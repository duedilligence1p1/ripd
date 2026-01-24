const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authMiddleware);

// GET /api/projects - List user's projects
router.get('/', async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            where: { userId: req.user.id },
            include: {
                operators: true,
                risks: true,
                actions: true,
                _count: {
                    select: { risks: true, actions: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        const formattedProjects = projects.map(project => ({
            ...project,
            dataCategories: JSON.parse(project.dataCategories || '[]'),
            transferCountries: JSON.parse(project.transferCountries || '[]'),
            purposes: JSON.parse(project.purposes || '[]')
        }));

        res.json(formattedProjects);
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ error: 'Erro ao buscar projetos' });
    }
});

// GET /api/projects/:id - Get single project
router.get('/:id', async (req, res) => {
    try {
        const project = await prisma.project.findFirst({
            where: {
                id: req.params.id,
                userId: req.user.id
            },
            include: {
                operators: true,
                risks: { orderBy: { criticalValue: 'desc' } },
                actions: { orderBy: { priority: 'desc' } }
            }
        });

        if (!project) {
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }

        const formattedProject = {
            ...project,
            dataCategories: JSON.parse(project.dataCategories || '[]'),
            transferCountries: JSON.parse(project.transferCountries || '[]'),
            purposes: JSON.parse(project.purposes || '[]')
        };

        res.json(formattedProject);
    } catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({ error: 'Erro ao buscar projeto' });
    }
});

// POST /api/projects - Create project
router.post('/', async (req, res) => {
    try {
        const {
            name,
            description,
            controller,
            dpoName,
            dpoEmail,
            operators,
            hasSensitiveData,
            hasBiometricData,
            hasProfileSurveillance,
            isRegulatedSector,
            hasAutomatedDecision,
            hasMinorData,
            dataCategories,
            collectionMethod,
            hasInternationalTransfer,
            transferCountries,
            transferMechanism,
            purposes,
            retentionPeriodMonths,
            retentionJustification
        } = req.body;

        if (!name || !controller || !dpoName) {
            return res.status(400).json({
                error: 'Nome do projeto, controlador e DPO são obrigatórios'
            });
        }

        const project = await prisma.project.create({
            data: {
                name,
                description,
                controller,
                dpoName,
                dpoEmail,
                hasSensitiveData: hasSensitiveData || false,
                hasBiometricData: hasBiometricData || false,
                hasProfileSurveillance: hasProfileSurveillance || false,
                isRegulatedSector: isRegulatedSector !== false,
                hasAutomatedDecision: hasAutomatedDecision || false,
                hasMinorData: hasMinorData || false,
                dataCategories: JSON.stringify(dataCategories || []),
                collectionMethod,
                hasInternationalTransfer: hasInternationalTransfer || false,
                transferCountries: JSON.stringify(transferCountries || []),
                transferMechanism,
                purposes: JSON.stringify(purposes || []),
                retentionPeriodMonths,
                retentionJustification,
                userId: req.user.id,
                operators: operators?.length ? {
                    create: operators.map(op => ({
                        name: op.name,
                        type: op.type,
                        country: op.country
                    }))
                } : undefined
            },
            include: {
                operators: true
            }
        });

        res.status(201).json(project);
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({ error: 'Erro ao criar projeto' });
    }
});

// PUT /api/projects/:id - Update project
router.put('/:id', async (req, res) => {
    try {
        const existingProject = await prisma.project.findFirst({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!existingProject) {
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }

        const { operators, ...projectData } = req.body;

        // Convert arrays to JSON strings for SQLite storage
        if (Array.isArray(projectData.dataCategories)) {
            projectData.dataCategories = JSON.stringify(projectData.dataCategories);
        }
        if (Array.isArray(projectData.transferCountries)) {
            projectData.transferCountries = JSON.stringify(projectData.transferCountries);
        }
        if (Array.isArray(projectData.purposes)) {
            projectData.purposes = JSON.stringify(projectData.purposes);
        }

        // Update operators if provided
        if (operators) {
            await prisma.operator.deleteMany({
                where: { projectId: req.params.id }
            });
            await prisma.operator.createMany({
                data: operators.map(op => ({
                    name: op.name,
                    type: op.type,
                    country: op.country,
                    projectId: req.params.id
                }))
            });
        }

        // Calculate maturity score based on completed actions
        const actions = await prisma.actionPlan.findMany({
            where: { projectId: req.params.id }
        });

        const completedActions = actions.filter(a => a.status === 'COMPLETED').length;
        const totalActions = actions.length;
        const maturityScore = totalActions > 0
            ? (completedActions / totalActions) * 5
            : 0;

        const project = await prisma.project.update({
            where: { id: req.params.id },
            data: {
                ...projectData,
                maturityScore
            },
            include: {
                operators: true,
                risks: true,
                actions: true
            }
        });

        res.json(project);
    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({ error: 'Erro ao atualizar projeto' });
    }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', async (req, res) => {
    try {
        const project = await prisma.project.findFirst({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!project) {
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }

        await prisma.project.delete({
            where: { id: req.params.id }
        });

        res.json({ message: 'Projeto excluído com sucesso' });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({ error: 'Erro ao excluir projeto' });
    }
});

// PUT /api/projects/:id/status - Update project status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['DRAFT', 'IN_REVIEW', 'APPROVED', 'ARCHIVED'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Status inválido' });
        }

        const project = await prisma.project.findFirst({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!project) {
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }

        const updated = await prisma.project.update({
            where: { id: req.params.id },
            data: { status }
        });

        res.json(updated);
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ error: 'Erro ao atualizar status' });
    }
});

module.exports = router;
