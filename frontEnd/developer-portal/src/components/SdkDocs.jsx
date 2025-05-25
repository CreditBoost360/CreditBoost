import CodeBlock from './CodeBlock'

const SdkDocs = () => {
  return (
    <div className="sdk-docs">
      <h2>CreditBoost SDK Documentation</h2>
      
      <section>
        <h3>Installation</h3>
        <p>The CreditBoost SDK is available for multiple languages.</p>
        
        <h4>JavaScript / Node.js</h4>
        <CodeBlock language="bash">
          npm install creditboost-sdk
        </CodeBlock>
        
        <h4>Python</h4>
        <CodeBlock language="bash">
          pip install creditboost-sdk
        </CodeBlock>
        
        <h4>Java</h4>
        <CodeBlock language="bash">
          // Maven
          <dependency>
            <groupId>com.creditboost</groupId>
            <artifactId>creditboost-sdk</artifactId>
            <version>1.0.0</version>
          </dependency>
          
          // Gradle
          implementation 'com.creditboost:creditboost-sdk:1.0.0'
        </CodeBlock>
      </section>
      
      <section>
        <h3>Usage</h3>
        
        <h4>JavaScript / Node.js</h4>
        <CodeBlock language="javascript">
          import { CreditBoostSDK } from 'creditboost-sdk';
          
          // Initialize with your API key
          const creditBoost = new CreditBoostSDK({
            apiKey: 'YOUR_API_KEY'
          });
          
          // Create a credit passport
          async function createPassport() {
            try {
              const result = await creditBoost.createCreditPassport({
                userAddress: '0x...',
                creditScore: 750,
                transactionHistory: []
              });
              
              console.log(result);
            } catch (error) {
              console.error('Error creating passport:', error);
            }
          }
        </CodeBlock>
        
        <h4>Python</h4>
        <CodeBlock language="python">
          from creditboost import CreditBoostSDK
          
          # Initialize with your API key
          credit_boost = CreditBoostSDK(api_key='YOUR_API_KEY')
          
          # Create a credit passport
          try:
              result = credit_boost.create_credit_passport(
                  user_address='0x...',
                  credit_score=750,
                  transaction_history=[]
              )
              
              print(result)
          except Exception as e:
              print(f"Error creating passport: {e}")
        </CodeBlock>
      </section>
      
      <section>
        <h3>SDK Classes and Methods</h3>
        
        <h4>CreditBoostSDK</h4>
        <p>The main SDK class for interacting with the CreditBoost API.</p>
        
        <h5>Methods:</h5>
        <ul>
          <li><code>createCreditPassport(passportData)</code> - Create a new credit passport</li>
          <li><code>getCreditPassport(userAddress)</code> - Get a user's credit passport</li>
          <li><code>updateCreditScore(userAddress, newScore)</code> - Update credit score</li>
          <li><code>uploadKycDocuments(userAddress, documents)</code> - Upload KYC documents</li>
          <li><code>checkFraud(creditData)</code> - Analyze credit data for fraud</li>
        </ul>
      </section>
    </div>
  )
}

export default SdkDocs

