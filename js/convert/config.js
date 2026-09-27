(() => {
  // const API_BASE_URL = 'http://127.0.0.1:3000';
    const API_BASE_URL = 'https://venusdigital-backend.onrender.com';
  window.API_BASE_URL = API_BASE_URL;
  window.api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: 20000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  });

  function pageLoginPathFromConfig() {
    const path = window.location.pathname || '';
    return path.includes('/user/') || path.includes('/admin/') ? '../login.html' : './login.html';
  }

  function hasJwtCookieCfg() {
    try { return /(?:^|;\s*)jwt=/.test(document.cookie || ''); } catch (_) { return false; }
  }

  function isPublicPageCfg() {
    const path = window.location.pathname || '';
    return path === '/' || /(?:index|login|register|forgot-password|reset-password|reset)\.html$/i.test(path);
  }

  window.api.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error && error.response && error.response.status;
      const noResponse = !error || !error.response;

      // Weak network / timeout / backend unreachable — never force logout redirect
      if (noResponse) {
        return Promise.reject(error);
      }

      if (status === 401) {
        localStorage.removeItem('user');
        // Only bounce to login on a real 401, and only off public pages
        if (!isPublicPageCfg()) {
          // If cookie somehow still present, allow one soft path (auth.js retries handle protect)
          // but definitive 401 from server means token is invalid — redirect
          window.location.href = pageLoginPathFromConfig();
        }
      }
      return Promise.reject(error);
    }
  );
})();
