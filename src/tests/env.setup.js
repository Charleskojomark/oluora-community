// This file runs before setup.js and ensures environment variables are loaded
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.test') });

// Set NODE_ENV to test if not already set
process.env.NODE_ENV = 'test';