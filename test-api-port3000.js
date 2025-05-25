// Direct test of the API using Node.js
const http = require('http');

const data = JSON.stringify({
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'Password123!'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/signup',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('Sending request to:', `http://${options.hostname}:${options.port}${options.path}`);
console.log('Request data:', data);

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log('Headers:', res.headers);
  
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Response data:', responseData);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();