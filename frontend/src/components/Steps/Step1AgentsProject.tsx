'use client';

import { useState } from 'react';
import { ProjectFormData } from '@/app/project/[id]/page';

interface Step1Props {
    formData: ProjectFormData;
    updateFormData: (updates: Partial<ProjectFormData>) => void;
}

const OPERATOR_TYPES = [
    'Cloud Provider',
    'KYC Provider',
    'Payment Gateway',
    'Analytics',
    'CRM',
    'Marketing',
    'Outro'
];

export default function Step1AgentsProject({ formData, updateFormData }: Step1Props) {
    const [newOperator, setNewOperator] = useState({ name: '', type: '', country: '' });

    const addOperator = () => {
        if (!newOperator.name || !newOperator.type) return;
        updateFormData({
            operators: [...formData.operators, { ...newOperator }]
        });
        setNewOperator({ name: '', type: '', country: '' });
    };

    const removeOperator = (index: number) => {
        updateFormData({
            operators: formData.operators.filter((_, i) => i !== index)
        });
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Agentes e Projeto</h2>
                <p className="text-gray-600">Identificação dos agentes de tratamento e informações básicas do projeto</p>
            </div>

            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="label">Nome do Projeto *</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => updateFormData({ name: e.target.value })}
                        className="input"
                        placeholder="Ex: Plataforma de Apostas - KYC"
                        required
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="label">Descrição</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => updateFormData({ description: e.target.value })}
                        className="input min-h-[100px]"
                        placeholder="Descreva o projeto e seu objetivo de tratamento de dados"
                    />
                </div>

                <div>
                    <label className="label">Controlador *</label>
                    <input
                        type="text"
                        value={formData.controller}
                        onChange={(e) => updateFormData({ controller: e.target.value })}
                        className="input"
                        placeholder="Ex: 1pra1 Apostas Ltda"
                        required
                    />
                </div>

                <div>
                    <label className="label">Nome do DPO *</label>
                    <input
                        type="text"
                        value={formData.dpoName}
                        onChange={(e) => updateFormData({ dpoName: e.target.value })}
                        className="input"
                        placeholder="Nome do Encarregado de Dados"
                        required
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="label">Email do DPO</label>
                    <input
                        type="email"
                        value={formData.dpoEmail}
                        onChange={(e) => updateFormData({ dpoEmail: e.target.value })}
                        className="input"
                        placeholder="dpo@empresa.com"
                    />
                </div>
            </div>

            {/* Operators */}
            <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Operadores de Dados</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Adicione os operadores que tratam dados em nome do controlador (ex: AWS, fornecedores KYC, etc.)
                </p>

                {/* Operators List */}
                {formData.operators.length > 0 && (
                    <div className="space-y-3 mb-6">
                        {formData.operators.map((operator, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between bg-gray-50 rounded-lg p-4"
                            >
                                <div>
                                    <span className="font-medium text-gray-800">{operator.name}</span>
                                    <span className="text-gray-500 ml-2">({operator.type})</span>
                                    {operator.country && (
                                        <span className="text-gray-400 ml-2">- {operator.country}</span>
                                    )}
                                </div>
                                <button
                                    onClick={() => removeOperator(index)}
                                    className="text-red-500 hover:text-red-700 p-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Operator Form */}
                <div className="grid md:grid-cols-4 gap-4 bg-primary-50 rounded-lg p-4">
                    <div>
                        <label className="label text-sm">Nome do Operador</label>
                        <input
                            type="text"
                            value={newOperator.name}
                            onChange={(e) => setNewOperator({ ...newOperator, name: e.target.value })}
                            className="input"
                            placeholder="Ex: AWS"
                        />
                    </div>
                    <div>
                        <label className="label text-sm">Tipo</label>
                        <select
                            value={newOperator.type}
                            onChange={(e) => setNewOperator({ ...newOperator, type: e.target.value })}
                            className="input"
                        >
                            <option value="">Selecione...</option>
                            {OPERATOR_TYPES.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="label text-sm">País (opcional)</label>
                        <input
                            type="text"
                            value={newOperator.country}
                            onChange={(e) => setNewOperator({ ...newOperator, country: e.target.value })}
                            className="input"
                            placeholder="Ex: USA"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={addOperator}
                            disabled={!newOperator.name || !newOperator.type}
                            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Adicionar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
