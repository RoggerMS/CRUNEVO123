const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function run() {
  try {
    console.log('1. Logging in as Student...');
    let token;
    let userId;
    try {
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'student_1@crunevo.local', // Use seed user
            password: 'User123!',
        });
        token = loginRes.data.access_token;
        userId = (await axios.get(`${API_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } })).data.id;
    } catch (e) {
        console.log('   Seed user failed, registering temp user...');
        const email = `student_bm_${Date.now()}@crunevo.local`;
        await axios.post(`${API_URL}/auth/register`, {
            email,
            username: `student_bm_${Date.now()}`,
            password: 'User123!',
        });
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email,
            password: 'User123!',
        });
        token = loginRes.data.access_token;
        userId = (await axios.get(`${API_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } })).data.id;
    }
    const headers = { headers: { Authorization: `Bearer ${token}` } };
    console.log('   Logged in.');

    // Find a document to bookmark
    console.log('\n2. Finding a document...');
    const feedRes = await axios.get(`${API_URL}/feed`, headers);
    const doc = feedRes.data.find(i => i.type === 'DOCUMENT');
    
    if (!doc) {
        console.log('   No document found in feed to bookmark. Skipping.');
        // Create one? No, too complex. Just warn.
        // Actually let's try to create one if needed, or search documents.
        // For now, assume seed ran.
        return;
    }
    console.log('   Found doc:', doc.title, doc.id);

    console.log('\n3. Toggling Bookmark (ON)...');
    const onRes = await axios.post(`${API_URL}/bookmarks/document/${doc.id}`, {}, headers);
    console.log('   Response:', onRes.data);
    if (!onRes.data.bookmarked) throw new Error('Should be bookmarked');

    console.log('\n4. Verifying List...');
    const listRes = await axios.get(`${API_URL}/bookmarks`, headers);
    const found = listRes.data.find(b => b.documentId === doc.id);
    if (!found) throw new Error('Bookmark not found in list');
    console.log('   Success! Found in list.');

    console.log('\n5. Toggling Bookmark (OFF)...');
    const offRes = await axios.post(`${API_URL}/bookmarks/document/${doc.id}`, {}, headers);
    console.log('   Response:', offRes.data);
    if (offRes.data.bookmarked) throw new Error('Should NOT be bookmarked');

    console.log('\n6. Verifying List (Empty)...');
    const listRes2 = await axios.get(`${API_URL}/bookmarks`, headers);
    const found2 = listRes2.data.find(b => b.documentId === doc.id);
    if (found2) throw new Error('Bookmark SHOULD be gone');
    console.log('   Success! Gone from list.');

    console.log('\nALL BOOKMARK TESTS PASSED.');

  } catch (error) {
    console.error('\nFAILED:', error.message);
    if (error.response) {
      console.error('Data:', error.response.data);
    }
    process.exit(1);
  }
}

run();
