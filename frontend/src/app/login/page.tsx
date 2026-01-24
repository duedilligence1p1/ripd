'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await login(email, password);
            toast.success('Login realizado com sucesso!');
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Erro ao fazer login');
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
                    <h1 className="text-2xl font-bold text-gray-800">RIPD Manager</h1>
                    <p className="text-gray-600 mt-2">Entre na sua conta</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
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
                            'Entrar'
                        )}
                    </button>
                </form>

                <p className="text-center text-gray-600 mt-6">
                    Não tem uma conta?{' '}
                    <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                        Criar conta
                    </Link>
                </p>

                <div className="mt-8 p-4 bg-primary-50 rounded-lg">
                    <p className="text-sm text-gray-600 font-medium mb-2">Credenciais de teste:</p>
                    <p className="text-sm text-gray-500">Email: teste@1pra1.com</p>
                    <p className="text-sm text-gray-500">Senha: test123</p>
                </div>
            </div>
        </main>
    );
}
