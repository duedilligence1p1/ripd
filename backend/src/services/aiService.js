const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');

// Initialize Groq client lazily
let groqClient = null;

function getGroqClient() {
    if (!groqClient && process.env.GROQ_API_KEY) {
        groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    return groqClient;
}

/**
 * Generate a response using Groq AI (Llama model)
 * @param {string} message - The user message
 * @param {Object} context - Contextual data (project details, gaps, etc.)
 * @returns {Promise<string>} AI generated response
 */
async function generateChatResponse(message, context) {
    try {
        console.log('GROQ_API_KEY status:', process.env.GROQ_API_KEY ? 'Present' : 'Missing');

        if (!process.env.GROQ_API_KEY) {
            console.error('CRITICAL: GROQ_API_KEY is missing in process.env');
            return "O Groq API Key não está configurado. Verifique o arquivo .env.";
        }

        const client = getGroqClient();

        const risksInfo = context.risks && context.risks.length > 0
            ? context.risks.map(r => `- ${r.description} (Nível: ${r.level})`).join('\n')
            : 'Nenhum risco mapeado.';

        const actionsInfo = context.actions && context.actions.length > 0
            ? context.actions.map(a => `- ${a.measure} (Status: ${a.status})`).join('\n')
            : 'Nenhum plano de ação.';

        const systemPrompt = `Você é o DPO Co-Pilot, assistente especialista em LGPD e RIPD.
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
- Responda sempre em português brasileiro.`;

        console.log('--- ENVIANDO PARA GROQ ---');
        console.log('Pergunta:', message);

        const chatCompletion = await client.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 1024,
        });

        return chatCompletion.choices[0]?.message?.content || "Desculpe, não consegui gerar uma resposta.";
    } catch (error) {
        const errorLog = `
--- GROQ ERROR ${new Date().toISOString()} ---
Message: ${error.message}
Stack: ${error.stack}
-----------------------------------
`;
        fs.appendFileSync(path.join(__dirname, '../../groq-error.log'), errorLog);
        console.error('--- GROQ ERROR DETAILS ---');
        console.error('Message:', error.message);

        // Handle specific error codes with user-friendly messages
        if (error.message.includes('429') || error.message.includes('Too Many Requests') || error.message.includes('rate')) {
            return "⚠️ Estamos com muitas requisições no momento. Por favor, aguarde alguns segundos e tente novamente.";
        }
        if (error.message.includes('401') || error.message.includes('invalid') || error.message.includes('Unauthorized')) {
            return "⚠️ A chave de API está inválida. Por favor, entre em contato com o administrador do sistema.";
        }
        if (error.message.includes('404') || error.message.includes('not found')) {
            return "⚠️ O modelo de IA não está disponível. Por favor, entre em contato com o suporte.";
        }

        // Generic fallback
        return "Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente mais tarde.";
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
        if (!process.env.GROQ_API_KEY) {
            throw new Error('API Key não configurada');
        }

        const client = getGroqClient();

        const prompt = `Você é um analista de riscos de privacidade. Gere uma lista de riscos para o projeto: "${project.name}".
        Contexto:
        - Dados Sensíveis: ${project.hasSensitiveData}
        - Biométricos: ${project.hasBiometricData}
        - Menores: ${project.hasMinorData}
        - Decisões Automatizadas: ${project.hasAutomatedDecision}
        - Setor Regulado: ${project.isRegulatedSector}
        - Categorias: ${project.dataCategories}
        - Finalidades: ${project.purposes}

        Retorne APENAS um array JSON válido de objetos com:
        - description: descrição clara do risco
        - source: fonte do risco (ex: Processamento indevido)
        - impact: 1 a 5
        - probability: 1 a 5
        - mitigation: sugestão de medida inicial

        Gere entre 4 e 6 riscos relevantes.
        Retorne SOMENTE o JSON, sem texto adicional.`;

        const chatCompletion = await client.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_tokens: 2048,
        });

        const responseText = chatCompletion.choices[0]?.message?.content || "[]";
        // Extract JSON from response
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(responseText);
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
        if (!process.env.GROQ_API_KEY) {
            throw new Error('API Key não configurada');
        }

        const client = getGroqClient();

        const risksText = risks.map(r => r.description).join(', ');

        const prompt = `Você é um gestor de segurança e privacidade. Gere um plano de ação para o projeto: "${project.name}".
        Riscos identificados: ${risksText}
        Contexto:
        - Dados Sensíveis: ${project.hasSensitiveData}
        
        Retorne APENAS um array JSON válido de objetos com:
        - measure: Nome da medida (ex: MFA)
        - description: O que deve ser feito
        - responsible: Área responsável (ex: TI)
        - priority: 1 a 5

        Gere medidas práticas para mitigar os riscos informados.
        Retorne SOMENTE o JSON, sem texto adicional.`;

        const chatCompletion = await client.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_tokens: 2048,
        });

        const responseText = chatCompletion.choices[0]?.message?.content || "[]";
        // Extract JSON from response
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(responseText);
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
