'use client';

import { useParams } from 'next/navigation';
import ProtectedLayout from '../../components/ProtectedLayout';
import StatusBadge from '../../components/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { insforge } from '../../../lib/insforge';
import {
    ArrowLeft, Shield, Phone, Mail, MapPin, Calendar, Star,
    FileText, Clock, MessageSquare, AlertTriangle, Ban, Play,
    Plus, Briefcase, Car,
} from 'lucide-react';

type Tab = 'overview' | 'documents' | 'activity' | 'notes';

export default function UserDetailPage() {
    const { id } = useParams();
    const { canPerform, admin } = useAdminAuth();
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [modal, setModal] = useState<{ type: string; open: boolean }>({ type: '', open: false });
    const [notes, setNotes] = useState<any[]>([]);
    const [newNote, setNewNote] = useState('');
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            try {
                const { data, error } = await insforge.database
                    .from('users')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (data && !error) {
                    setUser({
                        ...data,
                        role: data.role,
                        verificationTier: data.verification_tier,
                        registeredDate: new Date(data.registered_date).toISOString().split('T')[0],
                        lastActive: new Date().toISOString().split('T')[0], // Mock for now
                        documents: [],
                        notes: [],
                        statusHistory: [],
                        rating: 4.8, // Mock for now
                        totalTrips: data.role === 'driver' || data.role === 'dual' ? 150 : undefined,
                        numberOfVehicles: data.role === 'owner' || data.role === 'dual' ? 1 : undefined,
                    });
                }
            } catch (err) {
                console.error("Failed to load user", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchUser();
    }, [id]);

    if (isLoading) {
        return (
            <ProtectedLayout>
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading user details...
                </div>
            </ProtectedLayout>
        );
    }

    if (!user) {
        return (
            <ProtectedLayout>
                <div className="empty-state" style={{ marginTop: 80 }}>
                    <h3>User not found</h3>
                    <p>The user you&apos;re looking for doesn&apos;t exist.</p>
                    <Link href="/users" className="btn btn-secondary" style={{ marginTop: 16 }}>Back to Users</Link>
                </div>
            </ProtectedLayout>
        );
    }

    const allNotes = [...user.notes, ...notes];
    const maskTrn = (trn: string) => '***' + trn.slice(-6);

    const handleAddNote = () => {
        if (!newNote.trim() || !admin) return;
        setNotes(prev => [...prev, {
            id: `note-${Date.now()}`,
            adminId: admin.id,
            adminName: admin.fullName,
            note: newNote,
            createdAt: new Date().toISOString().split('T')[0],
        }]);
        setNewNote('');
    };

    const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
        { key: 'overview', label: 'Overview', icon: Shield },
        { key: 'documents', label: 'Documents', icon: FileText },
        { key: 'activity', label: 'Activity', icon: Clock },
        { key: 'notes', label: 'Notes', icon: MessageSquare },
    ];

    const totalDocs = user.documents.length;
    const approvedDocs = user.documents.filter((d: any) => d.status === 'approved').length;
    const completeness = totalDocs > 0 ? Math.round((approvedDocs / Math.max(totalDocs, 3)) * 100) : 0;

    return (
        <ProtectedLayout>
            <div className="animate-in">
                {/* Back + Header */}
                <Link href="/users" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 16, textDecoration: 'none' }}>
                    <ArrowLeft size={14} /> Back to Users
                </Link>

                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap' }}>
                    <div className={`avatar avatar-xl ${user.role === 'owner' ? 'avatar-purple' : user.role === 'dual' ? 'avatar-blue' : 'avatar-gold'}`}>
                        {user.avatar}
                    </div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>{user.name}</h1>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                            <StatusBadge status={user.role} />
                            <StatusBadge status={user.status} />
                            <StatusBadge status={user.verificationTier} />
                        </div>
                        <div style={{ display: 'flex', gap: 16, color: 'var(--text-muted)', fontSize: '0.82rem', flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={13} /> {user.phone}</span>
                            {user.email && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={13} /> {user.email}</span>}
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} /> {user.parish}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={13} /> Joined {user.registeredDate}</span>
                            {user.rating > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Star size={13} /> {user.rating}</span>}
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {canPerform('sendAlert') && (
                            <Link href={`/alerts/compose?user=${user.id}`} className="btn btn-secondary btn-sm">
                                <AlertTriangle size={14} /> Send Alert
                            </Link>
                        )}
                        {user.status === 'active' && canPerform('suspendUser') && (
                            <button className="btn btn-danger btn-sm" onClick={() => setModal({ type: 'suspend', open: true })}>
                                <Ban size={14} /> Suspend
                            </button>
                        )}
                        {user.status === 'suspended' && canPerform('reactivateUser') && (
                            <button className="btn btn-success btn-sm" onClick={() => setModal({ type: 'reactivate', open: true })}>
                                <Play size={14} /> Reactivate
                            </button>
                        )}
                        {user.status !== 'banned' && canPerform('banUser') && (
                            <button className="btn btn-danger btn-sm" onClick={() => setModal({ type: 'ban', open: true })}>
                                <Ban size={14} /> Ban
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    {tabs.map((t: any) => {
                        const Icon = t.icon;
                        return (
                            <button
                                key={t.key}
                                className={`tab ${activeTab === t.key ? 'active' : ''}`}
                                onClick={() => setActiveTab(t.key)}
                            >
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    <Icon size={14} /> {t.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                        <div className="card">
                            <div className="card-header"><h3>Registration Details</h3></div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <InfoRow label="TRN" value={maskTrn(user.trn)} />
                                <InfoRow label="Parish" value={user.parish} />
                                <InfoRow label="Registered" value={user.registeredDate} />
                                <InfoRow label="Last Active" value={user.lastActive} />
                                {user.licenceClass && <InfoRow label="Licence Class" value={user.licenceClass} />}
                                {user.licenceExpiry && <InfoRow label="Licence Expiry" value={user.licenceExpiry} />}
                                {user.tlcNumber && <InfoRow label="TLC Number" value={user.tlcNumber} />}
                                {user.businessName && <InfoRow label="Business" value={user.businessName} />}
                                {user.routeLicenceNumber && <InfoRow label="Route Licence" value={user.routeLicenceNumber} />}
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header"><h3>Verification Progress</h3></div>
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.82rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Profile Completeness</span>
                                    <span style={{ fontWeight: 700 }}>{completeness}%</span>
                                </div>
                                <div style={{ height: 8, borderRadius: 4, background: 'var(--surface-elevated)', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${completeness}%`, borderRadius: 4, background: completeness >= 80 ? 'var(--success)' : completeness >= 50 ? 'var(--warning)' : 'var(--error)', transition: 'width 0.5s ease' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {['Registered', 'Verified', 'Fully Verified'].map((tier, i) => {
                                    const tiers = ['registered', 'verified', 'fully_verified'];
                                    const currentIdx = tiers.indexOf(user.verificationTier);
                                    const done = i <= currentIdx;
                                    return (
                                        <div key={tier} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: done ? 'var(--success-muted)' : 'var(--surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: done ? 'var(--success)' : 'var(--text-muted)' }}>
                                                {done ? '✓' : i + 1}
                                            </div>
                                            <span style={{ fontSize: '0.85rem', color: done ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: done ? 500 : 400 }}>{tier}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {(user.role === 'driver' || user.role === 'dual') && (
                            <div className="card">
                                <div className="card-header"><h3>Driver Stats</h3></div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <InfoRow label="Total Trips" value={String(user.totalTrips ?? 0)} />
                                    <InfoRow label="Experience" value={`${user.experience ?? 0} years`} />
                                    <InfoRow label="Rating" value={user.rating > 0 ? `⭐ ${user.rating}` : 'No ratings yet'} />
                                </div>
                            </div>
                        )}

                        {(user.role === 'owner' || user.role === 'dual') && (
                            <div className="card">
                                <div className="card-header"><h3>Owner Details</h3></div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {user.businessName && <InfoRow label="Business" value={user.businessName} />}
                                    <InfoRow label="Vehicles" value={String(user.numberOfVehicles ?? 0)} />
                                    {user.primaryRoutes && user.primaryRoutes.map((r: any, i: number) => (
                                        <InfoRow key={i} label={i === 0 ? 'Routes' : ''} value={r} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {user.statusHistory.length > 0 && (
                            <div className="card" style={{ gridColumn: '1 / -1' }}>
                                <div className="card-header"><h3>Status History</h3></div>
                                <div className="timeline">
                                    {user.statusHistory.map((sh: any, i: number) => (
                                        <div key={i} className="timeline-item">
                                            <div className="timeline-date">{sh.changedAt}</div>
                                            <div className="timeline-title">{sh.from} → {sh.to}</div>
                                            <div className="timeline-desc">
                                                <strong>Reason:</strong> {sh.reason}<br />
                                                <strong>By:</strong> {sh.changedBy}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Document Type</th>
                                    <th>Upload Date</th>
                                    <th>Expiry Date</th>
                                    <th>Status</th>
                                    <th>Reviewed By</th>
                                    <th>Review Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {user.documents.length === 0 ? (
                                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No documents uploaded</td></tr>
                                ) : user.documents.map((doc: any) => (
                                    <tr key={doc.id}>
                                        <td style={{ fontWeight: 600 }}>{doc.type}</td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{doc.uploadDate}</td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{doc.expiryDate || '—'}</td>
                                        <td><StatusBadge status={doc.status} size="sm" /></td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{doc.reviewedBy || '—'}</td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{doc.reviewDate || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {user.documents.some((d: any) => d.rejectionReason) && (
                            <div style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
                                <h4 style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 8, color: 'var(--error)' }}>Rejection Notes</h4>
                                {user.documents.filter((d: any) => d.rejectionReason).map((d: any) => (
                                    <div key={d.id} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                                        <strong>{d.type}:</strong> {d.rejectionReason}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                    <div className="card">
                        <div className="card-header"><h3>User Activity</h3></div>
                        <div className="timeline">
                            <div className="timeline-item active">
                                <div className="timeline-date">{user.lastActive}</div>
                                <div className="timeline-title">Last Active</div>
                                <div className="timeline-desc">User was last active on the platform</div>
                            </div>
                            {user.documents.sort((a: any, b: any) => b.uploadDate.localeCompare(a.uploadDate)).slice(0, 5).map((doc: any, i: number) => (
                                <div key={i} className={`timeline-item ${doc.status === 'approved' ? 'success' : doc.status === 'rejected' ? 'error' : ''}`}>
                                    <div className="timeline-date">{doc.uploadDate}</div>
                                    <div className="timeline-title">Uploaded {doc.type}</div>
                                    <div className="timeline-desc">
                                        Status: <StatusBadge status={doc.status} size="sm" />
                                    </div>
                                </div>
                            ))}
                            <div className="timeline-item success">
                                <div className="timeline-date">{user.registeredDate}</div>
                                <div className="timeline-title">Registered</div>
                                <div className="timeline-desc">User created their account</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notes Tab */}
                {activeTab === 'notes' && (
                    <div>
                        {canPerform('addNote') && (
                            <div className="card" style={{ marginBottom: 16 }}>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <textarea
                                        className="form-textarea"
                                        placeholder="Add an internal note about this user..."
                                        value={newNote}
                                        onChange={e => setNewNote(e.target.value)}
                                        rows={2}
                                        style={{ flex: 1, minHeight: 60 }}
                                    />
                                    <button className="btn btn-primary" onClick={handleAddNote} disabled={!newNote.trim()} style={{ alignSelf: 'flex-end' }}>
                                        <Plus size={14} /> Add Note
                                    </button>
                                </div>
                            </div>
                        )}
                        {allNotes.length === 0 ? (
                            <div className="card empty-state">
                                <h3>No internal notes</h3>
                                <p>Add notes to keep track of interactions with this user.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {allNotes.sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt)).map((note: any) => (
                                    <div key={note.id} className="card" style={{ padding: 16 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                            <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{note.adminName}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{note.createdAt}</span>
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{note.note}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Modals */}
                <ConfirmModal
                    isOpen={modal.type === 'suspend' && modal.open}
                    title="Suspend User"
                    message={`Are you sure you want to suspend ${user.name}? They will not be able to apply for or post jobs while suspended.`}
                    confirmLabel="Suspend User"
                    confirmVariant="danger"
                    requireReason
                    reasonLabel="Suspension Reason"
                    onConfirm={() => setModal({ type: '', open: false })}
                    onCancel={() => setModal({ type: '', open: false })}
                />
                <ConfirmModal
                    isOpen={modal.type === 'reactivate' && modal.open}
                    title="Reactivate User"
                    message={`Are you sure you want to reactivate ${user.name}? They will regain full access based on their verification tier.`}
                    confirmLabel="Reactivate"
                    confirmVariant="success"
                    onConfirm={() => setModal({ type: '', open: false })}
                    onCancel={() => setModal({ type: '', open: false })}
                />
                <ConfirmModal
                    isOpen={modal.type === 'ban' && modal.open}
                    title="Ban User"
                    message={`Are you sure you want to permanently ban ${user.name}? This action is serious and cannot be easily undone. They will not be able to log in or re-register.`}
                    confirmLabel="Ban Permanently"
                    confirmVariant="danger"
                    requireReason
                    reasonLabel="Ban Reason"
                    onConfirm={() => setModal({ type: '', open: false })}
                    onCancel={() => setModal({ type: '', open: false })}
                />
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
