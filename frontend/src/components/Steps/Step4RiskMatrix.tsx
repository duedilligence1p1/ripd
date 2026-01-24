'use client';

import { useState } from 'react';
import { Risk } from '@/app/project/[id]/page';
import { risksApi } from '@/services/api';
import toast from 'react-hot-toast';

interface Step4Props {
    projectId: string | null;
    risks: Risk[];
    setRisks: (risks: Risk[]) => void;
}

const RISK_SOURCES = [
    'Armazenamento inadequado',
    'Gestão de acessos deficiente',
    'Transferência internacional',
    'Vazamento por terceiros',
    'Ataque cibernético',
    'Erro humano',
    'Processamento indevido',
    'Retenção excessiva',
    'Outro'
];

export default function Step4RiskMatrix({ projectId, risks, setRisks }: Step4Props) {
    const [isAdding, setIsAdding] = useState(false);
    const [isSaving, setIsSaving] = useState<string | null>(null);
    const [newRisk, setNewRisk] = useState<Risk>({
        description: '',
        source: '',
        impact: 3,
        probability: 3,
        mitigation: ''
    });

    const calculateCriticalValue = (impact: number, probability: number) => impact * probability;

    const getRiskLevel = (criticalValue: number): { level: string; color: string; bgColor: string } => {
        if (criticalValue <= 6) return { level: 'BAIXO', color: 'text-green-700', bgColor: 'bg-green-100' };
        if (criticalValue <= 12) return { level: 'MÉDIO', color: 'text-yellow-700', bgColor: 'bg-yellow-100' };
        if (criticalValue <= 19) return { level: 'ALTO', color: 'text-orange-700', bgColor: 'bg-orange-100' };
        return { level: 'CRÍTICO', color: 'text-red-700', bgColor: 'bg-red-100' };
    };

    const getCellColor = (criticalValue: number) => {
        if (criticalValue <= 6) return 'bg-green-100 text-green-800';
        if (criticalValue <= 12) return 'bg-yellow-100 text-yellow-800';
        if (criticalValue <= 19) return 'bg-orange-100 text-orange-800';
        return 'bg-red-100 text-red-800';
    };

    const addRisk = async () => {
        if (!newRisk.description || !newRisk.source) {
            toast.error('Preencha descrição e fonte do risco');
            return;
        }

        if (!projectId) {
            toast.error('Salve o projeto primeiro antes de adicionar riscos');
            return;
        }

        setIsSaving('new');
        try {
            const response = await risksApi.create({
                projectId,
                ...newRisk
            });
            setRisks([...risks, response.data]);
            setNewRisk({ description: '', source: '', impact: 3, probability: 3, mitigation: '' });
            setIsAdding(false);
            toast.success('Risco adicionado');
        } catch (error) {
            toast.error('Erro ao adicionar risco');
        } finally {
            setIsSaving(null);
        }
    };

    const deleteRisk = async (riskId: string) => {
        if (!confirm('Excluir este risco?')) return;

        setIsSaving(riskId);
        try {
            await risksApi.delete(riskId);
            setRisks(risks.filter(r => r.id !== riskId));
            toast.success('Risco excluído');
        } catch (error) {
            toast.error('Erro ao excluir risco');
        } finally {
            setIsSaving(null);
        }
    };

    // Calculate summary
    const riskSummary = {
        total: risks.length,
        critical: risks.filter(r => (r.criticalValue || 0) >= 20).length,
        high: risks.filter(r => (r.criticalValue || 0) >= 15 && (r.criticalValue || 0) < 20).length,
        medium: risks.filter(r => (r.criticalValue || 0) >= 8 && (r.criticalValue || 0) < 15).length,
        low: risks.filter(r => (r.criticalValue || 0) < 8).length,
        average: risks.length > 0
            ? (risks.reduce((sum, r) => sum + (r.criticalValue || 0), 0) / risks.length).toFixed(1)
            : '0'
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Matriz de Riscos</h2>
                <p className="text-gray-600">Identifique e avalie os riscos de tratamento de dados pessoais</p>
            </div>

            {/* Risk Summary */}
            <div className="grid grid-cols-5 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-gray-800">{riskSummary.total}</p>
                    <p className="text-sm text-gray-500">Total</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">{riskSummary.critical}</p>
                    <p className="text-sm text-red-600">Críticos</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-orange-600">{riskSummary.high}</p>
                    <p className="text-sm text-orange-600">Altos</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{riskSummary.medium}</p>
                    <p className="text-sm text-yellow-600">Médios</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{riskSummary.low}</p>
                    <p className="text-sm text-green-600">Baixos</p>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 text-sm">
                <span className="font-medium text-gray-700">Legenda:</span>
                <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-green-100"></span>
                    <span className="text-gray-600">Baixo (1-6)</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-yellow-100"></span>
                    <span className="text-gray-600">Médio (8-12)</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-orange-100"></span>
                    <span className="text-gray-600">Alto (15-19)</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-red-100"></span>
                    <span className="text-gray-600">Crítico (20-25)</span>
                </div>
            </div>

            {!projectId && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-amber-700">
                        <span className="font-medium">Salve o projeto primeiro</span> para poder adicionar riscos à matriz.
                    </p>
                </div>
            )}

            {/* Risks Table */}
            {risks.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="text-left p-3 font-medium text-gray-700 border-b">Descrição</th>
                                <th className="text-left p-3 font-medium text-gray-700 border-b w-32">Fonte</th>
                                <th className="text-center p-3 font-medium text-gray-700 border-b w-20">Impacto</th>
                                <th className="text-center p-3 font-medium text-gray-700 border-b w-20">Prob.</th>
                                <th className="text-center p-3 font-medium text-gray-700 border-b w-24">Valor</th>
                                <th className="text-center p-3 font-medium text-gray-700 border-b w-24">Nível</th>
                                <th className="text-center p-3 font-medium text-gray-700 border-b w-16"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {risks.map((risk) => {
                                const criticalValue = risk.criticalValue || calculateCriticalValue(risk.impact, risk.probability);
                                const riskLevel = getRiskLevel(criticalValue);

                                return (
                                    <tr key={risk.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3">
                                            <p className="font-medium text-gray-800">{risk.description}</p>
                                            {risk.mitigation && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    <span className="text-primary-600">Mitigação:</span> {risk.mitigation}
                                                </p>
                                            )}
                                        </td>
                                        <td className="p-3 text-gray-600 text-sm">{risk.source}</td>
                                        <td className="p-3 text-center font-medium">{risk.impact}</td>
                                        <td className="p-3 text-center font-medium">{risk.probability}</td>
                                        <td className="p-3 text-center">
                                            <span className={`px-3 py-1 rounded-full font-bold ${getCellColor(criticalValue)}`}>
                                                {criticalValue}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${riskLevel.bgColor} ${riskLevel.color}`}>
                                                {riskLevel.level}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <button
                                                onClick={() => risk.id && deleteRisk(risk.id)}
                                                disabled={isSaving === risk.id}
                                                className="text-red-500 hover:text-red-700 disabled:opacity-50"
                                            >
                                                {isSaving === risk.id ? (
                                                    <div className="spinner w-5 h-5"></div>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Risk Form */}
            {isAdding ? (
                <div className="bg-primary-50 rounded-lg p-6 space-y-4">
                    <h4 className="font-semibold text-gray-800">Adicionar Novo Risco</h4>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="label">Descrição do Risco *</label>
                            <input
                                type="text"
                                value={newRisk.description}
                                onChange={(e) => setNewRisk({ ...newRisk, description: e.target.value })}
                                className="input"
                                placeholder="Ex: Vazamento de dados biométricos"
                            />
                        </div>

                        <div>
                            <label className="label">Fonte do Risco *</label>
                            <select
                                value={newRisk.source}
                                onChange={(e) => setNewRisk({ ...newRisk, source: e.target.value })}
                                className="input"
                            >
                                <option value="">Selecione...</option>
                                {RISK_SOURCES.map((source) => (
                                    <option key={source} value={source}>{source}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="label">Medida de Mitigação</label>
                            <input
                                type="text"
                                value={newRisk.mitigation}
                                onChange={(e) => setNewRisk({ ...newRisk, mitigation: e.target.value })}
                                className="input"
                                placeholder="Ex: Criptografia AES-256"
                            />
                        </div>

                        <div>
                            <label className="label">Impacto (1-5)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    min={1}
                                    max={5}
                                    value={newRisk.impact}
                                    onChange={(e) => setNewRisk({ ...newRisk, impact: parseInt(e.target.value) })}
                                    className="flex-1"
                                />
                                <span className="w-8 text-center font-bold text-lg">{newRisk.impact}</span>
                            </div>
                        </div>

                        <div>
                            <label className="label">Probabilidade (1-5)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    min={1}
                                    max={5}
                                    value={newRisk.probability}
                                    onChange={(e) => setNewRisk({ ...newRisk, probability: parseInt(e.target.value) })}
                                    className="flex-1"
                                />
                                <span className="w-8 text-center font-bold text-lg">{newRisk.probability}</span>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <div className="flex items-center gap-4">
                                <p className="text-gray-700">
                                    Valor Crítico:
                                    <span className={`ml-2 px-3 py-1 rounded-full font-bold ${getCellColor(newRisk.impact * newRisk.probability)}`}>
                                        {newRisk.impact * newRisk.probability}
                                    </span>
                                </p>
                                <p className="text-gray-700">
                                    Nível:
                                    <span className={`ml-2 px-3 py-1 rounded-full font-medium ${getRiskLevel(newRisk.impact * newRisk.probability).bgColor} ${getRiskLevel(newRisk.impact * newRisk.probability).color}`}>
                                        {getRiskLevel(newRisk.impact * newRisk.probability).level}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={addRisk}
                            disabled={isSaving === 'new' || !projectId}
                            className="btn-primary flex items-center gap-2"
                        >
                            {isSaving === 'new' && <div className="spinner w-4 h-4"></div>}
                            Adicionar Risco
                        </button>
                        <button
                            onClick={() => setIsAdding(false)}
                            className="btn-secondary"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsAdding(true)}
                        disabled={!projectId}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Adicionar Risco
                    </button>

                    <button
                        onClick={async () => {
                            if (!projectId) return;
                            if (!confirm('Deseja gerar riscos automaticamente com base nas respostas anteriores? Isso pode duplicar riscos existentes.')) return;

                            setIsSaving('generate');
                            try {
                                const response = await risksApi.generate(projectId);
                                setRisks([...risks, ...response.data]);
                                toast.success('Riscos gerados com sucesso!');
                            } catch (error) {
                                toast.error('Erro ao gerar riscos');
                            } finally {
                                setIsSaving(null);
                            }
                        }}
                        disabled={!projectId || isSaving === 'generate'}
                        className="btn-secondary flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSaving === 'generate' ? (
                            <div className="spinner w-4 h-4"></div>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        )}
                        Gerar Automático
                    </button>
                </div>
            )}
        </div>
    );
}
