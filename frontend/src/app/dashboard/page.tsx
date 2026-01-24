'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { projectsApi, pdfApi } from '@/services/api';
import toast from 'react-hot-toast';

interface Project {
    id: string;
    name: string;
    controller: string;
    status: string;
    maturityScore: number;
    createdAt: string;
    updatedAt: string;
    _count: {
        risks: number;
        actions: number;
    };
}

export default function DashboardPage() {
    const { user, logout, isLoading: authLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (isAuthenticated) {
            loadProjects();
        }
    }, [isAuthenticated]);

    const loadProjects = async () => {
        try {
            const response = await projectsApi.list();
            setProjects(response.data);
        } catch (error) {
            toast.error('Erro ao carregar projetos');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja excluir o projeto "${name}"?`)) return;

        try {
            await projectsApi.delete(id);
            toast.success('Projeto excluído');
            loadProjects();
        } catch (error) {
            toast.error('Erro ao excluir projeto');
        }
    };

    const handleDownloadPdf = async (projectId: string, projectName: string) => {
        try {
            const response = await pdfApi.download(projectId);
            // response.data is already a Blob because of responseType: 'blob' in api.ts
            const blob = response.data;
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const safeName = projectName.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'relatorio';
            a.download = `RIPD_${safeName}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success('PDF baixado com sucesso!');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Erro ao gerar PDF');
        }
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { label: string; class: string }> = {
            DRAFT: { label: 'Rascunho', class: 'bg-gray-100 text-gray-700' },
            IN_REVIEW: { label: 'Em Análise', class: 'bg-yellow-100 text-yellow-700' },
            APPROVED: { label: 'Aprovado', class: 'bg-green-100 text-green-700' },
            ARCHIVED: { label: 'Arquivado', class: 'bg-gray-200 text-gray-600' },
        };
        const badge = badges[status] || badges.DRAFT;
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}>
                {badge.label}
            </span>
        );
    };

    const getMaturityColor = (score: number) => {
        if (score < 1) return 'text-red-600';
        if (score < 2.5) return 'text-orange-500';
        if (score < 4) return 'text-yellow-500';
        return 'text-green-500';
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner w-12 h-12"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img src="/logo-sykesec.png" alt="SykeSec" className="h-10 object-contain" />
                        <span className="text-xl font-bold text-gray-800">RIPD Manager</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600">Olá, {user?.name}</span>
                        <button
                            onClick={logout}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            Sair
                        </button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                {/* Page Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                        <p className="text-gray-600 mt-1">Gerencie seus relatórios de impacto</p>
                    </div>
                    <Link
                        href="/project/new"
                        className="btn-primary flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Novo RIPD
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-sm">Total de Projetos</p>
                        <p className="text-3xl font-bold text-gray-800 mt-2">{projects.length}</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-sm">Em Rascunho</p>
                        <p className="text-3xl font-bold text-yellow-500 mt-2">
                            {projects.filter(p => p.status === 'DRAFT').length}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-sm">Aprovados</p>
                        <p className="text-3xl font-bold text-green-500 mt-2">
                            {projects.filter(p => p.status === 'APPROVED').length}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-sm">Maturidade Média</p>
                        <p className={`text-3xl font-bold mt-2 ${getMaturityColor(
                            projects.length > 0
                                ? projects.reduce((acc, p) => acc + p.maturityScore, 0) / projects.length
                                : 0
                        )}`}>
                            {projects.length > 0
                                ? (projects.reduce((acc, p) => acc + p.maturityScore, 0) / projects.length).toFixed(2)
                                : '0.00'
                            }/5.00
                        </p>
                    </div>
                </div>

                {/* Projects List */}
                {projects.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhum projeto ainda</h3>
                        <p className="text-gray-600 mb-6">Crie seu primeiro RIPD para começar</p>
                        <Link href="/project/new" className="btn-primary inline-flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Criar Primeiro RIPD
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {projects.map((project) => (
                            <div
                                key={project.id}
                                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-800">{project.name}</h3>
                                            {getStatusBadge(project.status)}
                                        </div>
                                        <p className="text-gray-600 text-sm mb-3">Controlador: {project.controller}</p>
                                        <div className="flex gap-6 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                {project._count.risks} riscos
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                {project._count.actions} ações
                                            </span>
                                            <span className={`flex items-center gap-1 font-medium ${getMaturityColor(project.maturityScore)}`}>
                                                Maturidade: {project.maturityScore.toFixed(2)}/5.00
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/project/${project.id}`}
                                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </Link>
                                        <button
                                            onClick={() => handleDownloadPdf(project.id, project.name)}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Baixar PDF"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(project.id, project.name)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Excluir"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
