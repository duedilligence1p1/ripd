const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');
const { generateActionsAI } = require('../services/aiService');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// GET /api/actions/project/:projectId - Get actions for a project
router.get('/project/:projectId', async (req, res) => {
    try {
        const project = await prisma.project.findFirst({
            where: { id: req.params.projectId, userId: req.user.id }
        });

        if (!project) {
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }

        const actions = await prisma.actionPlan.findMany({
            where: { projectId: req.params.projectId },
            orderBy: [{ status: 'asc' }, { priority: 'desc' }]
        });

        res.json(actions);
    } catch (error) {
        console.error('Get actions error:', error);
        res.status(500).json({ error: 'Erro ao buscar ações' });
    }
});

// POST /api/actions - Create action
router.post('/', async (req, res) => {
    try {
        const { projectId, measure, description, responsible, deadline, priority } = req.body;

        if (!projectId || !measure || !responsible || !deadline) {
            return res.status(400).json({
                error: 'Projeto, medida, responsável e prazo são obrigatórios'
            });
        }

        const project = await prisma.project.findFirst({
            where: { id: projectId, userId: req.user.id }
        });

        if (!project) {
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }

        const action = await prisma.actionPlan.create({
            data: {
                measure,
                description,
                responsible,
                deadline: new Date(deadline),
                priority: priority || 1,
                projectId
            }
        });

        // Update project maturity score
        await updateProjectMaturity(projectId);

        res.status(201).json(action);
    } catch (error) {
        console.error('Create action error:', error);
        res.status(500).json({ error: 'Erro ao criar ação' });
    }
});

// POST /api/actions/generate - Generate actions automatically
router.post('/generate', async (req, res) => {
    try {
        const { projectId } = req.body;
        const { generateActionsForProject } = require('../services/actionGenerator');

        const project = await prisma.project.findFirst({
            where: { id: projectId, userId: req.user.id },
            include: { risks: true }
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
        let generatedActions = await generateActionsAI(parsedProject, project.risks);

        if (!generatedActions || generatedActions.length === 0) {
            console.log('Falling back to static action generator');
            generatedActions = generateActionsForProject(parsedProject, project.risks);
        } else {
            // Ensure dates are correctly formatted for Prisma
            generatedActions = generatedActions.map(action => ({
                ...action,
                deadline: action.deadline ? new Date(action.deadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                status: 'PENDING'
            }));
        }

        // Create actions in transaction
        const createdActions = await prisma.$transaction(
            generatedActions.map(action =>
                prisma.actionPlan.create({
                    data: {
                        ...action,
                        projectId
                    }
                })
            )
        );

        // Update maturity
        await updateProjectMaturity(projectId);

        res.json(createdActions);
    } catch (error) {
        console.error('Generate actions error:', error);
        res.status(500).json({ error: 'Erro ao gerar ações automáticas' });
    }
});

// PUT /api/actions/:id - Update action
router.put('/:id', async (req, res) => {
    try {
        const { measure, description, responsible, deadline, priority, status } = req.body;

        const existingAction = await prisma.actionPlan.findUnique({
            where: { id: req.params.id },
            include: { project: true }
        });

        if (!existingAction || existingAction.project.userId !== req.user.id) {
            return res.status(404).json({ error: 'Ação não encontrada' });
        }

        const action = await prisma.actionPlan.update({
            where: { id: req.params.id },
            data: {
                measure: measure ?? existingAction.measure,
                description: description ?? existingAction.description,
                responsible: responsible ?? existingAction.responsible,
                deadline: deadline ? new Date(deadline) : existingAction.deadline,
                priority: priority ?? existingAction.priority,
                status: status ?? existingAction.status
            }
        });

        // Update maturity when status changes
        if (status) {
            await updateProjectMaturity(existingAction.projectId);
        }

        res.json(action);
    } catch (error) {
        console.error('Update action error:', error);
        res.status(500).json({ error: 'Erro ao atualizar ação' });
    }
});

// PUT /api/actions/:id/status - Quick status update
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Status inválido' });
        }

        const existingAction = await prisma.actionPlan.findUnique({
            where: { id: req.params.id },
            include: { project: true }
        });

        if (!existingAction || existingAction.project.userId !== req.user.id) {
            return res.status(404).json({ error: 'Ação não encontrada' });
        }

        const action = await prisma.actionPlan.update({
            where: { id: req.params.id },
            data: { status }
        });

        await updateProjectMaturity(existingAction.projectId);

        res.json(action);
    } catch (error) {
        console.error('Update action status error:', error);
        res.status(500).json({ error: 'Erro ao atualizar status' });
    }
});

// DELETE /api/actions/:id - Delete action
router.delete('/:id', async (req, res) => {
    try {
        const action = await prisma.actionPlan.findUnique({
            where: { id: req.params.id },
            include: { project: true }
        });

        if (!action || action.project.userId !== req.user.id) {
            return res.status(404).json({ error: 'Ação não encontrada' });
        }

        await prisma.actionPlan.delete({
            where: { id: req.params.id }
        });

        await updateProjectMaturity(action.projectId);

        res.json({ message: 'Ação excluída com sucesso' });
    } catch (error) {
        console.error('Delete action error:', error);
        res.status(500).json({ error: 'Erro ao excluir ação' });
    }
});

// Helper function to update project maturity score
async function updateProjectMaturity(projectId) {
    const actions = await prisma.actionPlan.findMany({
        where: { projectId }
    });

    const completedActions = actions.filter(a => a.status === 'COMPLETED').length;
    const totalActions = actions.length;
    const maturityScore = totalActions > 0
        ? parseFloat(((completedActions / totalActions) * 5).toFixed(2))
        : 0;

    await prisma.project.update({
        where: { id: projectId },
        data: { maturityScore }
    });
}

module.exports = router;
