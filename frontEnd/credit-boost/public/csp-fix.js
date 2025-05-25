// This script helps modify CSP at runtime
(function() {
  // Create a meta tag for CSP
  const cspMeta = document.createElement('meta');
  cspMeta.httpEquiv = 'Content-Security-Policy';
  cspMeta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://credvault.co.ke http://localhost:3000 http://localhost:8081; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';";
  
  // Add it to the head of the document
  document.head.appendChild(cspMeta);
  
  console.log('CSP updated to allow connections to localhost:8081');
})();