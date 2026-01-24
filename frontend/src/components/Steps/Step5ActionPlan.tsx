'use client';

import { useState } from 'react';
import { Action, ProjectFormData } from '@/app/project/[id]/page';
import { actionsApi } from '@/services/api';
import toast from 'react-hot-toast';

interface Step5Props {
    projectId: string | null;
    actions: Action[];
    setActions: (actions: Action[]) => void;
    formData: ProjectFormData;
}

// Medidas para quando há transferência internacional (operadores fora do país)
const INTERNATIONAL_TRANSFER_MEASURES = [
    { measure: 'Treinamento LGPD', description: 'Programa de conscientização para colaboradores sobre proteção de dados' },
    { measure: 'Due Diligence', description: 'Avaliação de conformidade de terceiros e operadores internacionais' },
];

// Medidas padrão (quando NÃO há transferência internacional)
const STANDARD_MEASURES = [
    { measure: 'Implementar MFA', description: 'Multi-factor authentication para acessos críticos' },
    { measure: 'Criptografia AES-256', description: 'Criptografia em repouso para dados sensíveis' },
    { measure: 'TLS 1.3', description: 'Criptografia em trânsito para todas as comunicações' },
    { measure: 'RBAC', description: 'Role-Based Access Control para gestão de permissões' },
    { measure: 'Logs de Auditoria', description: 'Registro de todas as operações com dados pessoais' },
    { measure: 'Backup Criptografado', description: 'Backups regulares com criptografia' },
    { measure: 'DLP', description: 'Data Loss Prevention para prevenção de vazamentos' },
    { measure: 'Treinamento LGPD', description: 'Programa de conscientização para colaboradores' },
];

const STATUS_OPTIONS = [
    { value: 'PENDING', label: 'Pendente', color: 'bg-gray-100 text-gray-700' },
    { value: 'IN_PROGRESS', label: 'Em Andamento', color: 'bg-blue-100 text-blue-700' },
    { value: 'COMPLETED', label: 'Concluído', color: 'bg-green-100 text-green-700' },
];

export default function Step5ActionPlan({ projectId, actions, setActions, formData }: Step5Props) {
    const [isAdding, setIsAdding] = useState(false);
    const [isSaving, setIsSaving] = useState<string | null>(null);
    const [newAction, setNewAction] = useState<Omit<Action, 'id'>>({
        measure: '',
        description: '',
        responsible: '',
        deadline: '',
        priority: 3,
        status: 'PENDING'
    });

    // Verifica se há transferência internacional (operadores fora do país)
    const hasInternationalOperators = formData.hasInternationalTransfer ||
        formData.operators.some(op => op.country && op.country !== 'Brasil' && op.country !== 'BR');

    // Seleciona as medidas baseado na transferência internacional
    const COMMON_MEASURES = hasInternationalOperators
        ? INTERNATIONAL_TRANSFER_MEASURES
        : STANDARD_MEASURES;

    const addAction = async () => {
        if (!newAction.measure || !newAction.responsible || !newAction.deadline) {
            toast.error('Preencha medida, responsável e prazo');
            return;
        }

        if (!projectId) {
            toast.error('Salve o projeto primeiro');
            return;
        }

        setIsSaving('new');
        try {
            const response = await actionsApi.create({
                projectId,
                ...newAction
            });
            setActions([...actions, response.data]);
            setNewAction({ measure: '', description: '', responsible: '', deadline: '', priority: 3, status: 'PENDING' });
            setIsAdding(false);
            toast.success('Ação adicionada');
        } catch (error) {
            toast.error('Erro ao adicionar ação');
        } finally {
            setIsSaving(null);
        }
    };

    const updateStatus = async (actionId: string, status: string) => {
        setIsSaving(actionId);
        try {
            await actionsApi.updateStatus(actionId, status);
            setActions(actions.map(a =>
                a.id === actionId ? { ...a, status } : a
            ));
            toast.success('Status atualizado');
        } catch (error) {
            toast.error('Erro ao atualizar status');
        } finally {
            setIsSaving(null);
        }
    };

    const deleteAction = async (actionId: string) => {
        if (!confirm('Excluir esta ação?')) return;

        setIsSaving(actionId);
        try {
            await actionsApi.delete(actionId);
            setActions(actions.filter(a => a.id !== actionId));
            toast.success('Ação excluída');
        } catch (error) {
            toast.error('Erro ao excluir ação');
        } finally {
            setIsSaving(null);
        }
    };

    const applyQuickMeasure = (measure: typeof COMMON_MEASURES[0]) => {
        setNewAction({
            ...newAction,
            measure: measure.measure,
            description: measure.description
        });
        setIsAdding(true);
    };

    // Calculate summary
    const completedCount = actions.filter(a => a.status === 'COMPLETED').length;
    const maturityScore = actions.length > 0 ? ((completedCount / actions.length) * 5).toFixed(2) : '0.00';

    const getStatusBadge = (status: string) => {
        const option = STATUS_OPTIONS.find(o => o.value === status);
        return option || STATUS_OPTIONS[0];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const isOverdue = (deadline: string, status: string) => {
        if (status === 'COMPLETED') return false;
        return new Date(deadline) < new Date();
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Plano de Ação</h2>
                <p className="text-gray-600">Defina as medidas de mitigação e acompanhe a implementação</p>
            </div>

            {/* Maturity Score */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-primary-100 text-sm">Nível de Maturidade</p>
                        <p className="text-4xl font-bold mt-1">{maturityScore}<span className="text-xl">/5.00</span></p>
                        <p className="text-primary-200 text-sm mt-2">
                            {completedCount} de {actions.length} ações concluídas
                        </p>
                    </div>
                    <div className="w-24 h-24">
                        <svg viewBox="0 0 36 36" className="transform -rotate-90">
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="3"
                            />
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="white"
                                strokeWidth="3"
                                strokeDasharray={`${(parseFloat(maturityScore) / 5) * 100}, 100`}
                            />
                        </svg>
                    </div>
                </div>
            </div>

            {/* International Transfer Alert */}
            {hasInternationalOperators && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-blue-700">
                        <span className="font-medium">Transferência Internacional detectada.</span> As medidas recomendadas incluem Treinamento LGPD e Due Diligence para operadores estrangeiros.
                    </p>
                </div>
            )}

            {!projectId && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-amber-700">
                        <span className="font-medium">Salve o projeto primeiro</span> para poder adicionar ações ao plano.
                    </p>
                </div>
            )}

            {/* Quick Add Measures */}
            {projectId && (
                <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">
                        {hasInternationalOperators
                            ? 'Medidas obrigatórias para transferência internacional:'
                            : 'Adicionar medidas comuns:'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {COMMON_MEASURES.map((measure) => (
                            <button
                                key={measure.measure}
                                onClick={() => applyQuickMeasure(measure)}
                                className="text-sm px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                {measure.measure}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions List */}
            {actions.length > 0 && (
                <div className="space-y-4">
                    {actions.map((action) => {
                        const statusBadge = getStatusBadge(action.status);
                        const overdue = isOverdue(action.deadline, action.status);

                        return (
                            <div
                                key={action.id}
                                className={`bg-white rounded-lg border p-5 ${overdue ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-semibold text-gray-800">{action.measure}</h4>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadge.color}`}>
                                                {statusBadge.label}
                                            </span>
                                            {overdue && (
                                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                                                    Atrasado
                                                </span>
                                            )}
                                        </div>
                                        {action.description && (
                                            <p className="text-gray-600 text-sm mb-3">{action.description}</p>
                                        )}
                                        <div className="flex gap-6 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                {action.responsible}
                                            </span>
                                            <span className={`flex items-center gap-1 ${overdue ? 'text-red-600 font-medium' : ''}`}>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {formatDate(action.deadline)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                Prioridade: {'⭐'.repeat(action.priority)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <select
                                            value={action.status}
                                            onChange={(e) => action.id && updateStatus(action.id, e.target.value)}
                                            disabled={isSaving === action.id}
                                            className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white"
                                        >
                                            {STATUS_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => action.id && deleteAction(action.id)}
                                            disabled={isSaving === action.id}
                                            className="p-2 text-red-500 hover:text-red-700 disabled:opacity-50"
                                        >
                                            {isSaving === action.id ? (
                                                <div className="spinner w-5 h-5"></div>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Action Form */}
            {isAdding ? (
                <div className="bg-primary-50 rounded-lg p-6 space-y-4">
                    <h4 className="font-semibold text-gray-800">Adicionar Nova Ação</h4>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="label">Medida *</label>
                            <input
                                type="text"
                                value={newAction.measure}
                                onChange={(e) => setNewAction({ ...newAction, measure: e.target.value })}
                                className="input"
                                placeholder="Ex: Implementar criptografia AES-256"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="label">Descrição</label>
                            <textarea
                                value={newAction.description}
                                onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
                                className="input min-h-[80px]"
                                placeholder="Detalhes sobre a implementação..."
                            />
                        </div>

                        <div>
                            <label className="label">Responsável *</label>
                            <input
                                type="text"
                                value={newAction.responsible}
                                onChange={(e) => setNewAction({ ...newAction, responsible: e.target.value })}
                                className="input"
                                placeholder="Ex: Equipe de Segurança"
                            />
                        </div>

                        <div>
                            <label className="label">Prazo *</label>
                            <input
                                type="date"
                                value={newAction.deadline}
                                onChange={(e) => setNewAction({ ...newAction, deadline: e.target.value })}
                                className="input"
                            />
                        </div>

                        <div>
                            <label className="label">Prioridade (1-5)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    min={1}
                                    max={5}
                                    value={newAction.priority}
                                    onChange={(e) => setNewAction({ ...newAction, priority: parseInt(e.target.value) })}
                                    className="flex-1"
                                />
                                <span className="w-16 text-center">{'⭐'.repeat(newAction.priority)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={addAction}
                            disabled={isSaving === 'new' || !projectId}
                            className="btn-primary flex items-center gap-2"
                        >
                            {isSaving === 'new' && <div className="spinner w-4 h-4"></div>}
                            Adicionar Ação
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
                        Adicionar Ação
                    </button>

                    <button
                        onClick={async () => {
                            if (!projectId) return;
                            if (!confirm('Deseja gerar ações automaticamente com base nos riscos e respostas anteriores?')) return;

                            setIsSaving('generate');
                            try {
                                const response = await actionsApi.generate(projectId);
                                setActions([...actions, ...response.data]);
                                toast.success('Ações geradas com sucesso!');
                            } catch (error) {
                                toast.error('Erro ao gerar ações');
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
