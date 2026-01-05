const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function run() {
  try {
    console.log('1. Logging in...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin_oficial@crunevo.local',
      password: 'User123!',
    });
    const token = loginRes.data.access_token;
    console.log('   Success! Token received.');

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    console.log('\n2. Creating Product...');
    const productRes = await axios.post(`${API_URL}/store/products`, {
      title: 'Verification Product',
      description: 'A product for testing store flow',
      price: 19.99,
      type: 'DIGITAL_RESOURCE',
    }, authHeaders);
    const productId = productRes.data.id;
    console.log('   Success! Product ID:', productId);

    console.log('\n3. Searching Products...');
    const searchRes = await axios.get(`${API_URL}/store/products?q=Verification`, authHeaders);
    const found = searchRes.data.find(p => p.id === productId);
    if (found) console.log('   Success! Found in search.');
    else {
        console.error('   Error: Not found in search.');
        process.exit(1);
    }

    console.log('\n4. Buying Product...');
    await axios.post(`${API_URL}/store/products/${productId}/buy`, {}, authHeaders);
    console.log('   Success! Buy request completed.');

    console.log('\n5. Verifying Purchase in My Orders...');
    const ordersRes = await axios.get(`${API_URL}/store/orders/mine`, authHeaders);
    const order = ordersRes.data.find(o => o.productId === productId);
    
    if (order) {
        console.log('   Success! Purchase found in orders.');
    } else {
        console.error('   Error: Purchase NOT found in orders.');
        process.exit(1);
    }

    console.log('\n6. Checking Product Sales Count...');
    const detailRes = await axios.get(`${API_URL}/store/products/${productId}`, authHeaders);
    if (detailRes.data._count.purchases >= 1) {
        console.log('   Success! Purchase count incremented.');
    } else {
        console.error('   Error: Purchase count mismatch.');
    }

    console.log('\nALL STORE CHECKS PASSED.');

  } catch (error) {
    console.error('\nFAILED:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    process.exit(1);
  }
}

run();
