'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { projectsApi, risksApi, actionsApi } from '@/services/api';
import toast from 'react-hot-toast';
import Stepper from '@/components/Stepper';
import Step1AgentsProject from '@/components/Steps/Step1AgentsProject';
import Step2TreatmentNature from '@/components/Steps/Step2TreatmentNature';
import Step3DataLifecycle from '@/components/Steps/Step3DataLifecycle';
import Step4RiskMatrix from '@/components/Steps/Step4RiskMatrix';
import Step5ActionPlan from '@/components/Steps/Step5ActionPlan';
import Step6Signatures from '@/components/Steps/Step6Signatures';

const STEPS = [
    { id: 1, title: 'Agentes e Projeto', description: 'Identificação básica' },
    { id: 2, title: 'Natureza do Tratamento', description: 'Checklist de riscos' },
    { id: 3, title: 'Ciclo de Vida', description: 'Categorias e transferências' },
    { id: 4, title: 'Matriz de Riscos', description: 'Avaliação de riscos' },
    { id: 5, title: 'Plano de Ação', description: 'Medidas de mitigação' },
    { id: 6, title: 'Aprovações', description: 'Assinaturas e validação' },
];

export interface ProjectFormData {
    name: string;
    description: string;
    controller: string;
    dpoName: string;
    dpoEmail: string;
    operators: { name: string; type: string; country: string }[];
    hasSensitiveData: boolean;
    hasBiometricData: boolean;
    hasProfileSurveillance: boolean;
    isRegulatedSector: boolean;
    hasAutomatedDecision: boolean;
    hasMinorData: boolean;
    dataCategories: string[];
    collectionMethod: string;
    hasInternationalTransfer: boolean;
    transferCountries: string[];
    transferMechanism: string;
    purposes: { purpose: string; legalBasis: string }[];
    retentionPeriodMonths: number | null;
    retentionJustification: string;
    preparerName?: string;
    preparerRole?: string;
    managerName?: string;
    managerRole?: string;
}

export interface Risk {
    id?: string;
    description: string;
    source: string;
    impact: number;
    probability: number;
    criticalValue?: number;
    level?: string;
    mitigation: string;
}

export interface Action {
    id?: string;
    measure: string;
    description: string;
    responsible: string;
    deadline: string;
    priority: number;
    status: string;
}

const initialFormData: ProjectFormData = {
    name: '',
    description: '',
    controller: '',
    dpoName: '',
    dpoEmail: '',
    operators: [],
    hasSensitiveData: false,
    hasBiometricData: false,
    hasProfileSurveillance: false,
    isRegulatedSector: true,
    hasAutomatedDecision: false,
    hasMinorData: false,
    dataCategories: [],
    collectionMethod: '',
    hasInternationalTransfer: false,
    transferCountries: [],
    transferMechanism: '',
    purposes: [],
    retentionPeriodMonths: null,
    retentionJustification: '',
    preparerName: '',
    preparerRole: '',
    managerName: '',
    managerRole: '',
};

export default function ProjectPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const projectId = params.id as string;
    const isNewProject = projectId === 'new';

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
    const [risks, setRisks] = useState<Risk[]>([]);
    const [actions, setActions] = useState<Action[]>([]);
    const [isLoading, setIsLoading] = useState(!isNewProject);
    const [isSaving, setIsSaving] = useState(false);
    const [savedProjectId, setSavedProjectId] = useState<string | null>(
        isNewProject ? null : projectId
    );

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (!isNewProject && isAuthenticated) {
            loadProject();
        }
    }, [projectId, isAuthenticated]);

    const loadProject = async () => {
        try {
            const response = await projectsApi.get(projectId);
            const project = response.data;

            setFormData({
                name: project.name || '',
                description: project.description || '',
                controller: project.controller || '',
                dpoName: project.dpoName || '',
                dpoEmail: project.dpoEmail || '',
                operators: project.operators || [],
                hasSensitiveData: project.hasSensitiveData || false,
                hasBiometricData: project.hasBiometricData || false,
                hasProfileSurveillance: project.hasProfileSurveillance || false,
                isRegulatedSector: project.isRegulatedSector ?? true,
                hasAutomatedDecision: project.hasAutomatedDecision || false,
                hasMinorData: project.hasMinorData || false,
                dataCategories: project.dataCategories || [],
                collectionMethod: project.collectionMethod || '',
                hasInternationalTransfer: project.hasInternationalTransfer || false,
                transferCountries: project.transferCountries || [],
                transferMechanism: project.transferMechanism || '',
                purposes: project.purposes || [],
                retentionPeriodMonths: project.retentionPeriodMonths || null,
                retentionJustification: project.retentionJustification || '',
                preparerName: project.preparerName || '',
                preparerRole: project.preparerRole || '',
                managerName: project.managerName || '',
                managerRole: project.managerRole || '',
            });

            setRisks(project.risks || []);
            setActions(project.actions || []);
        } catch (error) {
            toast.error('Erro ao carregar projeto');
            router.push('/dashboard');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (goToNext = false) => {
        if (!formData.name || !formData.controller || !formData.dpoName) {
            toast.error('Preencha os campos obrigatórios: Nome, Controlador e DPO');
            setCurrentStep(1);
            return;
        }

        setIsSaving(true);

        try {
            let projectIdToUse = savedProjectId;

            if (savedProjectId) {
                await projectsApi.update(savedProjectId, formData);
                toast.success('Projeto salvo!');
            } else {
                const response = await projectsApi.create(formData);
                projectIdToUse = response.data.id;
                setSavedProjectId(projectIdToUse);
                toast.success('Projeto criado!');
                // Update URL without full reload
                window.history.replaceState({}, '', `/project/${projectIdToUse}`);
            }

            if (goToNext && currentStep < STEPS.length) {
                setCurrentStep(currentStep + 1);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Erro ao salvar projeto');
        } finally {
            setIsSaving(false);
        }
    };

    const handleFinish = async () => {
        await handleSave(false);
        router.push('/dashboard');
    };

    const updateFormData = (updates: Partial<ProjectFormData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="spinner w-12 h-12"></div>
            </div>
        );
    }

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <Step1AgentsProject
                        formData={formData}
                        updateFormData={updateFormData}
                    />
                );
            case 2:
                return (
                    <Step2TreatmentNature
                        formData={formData}
                        updateFormData={updateFormData}
                    />
                );
            case 3:
                return (
                    <Step3DataLifecycle
                        formData={formData}
                        updateFormData={updateFormData}
                    />
                );
            case 4:
                return (
                    <Step4RiskMatrix
                        projectId={savedProjectId}
                        risks={risks}
                        setRisks={setRisks}
                    />
                );
            case 5:
                return (
                    <Step5ActionPlan
                        projectId={savedProjectId}
                        actions={actions}
                        setActions={setActions}
                        formData={formData}
                    />
                );
            case 6:
                return (
                    <Step6Signatures
                        formData={formData}
                        updateFormData={updateFormData}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Voltar
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">
                        {isNewProject ? 'Novo RIPD' : 'Editar RIPD'}
                    </h1>
                    <div className="w-20"></div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Stepper */}
                <Stepper steps={STEPS} currentStep={currentStep} onStepClick={setCurrentStep} />

                {/* Form Content */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mt-8 animate-fade-in">
                    {renderStep()}
                </div>

                {/* Navigation */}
                <div className="flex justify-between mt-8">
                    <button
                        onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                        disabled={currentStep === 1}
                        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Anterior
                    </button>

                    <div className="flex gap-4">
                        <button
                            onClick={() => handleSave(false)}
                            disabled={isSaving}
                            className="btn-secondary flex items-center gap-2"
                        >
                            {isSaving && <div className="spinner w-4 h-4"></div>}
                            Salvar
                        </button>

                        {currentStep < STEPS.length ? (
                            <button
                                onClick={() => handleSave(true)}
                                disabled={isSaving}
                                className="btn-primary flex items-center gap-2"
                            >
                                {isSaving && <div className="spinner w-4 h-4"></div>}
                                Próximo
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        ) : (
                            <button
                                onClick={handleFinish}
                                disabled={isSaving}
                                className="btn-primary bg-green-600 hover:bg-green-700 flex items-center gap-2"
                            >
                                {isSaving && <div className="spinner w-4 h-4"></div>}
                                Finalizar
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
