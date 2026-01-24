/**
 * Risk Calculator Service
 * Calculates risk levels based on Impact x Probability matrix
 */

/**
 * Calculate risk level based on critical value
 * @param {number} criticalValue - Impact x Probability (1-25)
 * @returns {string} Risk level: LOW, MEDIUM, HIGH, or CRITICAL
 */
function calculateRiskLevel(criticalValue) {
    if (criticalValue <= 6) {
        return 'LOW';
    } else if (criticalValue <= 12) {
        return 'MEDIUM';
    } else if (criticalValue <= 19) {
        return 'HIGH';
    } else {
        return 'CRITICAL';
    }
}

/**
 * Get color for risk level (for frontend display)
 * @param {string} level - Risk level
 * @returns {string} Color code
 */
function getRiskColor(level) {
    const colors = {
        LOW: '#22c55e',      // Green
        MEDIUM: '#eab308',   // Yellow
        HIGH: '#f97316',     // Orange
        CRITICAL: '#ef4444'  // Red
    };
    return colors[level] || '#6b7280';
}

/**
 * Calculate overall project risk score
 * @param {Array} risks - Array of risk objects
 * @returns {object} Risk summary with counts and average
 */
function calculateProjectRiskSummary(risks) {
    if (!risks || risks.length === 0) {
        return {
            total: 0,
            averageCriticalValue: 0,
            byLevel: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 }
        };
    }

    const totalCriticalValue = risks.reduce((sum, r) => sum + (r.criticalValue || 0), 0);
    const byLevel = risks.reduce((acc, r) => {
        const level = r.level || 'LOW';
        acc[level] = (acc[level] || 0) + 1;
        return acc;
    }, { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 });

    return {
        total: risks.length,
        averageCriticalValue: parseFloat((totalCriticalValue / risks.length).toFixed(2)),
        byLevel
    };
}

/**
 * Legal basis suggestions based on purpose
 */
const LEGAL_BASIS_SUGGESTIONS = {
    'PLD': {
        basis: 'LEGAL_OBLIGATION',
        article: 'Art. 7º, II',
        description: 'Obrigação Legal - Lei 9.613/98 (PLD/FT)'
    },
    'KYC': {
        basis: 'LEGAL_OBLIGATION',
        article: 'Art. 7º, II',
        description: 'Obrigação Legal - Lei 14.790/2023'
    },
    'MARKETING': {
        basis: 'CONSENT',
        article: 'Art. 7º, I',
        description: 'Consentimento do titular'
    },
    'RESPONSIBLE_GAMING': {
        basis: 'LEGITIMATE_INTEREST',
        article: 'Art. 7º, IX',
        description: 'Interesse Legítimo - Proteção do jogador'
    },
    'FRAUD_PREVENTION': {
        basis: 'LEGITIMATE_INTEREST',
        article: 'Art. 7º, IX',
        description: 'Interesse Legítimo - Prevenção a fraudes'
    },
    'CONTRACT_EXECUTION': {
        basis: 'CONTRACT',
        article: 'Art. 7º, V',
        description: 'Execução de contrato'
    }
};

function suggestLegalBasis(purpose) {
    const key = purpose.toUpperCase().replace(/\s+/g, '_');
    return LEGAL_BASIS_SUGGESTIONS[key] || {
        basis: 'LEGITIMATE_INTEREST',
        article: 'Art. 7º, IX',
        description: 'Interesse Legítimo (verificar necessidade)'
    };
}

module.exports = {
    calculateRiskLevel,
    getRiskColor,
    calculateProjectRiskSummary,
    suggestLegalBasis,
    LEGAL_BASIS_SUGGESTIONS
};
