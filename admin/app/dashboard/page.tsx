'use client';

import ProtectedLayout from '../components/ProtectedLayout';
import StatusBadge from '../components/StatusBadge';
import Link from 'next/link';
import {
    Users,
    FileCheck,
    Bell,
    Scale,
    UserPlus,
    Clock,
    AlertTriangle,
    Briefcase,
    TrendingUp,
    ArrowUpRight,
} from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { useState, useEffect } from 'react';
import { registrationTrend, verificationFunnel, type PlatformUser } from '../data/users';
import { insforge } from '../../lib/insforge';

export default function DashboardPage() {
    const [users, setUsers] = useState<PlatformUser[]>([]);
    const [activeJobs, setActiveJobs] = useState(0);
    const [openDisputes, setOpenDisputes] = useState(0);
    const [recentAlerts, setRecentAlerts] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const [usersRes, jobsRes, disputesRes, alertsRes] = await Promise.all([
                    insforge.database.from('users').select('*'),
                    insforge.database.from('jobs').select('id').eq('status', 'open'),
                    insforge.database.from('disputes').select('id').not('status', 'in', '("resolved","closed")'),
                    insforge.database.from('alerts').select('id').eq('status', 'sent')
                ]);

                if (usersRes.data) {
                    const formattedUsers = usersRes.data.map((u: any) => ({
                        ...u,
                        role: u.role,
                        registeredDate: new Date(u.registered_date).toISOString().split('T')[0],
                        documents: [], // documents not yet live
                    }));
                    setUsers(formattedUsers);
                }

                if (jobsRes.data) setActiveJobs(jobsRes.data.length);
                if (disputesRes.data) setOpenDisputes(disputesRes.data.length);
                if (alertsRes.data) setRecentAlerts(alertsRes.data.length);
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchDashboardData();
    }, []);

    // Calculate metrics
    const totalUsers = users.length;
    const drivers = users.filter(u => u.role === 'driver' || u.role === 'dual').length;
    const owners = users.filter(u => u.role === 'owner' || u.role === 'dual').length;
    const pendingDocs = 0; // Temporarily 0 since we haven't ported documents table yet
    const newThisWeek = users.filter((u: any) => u.registeredDate >= '2026-02-22').length;
    const expiringDocs = 0; // Temporarily 0

    const metrics = [
        { label: 'Total Users', value: totalUsers, sub: `${drivers} drivers · ${owners} owners`, icon: Users, color: 'var(--primary)', bg: 'var(--primary-muted)', trend: '+12%', up: true },
        { label: 'Pending Verification', value: pendingDocs, sub: 'documents in queue', icon: FileCheck, color: 'var(--warning)', bg: 'var(--warning-muted)', trend: '', up: false },
        { label: 'Active Listings', value: activeJobs, sub: 'open job postings', icon: Briefcase, color: 'var(--info)', bg: 'var(--info-muted)', trend: '+3', up: true },
        { label: 'Open Disputes', value: openDisputes, sub: 'need attention', icon: Scale, color: 'var(--error)', bg: 'var(--error-muted)', trend: '', up: false },
    ];

    const secondaryMetrics = [
        { label: 'New This Week', value: newThisWeek, icon: UserPlus, color: 'var(--success)', bg: 'var(--success-muted)' },
        { label: 'Docs Awaiting Review', value: pendingDocs, icon: Clock, color: 'var(--warning)', bg: 'var(--warning-muted)' },
        { label: 'Expiring (30 days)', value: expiringDocs, icon: AlertTriangle, color: '#F97316', bg: 'rgba(249,115,22,0.12)' },
        { label: 'Alerts Sent (7d)', value: recentAlerts, icon: Bell, color: 'var(--secondary)', bg: 'var(--secondary-muted)' },
    ];

    const quickActions = [
        { label: 'Review Documents', href: '/documents', icon: FileCheck, color: 'var(--warning)', bg: 'var(--warning-muted)' },
        { label: 'Send Alert', href: '/alerts/compose', icon: Bell, color: 'var(--secondary)', bg: 'var(--secondary-muted)' },
        { label: 'View Disputes', href: '/disputes', icon: Scale, color: 'var(--error)', bg: 'var(--error-muted)' },
        { label: 'Manage Users', href: '/users', icon: Users, color: 'var(--info)', bg: 'var(--info-muted)' },
    ];

    return (
        <ProtectedLayout>
            <div className="animate-in">
                <div className="page-header">
                    <div>
                        <h1>Dashboard</h1>
                        <p>Platform overview and quick actions</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        <Clock size={14} />
                        <span>Last updated: just now</span>
                    </div>
                </div>

                {/* Primary Metrics */}
                <div className="metric-grid">
                    {metrics.map(m => {
                        const Icon = m.icon;
                        return (
                            <div key={m.label} className="metric-card">
                                <div className="metric-icon" style={{ background: m.bg }}>
                                    <Icon size={22} color={m.color} />
                                </div>
                                <div>
                                    <div className="metric-value">{m.value}</div>
                                    <div className="metric-label">{m.label}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{m.sub}</div>
                                    {m.trend && (
                                        <div className={`metric-trend ${m.up ? 'up' : 'down'}`}>
                                            <TrendingUp size={12} />{m.trend} this month
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Secondary Metrics */}
                <div className="metric-grid" style={{ marginBottom: 24 }}>
                    {secondaryMetrics.map(m => {
                        const Icon = m.icon;
                        return (
                            <div key={m.label} className="metric-card" style={{ padding: '16px 18px' }}>
                                <div className="metric-icon" style={{ background: m.bg, width: 36, height: 36 }}>
                                    <Icon size={18} color={m.color} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.1 }}>{m.value}</div>
                                    <div className="metric-label">{m.label}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Quick Actions */}
                <div className="card" style={{ marginBottom: 24 }}>
                    <div className="card-header">
                        <h3>Quick Actions</h3>
                    </div>
                    <div className="quick-actions">
                        {quickActions.map(qa => {
                            const Icon = qa.icon;
                            return (
                                <Link key={qa.label} href={qa.href} className="quick-action">
                                    <div className="qa-icon" style={{ background: qa.bg }}>
                                        <Icon size={18} color={qa.color} />
                                    </div>
                                    <span>{qa.label}</span>
                                    <ArrowUpRight size={14} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Charts */}
                <div className="charts-grid">
                    <div className="chart-card">
                        <h3>Registration Trend (Last 30 Days)</h3>
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={registrationTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} stroke="var(--border)" />
                                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} stroke="var(--border)" />
                                <Tooltip
                                    contentStyle={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.8rem' }}
                                    labelStyle={{ color: 'var(--text-primary)' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '0.78rem' }} />
                                <Line type="monotone" dataKey="drivers" stroke="var(--primary)" strokeWidth={2} dot={false} name="Drivers" />
                                <Line type="monotone" dataKey="owners" stroke="var(--secondary)" strokeWidth={2} dot={false} name="Owners" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-card">
                        <h3>Verification Funnel</h3>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={verificationFunnel}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="tier" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} stroke="var(--border)" />
                                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} stroke="var(--border)" />
                                <Tooltip
                                    contentStyle={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.8rem' }}
                                    labelStyle={{ color: 'var(--text-primary)' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '0.78rem' }} />
                                <Bar dataKey="drivers" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Drivers" />
                                <Bar dataKey="owners" fill="var(--secondary)" radius={[4, 4, 0, 0]} name="Owners" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="card" style={{ marginTop: 24 }}>
                    <div className="card-header">
                        <h3>Recent Disputes</h3>
                        <Link href="/disputes" className="btn btn-ghost btn-sm">View All <ArrowUpRight size={12} /></Link>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Reference</th>
                                <th>Filed By</th>
                                <th>Against</th>
                                <th>Category</th>
                                <th>Priority</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Empty state for recent disputes layout placeholder */}
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                                    Recent disputes data is loading...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </ProtectedLayout>
    );
}
