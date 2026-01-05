const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function run() {
  try {
    console.log('1. Logging in as Student...');
    let token;
    let userId;
    try {
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'student_gaps@crunevo.local',
            password: 'User123!',
        });
        token = loginRes.data.access_token;
        const meRes = await axios.get(`${API_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
        userId = meRes.data.id;
    } catch (e) {
        // Register if needed
        await axios.post(`${API_URL}/auth/register`, {
            email: 'student_gaps@crunevo.local',
            username: 'student_gaps',
            password: 'User123!',
        });
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'student_gaps@crunevo.local',
            password: 'User123!',
        });
        token = loginRes.data.access_token;
        const meRes = await axios.get(`${API_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
        userId = meRes.data.id;
    }
    const headers = { headers: { Authorization: `Bearer ${token}` } };
    console.log('   Success! Logged in.');

    console.log('\n2. Creating a Club (to join)...');
    const clubRes = await axios.post(`${API_URL}/clubs`, {
        name: 'Gaps Club',
        description: 'Testing my clubs endpoint',
        isPublic: true
    }, headers);
    const clubId = clubRes.data.id;
    console.log('   Success! Club created:', clubId);

    console.log('\n3. Verifying "My Clubs"...');
    const myClubsRes = await axios.get(`${API_URL}/clubs/my-clubs`, headers);
    const found = myClubsRes.data.find(c => c.id === clubId);
    
    if (found) {
        console.log('   Success! Club found in my-clubs list.');
    } else {
        console.error('   Error: Club NOT found in my-clubs.');
        process.exit(1);
    }

    console.log('\n4. Verifying User Public Clubs (Profile)...');
    const userClubsRes = await axios.get(`${API_URL}/clubs/user/${userId}`, headers);
    const foundPublic = userClubsRes.data.find(c => c.id === clubId);
    
    if (foundPublic) {
        console.log('   Success! Club found in user profile clubs.');
    } else {
        console.error('   Error: Club NOT found in user profile clubs.');
        process.exit(1);
    }

    console.log('\n5. Verifying Community Explore...');
    const exploreRes = await axios.get(`${API_URL}/community/explore`);
    if (exploreRes.data.popularClubs && exploreRes.data.topDocs && exploreRes.data.recentQuestions) {
        console.log('   Success! Explore data structure is correct.');
        console.log('   Clubs:', exploreRes.data.popularClubs.length);
        console.log('   Docs:', exploreRes.data.topDocs.length);
        console.log('   Questions:', exploreRes.data.recentQuestions.length);
    } else {
        console.error('   Error: Explore data missing keys.');
        process.exit(1);
    }

    console.log('\nALL GAP CHECKS PASSED.');

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
