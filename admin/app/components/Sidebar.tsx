'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
    LayoutDashboard,
    Users,
    FileCheck,
    Bell,
    Scale,
    LogOut,
    Shield,
    ChevronLeft,
    ChevronRight,
    Activity,
    Settings,
    Briefcase,
    MapPin,
    BarChart as BarChartIcon,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/users', label: 'Users', icon: Users },
    { href: '/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/trips', label: 'Trips', icon: MapPin },
    { href: '/documents', label: 'Documents', icon: FileCheck },
    { href: '/alerts', label: 'Alerts', icon: Bell },
    { href: '/disputes', label: 'Disputes', icon: Scale },
    { href: '/audit-logs', label: 'Audit Logs', icon: Activity },
    { href: '/reports', label: 'Reports', icon: BarChartIcon },
    { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { admin, logout } = useAdminAuth();
    const [collapsed, setCollapsed] = useState(false);

    const roleLabels: Record<string, string> = {
        super_admin: 'Super Admin',
        moderator: 'Moderator',
        support_agent: 'Support Agent',
    };

    return (
        <aside
            style={{
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
                background: 'var(--surface)',
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width var(--transition-slow)',
                zIndex: 100,
                overflow: 'hidden',
            }}
        >
            {/* Brand */}
            <div
                style={{
                    padding: collapsed ? '20px 12px' : '20px 20px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    minHeight: 'var(--header-height)',
                }}
            >
                <div
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 'var(--radius)',
                        background: 'var(--primary-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    <Shield size={20} color="var(--primary)" />
                </div>
                {!collapsed && (
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.02em', color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                            One&apos;N&apos;Move
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                            Admin Panel
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {navItems.map(item => {
                    const isActive = pathname.startsWith(item.href);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: collapsed ? '10px 12px' : '10px 14px',
                                borderRadius: 'var(--radius)',
                                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                                background: isActive ? 'var(--primary-muted)' : 'transparent',
                                fontWeight: isActive ? 600 : 500,
                                fontSize: '0.85rem',
                                transition: 'all var(--transition)',
                                textDecoration: 'none',
                                justifyContent: collapsed ? 'center' : 'flex-start',
                            }}
                            title={collapsed ? item.label : undefined}
                        >
                            <Icon size={20} style={{ flexShrink: 0 }} />
                            {!collapsed && <span>{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Collapse Toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '10px',
                    margin: '0 8px',
                    borderRadius: 'var(--radius)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    transition: 'all var(--transition)',
                }}
            >
                {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /> <span>Collapse</span></>}
            </button>

            {/* Admin Profile */}
            {admin && (
                <div
                    style={{
                        padding: collapsed ? '16px 12px' : '16px 20px',
                        borderTop: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                    }}
                >
                    <div
                        className="avatar avatar-sm avatar-gold"
                        style={{ flexShrink: 0 }}
                    >
                        {admin.avatar}
                    </div>
                    {!collapsed && (
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {admin.fullName}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                {roleLabels[admin.role]}
                            </div>
                        </div>
                    )}
                    <button
                        onClick={logout}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: 4,
                            display: 'flex',
                            transition: 'color var(--transition)',
                            flexShrink: 0,
                        }}
                        title="Logout"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            )}
        </aside>
    );
}
