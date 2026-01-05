const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function run() {
  try {
    console.log('1. Logging in as Student...');
    let token;
    let userId;
    try {
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'student_brain@crunevo.local',
            password: 'User123!',
        });
        token = loginRes.data.access_token;
        const meRes = await axios.get(`${API_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
        userId = meRes.data.id;
    } catch (e) {
        await axios.post(`${API_URL}/auth/register`, {
            email: 'student_brain@crunevo.local',
            username: 'student_brain',
            password: 'User123!',
        });
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'student_brain@crunevo.local',
            password: 'User123!',
        });
        token = loginRes.data.access_token;
        const meRes = await axios.get(`${API_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
        userId = meRes.data.id;
    }
    const headers = { headers: { Authorization: `Bearer ${token}` } };
    console.log('   Success! Logged in.');

    console.log('\n2. Creating Question...');
    const qRes = await axios.post(`${API_URL}/aula/questions`, {
        title: '¿Qué es NestJS?',
        body: 'Estoy aprendiendo NestJS y quiero saber sus ventajas.',
        tags: 'nestjs,backend'
    }, headers);
    const questionId = qRes.data.id;
    console.log('   Success! Question created:', questionId);

    console.log('\n3. Waiting for AI Brain (8 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 8000));

    console.log('\n4. Verifying AI Answer...');
    const qDetail = await axios.get(`${API_URL}/aula/questions/${questionId}`, headers);
    const aiAnswer = qDetail.data.answers.find(a => a.body.startsWith('🤖'));

    if (aiAnswer) {
        console.log('   Success! AI Answer found:', aiAnswer.body.substring(0, 50) + '...');
    } else {
        console.error('   Error: AI Answer NOT found.');
        process.exit(1);
    }

    console.log('\nALL BRAIN CHECKS PASSED.');

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
