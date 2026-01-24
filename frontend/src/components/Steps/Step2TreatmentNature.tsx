'use client';

import { ProjectFormData } from '@/app/project/[id]/page';

interface Step2Props {
    formData: ProjectFormData;
    updateFormData: (updates: Partial<ProjectFormData>) => void;
}

const RISK_CHECKLIST = [
    {
        key: 'hasSensitiveData',
        label: 'Dados Sensíveis',
        description: 'Origem racial/étnica, convicção religiosa, opinião política, dados de saúde, orientação sexual',
        warning: 'Requer base legal específica (Art. 11 LGPD)'
    },
    {
        key: 'hasBiometricData',
        label: 'Dados Biométricos',
        description: 'Impressão digital, reconhecimento facial, voz, íris',
        warning: 'Considerado dado sensível pela LGPD'
    },
    {
        key: 'hasProfileSurveillance',
        label: 'Vigilância/Monitoramento de Perfil',
        description: 'Análise sistemática de comportamento, scoring, perfilamento de apostas',
        warning: 'Pode requerer RIPD obrigatório (Art. 10, §3º)'
    },
    {
        key: 'isRegulatedSector',
        label: 'Setor Regulado',
        description: 'Apostas online reguladas pela Lei 14.790/2023 e normativas SPA/MF',
        warning: 'Sujeito a fiscalização e exigências específicas'
    },
    {
        key: 'hasAutomatedDecision',
        label: 'Decisão Automatizada',
        description: 'Decisões baseadas exclusivamente em tratamento automatizado (ex: bloqueio automático)',
        warning: 'Titular pode solicitar revisão humana (Art. 20 LGPD)'
    },
    {
        key: 'hasMinorData',
        label: 'Dados de Menores',
        description: 'Tratamento de dados de crianças e adolescentes',
        warning: 'Proibido em plataformas de apostas - exige verificação'
    }
];

export default function Step2TreatmentNature({ formData, updateFormData }: Step2Props) {
    const handleCheckboxChange = (key: string, checked: boolean) => {
        updateFormData({ [key]: checked });
    };

    const activeRisks = RISK_CHECKLIST.filter(
        item => formData[item.key as keyof ProjectFormData] === true
    ).length;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Natureza do Tratamento</h2>
                <p className="text-gray-600">Identifique as características de risco do tratamento de dados</p>
            </div>

            {/* Risk Counter */}
            <div className={`p-4 rounded-lg ${activeRisks === 0 ? 'bg-green-50 border border-green-200' :
                    activeRisks <= 2 ? 'bg-yellow-50 border border-yellow-200' :
                        'bg-red-50 border border-red-200'
                }`}>
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${activeRisks === 0 ? 'bg-green-100 text-green-700' :
                            activeRisks <= 2 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                        }`}>
                        {activeRisks}
                    </div>
                    <div>
                        <p className={`font-medium ${activeRisks === 0 ? 'text-green-700' :
                                activeRisks <= 2 ? 'text-yellow-700' :
                                    'text-red-700'
                            }`}>
                            {activeRisks === 0 ? 'Baixo risco identificado' :
                                activeRisks <= 2 ? 'Risco moderado identificado' :
                                    'Alto risco identificado - RIPD obrigatório'}
                        </p>
                        <p className="text-sm text-gray-600">
                            {activeRisks} de {RISK_CHECKLIST.length} fatores de risco marcados
                        </p>
                    </div>
                </div>
            </div>

            {/* Checklist */}
            <div className="space-y-4">
                {RISK_CHECKLIST.map((item) => {
                    const isChecked = formData[item.key as keyof ProjectFormData] === true;

                    return (
                        <label
                            key={item.key}
                            className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all ${isChecked
                                    ? 'border-primary-300 bg-primary-50'
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => handleCheckboxChange(item.key, e.target.checked)}
                                className="w-5 h-5 mt-1 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <div className="flex-1">
                                <p className={`font-medium ${isChecked ? 'text-primary-800' : 'text-gray-800'}`}>
                                    {item.label}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                {isChecked && (
                                    <div className="flex items-center gap-2 mt-2 text-sm text-amber-700 bg-amber-50 rounded px-3 py-1.5">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        {item.warning}
                                    </div>
                                )}
                            </div>
                        </label>
                    );
                })}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <p className="font-medium text-blue-800">Sobre o RIPD Obrigatório</p>
                        <p className="text-sm text-blue-700 mt-1">
                            Conforme a LGPD (Art. 10, §3º) e regulamentações da ANPD, o RIPD é obrigatório
                            quando há tratamento de alto risco, incluindo vigilância de perfil e dados sensíveis
                            em larga escala. No setor de apostas online, o RIPD também é exigido pela Lei 14.790/2023.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
