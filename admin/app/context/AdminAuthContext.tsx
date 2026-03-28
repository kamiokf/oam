'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { ROLE_PERMISSIONS, type AdminUser } from '../data/admin-users';
import { insforge } from '../../lib/insforge';

interface AdminAuthContextType {
    admin: AdminUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    permissions: typeof ROLE_PERMISSIONS[keyof typeof ROLE_PERMISSIONS] | null;
    login: (email: string, password: string, totpCode: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    canPerform: (action: string) => boolean;
    sessionExpiresAt: number | null;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
    admin: null,
    isAuthenticated: false,
    isLoading: true,
    permissions: null,
    login: async () => ({ success: false }),
    logout: () => { },
    canPerform: () => false,
    sessionExpiresAt: null,
});

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
    const [admin, setAdmin] = useState<AdminUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const permissions = admin ? ROLE_PERMISSIONS[admin.role] : null;

    // Check for existing session
    useEffect(() => {
        async function checkSession() {
            const stored = typeof window !== 'undefined' ? localStorage.getItem('admin_session') : null;
            if (stored) {
                try {
                    const session = JSON.parse(stored);
                    const now = Date.now();
                    if (session.expiresAt > now) {
                        const { data: foundAdmin } = await insforge.database
                            .from('admin_users')
                            .select('*')
                            .eq('id', session.adminId)
                            .single();

                        if (foundAdmin) {
                            setAdmin({
                                id: foundAdmin.id,
                                email: foundAdmin.email,
                                fullName: foundAdmin.full_name,
                                role: foundAdmin.role as any,
                                isActive: foundAdmin.is_active,
                                lastLogin: foundAdmin.last_login,
                                createdAt: foundAdmin.created_at,
                                avatar: foundAdmin.avatar,
                            });
                            setSessionExpiresAt(session.expiresAt);
                        }
                    } else {
                        localStorage.removeItem('admin_session');
                    }
                } catch {
                    localStorage.removeItem('admin_session');
                }
            }
            setIsLoading(false);
        }
        checkSession();
    }, []);

    // Reset session timeout on activity
    const resetTimeout = useCallback(() => {
        if (!admin) return;
        const expiresAt = Date.now() + SESSION_TIMEOUT;
        setSessionExpiresAt(expiresAt);

        if (typeof window !== 'undefined') {
            localStorage.setItem('admin_session', JSON.stringify({ adminId: admin.id, expiresAt }));
        }

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setAdmin(null);
            setSessionExpiresAt(null);
            if (typeof window !== 'undefined') localStorage.removeItem('admin_session');
        }, SESSION_TIMEOUT);
    }, [admin]);

    // Activity listeners
    useEffect(() => {
        if (!admin) return;
        resetTimeout();

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(e => window.addEventListener(e, resetTimeout));
        return () => {
            events.forEach(e => window.removeEventListener(e, resetTimeout));
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [admin, resetTimeout]);

    const login = useCallback(async (email: string, password: string, totpCode: string) => {
        setIsLoading(true);

        // Basic client-side format check
        if (totpCode.length !== 6 || !/^\d+$/.test(totpCode)) {
            setIsLoading(false);
            return { success: false, error: 'Enter a valid 6-digit code.' };
        }

        // Validate credentials via secure API route (checks env vars server-side)
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, totpCode }),
            });

            if (res.status === 429) {
                setIsLoading(false);
                return { success: false, error: 'Too many login attempts. Please try again in 5 minutes.' };
            }

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setIsLoading(false);
                return { success: false, error: data.error || 'Login failed' };
            }
        } catch {
            setIsLoading(false);
            return { success: false, error: 'Network error. Please try again.' };
        }

        // Credentials valid — look up admin user from DB
        const { data: foundAdmin, error } = await insforge.database
            .from('admin_users')
            .select('*')
            .eq('role', 'super_admin')
            .eq('is_active', true)
            .single();

        if (error || !foundAdmin) {
            setIsLoading(false);
            return { success: false, error: 'Admin account not found in database' };
        }

        const mappedAdmin: AdminUser = {
            id: foundAdmin.id,
            email: email, // Use the login email, not the DB email
            fullName: foundAdmin.full_name,
            role: foundAdmin.role as any,
            isActive: foundAdmin.is_active,
            lastLogin: foundAdmin.last_login,
            createdAt: foundAdmin.created_at,
            avatar: foundAdmin.avatar,
        };

        setAdmin(mappedAdmin);
        const expiresAt = Date.now() + SESSION_TIMEOUT;
        setSessionExpiresAt(expiresAt);
        if (typeof window !== 'undefined') {
            localStorage.setItem('admin_session', JSON.stringify({ adminId: foundAdmin.id, expiresAt }));
        }

        // Update last login
        await insforge.database
            .from('admin_users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', foundAdmin.id);

        setIsLoading(false);
        return { success: true };
    }, []);

    const logout = useCallback(() => {
        setAdmin(null);
        setSessionExpiresAt(null);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (typeof window !== 'undefined') localStorage.removeItem('admin_session');
    }, []);

    const canPerform = useCallback((action: string) => {
        if (!permissions) return false;
        return !!(permissions as unknown as Record<string, boolean>)[action];
    }, [permissions]);

    return (
        <AdminAuthContext.Provider
            value={{
                admin,
                isAuthenticated: !!admin,
                isLoading,
                permissions,
                login,
                logout,
                canPerform,
                sessionExpiresAt,
            }}
        >
            {children}
        </AdminAuthContext.Provider>
    );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
