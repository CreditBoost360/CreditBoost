import CodeBlock from './CodeBlock'

const QuickStart = () => {
  return (
    <div className="quick-start">
      <h2>Getting Started with CreditBoost API</h2>
      <section>
        <h3>1. Get Your API Key</h3>
        <p>
          First, you'll need to register for a partner account to receive your API key.
          Once you have your API key, you can exchange it for a JWT token:
        </p>
        <CodeBlock language="bash">
          curl -X POST https://api.creditboost.co.ke/v1/auth/partner-token \
            -H "X-API-Key: your_api_key" \
            -d '{"partnerId": "your_partner_id"}'
        </CodeBlock>
      </section>
      
      <section>
        <h3>2. Make Your First API Call</h3>
        <p>
          With your token, you can now make authenticated requests to the API. 
          Here's an example of creating a credit passport:
        </p>
        <CodeBlock language="javascript">
          const response = await fetch('https://api.creditboost.co.ke/v1/passport/create', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer YOUR_TOKEN',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              userAddress: '0x...',
              creditScore: 750,
              transactionHistory: []
            })
          });
        </CodeBlock>
      </section>

      <section>
        <h3>3. Retrieve Credit Passport Data</h3>
        <p>
          To retrieve a user's credit passport data, make a GET request:
        </p>
        <CodeBlock language="javascript">
          const userAddress = '0x...';
          const response = await fetch(`https://api.creditboost.co.ke/v1/passport/${userAddress}`, {
            method: 'GET',
            headers: {
              'Authorization': 'Bearer YOUR_TOKEN'
            }
          });
          
          const data = await response.json();
          console.log(data);
        </CodeBlock>
      </section>
    </div>
  )
}

export default QuickStart

