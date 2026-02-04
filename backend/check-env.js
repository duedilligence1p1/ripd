require('dotenv').config();
console.log('GEMINI_API_KEY from env:', process.env.GEMINI_API_KEY ? 'FOUND (starts with ' + process.env.GEMINI_API_KEY.substring(0, 7) + ')' : 'NOT FOUND');
