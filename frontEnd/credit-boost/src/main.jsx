import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { TranslationProvider } from './context/TranslationContext.jsx'

// Add debug utilities to window object
window.debugNetwork = () => {
  console.log('Debugging network...');
  
  // Check localStorage for authentication data
  const authData = {
    isAuthenticated: localStorage.getItem('isAuthenticated'),
    token: localStorage.getItem('token') ? 'Present' : 'Missing',
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : 'Missing',
    preferredLanguage: localStorage.getItem('preferredLanguage'),
    authProvider: localStorage.getItem('auth_provider'),
    supabaseSession: localStorage.getItem('supabase_session') ? 'Present' : 'Missing',
    userData: localStorage.getItem('user_data') ? 'Present' : 'Missing'
  };
  
  console.log('Authentication data in localStorage:', authData);
  
  // Test API connection
  fetch('http://localhost:3000/')
    .then(response => response.json())
    .then(data => {
      console.log('API connection successful:', data);
    })
    .catch(error => {
      console.error('API connection failed:', error);
    });
};

// Add CORS test utility
window.testCors = (url) => {
  console.log(`Testing CORS for ${url}...`);
  
  fetch(url, {
    method: 'OPTIONS',
    headers: {
      'Origin': window.location.origin,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type'
    }
  })
    .then(response => {
      console.log('CORS preflight response:', response);
      console.log('CORS headers:', {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
        'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials')
      });
    })
    .catch(error => {
      console.error('CORS test failed:', error);
    });
};

// Add direct login test utility
window.testLogin = (email = 'test@example.com', password = 'password123') => {
  console.log(`Testing login with email: ${email}...`);
  
  fetch('http://localhost:3000/api/auth/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
      email,
      password,
      language: 'en'
    })
  })
    .then(response => response.json())
    .then(data => {
      console.log('Login response:', data);
      
      // Store authentication data
      if (data.token) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('Authentication data stored in localStorage');
      }
    })
    .catch(error => {
      console.error('Login test failed:', error);
    });
};

// Add auth reset utility
window.resetAuth = () => {
  console.log('Resetting authentication data...');
  
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('auth_provider');
  localStorage.removeItem('supabase_session');
  localStorage.removeItem('user_data');
  
  console.log('Authentication data cleared');
};

console.log('Application loaded. To debug network issues, run window.debugNetwork() in console');
console.log('To test CORS, run window.testCors("http://localhost:8081/api/auth/signup") in console');
console.log('To test login directly, run window.testLogin("email", "password") in console');
console.log('To reset authentication data, run window.resetAuth() in console');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TranslationProvider>
      <App />
    </TranslationProvider>
  </React.StrictMode>,
)