const { calculateRiskLevel } = require('./riskCalculator');

/**
 * Generate standard risks based on project characteristics
 * @param {Object} project - The project data
 * @returns {Array} Array of risk objects to be created
 */
function generateRisksForProject(project) {
    const risks = [];

    // 1. Sensitive Data Risks
    if (project.hasSensitiveData) {
        risks.push({
            description: 'Vazamento de dados pessoais sensíveis',
            source: 'Acesso não autorizado ou falha de segurança',
            impact: 5, // High impact
            probability: 3, // Medium probability
            mitigation: 'Implementar criptografia, controle de acesso rigoroso e logs de auditoria'
        });

        risks.push({
            description: 'Tratamento discriminatório indevido',
            source: 'Algoritmos ou processos de decisão',
            impact: 4,
            probability: 2,
            mitigation: 'Revisão humana de decisões e análise de impacto discriminatório'
        });
    }

    // 2. International Transfer Risks
    if (project.hasInternationalTransfer) {
        risks.push({
            description: 'Insegurança na transferência internacional de dados',
            source: 'Transferência para países sem nível adequado de proteção',
            impact: 4,
            probability: 3,
            mitigation: 'Utilizar Cláusulas Padrão Contratuais e verificar adequação do país destino'
        });
    }

    // 3. Biometric Data Risks
    if (project.hasBiometricData) {
        risks.push({
            description: 'Comprometimento de dados biométricos (irreversível)',
            source: 'Vazamento de banco de dados biométricos',
            impact: 5, // Critical impact
            probability: 2,
            mitigation: 'Armazenar apenas templates (hashes), nunca a imagem bruta, e usar criptografia forte'
        });
    }

    // 4. Minor (Children) Data Risks
    if (project.hasMinorData) {
        risks.push({
            description: 'Exposição indevida de dados de crianças/adolescentes',
            source: 'Coleta excessiva ou falta de consentimento parental',
            impact: 5,
            probability: 3,
            mitigation: 'Coletar consentimento específico e destaque, minimizar dados coletados'
        });
    }

    // 5. Automated Decision Making
    if (project.hasAutomatedDecision) {
        risks.push({
            description: 'Decisões automatizadas opacas ou injustas',
            source: 'Algoritmos de IA ou Machine Learning',
            impact: 4,
            probability: 3,
            mitigation: 'Garantir transparência, explicabilidade e direito de revisão humana'
        });
    }

    // 6. General/Standard Risks (Always included or based on other generic flags)
    risks.push({
        description: 'Acesso não autorizado a dados pessoais',
        source: 'Falha em autenticação ou controle de acesso',
        impact: 4,
        probability: 3,
        mitigation: 'Implementar MFA, política de senhas fortes e revisão periódica de acessos'
    });

    risks.push({
        description: 'Perda de disponibilidade dos dados',
        source: 'Falha técnica, desastre ou ransomware',
        impact: 4,
        probability: 3,
        mitigation: 'Backup regular com testes de restore e plano de recuperação de desastres'
    });

    // Calculate levels for all risks
    return risks.map(risk => {
        const criticalValue = risk.impact * risk.probability;
        return {
            ...risk,
            criticalValue,
            level: calculateRiskLevel(criticalValue)
        };
    });
}

module.exports = {
    generateRisksForProject
};
