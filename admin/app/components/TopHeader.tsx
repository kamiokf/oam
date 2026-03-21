'use client';

import { usePathname } from 'next/navigation';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Search, Bell, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { insforge } from '../../lib/insforge';
import Link from 'next/link';

const routeLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    users: 'Users',
    jobs: 'Jobs',
    trips: 'Trips',
    documents: 'Documents',
    alerts: 'Alerts',
    disputes: 'Disputes',
    'audit-logs': 'Audit Logs',
    reports: 'Reports',
    settings: 'Settings',
};

export default function TopHeader() {
    const pathname = usePathname();
    const { admin } = useAdminAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Build breadcrumbs from pathname
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs = segments.map((seg, i) => ({
        label: routeLabels[seg] || decodeURIComponent(seg),
        href: '/' + segments.slice(0, i + 1).join('/'),
        isLast: i === segments.length - 1,
    }));

    // Fetch unread notification count (admin-relevant)
    useEffect(() => {
        async function fetchUnread() {
            try {
                const { data } = await insforge.database
                    .from('notifications')
                    .select('id')
                    .eq('read', false);
                setUnreadCount(data?.length || 0);
            } catch {
                // silently fail
            }
        }
        fetchUnread();
        const interval = setInterval(fetchUnread, 30000); // poll every 30s
        return () => clearInterval(interval);
    }, []);

    const roleLabels: Record<string, { label: string; color: string }> = {
        super_admin: { label: 'Super Admin', color: 'var(--gold)' },
        moderator: { label: 'Moderator', color: 'var(--primary)' },
        support_agent: { label: 'Support', color: 'var(--info)' },
    };

    const roleBadge = admin ? roleLabels[admin.role] || { label: admin.role, color: 'var(--text-muted)' } : null;

    return (
        <header
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 28px',
                height: 56,
                borderBottom: '1px solid var(--border)',
                background: 'var(--surface)',
                position: 'sticky',
                top: 0,
                zIndex: 50,
            }}
        >
            {/* Breadcrumbs */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {breadcrumbs.map((crumb, i) => (
                    <span key={crumb.href} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {i > 0 && <ChevronRight size={14} color="var(--text-muted)" />}
                        {crumb.isLast ? (
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {crumb.label}
                            </span>
                        ) : (
                            <Link
                                href={crumb.href}
                                style={{
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                    color: 'var(--text-muted)',
                                    textDecoration: 'none',
                                    transition: 'color var(--transition)',
                                }}
                            >
                                {crumb.label}
                            </Link>
                        )}
                    </span>
                ))}
            </nav>

            {/* Right actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Search */}
                <div style={{ position: 'relative' }}>
                    {searchOpen ? (
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
                            placeholder="Search users, jobs..."
                            autoFocus
                            style={{
                                width: 220,
                                padding: '6px 12px 6px 32px',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)',
                                background: 'var(--surface-light)',
                                fontSize: '0.82rem',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                transition: 'all var(--transition)',
                                fontFamily: 'inherit',
                            }}
                        />
                    ) : null}
                    <button
                        onClick={() => setSearchOpen(!searchOpen)}
                        style={{
                            position: searchOpen ? 'absolute' : 'relative',
                            left: searchOpen ? 8 : 0,
                            top: searchOpen ? '50%' : 0,
                            transform: searchOpen ? 'translateY(-50%)' : 'none',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: 6,
                            display: 'flex',
                            borderRadius: 'var(--radius)',
                            transition: 'all var(--transition)',
                        }}
                        title="Search"
                    >
                        <Search size={18} />
                    </button>
                </div>

                {/* Notifications */}
                <Link
                    href="/alerts"
                    style={{
                        position: 'relative',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: 6,
                        display: 'flex',
                        borderRadius: 'var(--radius)',
                        textDecoration: 'none',
                    }}
                    title="Notifications"
                >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                        <span
                            style={{
                                position: 'absolute',
                                top: 2,
                                right: 2,
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                background: 'var(--error)',
                                color: '#fff',
                                fontSize: '0.6rem',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid var(--surface)',
                            }}
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Link>

                {/* Divider */}
                <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

                {/* Admin info */}
                {admin && roleBadge && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                            {admin.fullName}
                        </span>
                        <span
                            style={{
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-full)',
                                background: `color-mix(in srgb, ${roleBadge.color} 15%, transparent)`,
                                color: roleBadge.color,
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                            }}
                        >
                            {roleBadge.label}
                        </span>
                    </div>
                )}
            </div>
        </header>
    );
}
