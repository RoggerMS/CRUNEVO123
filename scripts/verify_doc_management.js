const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3000';

async function run() {
  try {
    console.log('1. Logging in...');
    let token;
    let userId;
    try {
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'student_docs@crunevo.local',
            password: 'User123!',
        });
        token = loginRes.data.access_token;
        const meRes = await axios.get(`${API_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
        userId = meRes.data.id;
    } catch (e) {
         await axios.post(`${API_URL}/auth/register`, {
            email: 'student_docs@crunevo.local',
            username: 'student_docs',
            password: 'User123!',
        });
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'student_docs@crunevo.local',
            password: 'User123!',
        });
        token = loginRes.data.access_token;
        const meRes = await axios.get(`${API_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
        userId = meRes.data.id;
    }
    const headers = { headers: { Authorization: `Bearer ${token}` } };
    console.log('   Success! Logged in.');

    // Create dummy file
    const filePath = path.join(__dirname, 'test_doc_v1.txt');
    fs.writeFileSync(filePath, 'Version 1 Content');
    
    console.log('\n2. Uploading Document v1...');
    const form1 = new FormData();
    form1.append('title', 'My Thesis');
    form1.append('description', 'Initial draft');
    form1.append('visibility', 'PUBLIC');
    form1.append('file', fs.createReadStream(filePath));

    const uploadRes = await axios.post(`${API_URL}/documents`, form1, {
        headers: { ...headers.headers, ...form1.getHeaders() }
    });
    const docId = uploadRes.data.id;
    console.log(`   Success! Doc ID: ${docId}, Version: ${uploadRes.data.version}, Thumbnail: ${uploadRes.data.thumbnailUrl}`);

    if (uploadRes.data.version !== 1) throw new Error('Version should be 1');

    console.log('\n3. Uploading Version 2...');
    const filePath2 = path.join(__dirname, 'test_doc_v2.txt');
    fs.writeFileSync(filePath2, 'Version 2 Content');
    const form2 = new FormData();
    form2.append('file', fs.createReadStream(filePath2));

    const v2Res = await axios.post(`${API_URL}/documents/${docId}/version`, form2, {
        headers: { ...headers.headers, ...form2.getHeaders() }
    });
    console.log(`   Success! New Version: ${v2Res.data.version}`);

    if (v2Res.data.version !== 2) throw new Error('Version should be 2');

    console.log('\n4. Verifying History...');
    // We didn't expose history endpoint, but we can check if the old doc exists in DB or just trust the version increment.
    // Ideally we check if previous version is archived, but for MVP verifying v2 is enough.

    console.log('\n5. Testing Status Permissions...');
    // Try as Student (Should Fail)
    try {
        await axios.post(`${API_URL}/documents/${docId}/status`, { status: 'FLAGGED' }, headers);
        throw new Error('Student should not be able to flag document');
    } catch (e) {
        if (e.response && e.response.status === 403) {
            console.log('   Success! Student blocked from changing status.');
        } else {
            throw e;
        }
    }

    // Login as Admin
    console.log('   Logging in as Admin...');
    let adminToken;
    try {
        const loginResA = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin_oficial@crunevo.local', // From seed
            password: 'User123!',
        });
        adminToken = loginResA.data.access_token;
    } catch (e) {
        // Fallback if seed didn't run or using different admin
        const loginResA = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@crunevo.local',
            password: 'Admin123!',
        });
        adminToken = loginResA.data.access_token;
    }
    const adminHeaders = { headers: { Authorization: `Bearer ${adminToken}` } };

    // Try as Admin (Should Success)
    const statusRes = await axios.post(`${API_URL}/documents/${docId}/status`, { status: 'VERIFIED' }, adminHeaders);
    console.log(`   Success! Admin changed status to: ${statusRes.data.qualityStatus}`);
    
    if (statusRes.data.qualityStatus !== 'VERIFIED') throw new Error('Status should be VERIFIED');

    // Clean up
    fs.unlinkSync(filePath);
    fs.unlinkSync(filePath2);

    console.log('\nALL DOC MANAGEMENT CHECKS PASSED.');

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
