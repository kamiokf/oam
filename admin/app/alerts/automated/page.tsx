'use client';

import ProtectedLayout from '../../components/ProtectedLayout';
import { useState } from 'react';
import Link from 'next/link';
import { Settings, Zap, Edit2, Play, Pause, Plus } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

export default function AutomatedAlertsPage() {
    const [triggers, setTriggers] = useState([
        {
            id: 'trg-1',
            name: 'Document Expiry Warning (30 Days)',
            description: 'Send warning when a required document is 30 days from expiring.',
            event: 'document.expiring_30',
            channel: 'push, in_app',
            active: true,
            templateId: 'tpl-1'
        },
        {
            id: 'trg-2',
            name: 'Document Expired Suspension',
            description: 'Notify user they are suspended due to an expired document.',
            event: 'document.expired',
            channel: 'push, in_app, sms',
            active: true,
            templateId: 'tpl-2'
        },
        {
            id: 'trg-3',
            name: 'User Inactive 30 Days',
            description: 'Send re-engagement campaign after 30 days of inactivity.',
            event: 'user.inactive_30',
            channel: 'in_app',
            active: false,
            templateId: 'tpl-3'
        },
        {
            id: 'trg-4',
            name: 'New Dispute Assigned',
            description: 'Notify operations team when an urgent dispute is filed.',
            event: 'dispute.created_urgent',
            channel: 'push',
            active: true,
            templateId: 'tpl-4'
        }
    ]);

    const toggleTrigger = (id: string) => {
        setTriggers(triggers.map(t => t.id === id ? { ...t, active: !t.active } : t));
    };

    return (
        <ProtectedLayout requirePermission="sendAlert">
            <div className="animate-in">
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1>Automated Triggers</h1>
                        <p>Configure automated messages sent based on system events.</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <Link href="/alerts" className="btn btn-secondary">
                            View Sent Alerts
                        </Link>
                        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Plus size={16} /> New Trigger
                        </button>
                    </div>
                </div>

                <div className="card">
                    <table style={{ minWidth: 800 }}>
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th>Name & Description</th>
                                <th>System Event</th>
                                <th>Channels</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {triggers.map(trigger => (
                                <tr key={trigger.id}>
                                    <td>
                                        <button
                                            onClick={() => toggleTrigger(trigger.id)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 6,
                                                padding: '4px 8px',
                                                borderRadius: 'var(--radius)',
                                                transition: 'background var(--transition)',
                                            }}
                                            className="hover-bg"
                                        >
                                            <div style={{
                                                width: 8, height: 8, borderRadius: '50%',
                                                background: trigger.active ? 'var(--success)' : 'var(--text-muted)'
                                            }} />
                                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: trigger.active ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                                {trigger.active ? 'Active' : 'Paused'}
                                            </span>
                                        </button>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{trigger.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>{trigger.description}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontFamily: 'monospace', background: 'var(--surface)', padding: '4px 8px', borderRadius: 4 }}>
                                            <Zap size={10} style={{ display: 'inline', marginRight: 4, color: 'var(--primary)' }} />
                                            {trigger.event}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            {trigger.channel.split(', ').map(ch => (
                                                <span key={ch} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', background: 'var(--primary-muted)', padding: '2px 8px', borderRadius: 12 }}>
                                                    {ch.replace('_', '-')}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                            <button className="btn btn-secondary btn-sm" title="Edit Template">
                                                <Edit2 size={14} />
                                            </button>
                                            <button className="btn btn-secondary btn-sm" title="Configure Trigger">
                                                <Settings size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </ProtectedLayout>
    );
}
