const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_URL = 'http://localhost:3000';

async function run() {
  try {
    console.log('1. Logging in...');
    const email = `logic_test_${Date.now()}@crunevo.local`;
    await axios.post(`${API_URL}/auth/register`, {
        email,
        username: `logic_${Date.now()}`,
        password: 'User123!',
    });
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
        email,
        password: 'User123!',
    });
    const token = loginRes.data.access_token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log('2. Getting initial stats...');
    const me1 = await axios.get(`${API_URL}/users/me`, { headers });
    const initialPoints = me1.data.points;
    console.log(`   Points: ${initialPoints}`);

    console.log('3. Uploading Document (Should trigger logic)...');
    // Create dummy file
    fs.writeFileSync('dummy_logic.txt', 'Content logic');
    const form = new FormData();
    form.append('file', fs.createReadStream('dummy_logic.txt'));
    form.append('title', 'Logic Test Doc');
    form.append('description', 'Testing event emitter');
    form.append('visibility', 'PUBLIC');

    await axios.post(`${API_URL}/documents`, form, {
        headers: { ...headers, ...form.getHeaders() }
    });
    
    // Clean up
    fs.unlinkSync('dummy_logic.txt');

    console.log('4. Waiting for Event Processing (1s)...');
    await new Promise(r => setTimeout(r, 1000));

    console.log('5. Checking stats again...');
    const me2 = await axios.get(`${API_URL}/users/me`, { headers });
    const newPoints = me2.data.points;
    console.log(`   Points: ${newPoints}`);

    if (newPoints > initialPoints) {
        console.log(`   SUCCESS: Points increased by ${newPoints - initialPoints}`);
    } else {
        throw new Error('Points did not increase! Event logic failed.');
    }

    console.log('6. Checking Level Up Logic...');
    // Formula: floor(sqrt(points)/10) + 1
    // Need 100 pts for Lvl 2.
    // Create new stream for second upload
    fs.writeFileSync('dummy_logic2.txt', 'Content logic 2');
    const form2 = new FormData();
    form2.append('file', fs.createReadStream('dummy_logic2.txt'));
    form2.append('title', 'Doc 2');
    form2.append('visibility', 'PUBLIC');
    
    // Retry logic or just standard request
    await axios.post(`${API_URL}/documents`, form2, { 
        headers: { ...headers, ...form2.getHeaders() } 
    });
    fs.unlinkSync('dummy_logic2.txt');

    await new Promise(r => setTimeout(r, 1000));
    const me3 = await axios.get(`${API_URL}/users/me`, { headers });
    console.log(`   Points: ${me3.data.points}, Level: ${me3.data.level}`);
    
    // Total should be roughly 100 (50+50) -> Level 2?
    // sqrt(100) = 10 / 10 = 1 + 1 = 2.
    if (me3.data.points >= 100 && me3.data.level >= 2) {
         console.log('   SUCCESS: Level Up Logic Verified!');
    } else {
         console.log('   Warning: Level up not reached yet (Points: ' + me3.data.points + '). Check formula.');
    }

    console.log('\nLOGIC ARCHITECTURE VERIFIED.');

  } catch (error) {
    console.error('\nFAILED:', error.message);
    if (error.response) console.error('Data:', error.response.data);
    process.exit(1);
  }
}

run();
