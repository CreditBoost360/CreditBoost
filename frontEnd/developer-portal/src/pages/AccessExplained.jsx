import React from 'react';
import CodeBlock from '../components/CodeBlock';

const AccessExplained = () => {
  return (
    <div className="access-explained">
      <h1>CreditBoost API Access Explained</h1>
      
      <section className="explanation-section">
        <h2>Overview of the API Access System</h2>
        <p>
          Our API access system is designed with three core principles:
        </p>
        <ul>
          <li><strong>Security</strong> - Two-tier authentication with API keys and JWT tokens</li>
          <li><strong>Simplicity</strong> - Clear documentation and consistent patterns</li>
          <li><strong>Flexibility</strong> - Multiple integration options via SDKs or direct API calls</li>
        </ul>
      </section>

      <section className="explanation-section">
        <h2>1. Authentication System</h2>
        <p>
          We've implemented a two-tier authentication system that balances security and ease of use:
        </p>
        
        <h3>Partner Registration</h3>
        <p>When a partner registers, we:</p>
        <ul>
          <li>Generate a secure API key with the prefix <code>cbk_</code> (32 bytes of entropy)</li>
          <li>Store partner details in our secure database</li>
          <li>Send a welcome email with instructions and the API key</li>
        </ul>
        <CodeBlock language="javascript">
{`// Partner registration process
const registerPartner = async (req, res) => {
  // Generate unique API key with prefix
  const apiKey = generateSecureApiKey(); // generates: cbk_1234...
  
  // Store partner info
  const partner = await db.partners.create({
    name,
    email,
    apiKey,
    status: 'pending_approval'
  });
  
  // Send welcome email with setup instructions
  await sendWelcomeEmail(email, {
    apiKey,
    portalUrl: 'https://developers.creditboost.co.ke'
  });
};`}
        </CodeBlock>
        
        <h3>Token Generation</h3>
        <p>
          For security, we don't use the API key directly for API calls. Instead:
        </p>
        <ul>
          <li>Partners exchange their API key for a short-lived JWT token (24 hours)</li>
          <li>The JWT token is used for all API requests</li>
          <li>This approach limits the exposure of the permanent API key</li>
        </ul>
        <CodeBlock language="javascript">
{`// Token generation for API access
const generatePartnerToken = async (req, res) => {
  // Validate API key from header
  const apiKey = req.headers['x-api-key'];
  
  // Generate 24-hour JWT token
  const token = jwt.sign(
    { partnerId: partner.id, type: 'partner' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  return res.json({ token, expiresAt });
};`}
        </CodeBlock>
        
        <h3>API Route Protection</h3>
        <p>
          Each API endpoint is protected by a middleware that:
        </p>
        <ul>
          <li>Verifies the JWT token's validity</li>
          <li>Checks that the token belongs to a partner</li>
          <li>Rejects requests with invalid or expired tokens</li>
        </ul>
        <CodeBlock language="javascript">
{`// Protect API routes
const authenticatePartner = (req, res, next) => {
  // Check JWT token
  const token = req.headers.authorization.split(' ')[1];
  
  // Verify token and check partner type
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (user.type !== 'partner') {
      return res.status(403).json({
        message: 'Partner access required'
      });
    }
    next();
  });
};`}
        </CodeBlock>
      </section>

      <section className="explanation-section">
        <h2>2. OpenAPI Specification</h2>
        <p>
          We've created a comprehensive OpenAPI (Swagger) specification that:
        </p>
        <ul>
          <li>Documents all API endpoints, parameters, and responses</li>
          <li>Provides interactive "Try it out" functionality</li>
          <li>Can be used to generate client code in multiple languages</li>
          <li>Serves as the single source of truth for API documentation</li>
        </ul>
        <p>
          The specification includes:
        </p>
        <ul>
          <li>Authentication endpoints</li>
          <li>Credit Passport operations</li>
          <li>Verification endpoints</li>
          <li>Payment processing</li>
          <li>Detailed schema definitions for all objects</li>
        </ul>
      </section>

      <section className="explanation-section">
        <h2>3. Developer Portal</h2>
        <p>
          Our developer portal is designed to be a one-stop resource for partners:
        </p>
        <ul>
          <li><strong>Interactive API Docs</strong> - Built with Swagger UI for live testing</li>
          <li><strong>Quick Start Guides</strong> - Step-by-step instructions to get started</li>
          <li><strong>SDK Documentation</strong> - Clear explanations of available SDKs</li>
          <li><strong>Authentication Guides</strong> - Detailed authentication instructions</li>
          <li><strong>Code Samples</strong> - Ready-to-use examples in multiple languages</li>
        </ul>
        <p>
          Key components include:
        </p>
        <CodeBlock language="jsx">
{`// Swagger UI integration
const ApiDocs = () => {
  return (
    <div className="api-docs">
      <SwaggerUI url="/api/docs/swagger.yaml" />
    </div>
  );
};

// Code examples with syntax highlighting
const CodeBlock = ({ language, children }) => {
  return (
    <div className="code-block">
      <SyntaxHighlighter 
        language={language} 
        style={vscDarkPlus}
        showLineNumbers={true}
      >
        {children}
      </SyntaxHighlighter>
      <button onClick={() => navigator.clipboard.writeText(children)}>
        Copy
      </button>
    </div>
  );
};`}
        </CodeBlock>
      </section>

      <section className="explanation-section">
        <h2>4. Deployment Configuration</h2>
        <p>
          We've implemented a streamlined deployment process for the developer portal:
        </p>
        <ul>
          <li>Automated builds and deployments to AWS S3</li>
          <li>CloudFront distribution for global CDN access</li>
          <li>Separate development and production environments</li>
          <li>Cache invalidation for immediate updates</li>
        </ul>
        <CodeBlock language="bash">
{`#!/bin/bash

# Build the portal
npm run build

# Deploy to development or production
if [ "$1" = "dev" ]; then
  aws s3 sync dist/ s3://dev-developers.creditboost.co.ke --delete
elif [ "$1" = "prod" ]; then
  aws s3 sync dist/ s3://developers.creditboost.co.ke --delete
fi

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"`}
        </CodeBlock>
      </section>

      <section className="explanation-section">
        <h2>5. Secure Access with Nginx</h2>
        <p>
          Our Nginx configuration ensures secure access to the developer portal:
        </p>
        <ul>
          <li>HTTPS enforcement with modern TLS protocols</li>
          <li>Comprehensive security headers</li>
          <li>CORS configuration for API access</li>
          <li>Asset optimization with caching</li>
          <li>Static asset compression</li>
        </ul>
        <CodeBlock language="nginx">
{`server {
    listen 443 ssl;
    server_name developers.creditboost.co.ke;

    ssl_certificate /etc/letsencrypt/live/developers.creditboost.co.ke/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/developers.creditboost.co.ke/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;
    
    # Swagger specification file with CORS
    location /api/docs/swagger.yaml {
        alias /var/www/developer-portal/swagger.yaml;
        add_header 'Access-Control-Allow-Origin' '*';
    }
}`}
        </CodeBlock>
      </section>

      <section className="explanation-section">
        <h2>Partner Integration Process</h2>
        <p>
          With these components in place, the partner integration process is simple:
        </p>
        <ol>
          <li>Partner registers at developers.creditboost.co.ke</li>
          <li>They receive an API key via email</li>
          <li>They use the key to generate JWT tokens</li>
          <li>They make API calls using JWT tokens</li>
          <li>For simpler integration, they can use our SDKs</li>
        </ol>
        <p>
          This approach makes it easy for partners to access our APIs while maintaining security.
        </p>
      </section>
    </div>
  );
};

export default AccessExplained;

