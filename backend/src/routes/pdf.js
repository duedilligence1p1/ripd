const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');
const { generateRIPDPdf } = require('../services/pdfGenerator');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// GET /api/pdf/project/:projectId - Generate PDF for project
router.get('/project/:projectId', async (req, res) => {
    try {
        console.log(`[PDF] Requesting PDF for project: ${req.params.projectId} by user: ${req.user.id}`);

        const project = await prisma.project.findFirst({
            where: {
                id: req.params.projectId,
                userId: req.user.id
            },
            include: {
                operators: true,
                risks: { orderBy: { criticalValue: 'desc' } },
                actions: { orderBy: [{ status: 'asc' }, { priority: 'desc' }] }
            }
        });

        if (!project) {
            console.error(`[PDF] Project not found: ${req.params.projectId}`);
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }

        console.log(`[PDF] Project found: ${project.name}. Generating buffer...`);

        const pdfBuffer = await generateRIPDPdf(project);

        console.log(`[PDF] Buffer generated successfully (${pdfBuffer.length} bytes). Sending...`);

        // Set response headers
        const filename = `RIPD_${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        res.status(200).send(pdfBuffer);

        console.log(`[PDF] Document sent successfully for project: ${project.name}`);

    } catch (error) {
        console.error('[PDF] Fatal Error:', error.message);
        console.error(error.stack);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Erro interno ao gerar PDF', details: error.message });
        }
    }
});

// GET /api/pdf/project/:projectId/preview - Preview PDF (inline)
router.get('/project/:projectId/preview', async (req, res) => {
    try {
        const project = await prisma.project.findFirst({
            where: {
                id: req.params.projectId,
                userId: req.user.id
            },
            include: {
                operators: true,
                risks: { orderBy: { criticalValue: 'desc' } },
                actions: { orderBy: [{ status: 'asc' }, { priority: 'desc' }] }
            }
        });

        if (!project) {
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }

        const doc = generateRIPDPdf(project);

        // Set response headers for inline PDF view
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline');

        console.log(`[PDF] Previewing project: ${project.name}`);

        const pdfBuffer = await generateRIPDPdf(project);

        // Set response headers for inline PDF view
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline');
        res.setHeader('Content-Length', pdfBuffer.length);

        res.status(200).send(pdfBuffer);

    } catch (error) {
        console.error('Preview PDF error:', error.message);
        console.error(error.stack);
        res.status(500).json({ error: 'Erro ao visualizar PDF' });
    }
});

module.exports = router;
