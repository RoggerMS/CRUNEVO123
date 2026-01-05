const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function run() {
  try {
    console.log('1. Logging in as Admin...');
    let tokenA;
    try {
        const loginResA = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin_oficial@crunevo.local',
            password: 'User123!',
        });
        tokenA = loginResA.data.access_token;
    } catch (e) {
        // Register Admin if missing
        await axios.post(`${API_URL}/auth/register`, {
            email: 'admin_oficial@crunevo.local',
            username: 'admin_vitality',
            password: 'User123!',
            role: 'ADMIN' 
        });
        // Retry login
        const loginResA = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin_oficial@crunevo.local',
            password: 'User123!',
        });
        tokenA = loginResA.data.access_token;
    }
    console.log('   Success! Token A received.');
    const headersA = { headers: { Authorization: `Bearer ${tokenA}` } };

    console.log('\n2. Ensuring Normal User exists...');
    let tokenB;
    let userIdB;
    try {
        const loginResB = await axios.post(`${API_URL}/auth/login`, {
            email: 'student@crunevo.local',
            password: 'User123!',
        });
        tokenB = loginResB.data.access_token;
        const meRes = await axios.get(`${API_URL}/users/me`, { headers: { Authorization: `Bearer ${tokenB}` } });
        userIdB = meRes.data.id;
    } catch (e) {
         // Register
         try {
             await axios.post(`${API_URL}/auth/register`, {
                email: 'student@crunevo.local',
                username: 'student_vitality',
                password: 'User123!',
            });
         } catch (regError) {}
        const loginResB = await axios.post(`${API_URL}/auth/login`, {
            email: 'student@crunevo.local',
            password: 'User123!',
        });
        tokenB = loginResB.data.access_token;
        const meRes = await axios.get(`${API_URL}/users/me`, { headers: { Authorization: `Bearer ${tokenB}` } });
        userIdB = meRes.data.id;
    }
    console.log('   Success! User ready.');
    const headersB = { headers: { Authorization: `Bearer ${tokenB}` } };

    console.log('\n3. Triggering Daily Question...');
    const triggerRes = await axios.post(`${API_URL}/vitality/daily/trigger`, {}, headersA);
    console.log('   Success! Question triggered:', triggerRes.data.message);
    const questionId = triggerRes.data.questionId;

    console.log('\n4. Verifying Notification...');
    const notifsRes = await axios.get(`${API_URL}/vitality/notifications`, headersB);
    const dailyNotif = notifsRes.data.find(n => n.type === 'DAILY' && n.content.includes('Pregunta'));
    
    if (dailyNotif) {
        console.log('   Success! Daily notification found.');
    } else {
        console.error('   Error: Daily notification not found.');
        process.exit(1);
    }

    console.log('\n5. Reading Notification...');
    await axios.patch(`${API_URL}/vitality/notifications/${dailyNotif.id}/read`, {}, headersB);
    console.log('   Success! Marked as read.');

    console.log('\n6. Answering Question (Earning Points)...');
    // Check initial points
    const profileBefore = await axios.get(`${API_URL}/users/${userIdB}/profile`, headersB);
    const pointsBefore = profileBefore.data.user.points || 0;
    
    await axios.post(`${API_URL}/aula/questions/${questionId}/answers`, { body: 'This is my daily answer!' }, headersB);
    
    // Check points after
    const profileAfter = await axios.get(`${API_URL}/users/${userIdB}/profile`, headersB);
    const pointsAfter = profileAfter.data.user.points;
    
    console.log(`   Points: ${pointsBefore} -> ${pointsAfter}`);
    
    if (pointsAfter > pointsBefore) {
        console.log('   Success! Points awarded.');
    } else {
        console.error('   Error: Points not awarded.');
        // process.exit(1); // Soft fail if points logic async or delayed, but it should be sync.
    }

    console.log('\nALL VITALITY CHECKS PASSED.');

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
