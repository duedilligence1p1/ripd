require('dotenv').config();

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();
        console.log('MODEL LIST:');
        data.models.forEach(m => console.log(`- ${m.name}`));
    } catch (e) {
        console.error('Error:', e.message);
    }
}

listModels();
