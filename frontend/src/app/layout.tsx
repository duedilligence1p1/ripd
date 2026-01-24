import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'RIPD Manager 1pra1',
    description: 'Gestão de Relatórios de Impacto à Proteção de Dados - Lei 14.790/2023',
    keywords: ['RIPD', 'LGPD', 'Proteção de Dados', 'Apostas Online', 'Compliance'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR">
            <body className={inter.className}>
                <AuthProvider>
                    {children}
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#1e40af',
                                color: '#fff',
                            },
                            success: {
                                style: {
                                    background: '#22c55e',
                                },
                            },
                            error: {
                                style: {
                                    background: '#ef4444',
                                },
                            },
                        }}
                    />
                </AuthProvider>
            </body>
        </html>
    );
}
