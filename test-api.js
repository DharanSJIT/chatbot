import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.BYTEZ_API_KEY;

console.log('Testing Bytez API...');
console.log('API Key:', API_KEY ? API_KEY.substring(0, 8) + '...' : 'Not set');

const endpoints = [
  'https://api.bytez.com/v1/chat/completions',
  'https://api.bytez.com/chat/completions',
  'https://api.bytez.com/v1/completions',
  'https://api.bytez.com/completions'
];

const authMethods = [
  { name: 'Bearer', headers: { 'Authorization': `Bearer ${API_KEY}` } },
  { name: 'X-API-Key', headers: { 'X-API-Key': API_KEY } },
  { name: 'provider-key', headers: { 'provider-key': API_KEY } },
  { name: 'api-key', headers: { 'api-key': API_KEY } }
];

async function testEndpoint(endpoint, authMethod) {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authMethod.headers
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      })
    });

    const data = await response.text();
    return {
      endpoint,
      authMethod: authMethod.name,
      status: response.status,
      success: response.ok,
      response: data.substring(0, 200) // Limit response length
    };
  } catch (error) {
    return {
      endpoint,
      authMethod: authMethod.name,
      status: 'error',
      success: false,
      error: error.message
    };
  }
}

async function runTests() {
  console.log('\nTesting all combinations...\n');
  
  for (const endpoint of endpoints) {
    console.log(`Testing endpoint: ${endpoint}`);
    for (const authMethod of authMethods) {
      const result = await testEndpoint(endpoint, authMethod);
      console.log(`  ${authMethod.name}: ${result.status} - ${result.success ? 'SUCCESS' : 'FAILED'}`);
      if (result.success) {
        console.log(`    Response: ${result.response}`);
      } else if (result.error) {
        console.log(`    Error: ${result.error}`);
      } else {
        console.log(`    Response: ${result.response}`);
      }
    }
    console.log('');
  }
}

runTests().catch(console.error);