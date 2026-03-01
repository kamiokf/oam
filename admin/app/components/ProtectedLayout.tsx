'use client';

import { useAdminAuth } from '../context/AdminAuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from './Sidebar';

interface ProtectedLayoutProps {
    children: React.ReactNode;
    requirePermission?: string;
}

export default function ProtectedLayout({ children, requirePermission }: ProtectedLayoutProps) {
    const { isAuthenticated, isLoading, canPerform } = useAdminAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (requirePermission && !canPerform(requirePermission)) {
                router.push('/dashboard');
            }
        }
    }, [isAuthenticated, isLoading, router, requirePermission, canPerform]);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || (requirePermission && !canPerform(requirePermission))) return null;

    return (
        <div className="admin-layout">
            <Sidebar />
            <main className="admin-main">
                <div className="admin-content">
                    {children}
                </div>
            </main>
        </div>
    );
}
