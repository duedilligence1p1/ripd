require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function debugAI() {
    console.log('--- DIAGNÓSTICO DE IA ---');
    const key = process.env.GEMINI_API_KEY;

    if (!key) {
        console.error('❌ ERRO: Chave GEMINI_API_KEY não encontrada no .env');
        return;
    }

    console.log('✅ Chave encontrada:', key.substring(0, 10) + '...');

    const genAI = new GoogleGenerativeAI(key);
    const modelName = "gemini-1.5-flash";

    try {
        console.log(`\n1. Testando modelo: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        console.log('2. Enviando pergunta de teste: "Qual seu nome?"');
        const result = await model.generateContent("Qual seu nome?");
        const response = await result.response;
        console.log('✅ RESPOSTA RECEBIDA:', response.text());

        console.log('\n3. Testando modo Chat (usado no sistema)...');
        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: "Contexto: Sou um DPO." }] },
                { role: "model", parts: [{ text: "Ok." }] }
            ]
        });
        const chatResult = await chat.sendMessage("Responda apenas: OK-FUNCIONANDO");
        const chatResponse = await chatResult.response;
        console.log('✅ CHAT RESPONSE:', chatResponse.text());

        console.log('\n--- DIAGNÓSTICO CONCLUÍDO COM SUCESSO ---');
    } catch (error) {
        console.error('\n❌ ERRO DURANTE O TESTE:');
        console.error('Mensagem:', error.message);
        if (error.status) console.error('Status HTTP:', error.status);
        if (error.statusText) console.error('Status Text:', error.statusText);

        if (error.message.includes('NOT_FOUND') || error.message.includes('404')) {
            console.log('\n💡 SUGESTÃO: O modelo selecionado pode não estar disponível para sua chave ainda. Tentando modelos alternativos...');
            // Tenta listar modelos disponíveis
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
                const data = await response.json();
                console.log('Modelos disponíveis na sua conta:', data.models ? data.models.map(m => m.name).join(', ') : 'Nenhum encontrado');
            } catch (e) {
                console.error('Não foi possível listar modelos:', e.message);
            }
        }
    }
}

debugAI();
