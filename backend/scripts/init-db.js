require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Initializing RIPD Manager database...\n');

    try {
        // Create admin user
        const adminPassword = await bcrypt.hash('admin123', 10);
        const admin = await prisma.user.upsert({
            where: { email: 'admin@1pra1.com' },
            update: {},
            create: {
                email: 'admin@1pra1.com',
                password: adminPassword,
                name: 'Administrador',
                role: 'ADMIN'
            }
        });
        console.log('✅ Admin user created:', admin.email);

        // Create test user
        const testPassword = await bcrypt.hash('test123', 10);
        const testUser = await prisma.user.upsert({
            where: { email: 'teste@1pra1.com' },
            update: {},
            create: {
                email: 'teste@1pra1.com',
                password: testPassword,
                name: 'Usuário Teste',
                role: 'USER'
            }
        });
        console.log('✅ Test user created:', testUser.email);

        // Create sample project
        const sampleProject = await prisma.project.create({
            data: {
                name: 'Plataforma de Apostas - KYC',
                description: 'Tratamento de dados para verificação de identidade de apostadores',
                controller: '1pra1 Apostas Ltda',
                dpoName: 'João Silva',
                dpoEmail: 'dpo@1pra1.com',
                hasSensitiveData: false,
                hasBiometricData: true,
                hasProfileSurveillance: true,
                isRegulatedSector: true,
                hasAutomatedDecision: false,
                hasMinorData: false,
                dataCategories: JSON.stringify(['identification', 'financial', 'biometric']),
                collectionMethod: 'APP/API',
                hasInternationalTransfer: true,
                transferCountries: JSON.stringify(['USA', 'EU']),
                transferMechanism: 'Cláusulas Contratuais Padrão',
                purposes: JSON.stringify([
                    { purpose: 'KYC', legalBasis: 'LEGAL_OBLIGATION' },
                    { purpose: 'PLD', legalBasis: 'LEGAL_OBLIGATION' }
                ]),
                retentionPeriodMonths: 60,
                retentionJustification: 'Requisito COAF - Lei 9.613/98',
                userId: testUser.id,
                operators: {
                    create: [
                        { name: 'AWS', type: 'Cloud Provider', country: 'USA' },
                        { name: 'IDwall', type: 'KYC Provider', country: 'Brasil' }
                    ]
                }
            }
        });
        console.log('✅ Sample project created:', sampleProject.name);

        // Create sample risks
        const risks = await Promise.all([
            prisma.risk.create({
                data: {
                    description: 'Vazamento de dados biométricos',
                    source: 'Armazenamento inadequado',
                    impact: 5,
                    probability: 2,
                    criticalValue: 10,
                    level: 'MEDIUM',
                    mitigation: 'Criptografia AES-256',
                    projectId: sampleProject.id
                }
            }),
            prisma.risk.create({
                data: {
                    description: 'Acesso não autorizado à base de apostadores',
                    source: 'Gestão de acessos deficiente',
                    impact: 4,
                    probability: 3,
                    criticalValue: 12,
                    level: 'MEDIUM',
                    mitigation: 'Implementar MFA e RBAC',
                    projectId: sampleProject.id
                }
            }),
            prisma.risk.create({
                data: {
                    description: 'Transferência internacional sem garantias',
                    source: 'Cloud providers estrangeiros',
                    impact: 4,
                    probability: 4,
                    criticalValue: 16,
                    level: 'HIGH',
                    mitigation: 'Cláusulas Contratuais Padrão',
                    projectId: sampleProject.id
                }
            })
        ]);
        console.log('✅ Sample risks created:', risks.length);

        // Create sample actions
        const actions = await Promise.all([
            prisma.actionPlan.create({
                data: {
                    measure: 'Implementar criptografia AES-256',
                    description: 'Aplicar criptografia em repouso para dados biométricos',
                    responsible: 'Equipe de Segurança',
                    deadline: new Date('2026-03-01'),
                    priority: 5,
                    status: 'IN_PROGRESS',
                    projectId: sampleProject.id
                }
            }),
            prisma.actionPlan.create({
                data: {
                    measure: 'Configurar MFA obrigatório',
                    description: 'Multi-factor authentication para todos os acessos administrativos',
                    responsible: 'Equipe de TI',
                    deadline: new Date('2026-02-15'),
                    priority: 4,
                    status: 'COMPLETED',
                    projectId: sampleProject.id
                }
            }),
            prisma.actionPlan.create({
                data: {
                    measure: 'Revisar contratos de transferência',
                    description: 'Incluir cláusulas contratuais padrão nos contratos com AWS',
                    responsible: 'Jurídico',
                    deadline: new Date('2026-04-01'),
                    priority: 3,
                    status: 'PENDING',
                    projectId: sampleProject.id
                }
            })
        ]);
        console.log('✅ Sample actions created:', actions.length);

        // Update maturity score
        const completedActions = actions.filter(a => a.status === 'COMPLETED').length;
        const maturityScore = (completedActions / actions.length) * 5;
        await prisma.project.update({
            where: { id: sampleProject.id },
            data: { maturityScore }
        });
        console.log('✅ Maturity score updated:', maturityScore.toFixed(2));

        console.log('\n🎉 Database initialization complete!');
        console.log('\n📋 Login credentials:');
        console.log('   Admin: admin@1pra1.com / admin123');
        console.log('   Test:  teste@1pra1.com / test123');

    } catch (error) {
        console.error('❌ Error initializing database:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main();
