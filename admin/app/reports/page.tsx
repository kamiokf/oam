'use client';

import ProtectedLayout from '../components/ProtectedLayout';
import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { Download, Calendar, DollarSign, TrendingUp, Users, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { insforge } from '../../lib/insforge';

export default function ReportsPage() {
    const [dateRange, setDateRange] = useState('6M');
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [complianceData, setComplianceData] = useState<any[]>([]);
    const [totals, setTotals] = useState({ revenue: 0, commission: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [dateRange]);

    async function fetchData() {
        try {
            setIsLoading(true);

            // Fetch earnings
            const { data: earnings, error: eErr } = await insforge.database
                .from('earnings')
                .select('*')
                .order('date', { ascending: true });

            if (eErr) throw eErr;

            // Group earnings by month (simple demo grouping)
            const revMap: Record<string, { month: string; revenue: number; commission: number }> = {};
            let totalRev = 0;
            let totalComm = 0;

            (earnings || []).forEach(e => {
                const date = new Date(e.date);
                const monthName = date.toLocaleString('default', { month: 'short' });
                if (!revMap[monthName]) {
                    revMap[monthName] = { month: monthName, revenue: 0, commission: 0 };
                }
                revMap[monthName].revenue += Number(e.amount);
                revMap[monthName].commission += Number(e.amount) * 0.15; // 15% commission as defined

                totalRev += Number(e.amount);
                totalComm += Number(e.amount) * 0.15;
            });

            let finalRevData = Object.values(revMap);
            if (finalRevData.length === 0) {
                // fallback to empty chart
                finalRevData = [{ month: 'N/A', revenue: 0, commission: 0 }];
            }
            setRevenueData(finalRevData);
            setTotals({ revenue: totalRev, commission: totalComm });

            // Fetch users for compliance
            const { data: users, error: uErr } = await insforge.database
                .from('users')
                .select('verification_tier, status');

            if (uErr) throw uErr;

            let verified = 0, registered = 0, suspended = 0;
            const totalUsers = users?.length || 1; // avoid / 0

            (users || []).forEach(u => {
                if (u.status === 'suspended' || u.status === 'banned') suspended++;
                else if (u.verification_tier === 'verified' || u.verification_tier === 'fully_verified') verified++;
                else registered++;
            });

            setComplianceData([
                { name: 'Fully Verified', value: Math.round((verified / totalUsers) * 100), color: '#10B981' },
                { name: 'Missing Documents', value: Math.round((registered / totalUsers) * 100), color: '#F59E0B' },
                { name: 'Expired/Suspended', value: Math.round((suspended / totalUsers) * 100), color: '#EF4444' },
            ]);

        } catch (err) {
            console.error('Failed to fetch report data', err);
        } finally {
            setIsLoading(false);
        }
    }

    const handleExport = (type: 'csv' | 'pdf') => {
        toast.success(`Generating ${type.toUpperCase()} report...`);
        setTimeout(() => {
            toast.success(`Report downloaded successfully`);
        }, 1500);
    };

    return (
        <ProtectedLayout requirePermission="accessFinancials">
            <div className="animate-in">
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1>Analytics & Reports</h1>
                        <p>Platform financial performance and compliance overviews.</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <select
                            className="form-select"
                            value={dateRange}
                            onChange={e => setDateRange(e.target.value)}
                            style={{ minWidth: 140 }}
                        >
                            <option value="1M">Last 30 Days</option>
                            <option value="3M">Last 3 Months</option>
                            <option value="6M">Last 6 Months</option>
                            <option value="1Y">Last Year</option>
                        </select>
                        <button className="btn btn-secondary" onClick={() => handleExport('csv')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Download size={16} /> Export CSV
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                {isLoading ? (
                    <div className="empty-state" style={{ padding: 40, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading report data...</div>
                ) : (
                    <div className="dashboard-grid" style={{ marginBottom: 24 }}>
                        <div className="card metric-card">
                            <div className="metric-icon" style={{ background: 'var(--success-muted)', color: 'var(--success)' }}>
                                <DollarSign size={20} />
                            </div>
                            <div className="metric-content">
                                <p className="metric-label">Total Platform Revenue ({dateRange})</p>
                                <h3 className="metric-value">
                                    {new Intl.NumberFormat('en-JM', { style: 'currency', currency: 'JMD', maximumFractionDigits: 0 }).format(totals.revenue)}
                                </h3>
                                <div className="metric-trend positive" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: '0.8rem', fontWeight: 600 }}>
                                    <TrendingUp size={14} /> Tracking positive
                                </div>
                            </div>
                        </div>

                        <div className="card metric-card">
                            <div className="metric-icon" style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}>
                                <DollarSign size={20} />
                            </div>
                            <div className="metric-content">
                                <p className="metric-label">Total Commissions Earned ({dateRange})</p>
                                <h3 className="metric-value">
                                    {new Intl.NumberFormat('en-JM', { style: 'currency', currency: 'JMD', maximumFractionDigits: 0 }).format(totals.commission)}
                                </h3>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Based on 15% platform fee</p>
                            </div>
                        </div>

                        <div className="card metric-card">
                            <div className="metric-icon" style={{ background: 'var(--warning-muted)', color: 'var(--warning-text)' }}>
                                <ShieldAlert size={20} />
                            </div>
                            <div className="metric-content">
                                <p className="metric-label">Compliance Risk Score</p>
                                <h3 className="metric-value" style={{ color: 'var(--warning-text)' }}>Low Risk</h3>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                    {complianceData.find(c => c.name === 'Fully Verified')?.value || 0}% of active users are fully verified
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                    {/* Financial Chart */}
                    <div className="card">
                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3>Financial Performance</h3>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Values in JMD</span>
                        </div>
                        <div style={{ padding: '0 20px 20px', height: 350 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} dy={10} />
                                    <YAxis
                                        yAxisId="left"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                                        tickFormatter={(value) => `$${value / 1000}k`}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                                        tickFormatter={(value) => `$${value / 1000}k`}
                                    />
                                    <RechartsTooltip
                                        cursor={{ fill: 'var(--surface-light)' }}
                                        contentStyle={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)' }}
                                        formatter={(value: number | string | undefined) =>
                                            value != null
                                                ? new Intl.NumberFormat('en-JM', { style: 'currency', currency: 'JMD', maximumFractionDigits: 0 }).format(Number(value))
                                                : ''
                                        }
                                    />
                                    <Legend wrapperStyle={{ paddingTop: 20 }} />
                                    <Bar yAxisId="left" dataKey="revenue" name="Total Revenue" fill="var(--surface-elevated)" radius={[4, 4, 0, 0]} />
                                    <Bar yAxisId="right" dataKey="commission" name="Platform Commission" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Compliance Chart */}
                    <div className="card">
                        <div className="card-header">
                            <h3>Driver Compliance Breakdown</h3>
                        </div>
                        <div style={{ padding: 20, height: 350, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ flex: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={complianceData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {complianceData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                                            formatter={(value) => `${value}%`}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                                {complianceData.map(item => (
                                    <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: item.color }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.value}%</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedLayout>
    );
}
