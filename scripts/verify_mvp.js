const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

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

    console.log('\n2. Creating Document...');
    const dummyPath = path.join(__dirname, 'temp_verify_doc.txt');
    fs.writeFileSync(dummyPath, 'This is a test document for MVP verification.');

    const form = new FormData();
    form.append('title', 'Verify MVP Doc');
    form.append('description', 'Automated test doc from script');
    form.append('tags', 'verify,script');
    form.append('file', fs.createReadStream(dummyPath));

    const uploadRes = await axios.post(`${API_URL}/documents`, form, {
      headers: {
        ...authHeaders.headers,
        ...form.getHeaders(),
      },
    });
    console.log('   Success! Doc ID:', uploadRes.data.id);
    fs.unlinkSync(dummyPath); // Clean up

    console.log('\n3. Fetching Feed...');
    const feedRes = await axios.get(`${API_URL}/feed`, authHeaders);
    const found = feedRes.data.find(i => i.id === uploadRes.data.id);
    if (found) console.log('   Success! Document found in feed.');
    else console.error('   Error: Document NOT found in feed.');

    console.log('\n4. Creating Question...');
    const qRes = await axios.post(`${API_URL}/aula/questions`, {
      title: 'Is verification working?',
      body: 'Testing Q&A flow via script.',
      tags: 'test',
    }, authHeaders);
    console.log('   Success! Question ID:', qRes.data.id);

    console.log('\n5. Fetching Question Detail...');
    const qDetail = await axios.get(`${API_URL}/aula/questions/${qRes.data.id}`, authHeaders);
    if (qDetail.data.title === 'Is verification working?') console.log('   Success! Detail matches.');
    else console.error('   Error: Detail mismatch.');

    console.log('\nALL CHECKS PASSED.');
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
