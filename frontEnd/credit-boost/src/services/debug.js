// Debug utility for network issues
export const debugNetworkIssues = () => {
  console.log('=== Network Debug Information ===');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log('VITE_PRODUCTION:', import.meta.env.VITE_PRODUCTION);
  console.log('VITE_DEV_URL:', import.meta.env.VITE_DEV_URL);
  
  // Check CSP
  const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  console.log('CSP Meta Tag:', cspMeta ? cspMeta.getAttribute('content') : 'Not found in DOM');
  
  // Test connection to backend
  console.log('Testing connection to backend...');
  fetch('http://localhost:8081/health', { 
    method: 'GET',
    mode: 'cors'
  })
    .then(response => {
      console.log('Backend health check response:', response.status);
      return response.text();
    })
    .then(data => {
      console.log('Backend response data:', data);
    })
    .catch(error => {
      console.error('Backend connection test failed:', error);
    });
  
  // Check for service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations()
      .then(registrations => {
        console.log('Service Worker Registrations:', registrations);
      });
  }
  
  // Log browser information
  console.log('Browser Information:');
  console.log('User Agent:', navigator.userAgent);
  console.log('=== End Debug Information ===');
};

// Export a function to test CORS
export const testCorsRequest = async (url) => {
  try {
    const response = await fetch(url, {
      method: 'OPTIONS',
      mode: 'cors',
      headers: {
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type'
      }
    });
    
    console.log('CORS test response:', response);
    console.log('CORS headers:', {
      'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
      'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
      'access-control-allow-headers': response.headers.get('access-control-allow-headers')
    });
    
    return {
      status: response.status,
      ok: response.ok,
      headers: {
        'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
        'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
        'access-control-allow-headers': response.headers.get('access-control-allow-headers')
      }
    };
  } catch (error) {
    console.error('CORS test error:', error);
    return { error: error.message };
  }
};