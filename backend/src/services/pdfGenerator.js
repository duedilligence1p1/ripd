const PDFDocument = require('pdfkit');
const { calculateRiskLevel, getRiskColor, calculateProjectRiskSummary } = require('./riskCalculator');

// Helper to parse JSON strings (SQLite compatibility)
function parseJsonField(data) {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    return [];
}

/**
 * Generate RIPD PDF Report
 * @param {object} project - Complete project data with risks and actions
 * @returns {PDFDocument} PDF document stream
 */
/**
 * Generate RIPD PDF Report
 * @param {object} project - Complete project data with risks and actions
 * @returns {Promise<Buffer>} Promise resolving to PDF buffer
 */
function generateRIPDPdf(project) {
    return new Promise((resolve, reject) => {
        try {
            const chunks = [];
            const doc = new PDFDocument({
                margin: 50,
                size: 'A4',
                bufferPages: true,
                info: {
                    Title: `RIPD - ${project.name}`,
                    Author: '1pra1 - RIPD Manager',
                    Subject: 'Relatório de Impacto à Proteção de Dados',
                    Keywords: 'RIPD, LGPD, Proteção de Dados'
                }
            });

            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', err => reject(err));

            // Header
            doc.fontSize(20).font('Helvetica-Bold')
                .text('RELATÓRIO DE IMPACTO À', { align: 'center' })
                .text('PROTEÇÃO DE DADOS PESSOAIS', { align: 'center' });

            doc.moveDown();
            doc.fontSize(14).font('Helvetica')
                .text('Modelo 2.0 SGD - Lei 14.790/2023', { align: 'center' });

            doc.moveDown(2);

            // Project Info Section
            addSection(doc, '1. IDENTIFICAÇÃO DO PROJETO');
            addField(doc, 'Nome do Projeto', project.name);
            addField(doc, 'Descrição', project.description || 'Não informado');
            addField(doc, 'Controlador', project.controller);
            addField(doc, 'DPO Responsável', project.dpoName);
            addField(doc, 'Email do DPO', project.dpoEmail || 'Não informado');
            addField(doc, 'Status', translateStatus(project.status));

            const maturity = typeof project.maturityScore === 'number'
                ? project.maturityScore.toFixed(2)
                : '0.00';
            addField(doc, 'Maturidade', `${maturity}/5.00`);

            doc.moveDown();

            // Operators
            if (project.operators && project.operators.length > 0) {
                addSection(doc, '2. OPERADORES DE DADOS');
                project.operators.forEach((op, index) => {
                    doc.fontSize(10).font('Helvetica-Bold')
                        .text(`${index + 1}. ${op.name}`, { continued: true })
                        .font('Helvetica')
                        .text(` (${op.type}${op.country ? ' - ' + op.country : ''})`);
                });
            }

            doc.moveDown();

            // Risk Checklist
            addSection(doc, '3. NATUREZA DO TRATAMENTO');
            const riskChecklist = [
                { label: 'Dados Sensíveis', value: project.hasSensitiveData },
                { label: 'Dados Biométricos', value: project.hasBiometricData },
                { label: 'Vigilância de Perfil', value: project.hasProfileSurveillance },
                { label: 'Setor Regulado', value: project.isRegulatedSector },
                { label: 'Decisão Automatizada', value: project.hasAutomatedDecision },
                { label: 'Dados de Menores', value: project.hasMinorData }
            ];

            riskChecklist.forEach(item => {
                doc.fontSize(10).font('Helvetica')
                    .text(`${item.value ? '☑' : '☐'} ${item.label}`);
            });

            doc.moveDown();

            // Data Categories
            addSection(doc, '4. CATEGORIAS DE DADOS');
            const categories = parseJsonField(project.dataCategories);
            if (categories.length > 0) {
                doc.fontSize(10).text(categories.map(translateCategory).join(', '));
            } else {
                doc.fontSize(10).text('Nenhuma categoria informada');
            }

            addField(doc, 'Método de Coleta', project.collectionMethod || 'Não informado');

            // International Transfer
            if (project.hasInternationalTransfer) {
                doc.moveDown();
                addSection(doc, '5. TRANSFERÊNCIA INTERNACIONAL');
                const countries = parseJsonField(project.transferCountries);
                addField(doc, 'Países', countries.join(', ') || 'Não informado');
                addField(doc, 'Mecanismo', project.transferMechanism || 'Não informado');
            }

            // Risk Matrix - New Page
            doc.addPage();
            addSection(doc, '6. MATRIZ DE RISCOS');

            if (project.risks && project.risks.length > 0) {
                const summary = calculateProjectRiskSummary(project.risks);
                doc.fontSize(10)
                    .text(`Total de Riscos: ${summary.total}`)
                    .text(`Média de Criticidade: ${summary.averageCriticalValue}`)
                    .text(`Críticos: ${summary.byLevel.CRITICAL} | Altos: ${summary.byLevel.HIGH} | Médios: ${summary.byLevel.MEDIUM} | Baixos: ${summary.byLevel.LOW}`);

                doc.moveDown();

                // Risk Table Header
                const tableTop = doc.y;
                doc.fontSize(9).font('Helvetica-Bold');
                doc.text('Descrição', 50, tableTop, { width: 180 });
                doc.text('Fonte', 235, tableTop, { width: 100 });
                doc.text('I', 340, tableTop, { width: 25, align: 'center' });
                doc.text('P', 365, tableTop, { width: 25, align: 'center' });
                doc.text('Valor', 390, tableTop, { width: 35, align: 'center' });
                doc.text('Nível', 430, tableTop, { width: 60 });

                doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke();

                let rowY = tableTop + 20;
                project.risks.forEach((risk, index) => {
                    if (rowY > 750) {
                        doc.addPage();
                        rowY = 50;
                    }

                    doc.fontSize(8).font('Helvetica');
                    const description = risk.description || '';
                    const desc = description.length > 40
                        ? description.substring(0, 37) + '...'
                        : description;

                    const sourceText = risk.source || '';
                    const source = sourceText.length > 20
                        ? sourceText.substring(0, 17) + '...'
                        : sourceText;

                    doc.text(desc, 50, rowY, { width: 180 });
                    doc.text(source, 235, rowY, { width: 100 });
                    doc.text((risk.impact || 0).toString(), 340, rowY, { width: 25, align: 'center' });
                    doc.text((risk.probability || 0).toString(), 365, rowY, { width: 25, align: 'center' });
                    doc.text((risk.criticalValue || 0).toString(), 390, rowY, { width: 35, align: 'center' });
                    doc.text(translateRiskLevel(risk.level), 430, rowY, { width: 60 });

                    rowY += 18;
                });
            } else {
                doc.fontSize(10).text('Nenhum risco identificado.');
            }

            // Action Plan - New Page
            doc.addPage();
            addSection(doc, '7. PLANO DE AÇÃO');

            if (project.actions && project.actions.length > 0) {
                project.actions.forEach((action, index) => {
                    doc.fontSize(10).font('Helvetica-Bold')
                        .text(`${index + 1}. ${action.measure || 'Medida sem nome'}`);

                    const deadline = action.deadline ? new Date(action.deadline).toLocaleDateString('pt-BR') : 'Não definido';

                    doc.fontSize(9).font('Helvetica')
                        .text(`   Responsável: ${action.responsible || 'Não informado'}`)
                        .text(`   Prazo: ${deadline}`)
                        .text(`   Status: ${translateActionStatus(action.status)}`);
                    if (action.description) {
                        doc.text(`   Descrição: ${action.description}`);
                    }
                    doc.moveDown(0.5);
                });
            } else {
                doc.fontSize(10).text('Nenhuma ação definida.');
            }

            // Retention Info
            if (project.retentionPeriodMonths) {
                doc.moveDown();
                addSection(doc, '8. RETENÇÃO DE DADOS');
                addField(doc, 'Período', `${project.retentionPeriodMonths} meses`);
                addField(doc, 'Justificativa', project.retentionJustification || 'Não informada');
            }

            // Approvals and Signatures - New Page
            doc.addPage();
            addSection(doc, '9. APROVAÇÕES E ASSINATURAS');

            doc.moveDown();
            doc.fontSize(10).font('Helvetica');
            doc.text('Os responsáveis abaixo declaram ciência e aprovação do conteúdo deste Relatório de Impacto à Proteção de Dados.', { align: 'justify' });
            doc.moveDown(2);

            // Preparer
            renderSignatureBlock(doc, 'Responsável pela Elaboração', project.preparerName, project.preparerRole);

            // Manager
            renderSignatureBlock(doc, 'Gestor da Área de Negócio', project.managerName, project.managerRole);

            // DPO
            renderSignatureBlock(doc, 'Encarregado pelo Tratamento de Dados Pessoais (DPO)', project.dpoName, 'DPO / Encarregado');

            // Footer on each page
            const pages = doc.bufferedPageRange();
            for (let i = 0; i < pages.count; i++) {
                doc.switchToPage(i);
                doc.fontSize(8).font('Helvetica')
                    .text(
                        `RIPD Manager 1pra1 - Gerado em ${new Date().toLocaleDateString('pt-BR')} - Página ${i + 1} de ${pages.count}`,
                        50,
                        doc.page.height - 30,
                        { align: 'center', width: doc.page.width - 100 }
                    );
            }

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
}

// Helper functions
function addSection(doc, title) {
    doc.fontSize(12).font('Helvetica-Bold')
        .fillColor('#1e40af')
        .text(title)
        .fillColor('#000000');
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#1e40af');
    doc.moveDown(0.5);
}

function addField(doc, label, value) {
    doc.fontSize(10).font('Helvetica-Bold')
        .text(`${label}: `, { continued: true })
        .font('Helvetica')
        .text(value || 'N/A');
}

function translateStatus(status) {
    const map = {
        'DRAFT': 'Rascunho',
        'IN_REVIEW': 'Em Análise',
        'APPROVED': 'Aprovado',
        'ARCHIVED': 'Arquivado'
    };
    return map[status] || status;
}

function translateActionStatus(status) {
    const map = {
        'PENDING': 'Pendente',
        'IN_PROGRESS': 'Em Andamento',
        'COMPLETED': 'Concluído'
    };
    return map[status] || status;
}

function translateRiskLevel(level) {
    const map = {
        'LOW': 'Baixo',
        'MEDIUM': 'Médio',
        'HIGH': 'Alto',
        'CRITICAL': 'Crítico'
    };
    return map[level] || level;
}

function translateCategory(category) {
    const map = {
        'identification': 'Identificação',
        'financial': 'Financeiro',
        'biometric': 'Biométrico',
        'health': 'Saúde',
        'location': 'Localização',
        'behavioral': 'Comportamental',
        'gaming': 'Apostas/Jogos'
    };
    return map[category] || category;
}

function renderSignatureBlock(doc, title, name, role) {
    // Keep signature block together
    if (doc.y > 650) doc.addPage();

    doc.moveDown(1);
    doc.fontSize(10).font('Helvetica-Bold').text(title);
    doc.moveDown(2); // Space for signature

    const startX = 50;
    const endX = 300;

    doc.moveTo(startX, doc.y).lineTo(endX, doc.y).stroke(); // Underline
    doc.moveDown(0.5);

    doc.font('Helvetica').text(name || '_______________________________');
    if (role) {
        doc.fontSize(9).text(role, { color: 'grey' });
        doc.fillColor('black'); // Reset color
    }

    doc.moveDown(1);
}

module.exports = { generateRIPDPdf };
