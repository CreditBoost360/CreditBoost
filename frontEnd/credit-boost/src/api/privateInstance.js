import axios from "axios";

const baseURL = import.meta.env.VITE_PRODUCTION === 'true'
  ? 'https://credvault.co.ke/api'
  : import.meta.env.VITE_DEV_URL || '/api';

// Secure random nonce generator using browser's crypto API
const generateNonce = () => {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Enhanced Axios instance with security features
const api = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    },
    timeout: 10000,
    maxContentLength: 10 * 1024 * 1024, // 10MB
    maxRedirects: 5
});

// Request interceptor with enhanced security
api.interceptors.request.use(
    (config) => {
        // Add security nonce
        const nonce = generateNonce();
        config.headers['X-Nonce'] = nonce;
        
        // Add request timestamp for replay protection
        config.headers['X-Timestamp'] = Date.now();

        // Add CSRF token if available
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken) {
            config.headers['X-CSRF-Token'] = csrfToken;
        }

        // Add security headers for production
        if (import.meta.env.VITE_PRODUCTION === 'true') {
            config.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Enhanced response interceptor with security checks
api.interceptors.response.use(
    (response) => {
        // Validate response timestamp to prevent replay attacks
        const timestamp = response.headers['x-timestamp'];
        if (timestamp) {
            const timeDiff = Date.now() - timestamp;
            if (timeDiff > 300000) { // 5 minutes
                return Promise.reject(new Error('Response timeout - possible replay attack'));
            }
        }

        // Check for token expiration warning
        if (response.headers['x-token-expiring'] === 'true') {
            // Trigger token refresh
            api.post('auth/refresh')
                .catch(error => {
                    console.error('Token refresh failed:', error);
                    if (error.response?.status === 401) {
                        // Force logout on refresh failure
                        localStorage.clear();
                        window.location.href = '/login';
                    }
                });
        }

        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle specific security-related errors
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Clear sensitive data on authentication errors
                if (error.response.data?.message?.includes('invalid_token')) {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                // Attempt token refresh
                const response = await api.post('auth/refresh');
                if (response.data?.token) {
                    localStorage.setItem('auth_token', response.data.token);
                    originalRequest.headers['Authorization'] = `Bearer ${response.data.token}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Handle rate limiting
        if (error.response?.status === 429) {
            const retryAfter = error.response.headers['retry-after'] || 60;
            return Promise.reject(new Error(`Rate limit exceeded. Please try again in ${retryAfter} seconds`));
        }

        // Handle network errors
        if (!error.response) {
            console.error('Network Error:', error);
            return Promise.reject(new Error('Network error - please check your connection'));
        }

        return Promise.reject(error);
    }
);

export default api;