const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function run() {
  try {
    console.log('1. Logging in...');
    const email = `sprint_test_${Date.now()}@crunevo.local`;
    await axios.post(`${API_URL}/auth/register`, {
        email,
        username: `sprint_${Date.now()}`,
        password: 'User123!',
    });
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
        email,
        password: 'User123!',
    });
    const token = loginRes.data.access_token;
    const headers = { headers: { Authorization: `Bearer ${token}` } };
    const userId = (await axios.get(`${API_URL}/users/me`, headers)).data.id;
    console.log('   Logged in.');

    // --- TEST 1: PROFILE EDIT ---
    console.log('\n2. Testing Profile Edit...');
    const newBio = 'Updated Bio Sprint';
    await axios.patch(`${API_URL}/users/me`, { bio: newBio }, headers);
    const profileRes = await axios.get(`${API_URL}/users/me`, headers);
    if (profileRes.data.bio !== newBio) throw new Error('Profile update failed');
    console.log('   Success! Bio updated.');

    // --- TEST 2: EVENTS ---
    console.log('\n3. Testing Events...');
    await axios.post(`${API_URL}/events`, {
        title: 'Hackathon Sprint',
        description: 'Testing events',
        date: new Date(Date.now() + 86400000).toISOString(),
        location: 'Lab 3'
    }, headers);
    
    const eventsRes = await axios.get(`${API_URL}/events`, headers);
    const foundEvent = eventsRes.data.find(e => e.title === 'Hackathon Sprint');
    if (!foundEvent) throw new Error('Event creation failed');
    console.log('   Success! Event created and listed.');

    // --- TEST 3: CLUB LEAVE ---
    console.log('\n4. Testing Club Leave...');
    // Create club
    const clubRes = await axios.post(`${API_URL}/clubs`, { name: 'Sprint Club' }, headers);
    const clubId = clubRes.data.id;
    
    // Owner cannot leave immediately, need another user to join and leave.
    // Create User 2
    console.log('   Creating User 2 to join/leave...');
    const email2 = `sprint_user2_${Date.now()}@crunevo.local`;
    await axios.post(`${API_URL}/auth/register`, { email: email2, username: `u2_${Date.now()}`, password: 'User123!' });
    const login2 = await axios.post(`${API_URL}/auth/login`, { email: email2, password: 'User123!' });
    const token2 = login2.data.access_token;
    const headers2 = { headers: { Authorization: `Bearer ${token2}` } };

    // Join
    await axios.post(`${API_URL}/clubs/${clubId}/join`, {}, headers2);
    // Check member count (optional, skip for speed)
    
    // Leave
    await axios.post(`${API_URL}/clubs/${clubId}/leave`, {}, headers2);
    
    // Check if still member (should fail or return empty/null if we had endpoint)
    // Or check my-clubs
    const myClubsRes = await axios.get(`${API_URL}/clubs/my-clubs`, headers2);
    const stillIn = myClubsRes.data.find(c => c.id === clubId);
    if (stillIn) throw new Error('User 2 failed to leave club');
    
    console.log('   Success! User 2 joined and left club.');

    console.log('\nALL SPRINT CHECKS PASSED.');

  } catch (error) {
    console.error('\nFAILED:', error.message);
    if (error.response) console.error('Data:', error.response.data);
    process.exit(1);
  }
}

run();
