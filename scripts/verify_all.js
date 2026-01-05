const { execSync } = require('child_process');

function runScript(scriptName) {
  console.log(`\n========================================`);
  console.log(`RUNNING: ${scriptName}`);
  console.log(`========================================\n`);
  try {
    execSync(`node scripts/${scriptName}`, { stdio: 'inherit' });
    console.log(`\n✔ ${scriptName} PASSED`);
  } catch (error) {
    console.error(`\n❌ ${scriptName} FAILED`);
    process.exit(1);
  }
}

console.log('STARTING FULL SYSTEM VERIFICATION...');

// Sequence matters
runScript('verify_mvp.js');      // Basic Auth, Feed, Aula (Questions)
runScript('verify_apuntes.js');  // Documents/Apuntes flow
runScript('verify_store.js');    // Store/Marketplace flow
runScript('verify_chat.js');     // Messaging flow
runScript('verify_vitality.js'); // Gamification & Daily content
runScript('verify_brain.js');    // AI Event Driven architecture
runScript('verify_doc_management.js'); // Thumbnails & Versions

console.log(`\n========================================`);
console.log(`ALL VERIFICATIONS PASSED SUCCESSFULLY!`);
console.log(`========================================\n`);
