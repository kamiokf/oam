'use client';

import ProtectedLayout from '../../components/ProtectedLayout';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Send, Eye, Users, FileText, Bell, Zap, Check } from 'lucide-react';
import { mockUsers } from '../../data/users';
import type { AlertCategory, AlertPriority } from '../../data/alerts';

type Step = 1 | 2 | 3 | 4;

export default function ComposeAlertPage() {
    const [step, setStep] = useState<Step>(1);

    // Step 1 — Targeting
    const [targetType, setTargetType] = useState('individual');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [userSearch, setUserSearch] = useState('');

    // Step 2 — Message
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [category, setCategory] = useState<AlertCategory>('account');
    const [priority, setPriority] = useState<AlertPriority>('normal');
    const [ctaLabel, setCtaLabel] = useState('');
    const [ctaDestination, setCtaDestination] = useState('');

    // Step 3 — Channels
    const [channels, setChannels] = useState({ push: true, in_app: true, sms: false });

    const [sent, setSent] = useState(false);

    const selectedUser = mockUsers.find(u => u.id === selectedUserId);
    const filteredUsers = userSearch ? mockUsers.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.phone.includes(userSearch)) : mockUsers.slice(0, 5);

    const recipientCount = targetType === 'individual' ? (selectedUser ? 1 : 0)
        : targetType === 'all' ? mockUsers.length
            : targetType === 'drivers' ? mockUsers.filter(u => u.role === 'driver' || u.role === 'dual').length
                : targetType === 'owners' ? mockUsers.filter(u => u.role === 'owner' || u.role === 'dual').length
                    : targetType === 'unverified' ? mockUsers.filter(u => u.verificationTier === 'registered').length
                        : targetType === 'expiring' ? 24 // mock arbitrary count
                            : 0;

    const canProceed = (s: Step) => {
        if (s === 1) return recipientCount > 0;
        if (s === 2) return title.length > 0 && body.length > 0;
        if (s === 3) return channels.push || channels.in_app || channels.sms;
        return true;
    };

    const handleSend = () => { setSent(true); };

    if (sent) {
        return (
            <ProtectedLayout>
                <div className="animate-in" style={{ textAlign: 'center', paddingTop: 80 }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--success-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <Check size={32} color="var(--success)" />
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>Alert Sent Successfully!</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                        Your alert has been sent to {recipientCount} recipient{recipientCount !== 1 ? 's' : ''}.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                        <Link href="/alerts" className="btn btn-secondary">View All Alerts</Link>
                        <button className="btn btn-primary" onClick={() => { setSent(false); setStep(1); setTitle(''); setBody(''); }}>
                            Send Another
                        </button>
                    </div>
                </div>
            </ProtectedLayout>
        );
    }

    return (
        <ProtectedLayout>
            <div className="animate-in">
                <Link href="/alerts" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 16, textDecoration: 'none' }}>
                    <ArrowLeft size={14} /> Back to Alerts
                </Link>

                <div className="page-header">
                    <h1>Compose Alert</h1>
                </div>

                {/* Step Indicator */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
                    {[
                        { num: 1, label: 'Recipients' },
                        { num: 2, label: 'Message' },
                        { num: 3, label: 'Channels' },
                        { num: 4, label: 'Preview' },
                    ].map(s => (
                        <div key={s.num} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: '50%',
                                background: step >= s.num ? 'var(--primary-muted)' : 'var(--surface-elevated)',
                                color: step >= s.num ? 'var(--primary)' : 'var(--text-muted)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.78rem', fontWeight: 700, flexShrink: 0,
                            }}>
                                {step > s.num ? <Check size={14} /> : s.num}
                            </div>
                            <span style={{ fontSize: '0.78rem', fontWeight: step === s.num ? 600 : 400, color: step === s.num ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s.label}</span>
                            {s.num < 4 && <div style={{ flex: 1, height: 2, background: step > s.num ? 'var(--primary-dark)' : 'var(--border)', borderRadius: 1 }} />}
                        </div>
                    ))}
                </div>

                {/* Step 1 — Recipients */}
                {step === 1 && (
                    <div className="card">
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16 }}>Select Recipients</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginBottom: 20 }}>
                            {[
                                { key: 'individual', label: 'Individual User', icon: Users },
                                { key: 'all', label: 'All Users', icon: Users },
                                { key: 'drivers', label: 'All Drivers', icon: Users },
                                { key: 'owners', label: 'All Owners', icon: Users },
                                { key: 'unverified', label: 'Unverified Users', icon: Users },
                                { key: 'expiring', label: 'Expiring Documents', icon: Users },
                            ].map(opt => {
                                const Icon = opt.icon;
                                return (
                                    <button
                                        key={opt.key}
                                        className={`btn ${targetType === opt.key ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => setTargetType(opt.key)}
                                        style={{ justifyContent: 'flex-start' }}
                                    >
                                        <Icon size={16} /> {opt.label}
                                    </button>
                                );
                            })}
                        </div>

                        {targetType === 'individual' && (
                            <div>
                                <input
                                    className="form-input"
                                    placeholder="Search users by name or phone..."
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                    style={{ marginBottom: 12 }}
                                />
                                <div style={{ maxHeight: 250, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {filteredUsers.map(u => (
                                        <button
                                            key={u.id}
                                            onClick={() => setSelectedUserId(u.id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                                                background: selectedUserId === u.id ? 'var(--primary-muted)' : 'var(--surface-light)',
                                                border: `1px solid ${selectedUserId === u.id ? 'var(--primary-dark)' : 'var(--border)'}`,
                                                borderRadius: 'var(--radius)', cursor: 'pointer', color: 'var(--text-primary)',
                                                fontFamily: 'inherit', fontSize: '0.85rem', transition: 'all var(--transition)', textAlign: 'left', width: '100%',
                                            }}
                                        >
                                            <div className="avatar avatar-sm avatar-gold">{u.avatar}</div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600 }}>{u.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.phone}</div>
                                            </div>
                                            {selectedUserId === u.id && <Check size={16} color="var(--primary)" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ marginTop: 16, padding: '10px 14px', background: 'var(--surface-light)', borderRadius: 'var(--radius)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            <strong>{recipientCount}</strong> recipient{recipientCount !== 1 ? 's' : ''} selected
                        </div>
                    </div>
                )}

                {/* Step 2 — Message */}
                {step === 2 && (
                    <div className="card">
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16 }}>Compose Message</h3>
                        <div className="form-group">
                            <label className="form-label">Alert Title (max 60 characters)</label>
                            <input className="form-input" value={title} onChange={e => setTitle(e.target.value.slice(0, 60))} placeholder="Enter alert title..." />
                            <p className="form-hint">{title.length}/60</p>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Alert Body</label>
                            <textarea className="form-textarea" value={body} onChange={e => setBody(e.target.value.slice(0, 500))} placeholder="Enter alert message..." rows={4} />
                            <p className="form-hint">{body.length}/500</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select className="form-select" value={category} onChange={e => setCategory(e.target.value as AlertCategory)}>
                                    <option value="announcement">Announcement</option>
                                    <option value="compliance">Compliance</option>
                                    <option value="safety">Safety</option>
                                    <option value="opportunity">Opportunity</option>
                                    <option value="account">Account</option>
                                    <option value="promotion">Promotion</option>
                                    <option value="emergency">Emergency</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Priority</label>
                                <select className="form-select" value={priority} onChange={e => setPriority(e.target.value as AlertPriority)}>
                                    <option value="normal">Normal</option>
                                    <option value="high">High</option>
                                    <option value="emergency">Emergency</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div className="form-group">
                                <label className="form-label">CTA Button Label (optional)</label>
                                <input className="form-input" value={ctaLabel} onChange={e => setCtaLabel(e.target.value.slice(0, 25))} placeholder="e.g. Upload Now" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">CTA Destination (optional)</label>
                                <input className="form-input" value={ctaDestination} onChange={e => setCtaDestination(e.target.value)} placeholder="e.g. /profile/documents" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3 — Channels */}
                {step === 3 && (
                    <div className="card">
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16 }}>Delivery Channels</h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 20 }}>Select at least one delivery channel.</p>
                        {[
                            { key: 'push' as const, label: 'Push Notification', desc: 'Sent directly to the user\'s device' },
                            { key: 'in_app' as const, label: 'In-App Message', desc: 'Displayed in the notification center' },
                            { key: 'sms' as const, label: 'SMS', desc: 'Sent as a text message' },
                        ].map(ch => (
                            <label key={ch.key} style={{
                                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                                background: channels[ch.key] ? 'var(--primary-muted)' : 'var(--surface-light)',
                                border: `1px solid ${channels[ch.key] ? 'var(--primary-dark)' : 'var(--border)'}`,
                                borderRadius: 'var(--radius)', marginBottom: 10, cursor: 'pointer', transition: 'all var(--transition)',
                            }}>
                                <input
                                    type="checkbox"
                                    checked={channels[ch.key]}
                                    onChange={e => setChannels(prev => ({ ...prev, [ch.key]: e.target.checked }))}
                                    style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
                                />
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{ch.label}</div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{ch.desc}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                )}

                {/* Step 4 — Preview */}
                {step === 4 && (
                    <div>
                        <div className="card" style={{ marginBottom: 16 }}>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16 }}>Preview & Confirm</h3>

                            <div style={{ background: 'var(--surface-light)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 16 }}>
                                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                    <span className={`badge badge-${category === 'emergency' ? 'error' : category === 'safety' ? 'error' : category === 'compliance' ? 'warning' : 'info'}`}>
                                        {category}
                                    </span>
                                    <span className={`badge badge-${priority === 'emergency' ? 'error' : priority === 'high' ? 'warning' : 'info'}`}>
                                        {priority}
                                    </span>
                                </div>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>{title}</h2>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>{body}</p>
                                {ctaLabel && (
                                    <button className="btn btn-primary btn-sm">{ctaLabel}</button>
                                )}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.82rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Recipients</span>
                                    <span style={{ fontWeight: 600 }}>{recipientCount} user{recipientCount !== 1 ? 's' : ''}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Channels</span>
                                    <span>{Object.entries(channels).filter(([, v]) => v).map(([k]) => k.replace('_', '-')).join(', ')}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Schedule</span>
                                    <span>Send Immediately</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, gap: 12 }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setStep(s => Math.max(1, s - 1) as Step)}
                        disabled={step === 1}
                    >
                        <ArrowLeft size={14} /> Previous
                    </button>
                    {step < 4 ? (
                        <button
                            className="btn btn-primary"
                            onClick={() => setStep(s => Math.min(4, s + 1) as Step)}
                            disabled={!canProceed(step)}
                        >
                            Next <ArrowRight size={14} />
                        </button>
                    ) : (
                        <button className="btn btn-primary" onClick={handleSend}>
                            <Send size={14} /> Send Alert
                        </button>
                    )}
                </div>
            </div>
        </ProtectedLayout>
    );
}
