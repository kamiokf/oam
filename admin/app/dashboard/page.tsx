'use client';

import ProtectedLayout from '../components/ProtectedLayout';
import WelcomeGuide from '../components/WelcomeGuide';
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
import type { PlatformUser } from '../data/users';
import { DISPUTE_CATEGORIES } from '../data/disputes';
import { insforge } from '../../lib/insforge';

interface RegistrationDataPoint {
    date: string;
    drivers: number;
    owners: number;
}

interface VerificationDataPoint {
    tier: string;
    drivers: number;
    owners: number;
}

interface RecentDispute {
    id: string;
    referenceNumber: string;
    filedByName: string;
    filedAgainstName: string;
    category: string;
    priority: string;
    status: string;
}

export default function DashboardPage() {
    const [users, setUsers] = useState<PlatformUser[]>([]);
    const [activeJobs, setActiveJobs] = useState(0);
    const [openDisputes, setOpenDisputes] = useState(0);
    const [recentAlerts, setRecentAlerts] = useState(0);
    const [pendingDocsCount, setPendingDocsCount] = useState(0);
    const [expiringDocsCount, setExpiringDocsCount] = useState(0);
    const [registrationTrend, setRegistrationTrend] = useState<RegistrationDataPoint[]>([]);
    const [verificationFunnel, setVerificationFunnel] = useState<VerificationDataPoint[]>([]);
    const [recentDisputesList, setRecentDisputesList] = useState<RecentDispute[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const thirtyDaysFromNow = new Date();
                thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                const [usersRes, jobsRes, disputesRes, alertsRes, pendingDocsRes, expiringDocsRes, recentDisputesRes] = await Promise.all([
                    insforge.database.from('users').select('*'),
                    insforge.database.from('jobs').select('id').eq('status', 'open'),
                    insforge.database.from('disputes').select('id').not('status', 'in', '("resolved","closed")'),
                    insforge.database.from('alerts').select('id').eq('status', 'sent'),
                    insforge.database.from('user_documents').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
                    insforge.database.from('user_documents').select('id', { count: 'exact', head: true }).lte('expiry_date', thirtyDaysFromNow.toISOString()).not('expiry_date', 'is', null),
                    insforge.database.from('disputes')
                        .select('*, reporter:filed_by(name), respondent:filed_against(name)')
                        .order('created_at', { ascending: false })
                        .limit(5),
                ]);

                let fetchedUsers: any[] = [];
                if (usersRes.data) {
                    fetchedUsers = usersRes.data;
                    const formattedUsers = usersRes.data.map((u: any) => ({
                        ...u,
                        role: u.role,
                        registeredDate: new Date(u.registered_date).toISOString().split('T')[0],
                        documents: [],
                    }));
                    setUsers(formattedUsers);
                }

                if (jobsRes.data) setActiveJobs(jobsRes.data.length);
                if (disputesRes.data) setOpenDisputes(disputesRes.data.length);
                if (alertsRes.data) setRecentAlerts(alertsRes.data.length);
                setPendingDocsCount(pendingDocsRes.count || 0);
                setExpiringDocsCount(expiringDocsRes.count || 0);

                // Build registration trend from real users data (last 30 days)
                const trendMap = new Map<string, { drivers: number; owners: number }>();
                for (const u of fetchedUsers) {
                    const regDate = new Date(u.registered_date).toISOString().split('T')[0];
                    const daysSinceReg = (Date.now() - new Date(regDate).getTime()) / (1000 * 60 * 60 * 24);
                    if (daysSinceReg <= 30) {
                        const dateLabel = new Date(regDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        const entry = trendMap.get(dateLabel) || { drivers: 0, owners: 0 };
                        if (u.role === 'driver' || u.role === 'dual') entry.drivers++;
                        if (u.role === 'owner' || u.role === 'dual') entry.owners++;
                        trendMap.set(dateLabel, entry);
                    }
                }
                const trendData: RegistrationDataPoint[] = Array.from(trendMap.entries())
                    .map(([date, counts]) => ({ date, ...counts }))
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                setRegistrationTrend(trendData);

                // Build verification funnel from real data
                const funnel: Record<string, { drivers: number; owners: number }> = {
                    'Registered': { drivers: 0, owners: 0 },
                    'Verified': { drivers: 0, owners: 0 },
                    'Fully Verified': { drivers: 0, owners: 0 },
                };
                for (const u of fetchedUsers) {
                    const tier = u.verification_tier === 'fully_verified' ? 'Fully Verified'
                        : u.verification_tier === 'verified' ? 'Verified'
                        : 'Registered';
                    if (u.role === 'driver' || u.role === 'dual') funnel[tier].drivers++;
                    if (u.role === 'owner' || u.role === 'dual') funnel[tier].owners++;
                }
                setVerificationFunnel(
                    Object.entries(funnel).map(([tier, counts]) => ({ tier, ...counts }))
                );

                // Map recent disputes
                if (recentDisputesRes.data) {
                    setRecentDisputesList(recentDisputesRes.data.map((d: any) => {
                        const rep = Array.isArray(d.reporter) ? d.reporter[0] : (d.reporter || {});
                        const res = Array.isArray(d.respondent) ? d.respondent[0] : (d.respondent || {});
                        return {
                            id: d.id,
                            referenceNumber: d.reference_number,
                            filedByName: rep.name || 'Unknown',
                            filedAgainstName: res.name || 'Unknown',
                            category: d.category,
                            priority: d.priority,
                            status: d.status,
                        };
                    }));
                }
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
    const pendingDocs = pendingDocsCount;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newThisWeek = users.filter((u: any) => new Date(u.registeredDate) >= oneWeekAgo).length;
    const expiringDocs = expiringDocsCount;

    const metrics = [
        { label: 'Total Users', value: totalUsers, sub: `${drivers} drivers · ${owners} owners`, icon: Users, color: 'var(--primary)', bg: 'var(--primary-muted)', trend: '', up: false },
        { label: 'Pending Verification', value: pendingDocs, sub: 'documents in queue', icon: FileCheck, color: 'var(--warning)', bg: 'var(--warning-muted)', trend: '', up: false },
        { label: 'Active Listings', value: activeJobs, sub: 'open job postings', icon: Briefcase, color: 'var(--info)', bg: 'var(--info-muted)', trend: '', up: false },
        { label: 'Open Disputes', value: openDisputes, sub: 'need attention', icon: Scale, color: 'var(--error)', bg: 'var(--error-muted)', trend: '', up: false },
    ];

    const secondaryMetrics = [
        { label: 'New This Week', value: newThisWeek, icon: UserPlus, color: 'var(--success)', bg: 'var(--success-muted)' },
        { label: 'Docs Awaiting Review', value: pendingDocs, icon: Clock, color: 'var(--warning)', bg: 'var(--warning-muted)' },
        { label: 'Expiring (30 days)', value: expiringDocs, icon: AlertTriangle, color: '#F97316', bg: 'rgba(249,115,22,0.12)' },
        { label: 'Alerts Sent', value: recentAlerts, icon: Bell, color: 'var(--secondary)', bg: 'var(--secondary-muted)' },
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
                <WelcomeGuide />
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
                        {registrationTrend.length === 0 ? (
                            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                No registration data in the last 30 days
                            </div>
                        ) : (
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
                        )}
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

                {/* Recent Disputes */}
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
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                                        Loading...
                                    </td>
                                </tr>
                            ) : recentDisputesList.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                                        No disputes found
                                    </td>
                                </tr>
                            ) : recentDisputesList.map(d => (
                                <tr key={d.id}>
                                    <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.85rem' }}>{d.referenceNumber}</td>
                                    <td>{d.filedByName}</td>
                                    <td>{d.filedAgainstName}</td>
                                    <td>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>
                                            {DISPUTE_CATEGORIES[d.category as keyof typeof DISPUTE_CATEGORIES]?.label || d.category}
                                        </span>
                                    </td>
                                    <td><StatusBadge status={d.priority} size="sm" /></td>
                                    <td><StatusBadge status={d.status} size="sm" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </ProtectedLayout>
    );
}
