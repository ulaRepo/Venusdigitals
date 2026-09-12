// digital-grownt\frontend\js\convert\config.js
(() => {
  if (typeof axios === 'undefined') {
    console.error('[Digital Grownt] axios is not loaded. Include axios before config.js');
    return;
  }
  const API_BASE_URL = window.__DIGITAL_GROWNT_API_BASE_URL__ || window.location.origin;
  window.API_BASE_URL = API_BASE_URL;
  window.api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  });

  window.api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('user');
        const path = window.location.pathname || '';
        const publicPage = path === '/' || /(?:index|login|register|forgot-password|reset-password)\.html$/.test(path);
        if (!publicPage) {
          window.location.href = path.includes('/user/') || path.includes('/admin/') ? '../login.html' : './login.html';
        }
      }
      return Promise.reject(error);
    }
  );
})();
