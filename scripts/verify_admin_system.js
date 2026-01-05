const axios = require('axios');

const API_URL = 'http://localhost:3000';
let adminToken;
let userToken;
let userId;

async function login(email, password) {
  try {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    return res.data; // { access_token }
  } catch (e) {
    console.error(`Login failed for ${email}:`, e.response?.data || e.message);
    return null;
  }
}

async function register(email, username, password) {
    try {
        await axios.post(`${API_URL}/auth/register`, { email, username, password });
        console.log('Registered user.');
    } catch (e) {
        // Ignore if already exists
        console.log('User might already exist, proceeding to login.');
    }
}

async function getMe(token) {
    const res = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
}

async function run() {
  console.log('--- Verifying Admin System ---');

  // 1. Login Admin
  const adminData = await login('admin@crunevo.local', 'Admin123!');
  if (!adminData) {
      console.error('Admin login failed. Make sure to run seed: npx prisma db seed');
      process.exit(1);
  }
  adminToken = adminData.access_token;
  console.log('Admin logged in.');

  // 2. Register/Login Test User
  await register('testuser@example.com', 'testuser', 'Password123!');
  const userData = await login('testuser@example.com', 'Password123!');
  if (!userData) {
      console.error('Test User login failed.');
      process.exit(1);
  }
  userToken = userData.access_token;
  
  const me = await getMe(userToken);
  userId = me.id;
  console.log('Test User logged in:', userId);

  // 3. Test Get Users (Admin)
  try {
      const res = await axios.get(`${API_URL}/admin/users?search=testuser`, {
          headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('Search Users Result:', res.data.length > 0 ? 'Found' : 'Not Found');
      if (res.data.length === 0) throw new Error('User not found');
  } catch (e) {
      console.error('Get Users failed:', e.response?.data || e.message);
  }

  // 4. Test Update Stats
  try {
      await axios.post(`${API_URL}/admin/users/${userId}/stats`, { points: 100, level: 5 }, {
          headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('Update Stats: Success');
  } catch (e) {
      console.error('Update Stats failed:', e.response?.data || e.message);
  }

  // 5. Test Ban
  try {
      await axios.post(`${API_URL}/admin/users/${userId}/ban`, { isBanned: true }, {
          headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('Ban User: Success');
  } catch (e) {
      console.error('Ban User failed:', e.response?.data || e.message);
  }

  // 6. Test Unban
  try {
      await axios.post(`${API_URL}/admin/users/${userId}/ban`, { isBanned: false }, {
          headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('Unban User: Success');
  } catch (e) {
      console.error('Unban User failed:', e.response?.data || e.message);
  }

  console.log('--- Verification Complete ---');
}

run();
