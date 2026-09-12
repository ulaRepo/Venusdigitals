
(() => {
  const API_BASE_URL = 'https://venusdigital-backend.onrender.com';
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

