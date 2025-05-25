import axios from 'axios';
import axiosInstance from '../api/axiosInstance';

// Get the base URL from environment or use default
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create a custom axios instance for auth requests
const authAPI = axios.create({
  baseURL: `${BASE_URL}/api/auth`,  // Use absolute URL with the API base URL
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true  // Important for cookies/sessions
});

// Add request interceptor to handle errors consistently
authAPI.interceptors.request.use(
  config => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add language preference if available
    const language = localStorage.getItem('preferredLanguage');
    if (language) {
      config.headers['Accept-Language'] = language;
    }
    
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors consistently
authAPI.interceptors.response.use(
  response => response,
  error => {
    // Log the error for debugging
    console.error('Auth API error:', error.response?.data || error.message);
    
    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if needed
      // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Export the auth service as an object
export const authService = {
  async login(loginData) {
    try {
      console.log('Attempting login with data:', { ...loginData, password: '***' });
      
      // Use native fetch instead of axios for login
      const response = await fetch(`${BASE_URL}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(loginData)
      });
      
      const data = await response.json();
      console.log('Login response:', data);
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isAuthenticated', 'true');
        if (loginData.language) {
          localStorage.setItem('preferredLanguage', loginData.language);
        }
      }
      return data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  async register(userData) {
    try {
      // Store language preference
      if (userData.language) {
        localStorage.setItem('preferredLanguage', userData.language);
      }
      
      const response = await authAPI.post('/signup', userData);
      
      // If registration returns a token, store it
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return authAPI.post('/signout').catch(error => {
      console.error('Logout error:', error);
      // Still clear local storage even if server logout fails
    });
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (e) {
      localStorage.removeItem('user');
      return null;
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  async refreshToken() {
    try {
      const response = await authAPI.post('/refresh-token');
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
      throw error;
    }
  },

  async verifyEmail(token) {
    try {
      const response = await authAPI.get(`/verify-email?token=${token}`);
      return response.data;
    } catch (error) {
      console.error('Email verification failed:', error);
      throw error;
    }
  },

  async forgotPassword(email) {
    try {
      const response = await authAPI.post('/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password request failed:', error);
      throw error;
    }
  },

  async resetPassword(token, newPassword) {
    try {
      const response = await authAPI.post('/reset-password', {
        token,
        newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    }
  },
  
  getToken() {
    return localStorage.getItem('token');
  },
  
  async verifyToken() {
    try {
      const response = await authAPI.get('/verify-token');
      return response.data.valid;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  },
  
  async updateUserData(userData) {
    try {
      console.log('Updating user data:', { ...userData, profileImage: userData.profileImage ? '[Image data]' : null });
      
      // Use direct fetch API instead of axios for this specific request
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/auth/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(userData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response error:', response.status, errorText);
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Update user response:', data);
      
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      console.error('Update user data failed:', error);
      throw error;
    }
  }
};

// Default export for backward compatibility
export default authService;