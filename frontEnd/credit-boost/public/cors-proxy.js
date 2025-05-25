// Simple CORS proxy service worker
self.addEventListener('fetch', event => {
  // Only handle API requests to localhost:8081
  if (event.request.url.includes('localhost:8081')) {
    event.respondWith(
      handleApiRequest(event.request)
    );
  }
});

async function handleApiRequest(request) {
  // Create a new request with CORS headers
  const modifiedRequest = new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    mode: 'cors',
    credentials: 'include'
  });
  
  try {
    // Try to fetch with the modified request
    const response = await fetch(modifiedRequest);
    
    // Create a new response with CORS headers
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries([...response.headers.entries()]),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  } catch (error) {
    // Return error response
    return new Response(JSON.stringify({ error: 'Network error in CORS proxy' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}