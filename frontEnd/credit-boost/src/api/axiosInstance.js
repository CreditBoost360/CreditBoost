import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // Get CSRF token if not available
    if (!document.cookie.includes('XSRF-TOKEN')) {
      await axios.get(`${BASE_URL}/api/csrf-token`, { withCredentials: true });
    }
    
    // Read CSRF token from cookie
    const xsrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1];

    if (xsrfToken) {
      config.headers['X-XSRF-TOKEN'] = xsrfToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 403 Forbidden (CSRF token expired)
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Refresh CSRF token
      await axios.get(`${BASE_URL}/api/csrf-token`, { withCredentials: true });
      
      return axiosInstance(originalRequest);
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear local storage
      localStorage.clear();
      // Redirect to login
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

