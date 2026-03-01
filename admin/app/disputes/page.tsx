'use client';

import ProtectedLayout from '../components/ProtectedLayout';
import StatusBadge from '../components/StatusBadge';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Search, RotateCcw, MessageSquare, AlertTriangle, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { mockDisputes, DISPUTE_CATEGORIES } from '../data/disputes';

export default function DisputesPage() {
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');

    const filtered = useMemo(() => {
        let list = [...mockDisputes];
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(d =>
                d.referenceNumber.toLowerCase().includes(q) ||
                d.filedByName.toLowerCase().includes(q) ||
                d.filedAgainstName.toLowerCase().includes(q) ||
                d.relatedJobId?.toLowerCase().includes(q)
            );
        }
        if (categoryFilter) list = list.filter(d => d.category === categoryFilter);
        if (statusFilter) list = list.filter(d => d.status === statusFilter);
        if (priorityFilter) list = list.filter(d => d.priority === priorityFilter);
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [search, categoryFilter, statusFilter, priorityFilter]);

    // Priority Stats
    const highPriority = mockDisputes.filter(d => d.priority === 'high' && d.status !== 'resolved' && d.status !== 'closed').length;
    const requireAction = mockDisputes.filter(d => d.status === 'open' || d.status === 'escalated').length;
    const avgResolutionDays = 2.4; // Mock stat

    return (
        <ProtectedLayout>
            <div className="animate-in">
                <div className="page-header">
                    <div>
                        <h1>Dispute Resolution</h1>
                        <p>Manage and resolve platform conflicts securely</p>
                    </div>
                </div>

                {/* Dispute Metrics */}
                <div className="metric-grid" style={{ marginBottom: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                    <div className="metric-card">
                        <div className="metric-icon" style={{ background: 'var(--error-muted)' }}>
                            <AlertTriangle size={20} color="var(--error)" />
                        </div>
                        <div>
                            <div className="metric-value">{highPriority}</div>
                            <div className="metric-label">High Priority Open</div>
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-icon" style={{ background: 'var(--warning-muted)' }}>
                            <ShieldAlert size={20} color="var(--warning)" />
                        </div>
                        <div>
                            <div className="metric-value">{requireAction}</div>
                            <div className="metric-label">Require Admin Action</div>
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-icon" style={{ background: 'var(--success-muted)' }}>
                            <RotateCcw size={20} color="var(--success)" />
                        </div>
                        <div>
                            <div className="metric-value">{avgResolutionDays}d</div>
                            <div className="metric-label">Avg Resolution Time</div>
                        </div>
                    </div>
                </div>

                <div className="table-container">
                    <div className="table-toolbar">
                        <div className="table-search" style={{ flex: 1, minWidth: 250 }}>
                            <Search size={16} className="search-icon" />
                            <input
                                placeholder="Search ref #, users, or job..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <select className="form-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ width: 170 }}>
                            <option value="">All Categories</option>
                            {Object.entries(DISPUTE_CATEGORIES).map(([key, c]) => <option key={key} value={key}>{c.label}</option>)}
                        </select>
                        <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 150 }}>
                            <option value="">All Statuses</option>
                            <option value="open">Open</option>
                            <option value="under_review">Under Review</option>
                            <option value="awaiting_response">Awaiting Response</option>
                            <option value="escalated">Escalated</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                        <select className="form-select" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={{ width: 130 }}>
                            <option value="">All Priorities</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    <table style={{ minWidth: 1000 }}>
                        <thead>
                            <tr>
                                <th>Reference</th>
                                <th>Filed By</th>
                                <th>Against</th>
                                <th>Category</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={8} className="empty-state">No disputes found</td></tr>
                            ) : filtered.map(d => (
                                <tr key={d.id}>
                                    <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.85rem' }}>{d.referenceNumber}</td>
                                    <td>
                                        <div className="user-cell">
                                            <div className={`avatar avatar-sm ${d.filedByRole === 'owner' ? 'avatar-purple' : 'avatar-gold'}`}>{d.filedByAvatar}</div>
                                            <div>
                                                <div className="user-name">{d.filedByName}</div>
                                                <div className="user-sub" style={{ textTransform: 'capitalize' }}>{d.filedByRole}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="user-cell">
                                            <div className={`avatar avatar-sm ${d.filedAgainstRole === 'owner' ? 'avatar-purple' : 'avatar-gold'}`}>{d.filedAgainstAvatar}</div>
                                            <div>
                                                <div className="user-name">{d.filedAgainstName}</div>
                                                <div className="user-sub" style={{ textTransform: 'capitalize' }}>{d.filedAgainstRole}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>
                                            {DISPUTE_CATEGORIES[d.category as keyof typeof DISPUTE_CATEGORIES]?.label || d.category}
                                        </span>
                                    </td>
                                    <td><StatusBadge status={d.priority} size="sm" /></td>
                                    <td><StatusBadge status={d.status} size="sm" /></td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{new Date(d.createdAt).toLocaleDateString()}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <Link href={`/disputes/${d.id}`} className="btn btn-secondary btn-sm">
                                            Resolve <ArrowUpRight size={14} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="table-pagination">
                        <span>Showing {filtered.length} dispute{filtered.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            </div>
        </ProtectedLayout>
    );
}
