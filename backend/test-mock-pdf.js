const { generateRIPDPdf } = require('./src/services/pdfGenerator');
const fs = require('fs');

const mockProject = {
    name: 'Projeto Teste de PDF',
    description: 'Uma descrição de teste para o RIPD.',
    controller: 'Empresa Teste LTDA',
    dpoName: 'DPO de Teste',
    dpoEmail: 'dpo@teste.com',
    status: 'DRAFT',
    maturityScore: 3.5,
    hasSensitiveData: true,
    hasBiometricData: false,
    hasProfileSurveillance: true,
    isRegulatedSector: true,
    hasAutomatedDecision: false,
    hasMinorData: false,
    dataCategories: ['identification', 'financial', 'behavioral'],
    collectionMethod: 'Plataforma Web',
    hasInternationalTransfer: true,
    transferCountries: ['USA', 'UK'],
    transferMechanism: 'Standard Contractual Clauses',
    retentionPeriodMonths: 60,
    retentionJustification: 'Lei 14.790 e Regulamentação SPA',
    operators: [
        { name: 'AWS', type: 'Cloud Provider', country: 'Irlanda' },
        { name: 'Stripe', type: 'Payment Processor', country: 'USA' }
    ],
    risks: [
        { description: 'Vazamento de dados financeiros', source: 'Ataque cibernético', impact: 5, probability: 3, criticalValue: 15, level: 'HIGH' },
        { description: 'Acesso não autorizado', source: 'Erro humano', impact: 4, probability: 2, criticalValue: 8, level: 'MEDIUM' }
    ],
    actions: [
        { measure: 'Implementar MFA', responsible: 'TI', deadline: '2026-12-31', status: 'PENDING', priority: 5, description: 'Autenticação multifator em todos os acessos.' },
        { measure: 'Criptografia', responsible: 'Segurança', deadline: '2026-06-30', status: 'IN_PROGRESS', priority: 4 }
    ]
};

async function testMockPdf() {
    try {
        console.log('1. Gerando PDF com dados mockados...');
        const doc = generateRIPDPdf(mockProject);

        console.log('2. Salvando PDF de teste...');
        const writeStream = fs.createWriteStream('mock-ripd.pdf');
        doc.pipe(writeStream);
        doc.end();

        writeStream.on('finish', () => {
            console.log('   ✓ PDF salvo em mock-ripd.pdf');
        });

        writeStream.on('error', (err) => {
            console.error('   ✗ Erro no stream:', err.message);
        });

    } catch (error) {
        console.error('ERRO:', error.message);
        console.error('Stack:', error.stack);
    }
}

testMockPdf();
