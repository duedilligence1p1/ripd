const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Initialize Gemini API (now handled lazily)

/**
 * Generate a response using Gemini AI
 * @param {string} prompt - The user message
 * @param {Object} context - Contextual data (project details, gaps, etc.)
 * @returns {Promise<string>} AI generated response
 */
async function generateChatResponse(message, context) {
    try {
        console.log('GEMINI_API_KEY status:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');

        if (!process.env.GEMINI_API_KEY) {
            return "O Gemini API Key não está configurado. Verifique o arquivo .env.";
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: "models/gemini-2.0-flash"
        });

        const risksInfo = context.risks && context.risks.length > 0
            ? context.risks.map(r => `- ${r.description} (Nível: ${r.level})`).join('\n')
            : 'Nenhum risco mapeado.';

        const actionsInfo = context.actions && context.actions.length > 0
            ? context.actions.map(a => `- ${a.measure} (Status: ${a.status})`).join('\n')
            : 'Nenhum plano de ação.';

        const roleContext = `Você é o DPO Co-Pilot, assistente especialista em LGPD e RIPD.
Projeto: "${context.projectName || 'sem nome'}"
Passo Atual: ${context.currentStep || 1} / 6 (${getStepName(context.currentStep)})

Dados Atuais:
- Sensíveis: ${context.hasSensitiveData ? 'Sim' : 'Não'}
- Biométricos: ${context.hasBiometricData ? 'Sim' : 'Não'}
- Menores: ${context.hasMinorData ? 'Sim' : 'Não'}
- Perfilamento: ${context.hasProfileSurveillance ? 'Sim' : 'Não'}

Riscos do Projeto:
${risksInfo}

Ações Planejadas:
${actionsInfo}

Instruções:
- Responda de forma PERSONALIZADA à pergunta abaixo.
- Use o contexto acima para enriquecer sua resposta.
- Se for uma pergunta teórica sobre LGPD, explique claramente.
- Se for sobre o preenchimento, sugira o que fazer neste passo ${context.currentStep}.
`;

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: roleContext }],
                },
                {
                    role: "model",
                    parts: [{ text: "Entendido. Sou o DPO Co-Pilot e estou pronto para ajudar com base no contexto do seu projeto. O que você gostaria de saber?" }],
                },
            ],
        });

        console.log('--- ENVIANDO PARA IA ---');
        console.log('Pergunta:', message);

        const result = await chat.sendMessage(message);
        const response = await result.response;
        return response.text();
    } catch (error) {
        const errorLog = `
--- GEMINI ERROR ${new Date().toISOString()} ---
Message: ${error.message}
Stack: ${error.stack}
-----------------------------------
`;
        fs.appendFileSync(path.join(__dirname, '../../gemini-error.log'), errorLog);
        console.error('--- GEMINI ERROR DETAILS ---');
        console.error('Message:', error.message);
        throw new Error('Falha ao processar resposta da IA: ' + error.message);
    }
}

function getStepName(step) {
    const steps = {
        1: 'Agentes e Projeto',
        2: 'Natureza do Tratamento',
        3: 'Ciclo de Vida',
        4: 'Matriz de Riscos',
        5: 'Plano de Ação',
        6: 'Aprovações'
    };
    return steps[step] || 'Preenchimento';
}

/**
 * Generate risks using AI
 */
async function generateRisksAI(project) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('API Key não configurada');
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: "models/gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `Você é um analista de riscos de privacidade. Gere uma lista de riscos para o projeto: "${project.name}".
        Contexto:
        - Dados Sensíveis: ${project.hasSensitiveData}
        - Biométricos: ${project.hasBiometricData}
        - Menores: ${project.hasMinorData}
        - Decisões Automatizadas: ${project.hasAutomatedDecision}
        - Setor Regulado: ${project.isRegulatedSector}
        - Categorias: ${project.dataCategories}
        - Finalidades: ${project.purposes}

        Retorne um array JSON de objetos com:
        - description: descrição clara do risco
        - source: fonte do risco (ex: Processamento indevido)
        - impact: 1 a 5
        - probability: 1 a 5
        - mitigation: sugestão de medida inicial

        Gere entre 4 e 6 riscos relevantes.
        Formato: [ { "description": "...", "source": "...", "impact": 3, "probability": 2, "mitigation": "..." } ]`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return JSON.parse(response.text());
    } catch (error) {
        console.error('AI Risk Gen Error:', error);
        return null; // Fallback to mock logic in route
    }
}

/**
 * Generate actions using AI
 */
async function generateActionsAI(project, risks) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('API Key não configurada');
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: "models/gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const risksText = risks.map(r => r.description).join(', ');

        const prompt = `Você é um gestor de segurança e privacidade. Gere um plano de ação para o projeto: "${project.name}".
        Riscos identificados: ${risksText}
        Contexto:
        - Dados Sensíveis: ${project.hasSensitiveData}
        
        Retorne um array JSON de objetos com:
        - measure: Nome da medida (ex: MFA)
        - description: O que deve ser feito
        - responsible: Área responsável (ex: TI)
        - priority: 1 a 5

        Gere medidas práticas para mitigar os riscos informados.
        Formato: [ { "measure": "...", "description": "...", "responsible": "...", "priority": 5 } ]`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return JSON.parse(response.text());
    } catch (error) {
        console.error('AI Action Gen Error:', error);
        return null;
    }
}

module.exports = {
    generateChatResponse,
    generateRisksAI,
    generateActionsAI
};
