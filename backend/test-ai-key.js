require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testAI() {
    const key = process.env.GEMINI_API_KEY;
    console.log('Testing KEY:', key ? key.substring(0, 10) + '...' : 'NONE');

    if (!key || key.includes('placeholder') || key.includes('...')) {
        console.error('ERROR: KEY is likely a placeholder or missing.');
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: "Você é um assistente de teste."
        });

        console.log('Sending message to Gemini...');
        const result = await model.generateContent("Olá, responda com a palavra FUNCIONANDO");
        const response = await result.response;
        console.log('RESPONSE:', response.text());
    } catch (error) {
        console.error('DETAILED ERROR:', error.message);
        if (error.stack) console.error(error.stack);
    }
}

testAI();
