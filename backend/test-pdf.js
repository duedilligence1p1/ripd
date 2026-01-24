require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { generateRIPDPdf } = require('./src/services/pdfGenerator');
const fs = require('fs');

const prisma = new PrismaClient();

async function testPdf() {
    try {
        console.log('1. Conectando ao banco...');
        await prisma.$connect();
        console.log('   ✓ Conectado');

        console.log('2. Buscando projeto...');
        const project = await prisma.project.findFirst({
            include: {
                operators: true,
                risks: { orderBy: { criticalValue: 'desc' } },
                actions: { orderBy: [{ status: 'asc' }, { priority: 'desc' }] }
            }
        });

        if (!project) {
            console.log('   ✗ Nenhum projeto encontrado');
            return;
        }
        console.log('   ✓ Projeto encontrado:', project.name);

        console.log('3. Gerando PDF...');
        const doc = generateRIPDPdf(project);

        console.log('4. Salvando PDF de teste...');
        const writeStream = fs.createWriteStream('test-ripd.pdf');
        doc.pipe(writeStream);
        doc.end();

        writeStream.on('finish', () => {
            console.log('   ✓ PDF salvo em test-ripd.pdf');
            process.exit(0);
        });

    } catch (error) {
        console.error('ERRO:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

testPdf();
