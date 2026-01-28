const express = require('express');
const router = express.Router();

// Mock DPO Co-Pilot Logic
router.post('/', async (req, res) => {
    try {
        const { message, context } = req.body;
        const lowerMsg = message.toLowerCase();

        // Simulate thinking time
        await new Promise(resolve => setTimeout(resolve, 800));

        let reply = '';

        // Rule 2: Focus
        if (lowerMsg.includes('receita de bolo') || lowerMsg.includes('futebol') || lowerMsg.includes('política')) {
            return res.json({ reply: 'Meu foco é exclusivamente o Relatório de Impacto à Proteção de Dados (RIPD). Posso ajudar com questões de segurança e conformidade.' });
        }

        // Rule 3: Consultative (Legal Basis)
        if (lowerMsg.includes('base legal') || lowerMsg.includes('legítimo interesse') || lowerMsg.includes('execução de contrato')) {
            reply = 'Para este tratamento, a diferença é: **Execução de Contrato** é quando o dado é essencial para prestar o serviço (ex: endereço para entrega). **Legítimo Interesse** é mais flexível, mas exige teste de balanço e opção de opt-out (ex: marketing). Dado que seu setor é regulado, priorize Bases Legais explícitas quando possível.';
        }
        // Rule 4: Security Suggestions (Based on Gaps)
        else if (lowerMsg.includes('segurança') || lowerMsg.includes('medida') || lowerMsg.includes('proteção') || lowerMsg.includes('vulnerabilidade')) {
            reply = `Considerando a maturidade atual (0.49/5.00) e os gaps em *${context.gaps.join(', ')}*, recomendo fortemente:\n\n1. **Gestão de Vulnerabilidades**: Implementar scans recorrentes.\n2. **Criptografia**: Ativar TLS 1.3 em trânsito e AES-256 no banco.\n3. **Logs**: Centralizar logs de acesso para melhorar a Resposta a Incidentes.`;
        }
        // General RIPD Help
        else if (lowerMsg.includes('risco') || lowerMsg.includes('impacto')) {
            reply = 'Para avaliar o risco, considere a probabilidade de um vazamento e o impacto no titular. Se houver dados sensíveis (o que parece ser o caso neste projeto), o impacto é automaticamente ALTO. Recomendo classificar como "Risco Elevado" e propor criptografia como mitigação.';
        }
        // Default generic response
        else {
            reply = 'Entendido. Para o RIPD, certifique-se de documentar detalhadamente o fluxo deste dado. Você precisa de sugestões específicas de mitigação para este passo?';
        }

        res.json({ reply });

    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({ error: 'Erro ao processar mensagem' });
    }
});

module.exports = router;
