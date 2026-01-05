const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function run() {
  try {
    console.log('1. Logging in as Admin (User A)...');
    const loginResA = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin_oficial@crunevo.local',
      password: 'User123!',
    });
    const tokenA = loginResA.data.access_token;
    console.log('   Success! Token A received.');
    const headersA = { headers: { Authorization: `Bearer ${tokenA}` } };

    // Need a second user. Let's register one if not exists.
    console.log('\n2. Registering/Logging in User B...');
    let tokenB;
    let userBId;
    try {
        const loginResB = await axios.post(`${API_URL}/auth/login`, {
            email: 'chatuser@crunevo.local',
            password: 'User123!',
        });
        tokenB = loginResB.data.access_token;
        const meRes = await axios.get(`${API_URL}/users/me`, { headers: { Authorization: `Bearer ${tokenB}` } });
        userBId = meRes.data.id;
        console.log('   Success! Logged in as User B.');
    } catch (e) {
        // Register if login fails
        console.log('   User B not found, registering...');
        try {
            await axios.post(`${API_URL}/auth/register`, {
                email: 'chatuser@crunevo.local',
                username: 'chatuser',
                password: 'User123!',
            });
        } catch (regError) {
            // Might fail if already exists but login failed for other reason? Or race condition.
            // Try login again.
            console.log('   Register failed (maybe exists), retrying login...');
        }
        
        const loginResB = await axios.post(`${API_URL}/auth/login`, {
            email: 'chatuser@crunevo.local',
            password: 'User123!',
        });
        tokenB = loginResB.data.access_token;
        const meRes = await axios.get(`${API_URL}/users/me`, { headers: { Authorization: `Bearer ${tokenB}` } });
        userBId = meRes.data.id;
        console.log('   Success! Registered and logged in as User B.');
    }
    const headersB = { headers: { Authorization: `Bearer ${tokenB}` } };

    console.log('\n3. User A starts conversation with User B...');
    const convRes = await axios.post(`${API_URL}/messages/conversations`, { toUserId: userBId }, headersA);
    const conversationId = convRes.data.id;
    console.log('   Success! Conversation ID:', conversationId);

    console.log('\n4. User A sends "Hola"...');
    await axios.post(`${API_URL}/messages/conversations/${conversationId}`, { content: 'Hola' }, headersA);
    console.log('   Success! Message sent.');

    console.log('\n5. User B lists conversations...');
    const convListB = await axios.get(`${API_URL}/messages/conversations`, headersB);
    const convForB = convListB.data.find(c => c.id === conversationId);
    
    if (convForB && convForB.lastMessage && convForB.lastMessage.content === 'Hola') {
        console.log('   Success! User B sees conversation and last message "Hola".');
    } else {
        console.error('   Error: User B did not see the message correctly.');
        console.log('B Conversations:', JSON.stringify(convListB.data, null, 2));
        process.exit(1);
    }

    console.log('\n6. User B responds "Mundo"...');
    await axios.post(`${API_URL}/messages/conversations/${conversationId}`, { content: 'Mundo' }, headersB);
    console.log('   Success! Response sent.');

    console.log('\n7. User A reads messages...');
    const messagesA = await axios.get(`${API_URL}/messages/conversations/${conversationId}`, headersA);
    const lastMsg = messagesA.data[messagesA.data.length - 1];
    
    if (lastMsg.content === 'Mundo') {
        console.log('   Success! User A received "Mundo".');
    } else {
        console.error('   Error: User A did not receive response.');
        process.exit(1);
    }

    console.log('\nALL CHAT CHECKS PASSED.');

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
