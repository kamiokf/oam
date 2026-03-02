'use client';

import { useParams } from 'next/navigation';
import ProtectedLayout from '../../components/ProtectedLayout';
import StatusBadge from '../../components/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { DISPUTE_CATEGORIES, RESOLUTION_TYPES, type Dispute } from '../../data/disputes';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Paperclip, MessageSquare, Send, Calendar, Briefcase,
    AlertTriangle, CheckCircle, ShieldAlert
} from 'lucide-react';
import { insforge } from '../../../lib/insforge';

export default function DisputeDetailPage() {
    const { id } = useParams();
    const { admin } = useAdminAuth();
    const [dispute, setDispute] = useState<Dispute | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [message, setMessage] = useState('');
    const [resolutionModal, setResolutionModal] = useState<{ open: boolean; type: string; notes: string }>({ open: false, type: '', notes: '' });
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchDispute();
    }, [id]);

    async function fetchDispute() {
        if (!id) return;
        try {
            setIsLoading(true);
            const { data, error } = await insforge.database
                .from('disputes')
                .select(`
                    *,
                    reporter:filed_by(name, role),
                    respondent:filed_against(name, role)
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            if (!data) {
                setDispute(null);
                return;
            }

            const rep = Array.isArray(data.reporter) ? data.reporter[0] : (data.reporter || {});
            const res = Array.isArray(data.respondent) ? data.respondent[0] : (data.respondent || {});
            const mappedDispute: Dispute = {
                id: data.id,
                referenceNumber: data.reference_number,
                filedBy: data.filed_by,
                filedByName: rep.name || 'Unknown',
                filedByAvatar: rep.name ? rep.name.substring(0, 2).toUpperCase() : '??',
                filedByRole: rep.role || 'driver',
                filedAgainst: data.filed_against,
                filedAgainstName: res.name || 'Unknown',
                filedAgainstAvatar: res.name ? res.name.substring(0, 2).toUpperCase() : '??',
                filedAgainstRole: res.role || 'owner',
                category: data.category as any,
                description: data.description,
                status: data.status as any,
                priority: data.priority as any,
                assignedTo: data.assigned_to,
                assignedToName: null,
                evidence: data.evidence || [],
                timeline: data.timeline || [],
                messages: data.messages || [],
                resolutionType: data.resolution_type,
                resolutionNotes: data.resolution_notes,
                resolvedBy: data.resolved_by,
                resolvedAt: data.resolved_at,
                appealFiled: data.appeal_filed || false,
                relatedJobId: data.related_job_id,
                createdAt: data.created_at,
                updatedAt: data.updated_at
            };

            setDispute(mappedDispute);

            const events = mappedDispute.timeline.map((t: any) => ({
                id: `ev-${t.date}`,
                datetime: t.date,
                type: 'status_change',
                content: `${t.action}: ${t.description}`,
                senderName: t.actor,
            }));
            const msgs = mappedDispute.messages.map((m: any) => ({
                id: m.id,
                datetime: m.createdAt,
                type: 'message',
                senderId: m.senderId,
                senderName: m.senderName,
                senderRole: m.senderType,
                content: m.message,
                isInternal: (m as any).isInternal || false,
            }));
            setTimeline([...events, ...msgs].sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()));

        } catch (err) {
            console.error('Failed to fetch dispute:', err);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [timeline]);

    if (isLoading) {
        return (
            <ProtectedLayout>
                <div className="empty-state" style={{ marginTop: 80 }}>
                    <h3>Loading dispute...</h3>
                </div>
            </ProtectedLayout>
        );
    }

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

    const handleSendMessage = async () => {
        if (!message.trim() || !admin || !dispute) return;
        const newMessage = {
            id: `msg-${Date.now()}`,
            createdAt: new Date().toISOString(),
            senderId: admin.id,
            senderName: admin.fullName,
            senderType: 'admin' as const,
            message: message,
            isInternal: true, // Mock logic: all admin messages are internal notes for demo purposes
        };

        const updatedMessages = [...dispute.messages, newMessage];
        try {
            await insforge.database
                .from('disputes')
                .update({ messages: updatedMessages, updated_at: new Date().toISOString() })
                .eq('id', dispute.id);

            setDispute({ ...dispute, messages: updatedMessages });
            setTimeline(prev => [...prev, {
                id: newMessage.id,
                datetime: newMessage.createdAt,
                senderId: newMessage.senderId,
                senderName: newMessage.senderName,
                senderRole: newMessage.senderType,
                type: 'message' as const,
                content: newMessage.message,
                isInternal: newMessage.isInternal,
            }]);
            setMessage('');
        } catch (err) {
            console.error('Failed to send message:', err);
            alert('Failed to send message');
        }
    };

    const handleUpdateStatus = async (newStatus: typeof dispute.status) => {
        if (!admin || !dispute) return;

        const newEvent = {
            date: new Date().toISOString(),
            action: 'Status Updated',
            description: `Status changed to ${newStatus.replace('_', ' ')}`,
            actor: 'admin' as const
        };

        const updatedTimeline = [...dispute.timeline, newEvent];

        try {
            await insforge.database
                .from('disputes')
                .update({
                    status: newStatus,
                    timeline: updatedTimeline,
                    updated_at: new Date().toISOString()
                })
                .eq('id', dispute.id);

            setDispute({ ...dispute, status: newStatus, timeline: updatedTimeline });
            setTimeline(prev => [...prev, {
                id: `ev-${newEvent.date}`,
                datetime: newEvent.date,
                senderId: admin.id,
                senderName: admin.fullName,
                senderRole: 'admin',
                type: 'status_change' as const,
                content: `${newEvent.action}: ${newEvent.description}`,
                isInternal: true,
            }]);
        } catch (err) {
            console.error('Failed to update status:', err);
            alert('Failed to update status');
        }
    };

    const handleResolve = async () => {
        if (!admin || !resolutionModal.type || !dispute) return;

        const newEvent = {
            date: new Date().toISOString(),
            action: 'Dispute Resolved',
            description: `Resolved: ${RESOLUTION_TYPES.find(r => r.value === resolutionModal.type)?.label}`,
            actor: 'admin' as const
        };

        const updatedTimeline = [...dispute.timeline, newEvent];

        try {
            await insforge.database
                .from('disputes')
                .update({
                    status: 'resolved',
                    resolution_type: resolutionModal.type,
                    resolution_notes: resolutionModal.notes,
                    resolved_by: admin.id,
                    resolved_at: new Date().toISOString(),
                    timeline: updatedTimeline,
                    updated_at: new Date().toISOString()
                })
                .eq('id', dispute.id);

            setDispute({
                ...dispute,
                status: 'resolved',
                resolutionType: resolutionModal.type as any,
                resolutionNotes: resolutionModal.notes,
                resolvedBy: admin.id,
                resolvedAt: new Date().toISOString(),
                timeline: updatedTimeline
            });
            setTimeline(prev => [...prev, {
                id: `ev-${newEvent.date}`,
                datetime: newEvent.date,
                senderId: admin.id,
                senderName: admin.fullName,
                senderRole: 'admin',
                type: 'status_change' as const,
                content: `${newEvent.action}: ${newEvent.description}`,
                isInternal: true,
            }]);
            setResolutionModal({ open: false, type: '', notes: '' });
        } catch (err) {
            console.error('Failed to resolve dispute:', err);
            alert('Failed to resolve dispute');
        }
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
