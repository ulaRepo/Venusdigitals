// digital-grownt\frontend\js\convert\login.js
// Login with generous network retries; keep session when JWT is present

var LOGIN_MAX_ATTEMPTS = 8;
var LOGIN_BASE_DELAY_MS = 2000;
var LOGIN_MAX_DELAY_MS = 8000;
var LOGIN_TIMEOUT_MS = 25000;

function loginSleep(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

function loginHasJwtCookie() {
  try {
    return /(?:^|;\s*)jwt=/.test(document.cookie || '');
  } catch (_) {
    return false;
  }
}

function loginIsNetworkError(error) {
  if (!error) return true;
  if (!error.response) return true;
  var code = error.code || '';
  if (code === 'ECONNABORTED' || code === 'ERR_NETWORK' || code === 'ETIMEDOUT') return true;
  var msg = String(error.message || '').toLowerCase();
  if (msg.indexOf('network') >= 0 || msg.indexOf('timeout') >= 0 || msg.indexOf('failed to fetch') >= 0) return true;
  return false;
}

function loginIsUnauthorized(error) {
  return !!(error && error.response && error.response.status === 401);
}

function loginDestinationForUser(user) {
  user = user || {};
  if (user.role === 'ADMIN') return './admin/manageusers.html';
  return './user/dashboard.html';
}

/**
 * POST /auth/login with retries on weak network.
 * Real 401 / 400 validation errors fail immediately.
 */
async function postLoginWithRetry(payload) {
  var client = (typeof api !== 'undefined' && api) || window.api;
  if (!client) throw new Error('API client not ready');

  var lastError = null;
  for (var attempt = 1; attempt <= LOGIN_MAX_ATTEMPTS; attempt++) {
    try {
      var response = await client.post('/auth/login', payload, { timeout: LOGIN_TIMEOUT_MS });
      return response;
    } catch (error) {
      lastError = error;

      // Wrong credentials / validation — do not retry
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        throw error;
      }

      if (!loginIsNetworkError(error) && !(error.response && error.response.status >= 500)) {
        throw error;
      }

      if (attempt >= LOGIN_MAX_ATTEMPTS) break;

      var delay = Math.min(LOGIN_BASE_DELAY_MS * Math.pow(1.4, attempt - 1), LOGIN_MAX_DELAY_MS);
      delay = Math.round(delay + Math.random() * 400);
      console.warn('[login] attempt ' + attempt + '/' + LOGIN_MAX_ATTEMPTS + ' failed; retrying in ' + delay + 'ms…');
      showAlert('error', 'Network is slow. Retrying login (' + attempt + '/' + LOGIN_MAX_ATTEMPTS + ')…');
      await loginSleep(delay);
    }
  }
  throw lastError || new Error('Login failed');
}

/**
 * After cookie is set, optionally confirm /auth/me.
 * On weak network with jwt present, still proceed to dashboard.
 */
async function confirmSessionOrContinue(userFromLogin) {
  var client = (typeof api !== 'undefined' && api) || window.api;
  if (!client) return userFromLogin;

  for (var attempt = 1; attempt <= 6; attempt++) {
    try {
      var response = await client.get('/auth/me', { timeout: LOGIN_TIMEOUT_MS });
      if (response && response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
      }
    } catch (error) {
      if (loginIsUnauthorized(error)) {
        // Token not accepted — only fail if we truly have no cookie
        if (!loginHasJwtCookie()) throw error;
      }
      if (attempt < 6 && (loginIsNetworkError(error) || (error.response && error.response.status >= 500))) {
        var delay = Math.min(1500 * attempt, 6000);
        console.warn('[login] session confirm attempt ' + attempt + ' failed; waiting ' + delay + 'ms…');
        await loginSleep(delay);
        continue;
      }
      // Cookie or login payload exists — continue to app; protect page will keep user there
      if (loginHasJwtCookie() || userFromLogin) {
        console.warn('[login] Network weak after login; continuing with cookie/session.');
        return userFromLogin || (function () {
          try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch (_) { return null; }
        })();
      }
      throw error;
    }
  }
  return userFromLogin;
}

function goToApp(user, redirectFromServer) {
  var dest = redirectFromServer || loginDestinationForUser(user);
  // Mark soft session so protected pages prefer keeping the user during weak network
  try {
    sessionStorage.setItem('dg_just_logged_in', String(Date.now()));
  } catch (_) {}
  window.location.href = dest;
}

document.addEventListener('DOMContentLoaded', function () {
  // If already has session cookie / cache, soft-route into app instead of sitting on login
  (async function softRedirectIfSession() {
    var cached = null;
    try { cached = JSON.parse(localStorage.getItem('user') || 'null'); } catch (_) {}
    if (!(loginHasJwtCookie() || cached)) return;
    try {
      showAlert('success', 'Session found. Opening your dashboard…');
      var user = await confirmSessionOrContinue(cached);
      goToApp(user || cached, null);
    } catch (_) {
      // Stay on login if session truly invalid
    }
  })();

  var form = document.getElementById('loginForm') || document.querySelector('form');
  if (!form) return;

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    clearAlert();

    var values = new FormData(form);
    var payload = {
      email: values.get('email'),
      password: values.get('password'),
      remember: values.get('remember') === 'on'
    };
    if (!String(payload.email || '').trim()) return showAlert('error', 'Email or username is required');
    if (!payload.password) return showAlert('error', 'Password is required');

    var submitBtn = form.querySelector('button[type="submit"]');
    var prevLabel = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Signing in…';
    }

    var permissionPromise = Promise.resolve('default');
    try {
      if (typeof requestPushPermission === 'function') {
        permissionPromise = requestPushPermission();
      }
    } catch (_) {
      permissionPromise = Promise.resolve('default');
    }

    try {
      var response = await postLoginWithRetry(payload);
      var user = (response.data && response.data.user) || {};
      localStorage.setItem('user', JSON.stringify(user));

      // Confirm session; do not bounce back to login on weak network if jwt is set
      try {
        user = (await confirmSessionOrContinue(user)) || user;
      } catch (confirmErr) {
        if (loginIsUnauthorized(confirmErr) && !loginHasJwtCookie()) {
          throw confirmErr;
        }
        // Keep going with login payload user
      }

      try {
        var permission = await permissionPromise;
        if (typeof setupPushIfNeeded === 'function') {
          await setupPushIfNeeded({ permission: permission });
        }
      } catch (_) {}

      showAlert('success', (response.data && response.data.message) || 'Login successful');

      window.setTimeout(function () {
        goToApp(user, response.data && response.data.redirect);
      }, 400);
    } catch (error) {
      var msg = (error.response && error.response.data && (error.response.data.message || error.response.data.error))
        || error.message
        || 'Login failed';
      // If login actually set a cookie but later step failed on network, still enter app
      if (loginHasJwtCookie()) {
        var cachedUser = null;
        try { cachedUser = JSON.parse(localStorage.getItem('user') || 'null'); } catch (_) {}
        showAlert('success', 'Connected. Opening your dashboard…');
        window.setTimeout(function () {
          goToApp(cachedUser, null);
        }, 400);
      } else {
        showAlert('error', msg);
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = prevLabel || 'Sign In';
      }
    }
  });
});

function clearAlert() {
  var el = document.getElementById('form-alert');
  if (el) el.remove();
}

function showAlert(type, text) {
  clearAlert();
  var box = document.createElement('div');
  box.id = 'form-alert';
  box.className = type === 'success'
    ? 'mb-4 flex items-start gap-3 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300'
    : 'mb-4 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300';
  var message = document.createElement('span');
  message.className = 'flex-1 leading-relaxed';
  message.textContent = String(text || '');
  var close = document.createElement('button');
  close.type = 'button';
  close.className = 'text-current opacity-70 hover:opacity-100 bg-transparent border-0 cursor-pointer text-lg leading-none';
  close.setAttribute('aria-label', 'Dismiss');
  close.textContent = '×';
  close.addEventListener('click', function () { box.remove(); });
  box.append(message, close);
  var form = document.querySelector('form');
  if (form) form.parentNode.insertBefore(box, form);
}
