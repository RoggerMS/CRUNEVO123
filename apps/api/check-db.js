const { Client } = require('pg');

const configs = [
  { user: 'postgres', password: 'admin', port: 5432 },
  { user: 'postgres', password: 'password', port: 5432 },
  { user: 'postgres', password: 'postgres', port: 5432 },
  { user: 'postgres', password: '123', port: 5432 },
  { user: 'postgres', password: 'CrunevoSecurePwd2024!', port: 5432 },
  { user: 'postgres', password: 'CrunevoSecurePwd2024!', port: 5433 },
];

async function check() {
  for (const conf of configs) {
    const client = new Client({
      host: 'localhost',
      port: conf.port,
      user: conf.user,
      password: conf.password,
      database: 'postgres', // Connect to default db first
    });

    try {
      console.log(`Trying ${conf.user}:***@localhost:${conf.port}...`);
      await client.connect();
      console.log(`SUCCESS! Connected to localhost:${conf.port} with password '${conf.password}'`);
      
      // Check if crunevo db exists
      const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'crunevo'");
      if (res.rows.length > 0) {
          console.log("Database 'crunevo' EXISTS.");
      } else {
          console.log("Database 'crunevo' DOES NOT EXIST.");
      }
      
      await client.end();
      return;
    } catch (err) {
      console.log(`Failed: ${err.message}`);
    }
  }
  console.log("All attempts failed.");
}

check();
