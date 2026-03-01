'use client';

import { useParams } from 'next/navigation';
import ProtectedLayout from '../../components/ProtectedLayout';
import StatusBadge from '../../components/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { mockDisputes, DISPUTE_CATEGORIES, RESOLUTION_TYPES } from '../../data/disputes';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Paperclip, MessageSquare, Send, Calendar, Briefcase,
    AlertTriangle, CheckCircle, ShieldAlert
} from 'lucide-react';

export default function DisputeDetailPage() {
    const { id } = useParams();
    const { admin } = useAdminAuth();
    const [dispute, setDispute] = useState(() => mockDisputes.find(d => d.id === id));
    const [timeline, setTimeline] = useState<any[]>(() => {
        if (!dispute) return [];
        const events = dispute.timeline.map((t: any) => ({
            id: `ev-${t.date}`,
            datetime: t.date,
            type: 'status_change',
            content: `${t.action}: ${t.description}`,
            senderName: t.actor,
        }));
        const msgs = dispute.messages.map((m: any) => ({
            id: m.id,
            datetime: m.createdAt,
            type: 'message',
            senderId: m.senderId,
            senderName: m.senderName,
            senderRole: m.senderType,
            content: m.message,
            isInternal: false,
        }));
        return [...events, ...msgs].sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
    });
    const [message, setMessage] = useState('');
    const [resolutionModal, setResolutionModal] = useState<{ open: boolean; type: string; notes: string }>({ open: false, type: '', notes: '' });
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [timeline]);

    if (!dispute) {
        return (
            <ProtectedLayout>
                <div className="empty-state" style={{ marginTop: 80 }}>
                    <h3>Dispute not found</h3>
                    <p>The dispute case you&apos;re looking for doesn&apos;t exist.</p>
                    <Link href="/disputes" className="btn btn-secondary" style={{ marginTop: 16 }}>Back to Disputes</Link>
                </div>
            </ProtectedLayout>
        );
    }

    const categoryLabel = DISPUTE_CATEGORIES[dispute.category as keyof typeof DISPUTE_CATEGORIES]?.label || dispute.category;

    const handleSendMessage = () => {
        if (!message.trim() || !admin) return;
        const newMessage = {
            id: `msg-${Date.now()}`,
            datetime: new Date().toISOString(),
            senderId: admin.id,
            senderName: admin.fullName,
            senderRole: 'admin',
            type: 'message' as const,
            content: message,
            isInternal: true, // Mock logic: all admin messages are internal notes for demo purposes
        };
        setTimeline(prev => [...prev, newMessage]);
        setMessage('');
    };

    const handleUpdateStatus = (newStatus: typeof dispute.status) => {
        if (!admin) return;
        setDispute(prev => prev ? { ...prev, status: newStatus } : undefined);
        setTimeline(prev => [...prev, {
            id: `ev-${Date.now()}`,
            datetime: new Date().toISOString(),
            senderId: admin.id,
            senderName: admin.fullName,
            senderRole: 'admin',
            type: 'status_change' as const,
            content: `Status updated to ${newStatus.replace('_', ' ')}`,
            isInternal: true,
        }]);
    };

    const handleResolve = () => {
        if (!admin || !resolutionModal.type) return;
        setDispute(prev => prev ? { ...prev, status: 'resolved', resolutionType: resolutionModal.type as any, resolutionNotes: resolutionModal.notes } : undefined);
        setTimeline(prev => [...prev, {
            id: `ev-${Date.now()}`,
            datetime: new Date().toISOString(),
            senderId: admin.id,
            senderName: admin.fullName,
            senderRole: 'admin',
            type: 'status_change' as const,
            content: `Dispute resolved: ${RESOLUTION_TYPES.find(r => r.value === resolutionModal.type)?.label}`,
            isInternal: true,
        }]);
        setResolutionModal({ open: false, type: '', notes: '' });
    };

    return (
        <ProtectedLayout>
            <div className="animate-in" style={{ height: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column' }}>
                <Link href="/disputes" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 16, textDecoration: 'none', flexShrink: 0 }}>
                    <ArrowLeft size={14} /> Back to Disputes
                </Link>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20, flexShrink: 0 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Case {dispute.referenceNumber}</h1>
                            <StatusBadge status={dispute.status} />
                            <StatusBadge status={dispute.priority} />
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 600 }}>{dispute.description}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {dispute.status !== 'resolved' && dispute.status !== 'closed' && (
                            <>
                                <button className="btn btn-secondary" onClick={() => handleUpdateStatus('under_review')} disabled={dispute.status === 'under_review'}>Mark Under Review</button>
                                <button className="btn btn-warning" onClick={() => handleUpdateStatus('escalated')} disabled={dispute.status === 'escalated'}><ShieldAlert size={14} /> Escalate</button>
                                <button className="btn btn-success" onClick={() => setResolutionModal({ open: true, type: '', notes: '' })}><CheckCircle size={14} /> Resolve Case</button>
                            </>
                        )}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 350px) 1fr', gap: 20, flex: 1, overflow: 'hidden' }}>
                    {/* Sidebar Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', paddingRight: 4 }}>
                        {/* Resolution Details (if resolved) */}
                        {dispute.status === 'resolved' && (
                            <div className="card" style={{ background: 'var(--success-muted)', borderColor: 'var(--success-border)', padding: '16px 20px' }}>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--success-text)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle size={16} /> Resolution</h3>
                                <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>{RESOLUTION_TYPES.find(r => r.value === dispute.resolutionType)?.label}</p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{dispute.resolutionNotes}</p>
                            </div>
                        )}

                        {/* Parties Involved */}
                        <div className="card">
                            <div className="card-header"><h3>Parties Involved</h3></div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Filed By (Initiator)</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div className={`avatar avatar-md ${dispute.filedByRole === 'owner' ? 'avatar-purple' : 'avatar-gold'}`}>{dispute.filedByAvatar}</div>
                                        <div style={{ flex: 1 }}>
                                            <Link href={`/users/${dispute.filedBy}`} style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}>{dispute.filedByName}</Link>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{dispute.filedByRole}</div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ height: 1, background: 'var(--border)' }} />
                                <div>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Filed Against</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div className={`avatar avatar-md ${dispute.filedAgainstRole === 'owner' ? 'avatar-purple' : 'avatar-gold'}`}>{dispute.filedAgainstAvatar}</div>
                                        <div style={{ flex: 1 }}>
                                            <Link href={`/users/${dispute.filedAgainst}`} style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}>{dispute.filedAgainstName}</Link>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{dispute.filedAgainstRole}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Case Details */}
                        <div className="card">
                            <div className="card-header"><h3>Case Details</h3></div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <InfoRow label="Category" value={categoryLabel} />
                                <InfoRow label="Opened" value={new Date(dispute.createdAt).toLocaleString()} />
                                {dispute.relatedJobId && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                        <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><Briefcase size={14} /> Job Ref</span>
                                        <Link href="#" style={{ fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>{dispute.relatedJobId}</Link>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={14} /> Incident Date</span>
                                    <span style={{ fontWeight: 500 }}>{new Date(dispute.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Evidence Files */}
                        <div className="card">
                            <div className="card-header"><h3>Evidence ({dispute.evidence.length})</h3></div>
                            {dispute.evidence.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No evidence submitted.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {dispute.evidence.map((ev: any, i: number) => (
                                        <a key={i} href="#" className="doc-link" onClick={e => e.preventDefault()} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'var(--surface-light)', borderRadius: 'var(--radius)', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '0.82rem', transition: 'all var(--transition)' }}>
                                            <Paperclip size={14} color="var(--primary)" />
                                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>{ev.label}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{ev.type}</div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timeline / Chat */}
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div className="card-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><MessageSquare size={16} /> Case Timeline</h3>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 20, background: 'var(--bg)' }}>
                            {timeline.map(item => {
                                const isSystem = item.type === 'status_change';
                                const isAdmin = item.senderRole === 'admin';
                                const isInitiator = item.senderId === dispute.filedBy;

                                if (isSystem) {
                                    return (
                                        <div key={item.id} style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
                                            <div style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)', padding: '6px 16px', borderRadius: 20, fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <AlertTriangle size={12} /> {item.content}
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isAdmin ? 'flex-end' : 'flex-start', maxWidth: '85%', alignSelf: isAdmin ? 'flex-end' : 'flex-start' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, padding: '0 4px' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isAdmin ? 'var(--primary)' : 'var(--text-secondary)' }}>{item.senderName}</span>
                                            {isAdmin && <span className="badge badge-neutral" style={{ fontSize: '0.6rem', padding: '1px 4px' }}>Admin</span>}
                                            {item.isInternal && <span className="badge badge-warning" style={{ fontSize: '0.6rem', padding: '1px 4px' }}>Internal Note</span>}
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(item.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div style={{
                                            background: isAdmin ? 'var(--primary-muted)' : 'var(--surface)',
                                            border: `1px solid ${isAdmin ? 'var(--primary-dark)' : 'var(--border)'}`,
                                            padding: '12px 16px', borderRadius: '12px',
                                            borderTopRightRadius: isAdmin ? 4 : 12, borderTopLeftRadius: isAdmin ? 12 : 4,
                                            fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--text-primary)',
                                        }}>
                                            {item.content}
                                            {item.attachments && item.attachments.map((a: string, i: number) => (
                                                <div key={i} style={{ marginTop: 12, padding: 8, background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem' }}>
                                                    <Paperclip size={12} color="var(--primary)" /> {a}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        {dispute.status !== 'resolved' && dispute.status !== 'closed' && (
                            <div style={{ padding: 16, borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                                    <div style={{ flex: 1, position: 'relative' }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--warning)', fontWeight: 600, position: 'absolute', top: -18, left: 4 }}>Internal Admin Note (Not visible to users)</div>
                                        <textarea
                                            className="form-textarea"
                                            placeholder="Type an internal note..."
                                            value={message}
                                            onChange={e => setMessage(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                                            rows={2}
                                            style={{ minHeight: 44, resize: 'none' }}
                                        />
                                    </div>
                                    <button className="btn btn-primary" onClick={handleSendMessage} disabled={!message.trim()} style={{ height: 44, padding: '0 20px' }}>
                                        <Send size={16} /> Send
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Resolution Modal */}
                <ConfirmModal
                    isOpen={resolutionModal.open}
                    title="Resolve Dispute"
                    message={`You are about to resolve case ${dispute.referenceNumber}. Please select the resolution type and provide notes.`}
                    confirmLabel="Resolve Case"
                    confirmVariant="success"
                    requireReason={false}
                    onConfirm={handleResolve}
                    onCancel={() => setResolutionModal({ open: false, type: '', notes: '' })}
                />
                {/* Custom content for resolution modal (since ConfirmModal only has one text input) */}
                {resolutionModal.open && (
                    <div className="modal-overlay" style={{ zIndex: 1001 }}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <h2>Resolve Case {dispute.referenceNumber}</h2>
                            <p>Close this case and document the outcome.</p>
                            <div className="form-group" style={{ marginTop: 16 }}>
                                <label className="form-label">Resolution Outcome *</label>
                                <select className="form-select" value={resolutionModal.type} onChange={e => setResolutionModal(prev => ({ ...prev, type: e.target.value }))}>
                                    <option value="">Select outcome...</option>
                                    {RESOLUTION_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Resolution Notes *</label>
                                <textarea
                                    className="form-textarea"
                                    rows={3}
                                    value={resolutionModal.notes}
                                    onChange={e => setResolutionModal(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Explain the decision..."
                                />
                            </div>
                            <div className="modal-actions" style={{ marginTop: 24 }}>
                                <button className="btn btn-secondary" onClick={() => setResolutionModal({ open: false, type: '', notes: '' })}>Cancel</button>
                                <button className="btn btn-success" onClick={handleResolve} disabled={!resolutionModal.type || !resolutionModal.notes.trim()}>
                                    <CheckCircle size={16} /> Resolve Case
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedLayout>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>{label}</span>
            <span style={{ fontWeight: 500 }}>{value}</span>
        </div>
    );
}
