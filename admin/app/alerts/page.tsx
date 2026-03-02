'use client';

import ProtectedLayout from '../components/ProtectedLayout';
import StatusBadge from '../components/StatusBadge';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Plus, Send, Eye, BarChart3, ChevronRight, ArrowUpRight } from 'lucide-react';
import { alertTemplates, type Alert } from '../data/alerts';
import { insforge } from '../../lib/insforge';

export default function AlertsPage() {
    const [tab, setTab] = useState<'sent' | 'templates'>('sent');
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAlerts();
    }, []);

    async function fetchAlerts() {
        try {
            setIsLoading(true);
            const { data, error } = await insforge.database
                .from('alerts')
                .select('*, admin_users(full_name)')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const mapped: Alert[] = (data || []).map(a => {
                const admin = Array.isArray(a.admin_users) ? a.admin_users[0] : (a.admin_users || {});
                return {
                    id: a.id,
                    title: a.title,
                    bodyRich: a.body_rich,
                    bodyPlain: a.body_plain,
                    category: a.category,
                    priority: a.priority,
                    ctaLabel: a.cta_label,
                    ctaDestination: a.cta_destination,
                    targetingSummary: a.targeting_summary,
                    channels: a.channels || [],
                    status: a.status,
                    recipientCount: a.recipient_count || 0,
                    createdBy: a.created_by,
                    createdByName: admin.full_name || 'Admin',
                    createdAt: a.created_at,
                    sentAt: a.sent_at,
                    deliveryStats: a.delivery_stats,
                };
            });
            setAlerts(mapped);
        } catch (err) {
            console.error('Failed to fetch alerts:', err);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <ProtectedLayout>
            <div className="animate-in">
                <div className="page-header">
                    <div>
                        <h1>Alerts & Notifications</h1>
                        <p>Manage alerts and notification templates</p>
                    </div>
                    <Link href="/alerts/compose" className="btn btn-primary">
                        <Plus size={16} /> New Alert
                    </Link>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    <button className={`tab ${tab === 'sent' ? 'active' : ''}`} onClick={() => setTab('sent')}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <Send size={14} /> Sent Alerts ({alerts.length})
                        </span>
                    </button>
                    <button className={`tab ${tab === 'templates' ? 'active' : ''}`} onClick={() => setTab('templates')}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <Eye size={14} /> Templates ({alertTemplates.length})
                        </span>
                    </button>
                </div>

                {tab === 'sent' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {isLoading ? (
                            <div className="empty-state">Loading alerts...</div>
                        ) : alerts.length === 0 ? (
                            <div className="empty-state">No alerts found.</div>
                        ) : (
                            alerts.map(alert => (
                                <AlertCard key={alert.id} alert={alert} />
                            ))
                        )}
                    </div>
                )}

                {tab === 'templates' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                        {alertTemplates.map(tpl => (
                            <div key={tpl.id} className="card" style={{ cursor: 'pointer', transition: 'all var(--transition)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{tpl.name}</h3>
                                    <StatusBadge status={tpl.category} size="sm" />
                                </div>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>
                                    <strong style={{ color: 'var(--text-primary)' }}>Title:</strong> {tpl.titleTemplate}
                                </p>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12 }}>
                                    {tpl.bodyTemplate.slice(0, 120)}...
                                </p>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {tpl.variables.map(v => (
                                        <span key={v} className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                                            {`{${v}}`}
                                        </span>
                                    ))}
                                </div>
                                {tpl.ctaLabel && (
                                    <div style={{ marginTop: 12, fontSize: '0.78rem', color: 'var(--primary)' }}>
                                        CTA: {tpl.ctaLabel} → {tpl.ctaDestination}
                                    </div>
                                )}
                                <Link
                                    href={`/alerts/compose?template=${tpl.id}`}
                                    className="btn btn-secondary btn-sm"
                                    style={{ marginTop: 12, width: '100%' }}
                                >
                                    Use Template <ArrowUpRight size={12} />
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ProtectedLayout>
    );
}

function AlertCard({ alert }: { alert: Alert }) {
    const [expanded, setExpanded] = useState(false);

    const categoryColors: Record<string, string> = {
        compliance: 'var(--warning)',
        account: 'var(--info)',
        safety: 'var(--error)',
        opportunity: 'var(--success)',
        announcement: 'var(--primary)',
        promotion: 'var(--secondary)',
        emergency: '#DC2626',
    };

    return (
        <div className="card" style={{ borderLeft: `3px solid ${categoryColors[alert.category] || 'var(--border)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{alert.title}</h3>
                        <StatusBadge status={alert.status} size="sm" />
                        <StatusBadge status={alert.priority} size="sm" />
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 8 }}>{alert.bodyPlain}</p>
                    <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span>{alert.targetingSummary}</span>
                        <span>·</span>
                        <span>By {alert.createdByName}</span>
                        <span>·</span>
                        <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {alert.channels.map(ch => (
                        <span key={ch} className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{ch}</span>
                    ))}
                </div>
            </div>

            {alert.deliveryStats && (
                <div style={{ marginTop: 16, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                    <StatPill label="Delivered" value={alert.deliveryStats.delivered} total={alert.recipientCount} color="var(--success)" />
                    <StatPill label="Read" value={alert.deliveryStats.read} total={alert.recipientCount} color="var(--info)" />
                    <StatPill label="Clicked" value={alert.deliveryStats.clicked} total={alert.recipientCount} color="var(--primary)" />
                    <StatPill label="Failed" value={alert.deliveryStats.failed} total={alert.recipientCount} color="var(--error)" />
                </div>
            )}
        </div>
    );
}

function StatPill({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem' }}>
            <div style={{ width: 60, height: 4, borderRadius: 2, background: 'var(--surface-elevated)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2 }} />
            </div>
            <span style={{ color: 'var(--text-secondary)' }}>{label}: <strong style={{ color: 'var(--text-primary)' }}>{value}</strong> ({pct}%)</span>
        </div>
    );
}
