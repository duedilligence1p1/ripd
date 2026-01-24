'use client';

import { useState } from 'react';
import { ProjectFormData } from '@/app/project/[id]/page';

interface Step3Props {
    formData: ProjectFormData;
    updateFormData: (updates: Partial<ProjectFormData>) => void;
}

const DATA_CATEGORIES = [
    { id: 'identification', label: 'Identificação', description: 'Nome, CPF, RG, CNH' },
    { id: 'financial', label: 'Financeiro', description: 'Dados bancários, PIX, cartões' },
    { id: 'biometric', label: 'Biométrico', description: 'Foto, selfie, reconhecimento facial' },
    { id: 'location', label: 'Localização', description: 'Endereço, geolocalização, IP' },
    { id: 'behavioral', label: 'Comportamental', description: 'Histórico de apostas, padrões' },
    { id: 'gaming', label: 'Apostas/Jogos', description: 'Apostas realizadas, jogos favoritos' },
    { id: 'contact', label: 'Contato', description: 'Email, telefone, endereço' },
];

const COLLECTION_METHODS = [
    'Aplicativo Mobile',
    'Website',
    'API de Terceiros',
    'Upload de Documentos',
    'Formulário Online',
    'Integração Bancária',
];

const LEGAL_BASES = [
    { value: 'CONSENT', label: 'Consentimento (Art. 7º, I)', description: 'Titular consente com o tratamento' },
    { value: 'LEGAL_OBLIGATION', label: 'Obrigação Legal (Art. 7º, II)', description: 'PLD/FT, KYC, Lei 14.790' },
    { value: 'CONTRACT', label: 'Execução de Contrato (Art. 7º, V)', description: 'Prestação do serviço de apostas' },
    { value: 'LEGITIMATE_INTEREST', label: 'Interesse Legítimo (Art. 7º, IX)', description: 'Jogo responsável, prevenção a fraudes' },
    { value: 'CREDIT_PROTECTION', label: 'Proteção ao Crédito (Art. 7º, X)', description: 'Análise de crédito e risco' },
];

const PURPOSES = [
    { id: 'KYC', label: 'Know Your Customer (KYC)', suggestedBasis: 'LEGAL_OBLIGATION' },
    { id: 'PLD', label: 'Prevenção à Lavagem de Dinheiro', suggestedBasis: 'LEGAL_OBLIGATION' },
    { id: 'MARKETING', label: 'Marketing e Comunicações', suggestedBasis: 'CONSENT' },
    { id: 'RESPONSIBLE_GAMING', label: 'Jogo Responsável', suggestedBasis: 'LEGITIMATE_INTEREST' },
    { id: 'FRAUD_PREVENTION', label: 'Prevenção a Fraudes', suggestedBasis: 'LEGITIMATE_INTEREST' },
    { id: 'ANALYTICS', label: 'Analytics e Melhoria de Serviço', suggestedBasis: 'LEGITIMATE_INTEREST' },
];

const TRANSFER_COUNTRIES = ['USA', 'União Europeia', 'Reino Unido', 'Canadá', 'Japão', 'Outro'];

const TRANSFER_MECHANISMS = [
    'Cláusulas Contratuais Padrão (SCCs)',
    'Decisão de Adequação',
    'Consentimento Específico',
    'Normas Corporativas Globais (BCRs)',
    'Outro Mecanismo Legal',
];

// Helper to parse JSON strings (SQLite compatibility)
function parseJsonArray<T>(data: T[] | string | null | undefined): T[] {
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

export default function Step3DataLifecycle({ formData, updateFormData }: Step3Props) {
    const [newPurpose, setNewPurpose] = useState({ purpose: '', legalBasis: '' });

    // Parse arrays that may come as JSON strings from SQLite
    const dataCategories = parseJsonArray<string>(formData.dataCategories);
    const transferCountries = parseJsonArray<string>(formData.transferCountries);
    const purposes = parseJsonArray<{ purpose: string; legalBasis: string }>(formData.purposes);

    const toggleCategory = (categoryId: string) => {
        const updated = dataCategories.includes(categoryId)
            ? dataCategories.filter(c => c !== categoryId)
            : [...dataCategories, categoryId];
        updateFormData({ dataCategories: updated });
    };

    const toggleCountry = (country: string) => {
        const updated = transferCountries.includes(country)
            ? transferCountries.filter(c => c !== country)
            : [...transferCountries, country];
        updateFormData({ transferCountries: updated });
    };

    const addPurpose = () => {
        if (!newPurpose.purpose || !newPurpose.legalBasis) return;
        updateFormData({
            purposes: [...purposes, { ...newPurpose }]
        });
        setNewPurpose({ purpose: '', legalBasis: '' });
    };

    const removePurpose = (index: number) => {
        updateFormData({
            purposes: purposes.filter((_, i) => i !== index)
        });
    };

    const handleSuggestedPurpose = (purpose: typeof PURPOSES[0]) => {
        const exists = purposes.some(p => p.purpose === purpose.id);
        if (!exists) {
            updateFormData({
                purposes: [...purposes, {
                    purpose: purpose.label,
                    legalBasis: purpose.suggestedBasis
                }]
            });
        }
    };

    const getLegalBasisLabel = (value: string) => {
        return LEGAL_BASES.find(b => b.value === value)?.label || value;
    };

    // Check retention period warning
    const retentionWarning = formData.retentionPeriodMonths && formData.retentionPeriodMonths < 60;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Ciclo de Vida do Dado</h2>
                <p className="text-gray-600">Defina as categorias de dados, bases legais e transferências</p>
            </div>

            {/* Data Categories */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Categorias de Dados Coletados</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {DATA_CATEGORIES.map((category) => {
                        const isSelected = dataCategories.includes(category.id);
                        return (
                            <button
                                key={category.id}
                                onClick={() => toggleCategory(category.id)}
                                className={`text-left p-4 rounded-lg border transition-all ${isSelected
                                    ? 'border-primary-300 bg-primary-50'
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-300'
                                        }`}>
                                        {isSelected && (
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className={`font-medium ${isSelected ? 'text-primary-700' : 'text-gray-700'}`}>
                                        {category.label}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1 ml-7">{category.description}</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Collection Method */}
            <div>
                <label className="label">Método de Coleta</label>
                <select
                    value={formData.collectionMethod || ''}
                    onChange={(e) => updateFormData({ collectionMethod: e.target.value })}
                    className="input max-w-md"
                >
                    <option value="">Selecione...</option>
                    {COLLECTION_METHODS.map((method) => (
                        <option key={method} value={method}>{method}</option>
                    ))}
                </select>
            </div>

            {/* Purposes and Legal Basis */}
            <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Finalidades e Bases Legais</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Vincule cada finalidade de tratamento à sua base legal na LGPD
                </p>

                {/* Quick Add Suggestions */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {PURPOSES.map((purpose) => (
                        <button
                            key={purpose.id}
                            onClick={() => handleSuggestedPurpose(purpose)}
                            className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                        >
                            + {purpose.label}
                        </button>
                    ))}
                </div>

                {/* Purposes List */}
                {purposes.length > 0 && (
                    <div className="space-y-2 mb-4">
                        {purposes.map((purpose, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                            >
                                <div>
                                    <span className="font-medium text-gray-800">{purpose.purpose}</span>
                                    <span className="text-primary-600 ml-2 text-sm">
                                        → {getLegalBasisLabel(purpose.legalBasis)}
                                    </span>
                                </div>
                                <button
                                    onClick={() => removePurpose(index)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Custom Purpose */}
                <div className="grid md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
                    <div>
                        <label className="label text-sm">Finalidade</label>
                        <input
                            type="text"
                            value={newPurpose.purpose}
                            onChange={(e) => setNewPurpose({ ...newPurpose, purpose: e.target.value })}
                            className="input"
                            placeholder="Ex: Verificação de idade"
                        />
                    </div>
                    <div>
                        <label className="label text-sm">Base Legal</label>
                        <select
                            value={newPurpose.legalBasis}
                            onChange={(e) => setNewPurpose({ ...newPurpose, legalBasis: e.target.value })}
                            className="input"
                        >
                            <option value="">Selecione...</option>
                            {LEGAL_BASES.map((basis) => (
                                <option key={basis.value} value={basis.value}>{basis.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={addPurpose}
                            disabled={!newPurpose.purpose || !newPurpose.legalBasis}
                            className="btn-primary w-full disabled:opacity-50"
                        >
                            Adicionar
                        </button>
                    </div>
                </div>
            </div>

            {/* International Transfer */}
            <div className="border-t pt-6">
                <div className="flex items-center gap-3 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.hasInternationalTransfer || false}
                            onChange={(e) => updateFormData({ hasInternationalTransfer: e.target.checked })}
                            className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-lg font-semibold text-gray-800">Transferência Internacional</span>
                    </label>
                </div>

                {formData.hasInternationalTransfer && (
                    <div className="space-y-4 pl-7">
                        <div>
                            <label className="label">Países de Destino</label>
                            <div className="flex flex-wrap gap-2">
                                {TRANSFER_COUNTRIES.map((country) => {
                                    const isSelected = transferCountries.includes(country);
                                    return (
                                        <button
                                            key={country}
                                            onClick={() => toggleCountry(country)}
                                            className={`px-4 py-2 rounded-lg border transition-all ${isSelected
                                                ? 'border-primary-300 bg-primary-50 text-primary-700'
                                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                                }`}
                                        >
                                            {country}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="max-w-md">
                            <label className="label">Mecanismo de Transferência</label>
                            <select
                                value={formData.transferMechanism || ''}
                                onChange={(e) => updateFormData({ transferMechanism: e.target.value })}
                                className="input"
                            >
                                <option value="">Selecione...</option>
                                {TRANSFER_MECHANISMS.map((mechanism) => (
                                    <option key={mechanism} value={mechanism}>{mechanism}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Data Retention */}
            <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Retenção de Dados</h3>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="label">Período de Retenção (meses)</label>
                        <input
                            type="number"
                            value={formData.retentionPeriodMonths || ''}
                            onChange={(e) => updateFormData({
                                retentionPeriodMonths: e.target.value ? parseInt(e.target.value) : null
                            })}
                            className="input"
                            placeholder="Ex: 60 (5 anos)"
                            min={1}
                        />
                        {retentionWarning && (
                            <p className="text-amber-600 text-sm mt-2 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                COAF/SPA exigem retenção mínima de 5 anos (60 meses)
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="label">Justificativa Legal</label>
                        <input
                            type="text"
                            value={formData.retentionJustification || ''}
                            onChange={(e) => updateFormData({ retentionJustification: e.target.value })}
                            className="input"
                            placeholder="Ex: Requisito COAF - Lei 9.613/98"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
