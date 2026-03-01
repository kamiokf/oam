'use client';

import ProtectedLayout from '../components/ProtectedLayout';
import { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { Download, Calendar, DollarSign, TrendingUp, Users, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

// Mock Financial Data
const revenueData = [
    { month: 'Sep', revenue: 450000, commission: 67500 },
    { month: 'Oct', revenue: 520000, commission: 78000 },
    { month: 'Nov', revenue: 480000, commission: 72000 },
    { month: 'Dec', revenue: 610000, commission: 91500 },
    { month: 'Jan', revenue: 590000, commission: 88500 },
    { month: 'Feb', revenue: 650000, commission: 97500 },
];

const complianceData = [
    { name: 'Fully Verified', value: 65, color: '#10B981' }, // success
    { name: 'Missing Documents', value: 20, color: '#F59E0B' }, // warning
    { name: 'Expiring Soon (< 30d)', value: 10, color: '#6366F1' }, // primary
    { name: 'Expired/Suspended', value: 5, color: '#EF4444' }, // error
];

export default function ReportsPage() {
    const [dateRange, setDateRange] = useState('6M');

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
                <div className="dashboard-grid" style={{ marginBottom: 24 }}>
                    <div className="card metric-card">
                        <div className="metric-icon" style={{ background: 'var(--success-muted)', color: 'var(--success)' }}>
                            <DollarSign size={20} />
                        </div>
                        <div className="metric-content">
                            <p className="metric-label">Total Platform Revenue (6M)</p>
                            <h3 className="metric-value">J$ 3,300,000</h3>
                            <div className="metric-trend positive" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: '0.8rem', fontWeight: 600 }}>
                                <TrendingUp size={14} /> +12.5% vs previous
                            </div>
                        </div>
                    </div>

                    <div className="card metric-card">
                        <div className="metric-icon" style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}>
                            <DollarSign size={20} />
                        </div>
                        <div className="metric-content">
                            <p className="metric-label">Total Commissions Earned (6M)</p>
                            <h3 className="metric-value">J$ 495,000</h3>
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
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>85% of active users are fully verified</p>
                        </div>
                    </div>
                </div>

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
