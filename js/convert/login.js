document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm') || document.querySelector('form');
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearAlert();
    const values = new FormData(form);
    const payload = { email: values.get('email'), password: values.get('password'), remember: values.get('remember') === 'on' };
    if (!String(payload.email || '').trim()) return showAlert('error', 'Email or username is required');
    if (!payload.password) return showAlert('error', 'Password is required');

    let permissionPromise = Promise.resolve('default');
    try {
      permissionPromise = requestPushPermission();
    } catch (_) {
      permissionPromise = Promise.resolve('default');
    }
    try {
      const response = await api.post('/auth/login', payload);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      const permission = await permissionPromise;
      await setupPushIfNeeded({ permission });
      showAlert('success', response.data.message || 'Login successful');
      window.setTimeout(() => {
        const loggedInUser = response.data.user || {};
        const fallback = loggedInUser.role === 'ADMIN' ? './admin/manageusers.html' : './user/dashboard.html';
        window.location.href = response.data.redirect || fallback;
      }, 500);
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Login failed');
    }
  });
});
function clearAlert() {
  document.getElementById('form-alert')?.remove();
}

function showAlert(type, text) {
  clearAlert();
  const box = document.createElement('div');
  box.id = 'form-alert';
  box.className = type === 'success'
    ? 'mb-4 flex items-start gap-3 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300'
    : 'mb-4 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300';
  const message = document.createElement('span');
  message.className = 'flex-1 leading-relaxed';
  message.textContent = String(text || '');
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'text-current opacity-70 hover:opacity-100 bg-transparent border-0 cursor-pointer text-lg leading-none';
  close.setAttribute('aria-label', 'Dismiss');
  close.textContent = '×';
  close.addEventListener('click', () => box.remove());
  box.append(message, close);
  const form = document.querySelector('form');
  if (form) form.parentNode.insertBefore(box, form);
}
