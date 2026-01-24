/**
 * Generate action plans based on project risks and characteristics
 * @param {Object} project - The project data
 * @param {Array} risks - The list of risks associated with the project
 * @returns {Array} Array of action objects to be created
 */
function generateActionsForProject(project, risks) {
    const actions = [];
    const createdMeasures = new Set();

    function addAction(measure, description, responsible = 'TI / Segurança', priority = 3) {
        if (!createdMeasures.has(measure)) {
            actions.push({
                measure,
                description,
                responsible,
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
                priority,
                status: 'PENDING'
            });
            createdMeasures.add(measure);
        }
    }

    // 1. Actions based on specific project flags
    if (project.hasSensitiveData || project.hasBiometricData) {
        addAction(
            'Criptografia de Dados Sensíveis',
            'Implementar criptografia AES-256 para dados em repouso e TLS 1.3 para dados em trânsito.',
            'TI / Engenharia',
            5
        );
        addAction(
            'Relatório de Impacto (DPIA)',
            'Elaborar e manter atualizado o Relatório de Impacto à Proteção de Dados Pessoais.',
            'DPO / Jurídico',
            5
        );
    }

    if (project.hasInternationalTransfer) {
        addAction(
            'Cláusulas Padrão Contratuais',
            'Revisar contratos com operadores internacionais para incluir cláusulas padrão de proteção de dados.',
            'Jurídico',
            5
        );
        addAction(
            'Avaliação de Transferência (TIA)',
            'Realizar Transfer Impact Assessment para países de destino.',
            'DPO / Jurídico',
            4
        );
    }

    if (project.hasAutomatedDecision) {
        addAction(
            'Revisão Humana de Decisões',
            'Implementar processo para garantir intervenção humana quando solicitado pelo titular.',
            'Operações / Produto',
            4
        );
    }

    if (project.hasMinorData) {
        addAction(
            'Gestão de Consentimento de Menores',
            'Implementar fluxo de coleta de consentimento verificado dos pais ou responsáveis.',
            'Produto / Jurídico',
            5
        );
    }

    // 2. Standard Security Actions (Always good practices)
    addAction(
        'Controle de Acesso (RBAC)',
        'Implementar controle de acesso baseado em funções (Role-Based Access Control) com princípio do menor privilégio.',
        'TI / Segurança',
        4
    );

    addAction(
        'Autenticação Multifator (MFA)',
        'Exigir MFA para todos os acessos administrativos e a dados críticos.',
        'TI / Segurança',
        5
    );

    addAction(
        'Política de Retenção de Dados',
        'Configurar exclusão automática de dados após o fim do período de retenção legal/negocial.',
        'TI / Dados',
        3
    );

    addAction(
        'Treinamento em Proteção de Dados',
        'Realizar treinamento de conscientização sobre LGPD para todos os colaboradores envolvidos.',
        'RH / DPO',
        3
    );

    return actions;
}

module.exports = {
    generateActionsForProject
};
