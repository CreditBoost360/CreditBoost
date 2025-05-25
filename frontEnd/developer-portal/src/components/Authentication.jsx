import CodeBlock from './CodeBlock'

const Authentication = () => {
  return (
    <div className="authentication">
      <h2>Authentication</h2>
      
      <section>
        <h3>Overview</h3>
        <p>
          The CreditBoost API uses two authentication methods:
        </p>
        <ul>
          <li><strong>API Key Authentication</strong> - Used for partner authentication</li>
          <li><strong>JWT (Bearer) Authentication</strong> - Used for API requests</li>
        </ul>
      </section>
      
      <section>
        <h3>Partner Registration</h3>
        <p>
          To access the CreditBoost API, you need to register as a partner. 
          Contact our team at <a href="mailto:partners@creditboost.co.ke">partners@creditboost.co.ke</a> to get started.
        </p>
      </section>
      
      <section>
        <h3>API Key Authentication</h3>
        <p>
          For partner authentication, include your API key in the <code>X-API-Key</code> header:
        </p>
        <CodeBlock language="bash">
          curl -X POST https://api.creditboost.co.ke/v1/auth/partner-token \
            -H "X-API-Key: your_api_key" \
            -d '{"partnerId": "your_partner_id"}'
        </CodeBlock>
      </section>
      
      <section>
        <h3>JWT (Bearer) Authentication</h3>
        <p>
          For API requests, use the JWT token obtained from the partner-token endpoint.
          Include the token in the <code>Authorization</code> header:
        </p>
        <CodeBlock language="javascript">
          fetch('https://api.creditboost.co.ke/v1/passport/create', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer YOUR_JWT_TOKEN',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              // request body
            })
          });
        </CodeBlock>
      </section>
      
      <section>
        <h3>Token Expiration and Renewal</h3>
        <p>
          JWT tokens are valid for 24 hours. After that, you'll need to request a new token.
          When a token expires, the API will return a 401 response.
        </p>
        <CodeBlock language="javascript">
          // Check if token is about to expire and refresh
          const tokenData = parseJwt(currentToken);
          const expirationTime = tokenData.exp * 1000; // Convert to milliseconds
          
          if (Date.now() + 300000 > expirationTime) { // If token expires in less than 5 minutes
            // Request new token
            const response = await fetch('https://api.creditboost.co.ke/v1/auth/partner-token', {
              method: 'POST',
              headers: {
                'X-API-Key': 'your_api_key',
                'Content-Type': 'application/json'
              

