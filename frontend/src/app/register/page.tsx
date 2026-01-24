'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('As senhas não coincidem');
            return;
        }

        if (password.length < 6) {
            toast.error('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        setIsLoading(true);

        try {
            await register(email, password, name);
            toast.success('Conta criada com sucesso!');
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Erro ao criar conta');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 flex items-center justify-center p-4">
            <div className="glass rounded-2xl p-8 w-full max-w-md animate-fade-in">
                <div className="text-center mb-8">
                    <img
                        src="/logo-sykesec.png"
                        alt="SykeSec"
                        className="w-32 h-32 object-contain mx-auto mb-2"
                    />
                    <p className="text-xs text-gray-500 mb-4 px-4">
                        © SykeSec Security Consulting. Todos os direitos reservados.<br />
                        Cópia não autorizada. Licenciado para <strong>1pra1 Apostas Online</strong>.
                    </p>
                    <h1 className="text-2xl font-bold text-gray-800">Criar Conta</h1>
                    <p className="text-gray-600 mt-2">Comece a gerenciar seus RIPDs</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="name" className="label">Nome Completo</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input"
                            placeholder="Seu nome"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="label">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input"
                            placeholder="seu@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="label">Senha</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="label">Confirmar Senha</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="input"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full py-3 flex items-center justify-center"
                    >
                        {isLoading ? (
                            <div className="spinner w-5 h-5"></div>
                        ) : (
                            'Criar Conta'
                        )}
                    </button>
                </form>

                <p className="text-center text-gray-600 mt-6">
                    Já tem uma conta?{' '}
                    <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                        Entrar
                    </Link>
                </p>
            </div>
        </main>
    );
}
