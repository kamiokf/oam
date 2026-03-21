'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
    X,
    FileCheck,
    Users,
    Briefcase,
    Scale,
    Sparkles,
    ChevronRight,
    CheckCircle2,
} from 'lucide-react';

interface ChecklistItem {
    label: string;
    description: string;
    href: string;
    icon: typeof FileCheck;
    roles: string[];
}

const checklist: ChecklistItem[] = [
    {
        label: 'Review pending verifications',
        description: 'Documents are waiting for your review and approval.',
        href: '/documents',
        icon: FileCheck,
        roles: ['super_admin', 'moderator'],
    },
    {
        label: 'Check new registrations',
        description: 'Review recently registered drivers and vehicle owners.',
        href: '/users',
        icon: Users,
        roles: ['super_admin', 'moderator', 'support_agent'],
    },
    {
        label: 'Monitor job postings',
        description: 'See active job listings and flag any issues.',
        href: '/jobs',
        icon: Briefcase,
        roles: ['super_admin', 'moderator', 'support_agent'],
    },
    {
        label: 'Handle open disputes',
        description: 'Resolve any pending disputes between users.',
        href: '/disputes',
        icon: Scale,
        roles: ['super_admin', 'moderator'],
    },
];

const roleTips: Record<string, string> = {
    super_admin: 'As Super Admin, you have full access to all platform features including settings, reports, and user management.',
    moderator: 'As Moderator, you can manage users, verify documents, and handle disputes. Settings and financial reports require Super Admin access.',
    support_agent: 'As Support Agent, you can view user profiles, respond to queries, and send alerts. User editing and verification require Moderator access.',
};

export default function WelcomeGuide() {
    const { admin } = useAdminAuth();
    const [visible, setVisible] = useState(false);
    const [completedItems, setCompletedItems] = useState<string[]>([]);

    useEffect(() => {
        const dismissed = localStorage.getItem('onm_admin_onboarding_dismissed');
        if (!dismissed) {
            setVisible(true);
        }
        const completed = localStorage.getItem('onm_admin_onboarding_completed');
        if (completed) {
            try { setCompletedItems(JSON.parse(completed)); } catch { /* ignore */ }
        }
    }, []);

    const handleDismiss = () => {
        localStorage.setItem('onm_admin_onboarding_dismissed', 'true');
        setVisible(false);
    };

    const handleItemClick = (href: string) => {
        const next = [...new Set([...completedItems, href])];
        setCompletedItems(next);
        localStorage.setItem('onm_admin_onboarding_completed', JSON.stringify(next));
    };

    if (!visible || !admin) return null;

    const visibleItems = checklist.filter(item => item.roles.includes(admin.role));
    const allDone = visibleItems.every(item => completedItems.includes(item.href));

    return (
        <div
            style={{
                background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 8%, var(--surface)), var(--surface))',
                border: '1px solid color-mix(in srgb, var(--primary) 20%, var(--border))',
                borderRadius: 'var(--radius-lg)',
                padding: 24,
                marginBottom: 24,
                position: 'relative',
                animation: 'slideUp 400ms ease',
            }}
        >
            {/* Close button */}
            <button
                onClick={handleDismiss}
                style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'flex',
                    borderRadius: 'var(--radius)',
                    transition: 'all var(--transition)',
                }}
                title="Dismiss"
            >
                <X size={18} />
            </button>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: 'var(--radius)',
                        background: 'var(--primary-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Sparkles size={18} color="var(--primary)" />
                </div>
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                        Welcome back, {admin.fullName.split(' ')[0]}! 👋
                    </h3>
                </div>
            </div>

            {/* Role tip */}
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 20, maxWidth: 600 }}>
                {roleTips[admin.role]}
            </p>

            {/* Checklist */}
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: 10 }}>
                Quick Start {allDone ? '— All Done! 🎉' : ''}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
                {visibleItems.map(item => {
                    const Icon = item.icon;
                    const done = completedItems.includes(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => handleItemClick(item.href)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '12px 14px',
                                borderRadius: 'var(--radius)',
                                background: done ? 'color-mix(in srgb, var(--success) 8%, var(--surface))' : 'var(--surface)',
                                border: `1px solid ${done ? 'color-mix(in srgb, var(--success) 25%, var(--border))' : 'var(--border)'}`,
                                textDecoration: 'none',
                                transition: 'all var(--transition)',
                                cursor: 'pointer',
                            }}
                        >
                            <div
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 'var(--radius)',
                                    background: done ? 'color-mix(in srgb, var(--success) 12%, transparent)' : 'var(--surface-light)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                {done ? (
                                    <CheckCircle2 size={16} color="var(--success)" />
                                ) : (
                                    <Icon size={16} color="var(--text-muted)" />
                                )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontSize: '0.82rem',
                                    fontWeight: 600,
                                    color: done ? 'var(--success)' : 'var(--text-primary)',
                                    textDecoration: done ? 'line-through' : 'none',
                                }}>
                                    {item.label}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                    {item.description}
                                </div>
                            </div>
                            <ChevronRight size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                        </Link>
                    );
                })}
            </div>

            {/* Dismiss link */}
            <div style={{ textAlign: 'right', marginTop: 14 }}>
                <button
                    onClick={handleDismiss}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontFamily: 'inherit',
                    }}
                >
                    Don&apos;t show again
                </button>
            </div>
        </div>
    );
}
