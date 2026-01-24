'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function HomePage() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner w-12 h-12"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-16">
                <nav className="flex justify-between items-center mb-16">
                    <div className="flex items-center gap-3">
                        <img src="/logo-sykesec.png" alt="SykeSec" className="h-12 object-contain" />
                        <span className="text-white text-xl font-bold">RIPD Manager</span>
                    </div>
                    <div className="flex gap-4">
                        <Link
                            href="/login"
                            className="text-white hover:text-primary-200 transition-colors px-4 py-2"
                        >
                            Entrar
                        </Link>
                        <Link
                            href="/register"
                            className="bg-white text-primary-700 px-6 py-2 rounded-lg font-medium hover:bg-primary-50 transition-colors"
                        >
                            Criar Conta
                        </Link>
                    </div>
                </nav>

                <div className="text-center max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Relatórios de Impacto à
                        <span className="text-primary-300"> Proteção de Dados</span>
                    </h1>
                    <p className="text-xl text-primary-200 mb-8 max-w-2xl mx-auto">
                        Gestão completa de RIPD para o setor de apostas online.
                        Conformidade com a LGPD e Lei 14.790/2023.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link
                            href="/register"
                            className="bg-white text-primary-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-50 transition-all hover:shadow-lg hover:-translate-y-1"
                        >
                            Começar Agora
                        </Link>
                        <Link
                            href="#features"
                            className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all"
                        >
                            Saiba Mais
                        </Link>
                    </div>
                </div>

                {/* Features */}
                <div id="features" className="mt-32 grid md:grid-cols-3 gap-8">
                    <div className="glass rounded-2xl p-8 text-center card-hover">
                        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">Stepper Intuitivo</h3>
                        <p className="text-gray-600">
                            Preenchimento guiado passo a passo, sem sobrecarregar o usuário.
                        </p>
                    </div>

                    <div className="glass rounded-2xl p-8 text-center card-hover">
                        <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">Matriz de Riscos</h3>
                        <p className="text-gray-600">
                            Cálculo automático de criticidade com visualização por cores.
                        </p>
                    </div>

                    <div className="glass rounded-2xl p-8 text-center card-hover">
                        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">PDF Formatado</h3>
                        <p className="text-gray-600">
                            Exportação seguindo o modelo SGD 2.0 e requisitos da Lei 14.790.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <footer className="mt-32 text-center text-primary-300">
                    <p>© 2026 1pra1 - RIPD Manager. Todos os direitos reservados.</p>
                </footer>
            </div>
        </main>
    );
}
