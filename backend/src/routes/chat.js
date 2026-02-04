const express = require('express');
const router = express.Router();
const { generateChatResponse } = require('../services/aiService');

// DPO Co-Pilot Logic
router.post('/', async (req, res) => {
    try {
        const { message, context } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Mensagem é obrigatória' });
        }

        const reply = await generateChatResponse(message, context);

        res.json({ reply });

    } catch (error) {
        console.error('Chat Route Error:', error);
        res.status(500).json({ error: 'Erro interno do servidor. Por favor, tente novamente.' });
    }
});

module.exports = router;

