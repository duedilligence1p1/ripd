const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');
const { calculateRiskLevel } = require('../services/riskCalculator');
const { generateRisksAI } = require('../services/aiService');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// GET /api/risks/project/:projectId - Get risks for a project
router.get('/project/:projectId', async (req, res) => {
    try {
        // Verify project ownership
        const project = await prisma.project.findFirst({
            where: { id: req.params.projectId, userId: req.user.id }
        });

        if (!project) {
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }

        const risks = await prisma.risk.findMany({
            where: { projectId: req.params.projectId },
            orderBy: { criticalValue: 'desc' }
        });

        res.json(risks);
    } catch (error) {
        console.error('Get risks error:', error);
        res.status(500).json({ error: 'Erro ao buscar riscos' });
    }
});

// POST /api/risks - Create risk
router.post('/', async (req, res) => {
    try {
        const { projectId, description, source, impact, probability, mitigation } = req.body;

        if (!projectId || !description || !source || !impact || !probability) {
            return res.status(400).json({
                error: 'Projeto, descrição, fonte, impacto e probabilidade são obrigatórios'
            });
        }

        // Validate impact and probability ranges
        if (impact < 1 || impact > 5 || probability < 1 || probability > 5) {
            return res.status(400).json({
                error: 'Impacto e probabilidade devem estar entre 1 e 5'
            });
        }

        // Verify project ownership
        const project = await prisma.project.findFirst({
            where: { id: projectId, userId: req.user.id }
        });

        if (!project) {
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }

        const criticalValue = impact * probability;
        const level = calculateRiskLevel(criticalValue);

        const risk = await prisma.risk.create({
            data: {
                description,
                source,
                impact,
                probability,
                criticalValue,
                level,
                mitigation,
                projectId
            }
        });

        res.status(201).json(risk);
    } catch (error) {
        console.error('Create risk error:', error);
        res.status(500).json({ error: 'Erro ao criar risco' });
    }
});

// POST /api/risks/generate - Generate risks automatically
router.post('/generate', async (req, res) => {
    try {
        const { projectId } = req.body;
        const { generateRisksForProject } = require('../services/riskGenerator');

        const project = await prisma.project.findFirst({
            where: { id: projectId, userId: req.user.id }
        });

        if (!project) {
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }

        // Parse boolean fields that might be strings in SQLite
        const parsedProject = {
            ...project,
            hasSensitiveData: Boolean(project.hasSensitiveData),
            hasBiometricData: Boolean(project.hasBiometricData),
            hasInternationalTransfer: Boolean(project.hasInternationalTransfer),
            hasMinorData: Boolean(project.hasMinorData),
            hasAutomatedDecision: Boolean(project.hasAutomatedDecision)
        };

        // Try AI generation first
        let generatedRisks = await generateRisksAI(parsedProject);

        // Fallback to static generator if AI fails or returns empty
        if (!generatedRisks || generatedRisks.length === 0) {
            console.log('Falling back to static risk generator');
            generatedRisks = generateRisksForProject(parsedProject);
        } else {
            // Ensure levels are calculated for AI generated risks
            generatedRisks = generatedRisks.map(risk => {
                const criticalValue = risk.impact * risk.probability;
                return {
                    ...risk,
                    criticalValue,
                    level: calculateRiskLevel(criticalValue)
                };
            });
        }

        // Create risks in transaction
        const createdRisks = await prisma.$transaction(
            generatedRisks.map(risk =>
                prisma.risk.create({
                    data: {
                        ...risk,
                        projectId
                    }
                })
            )
        );

        res.json(createdRisks);
    } catch (error) {
        console.error('Generate risks error:', error);
        res.status(500).json({ error: 'Erro ao gerar riscos automáticos' });
    }
});

// PUT /api/risks/:id - Update risk
router.put('/:id', async (req, res) => {
    try {
        const { description, source, impact, probability, mitigation } = req.body;

        const existingRisk = await prisma.risk.findUnique({
            where: { id: req.params.id },
            include: { project: true }
        });

        if (!existingRisk || existingRisk.project.userId !== req.user.id) {
            return res.status(404).json({ error: 'Risco não encontrado' });
        }

        const newImpact = impact ?? existingRisk.impact;
        const newProbability = probability ?? existingRisk.probability;
        const criticalValue = newImpact * newProbability;
        const level = calculateRiskLevel(criticalValue);

        const risk = await prisma.risk.update({
            where: { id: req.params.id },
            data: {
                description: description ?? existingRisk.description,
                source: source ?? existingRisk.source,
                impact: newImpact,
                probability: newProbability,
                criticalValue,
                level,
                mitigation: mitigation ?? existingRisk.mitigation
            }
        });

        res.json(risk);
    } catch (error) {
        console.error('Update risk error:', error);
        res.status(500).json({ error: 'Erro ao atualizar risco' });
    }
});

// DELETE /api/risks/:id - Delete risk
router.delete('/:id', async (req, res) => {
    try {
        const risk = await prisma.risk.findUnique({
            where: { id: req.params.id },
            include: { project: true }
        });

        if (!risk || risk.project.userId !== req.user.id) {
            return res.status(404).json({ error: 'Risco não encontrado' });
        }

        await prisma.risk.delete({
            where: { id: req.params.id }
        });

        res.json({ message: 'Risco excluído com sucesso' });
    } catch (error) {
        console.error('Delete risk error:', error);
        res.status(500).json({ error: 'Erro ao excluir risco' });
    }
});

module.exports = router;
