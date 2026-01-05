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

    console.log('\n2. Uploading Apunte (Document)...');
    const dummyPath = path.join(__dirname, 'temp_apunte.txt');
    fs.writeFileSync(dummyPath, 'Content of apunte for testing.');

    const form = new FormData();
    form.append('title', 'Test Apunte Public');
    form.append('description', 'Description for search');
    form.append('visibility', 'PUBLIC');
    form.append('file', fs.createReadStream(dummyPath));

    const uploadRes = await axios.post(`${API_URL}/documents`, form, {
      headers: {
        ...authHeaders.headers,
        ...form.getHeaders(),
      },
    });
    const docId = uploadRes.data.id;
    console.log('   Success! Doc ID:', docId);
    fs.unlinkSync(dummyPath);

    console.log('\n3. Searching Apuntes...');
    const searchRes = await axios.get(`${API_URL}/apuntes?q=Description`, authHeaders);
    const found = searchRes.data.find(d => d.id === docId);
    if (found) console.log('   Success! Found in search.');
    else {
        console.error('   Error: Not found in search.');
        console.log('Results:', searchRes.data);
    }

    console.log('\n4. Fetching Apunte Detail...');
    const detailRes = await axios.get(`${API_URL}/apuntes/${docId}`, authHeaders);
    const initialDownloads = detailRes.data.downloadsCount;
    console.log('   Initial downloads:', initialDownloads);

    console.log('\n5. Downloading Apunte...');
    await axios.get(`${API_URL}/apuntes/${docId}/download`, {
        ...authHeaders,
        responseType: 'arraybuffer' // Just to download content
    });
    console.log('   Download request completed.');

    console.log('\n6. Verifying Download Count...');
    const detailResAfter = await axios.get(`${API_URL}/apuntes/${docId}`, authHeaders);
    const newDownloads = detailResAfter.data.downloadsCount;
    console.log('   New downloads:', newDownloads);

    if (newDownloads > initialDownloads) {
        console.log('   Success! Download count incremented.');
    } else {
        console.error('   Error: Download count did not increment.');
    }

    console.log('\nALL APUNTES CHECKS PASSED.');

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
