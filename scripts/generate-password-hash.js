#!/usr/bin/env node

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('Usage: node generate-password-hash.js "your-password"');
  process.exit(1);
}

const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log('Password:', password);
console.log('Hash:', hash);
console.log('\nUse this hash in your SQL INSERT:');
console.log(`'${hash}'`);
