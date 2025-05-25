import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Copy } from 'lucide-react';

const ApiTesting = () => {
  const [endpoint, setEndpoint] = useState('');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState({ 'Authorization': 'Bearer ' });
  const [body, setBody] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [headerEntries, setHeaderEntries] = useState([{ key: 'Authorization', value: 'Bearer ' }]);
  const [activeTab, setActiveTab] = useState('test');
  const [validationErrors, setValidationErrors] = useState([]);
  const [responseValidation, setResponseValidation] = useState(null);

  // Validation schemas for request and response validation
  const validationSchemas = {
    '/api/passport/create': {
      request: {
        required: ['userAddress', 'creditScore', 'transactionHistory'],
        properties: {
          userAddress: { type: 'string', pattern: '^0x[a-fA-F0-9]{40}$' },
          creditScore: { type: 'number', minimum: 300, maximum: 850 },
          transactionHistory: { type: 'array', minItems: 1 }
        }
      },
      response: {
        success: {
          status: 201,
          required: ['success', 'message', 'data'],
          properties: {
            data: {
              required: ['transactionHash', 'userAddress', 'creditScore']
            }
          }
        }
      }
    },
    '/api/passport/score': {
      request: {
        required: ['userAddress', 'newCreditScore'],
        properties: {
          userAddress: { type: 'string', pattern: '^0x[a-fA-F0-9]{40}$' },
          newCreditScore: { type: 'number', minimum: 300, maximum: 850 }
        }
      },
      response: {
        success: {
          status: 200,
          required: ['success', 'message', 'data']
        }
      }
    },
    '/api/passport/fraud-check': {
      request: {
        required: ['creditData'],
        properties: {
          creditData: { 
            type: 'object',
            required: ['userAddress'],
            properties: {
              userAddress: { type: 'string' },
              transactionHistory: { type: 'array' }
            }
          }
        }
      },
      response: {
        success: {
          status: 200,
          required: ['success', 'data'],
          properties: {
            data: {
              required: ['isFraudulent', 'riskLevel']
            }
          }
        }
      }
    }
  };

  // Validation functions
  const validateRequest = (path, method, data) => {
    // Reset validation errors
    setValidationErrors([]);
    
    // Find validation schema for the endpoint
    const schema = Object.keys(validationSchemas).find(key => path.startsWith(key));
    
    if (!schema || method === 'GET') {
      return true; // No validation needed or GET request
    }
    
    try {
      const schemaObj = validationSchemas[schema].request;
      const errors = [];
      
      // Validate JSON syntax
      let parsedData;
      try {
        parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      } catch (e) {
        errors.push({ type: 'syntax', message: 'Invalid JSON syntax' });
        setValidationErrors(errors);
        return false;
      }
      
      // Validate required fields
      if (schemaObj.required) {
        for (const field of schemaObj.required) {
          if (parsedData[field] === undefined) {
            errors.push({ 
              type: 'required', 
              field, 
              message: `Missing required field: ${field}` 
            });
          }
        }
      }
      
      // Validate property types and formats
      if (schemaObj.properties && parsedData) {
        Object.entries(schemaObj.properties).forEach(([propName, propSchema]) => {
          if (parsedData[propName] !== undefined) {
            // Type validation
            if (propSchema.type === 'string' && typeof parsedData[propName] !== 'string') {
              errors.push({ 
                type: 'type', 
                field: propName, 
                message: `${propName} must be a string` 
              });
            }
            else if (propSchema.type === 'number' && typeof parsedData[propName] !== 'number') {
              errors.push({ 
                type: 'type', 
                field: propName, 
                message: `${propName} must be a number` 
              });
            }
            else if (propSchema.type === 'array' && !Array.isArray(parsedData[propName])) {
              errors.push({ 
                type: 'type', 
                field: propName, 
                message: `${propName} must be an array` 
              });
            }
            else if (propSchema.type === 'object' && typeof parsedData[propName] !== 'object') {
              errors.push({ 
                type: 'type', 
                field: propName, 
                message: `${propName} must be an object` 
              });
            }
            
            // Pattern validation for strings
            if (propSchema.type === 'string' && propSchema.pattern && 
                !new RegExp(propSchema.pattern).test(parsedData[propName])) {
              errors.push({ 
                type: 'pattern', 
                field: propName, 
                message: `${propName} has invalid format` 
              });
            }
            
            // Range validation for numbers
            if (propSchema.type === 'number') {
              if (propSchema.minimum !== undefined && parsedData[propName] < propSchema.minimum) {
                errors.push({ 
                  type: 'range', 
                  field: propName, 
                  message: `${propName} must be at least ${propSchema.minimum}` 
                });
              }
              if (propSchema.maximum !== undefined && parsedData[propName] > propSchema.maximum) {
                errors.push({ 
                  type: 'range', 
                  field: propName, 
                  message: `${propName} must be at most ${propSchema.maximum}` 
                });
              }
            }
            
            // Array validation
            if (propSchema.type === 'array') {
              if (propSchema.minItems !== undefined && 
                  parsedData[propName].length < propSchema.minItems) {
                errors.push({ 
                  type: 'array', 
                  field: propName, 
                  message: `${propName} must have at least ${propSchema.minItems} items` 
                });
              }
            }
            
            // Recursive validation for objects
            if (propSchema.type === 'object' && propSchema.properties) {
              Object.entries(propSchema.properties).forEach(([nestedProp, nestedSchema]) => {
                if (propSchema.required && propSchema.required.includes(nestedProp) && 
                    parsedData[propName][nestedProp] === undefined) {
                  errors.push({ 
                    type: 'required', 
                    field: `${propName}.${nestedProp}`, 
                    message: `Missing required field: ${propName}.${nestedProp}` 
                  });
                }
              });
            }
          }
        });
      }
      
      setValidationErrors(errors);
      return errors.length === 0;
    } catch (error) {
      console.error('Validation error:', error);
      setValidationErrors([{ type: 'internal', message: 'Validation system error' }]);
      return false;
    }
  };
  
  // Response validation
  const validateResponse = (path, response) => {
    // Find validation schema for the endpoint
    const schema = Object.keys(validationSchemas).find(key => path.startsWith(key));
    
    if (!schema || !response) {
      setResponseValidation(null);
      return;
    }
    
    try {
      const responseType = response._isError ? 'error' : 
                           response.status >= 400 ? 'error' : 'success';
      const schemaObj = validationSchemas[schema].response[responseType];
      
      if (!schemaObj) {
        setResponseValidation(null);
        return;
      }
      
      const result = {
        valid: true,
        failures: []
      };
      
      // Status code validation
      if (schemaObj.status && response.status !== schemaObj.status) {
        result.valid = false;
        result.failures.push(`Expected status ${schemaObj.status}, got ${response.status}`);
      }
      
      // Required fields validation
      if (schemaObj.required && response.data) {
        for (const field of schemaObj.required) {
          if (response.data[field] === undefined) {
            result.valid = false;
            result.failures.push(`Missing required field in response: ${field}`);
          }
        }
      }
      
      // Nested property validation
      if (schemaObj.properties && response.data) {
        Object.entries(schemaObj.properties).forEach(([propName, propSchema]) => {
          if (response.data[propName] && propSchema.required) {
            for (const nestedField of propSchema.required) {
              if (response.data[propName][nestedField] === undefined) {
                result.valid = false;
                result.failures.push(`Missing required field in response: ${propName}.${nestedField}`);
              }
            }
          }
        });
      }
      
      setResponseValidation(result);
    } catch (error) {
      console.error('Response validation error:', error);
      setResponseValidation({
        valid: false,
        failures: ['Error validating response']
      });
    }
  };

  // Pre-configured API endpoints
  const endpoints = [
    {
      name: 'Create Credit Passport',
      path: '/api/passport/create',
      method: 'POST',
      description: 'Create a new credit passport for a user',
      sampleBody: {
        userAddress: '0x123456789abcdef',
        creditScore: 750,
        transactionHistory: [
          "Loan payment - $500",
          "Credit card payment - $200",
          "Mortgage payment - $1200"
        ]
      }
    },
    {
      name: 'Update Credit Score',
      path: '/api/passport/score',
      method: 'PUT',
      description: 'Update a user\'s credit score',
      sampleBody: {
        userAddress: '0x123456789abcdef',
        newCreditScore: 780
      }
    },
    {
      name: 'Get Credit Passport',
      path: '/api/passport/{userAddress}',
      method: 'GET',
      description: 'Retrieve credit passport data for a specific user',
      paramPlaceholder: '{userAddress}',
      paramDescription: 'Blockchain address of the user'
    },
    {
      name: 'Upload KYC Documents',
      path: '/api/passport/{userAddress}/kyc',
      method: 'POST',
      description: 'Upload Know Your Customer documents',
      paramPlaceholder: '{userAddress}',
      paramDescription: 'Blockchain address of the user',
      isMultipart: true
    },
    {
      name: 'Check for Fraud',
      path: '/api/passport/fraud-check',
      method: 'POST',
      description: 'Analyze credit data for potentially fraudulent activity',
      sampleBody: {
        creditData: {
          userAddress: '0x123456789abcdef',
          transactionHistory: [
            "Large transfer - $25000",
            "Multiple accounts created",
            "Foreign transaction - $5000"
          ],
          creditScore: 720,
          accountAge: 45
        }
      }
    }
  ];

  // Sample code generator
  const generateSampleCode = (language) => {
    if (!endpoint) return '';
    
    const selectedEndpoint = endpoints.find(ep => ep.path === endpoint.split('?')[0]);
    
    switch(language) {
      case 'javascript':
        return `// JavaScript - Using Fetch API
const url = "${endpoint}";
const options = {
  method: "${method}",
  headers: ${JSON.stringify(headers, null, 2)},
  ${method !== 'GET' ? `body: JSON.stringify(${body})` : ''}
};

fetch(url, options)
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`;

      case 'python':
        return `# Python - Using Requests
import requests
import json

url = "${endpoint}"
headers = ${JSON.stringify(headers, null, 2)}
${method !== 'GET' ? `payload = json.dumps(${body})` : ''}

response = requests.${method.toLowerCase()}(
    url, 
    headers=headers${method !== 'GET' ? `,\n    data=payload` : ''}
)
print(response.json())`;

      case 'curl':
        return `# cURL Command
curl -X ${method} \\
  "${endpoint}" \\
${Object.entries(headers).map(([key, value]) => `  -H "${key}: ${value}" \\\n`).join('')}${method !== 'GET' ? `  -d '${body}' \\\n` : ''}  --compressed`;

      default:
        return '';
    }
  };

  // Handle endpoint parameter replacement
  const handleEndpointChange = (value) => {
    const selected = endpoints.find(ep => ep.path === value);
    
    if (!selected) {
      setEndpoint('');
      setMethod('GET');
      setBody('');
      return;
    }
    
    let path = selected.path;
    
    // If endpoint has parameter placeholder
    if (selected.paramPlaceholder) {
      // Replace placeholder with a dummy value for now
      const paramValue = prompt(`Enter value for ${selected.paramDescription}:`, '0x123456789abcdef');
      if (paramValue) {
        path = path.replace(selected.paramPlaceholder, paramValue);
      }
    }
    
    setEndpoint(path);
    setMethod(selected.method);
    
    if (selected.sampleBody) {
      setBody(JSON.stringify(selected.sampleBody, null, 2));
    } else {
      setBody('');
    }
  };

  // Update headers from header entries
  const updateHeaders = () => {
    const newHeaders = {};
    headerEntries.forEach(entry => {
      if (entry.key && entry.value) {
        newHeaders[entry.key] = entry.value;
      }
    });
    setHeaders(newHeaders);
  };

  // Add header entry
  const addHeaderEntry = () => {
    setHeaderEntries([...headerEntries, { key: '', value: '' }]);
  };

  // Update header entry
  const updateHeaderEntry = (index, field, value) => {
    const newEntries = [...headerEntries];
    newEntries[index][field] = value;
    setHeaderEntries(newEntries);
    updateHeaders();
  };

  // Remove header entry
  const removeHeaderEntry = (index) => {
    const newEntries = [...headerEntries];
    newEntries.splice(index, 1);
    setHeaderEntries(newEntries);
    updateHeaders();
  };

  // Handle API test
  const handleTest = async () => {
    if (!endpoint) {
      alert('Please select an endpoint');
      return;
    }
    
    // Validate request before sending
    if (method !== 'GET') {
      const isValid = validateRequest(endpoint, method, body);
      if (!isValid) {
        // Don't proceed if validation fails
        return;
      }
    }

    setLoading(true);
    setResponse(null);

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: method !== 'GET' ? body : undefined
      });

      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { text, _responseType: 'text' };
      }

      const responseObj = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers.entries()]),
        data
      };
      
      setResponse(responseObj);
      
      // Validate the response against expected schema
      validateResponse(endpoint, responseObj);
    } catch (error) {
      setResponse({ 
        error: error.message,
        _isError: true
      });
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="api-testing-interface p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-primary">API Testing Playground</h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="test">Test API</TabsTrigger>
          <TabsTrigger value="code">Sample Code</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="test" className="space-y-4">
          {/* Endpoint Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select Endpoint</label>
            <select 
              className="w-full p-2 border rounded"
              onChange={(e) => handleEndpointChange(e.target.value)}
            >
              <option value="">Select an endpoint</option>
              {endpoints.map(ep => (
                <option key={ep.path} value={ep.path}>
                  {ep.name} - {ep.method} {ep.path}
                </option>
              ))}
            </select>
            
            {endpoint && (
              <div className="mt-2 text-sm text-gray-500">
                {endpoints.find(ep => ep.path === endpoint.split('?')[0])?.description}
              </div>
            )}
          </div>

          {/* Headers */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Request Headers</label>
              <Button variant="outline" size="sm" onClick={addHeaderEntry}>
                Add Header
              </Button>
            </div>
            
            {headerEntries.map((entry, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  placeholder="Header Name"
                  value={entry.key}
                  onChange={(e) => updateHeaderEntry(index, 'key', e.target.value)}
                  className="w-1/3"
                />
                <Input
                  placeholder="Value"
                  value={entry.value}
                  onChange={(e) => updateHeaderEntry(index, 'value', e.target.value)}
                  className="w-2/3"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => removeHeaderEntry(index)}
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>

          {/* Request Body (for POST/PUT) */}
          {method !== 'GET' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Request Body</label>
              <textarea
                className={`w-full p-2 border rounded font-mono text-sm ${validationErrors.length > 0 ? 'border-red-400' : ''}`}
                rows={8}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter JSON request body"
              />
              
              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="mt-2 text-red-500 border border-red-200 rounded p-3 bg-red-50">
                  <h4 className="font-semibold mb-1">Validation Errors:</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="text-red-700">
                        {error.message}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 text-xs text-gray-600">
                    Fix these errors before submitting the request
                  </div>
                </div>
              )}
              
              {/* Validate Button */}
              <Button 
                variant="outline" 
                size="sm"
                className="mt-2"
                onClick={() => validateRequest(endpoint, method, body)}
              >
                Validate Request
              </Button>
            </div>
          )}

          {/* Test Button */}
          <Button
            className="w-full"
            onClick={handleTest}
            disabled={loading}
          >
            {loading ? 'Sending Request...' : 'Send Request'}
          </Button>

                  }`}>
                    {response._isError ? 'Error' : response.status}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(response, null, 2))}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>
              <pre className="bg-gray-50 p-4 overflow-auto text-sm max-h-96">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="code">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select Language</label>
            <Tabs defaultValue="javascript" className="w-full">
              <TabsList>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="curl">cURL</TabsTrigger>
              </TabsList>
              
              <TabsContent value="javascript" className="mt-4">
                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-sm">
                    {generateSampleCode('javascript') || 'Select an endpoint to generate code'}
                  </pre>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="absolute top-2 right-2 bg-gray-800 text-white hover:bg-gray-700"
                    onClick={() => copyToClipboard(generateSampleCode('javascript'))}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="python" className="mt-4">
                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-sm">
                    {generateSampleCode('python') || 'Select an endpoint to generate code'}
                  </pre>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="absolute top-2 right-2 bg-gray-800 text-white hover:bg-gray-700"
                    onClick={() => copyToClipboard(generateSampleCode('python'))}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="curl" className="mt-4">
                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-sm">
                    {generateSampleCode('curl') || 'Select an endpoint to generate code'}
                  </pre>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="absolute top-2 right-2 bg-gray-800 text-white hover:bg-gray-700"
                    onClick={() => copyToClipboard(generateSampleCode('curl'))}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>
        
        <TabsContent value="docs">
          <div className="prose max-w-none">
            <h3>API Documentation</h3>
            <p>
              This testing interface allows you to try out our APIs directly in the browser.
              All endpoints are pre-configured with sample data and proper authentication.
            </p>
            
            <h4>Available Endpoints</h4>
            <ul>
              {endpoints.map(ep => (
                <li key={ep.path}>
                  <strong>{ep.name}</strong>
                  <br />
                  <code>{ep.method} {ep.path}</code>
                  <br />
                  {ep.description}
                </li>
              ))}
            </ul>

            <h4>Authentication</h4>
            <p>
              All API calls require authentication using a JWT token in the Authorization header:
            </p>
            <pre>
              Authorization: Bearer YOUR_TOKEN
            </pre>

            <h4>Response Format</h4>
            <p>All responses follow the standard format:</p>
            <pre>
{`{
  "success": boolean,
  "data": object | null,
  "error": string | null
}`}
            </pre>
            
            <h4>API Key Acquisition</h4>
            <p>
              To get your API key for testing these endpoints, please register at our 
              <a href="/register-partner" className="text-primary hover:underline"> partner registration portal</a>.
            </p>
            
            <h4>Rate Limits</h4>
            <p>
              Our API has the following rate limits:
            </p>
            <ul>
              <li>100 requests per minute per partner</li>
              <li>5,000 requests per day per partner</li>
              <li>Higher limits are available for enterprise partners</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiTesting;

