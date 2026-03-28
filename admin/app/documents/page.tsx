'use client';

import ProtectedLayout from '../components/ProtectedLayout';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { Search, Clock, CheckCircle, XCircle, RotateCcw, Flag, SkipForward, FileText, User } from 'lucide-react';
import { REJECTION_REASONS, type DocumentQueueItem } from '../data/documents';
import { insforge } from '../../lib/insforge';

export default function DocumentsPage() {
    const [queue, setQueue] = useState<DocumentQueueItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending');
    const [selectedDoc, setSelectedDoc] = useState<DocumentQueueItem | null>(null);
    const [reviewModal, setReviewModal] = useState<{ action: string; open: boolean }>({ action: '', open: false });
    const [rejectionReason, setRejectionReason] = useState('');
    const [rejectionNote, setRejectionNote] = useState('');

    useEffect(() => {
        fetchDocuments();
    }, []);

    async function fetchDocuments() {
        try {
            setIsLoading(true);
            const { data, error } = await insforge.database
                .from('user_documents')
                .select('*, user:user_id(name, role), admin:assigned_to(full_name)')
                .order('upload_date', { ascending: false });

            if (error) throw error;

            const mapped: DocumentQueueItem[] = (data || []).map(d => {
                const userObj = Array.isArray(d.user) ? d.user[0] : (d.user || {});
                const adminObj = Array.isArray(d.admin) ? d.admin[0] : (d.admin || {});
                const uName = userObj.name || 'Unknown';
                return {
                    id: d.id,
                    userId: d.user_id,
                    userName: uName,
                    userAvatar: uName.substring(0, 2).toUpperCase(),
                    userRole: userObj.role || 'driver',
                    documentType: d.type,
                    uploadDate: d.upload_date,
                    status: d.status,
                    priority: d.priority,
                    assignedTo: d.assigned_to,
                    assignedToName: adminObj.full_name || null,
                    expiryDate: d.expiry_date,
                    rejectionReason: d.rejection_reason,
                    fileType: d.file_type || 'image/jpeg',
                    fileUrl: d.file_url || null,
                };
            });
            setQueue(mapped);
        } catch (err) {
            console.error('Failed to fetch documents:', err);
        } finally {
            setIsLoading(false);
        }
    }

    const filtered = useMemo(() => {
        let docs = [...queue];
        if (search) {
            const q = search.toLowerCase();
            docs = docs.filter(d => d.userName.toLowerCase().includes(q) || d.documentType.toLowerCase().includes(q));
        }
        if (typeFilter) docs = docs.filter(d => d.documentType === typeFilter);
        if (priorityFilter) docs = docs.filter(d => d.priority === priorityFilter);
        if (statusFilter) docs = docs.filter(d => d.status === statusFilter);
        return docs;
    }, [queue, search, typeFilter, priorityFilter, statusFilter]);

    const handleReview = async (action: string, reason?: string) => {
        if (!selectedDoc) return;

        const newStatus = action === 'approve' ? 'approved'
            : action === 'reject' ? 'rejected'
                : action === 'reupload' ? 'reupload_requested'
                    : action === 'flag' ? 'flagged'
                        : selectedDoc.status;

        const newReason = action === 'reject' ? (rejectionReason + (rejectionNote ? ` — ${rejectionNote}` : '')) : selectedDoc.rejectionReason;

        try {
            const { error } = await insforge.database
                .from('user_documents')
                .update({ status: newStatus, rejection_reason: newReason, review_date: new Date().toISOString() })
                .eq('id', selectedDoc.id);

            if (error) throw error;

            setQueue(prev => prev.map(d => d.id === selectedDoc.id ? { ...d, status: newStatus as any, rejectionReason: newReason } : d));

            // Auto-verify: check if all docs for this user are now approved
            if (action === 'approve') {
                const userDocs = queue.filter(d => d.userId === selectedDoc.userId);
                const allApproved = userDocs.every(d =>
                    d.id === selectedDoc.id ? true : d.status === 'approved'
                );
                if (allApproved && userDocs.length >= 2) {
                    // Update user verification tier
                    await insforge.database
                        .from('users')
                        .update({ verification_tier: 'verified', updated_at: new Date().toISOString() })
                        .eq('id', selectedDoc.userId);

                    // Create notification for the user
                    await insforge.database
                        .from('notifications')
                        .insert([{
                            user_id: selectedDoc.userId,
                            type: 'document_status',
                            title: 'Documents Verified!',
                            message: 'All your documents have been approved. Your account is now verified!',
                            data: { verificationTier: 'verified' },
                        }]);
                }
            }

            // Notify user of individual document status change
            if (action === 'approve' || action === 'reject') {
                const statusText = action === 'approve' ? 'approved' : 'rejected';
                await insforge.database
                    .from('notifications')
                    .insert([{
                        user_id: selectedDoc.userId,
                        type: 'document_status',
                        title: `Document ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
                        message: `Your ${selectedDoc.documentType} has been ${statusText}.${action === 'reject' && newReason ? ` Reason: ${newReason}` : ''}`,
                        data: { documentType: selectedDoc.documentType, status: statusText },
                    }]);
            }
        } catch (err) {
            console.error('Failed to update document status:', err);
            alert('Failed to update document status');
        }

        setSelectedDoc(null);
        setReviewModal({ action: '', open: false });
        setRejectionReason('');
        setRejectionNote('');
    };

    const getTimeInQueue = (uploadDate: string) => {
        const now = new Date('2026-02-28T23:00:00');
        const upload = new Date(uploadDate);
        const hours = Math.floor((now.getTime() - upload.getTime()) / (1000 * 60 * 60));
        if (hours < 24) return { text: `${hours}h`, color: 'var(--success)' };
        const days = Math.floor(hours / 24);
        if (days <= 2) return { text: `${days}d ${hours % 24}h`, color: 'var(--warning)' };
        return { text: `${days}d`, color: 'var(--error)' };
    };

    const docTypes = [...new Set(queue.map(d => d.documentType))];

    return (
        <ProtectedLayout>
            <div className="animate-in">
                <div className="page-header">
                    <div>
                        <h1>Document Verification</h1>
                        <p>{queue.filter(d => d.status === 'pending').length} documents pending review</p>
                    </div>
                </div>

                {/* Detail View (when a doc is selected) */}
                {selectedDoc ? (
                    <div>
                        <button className="btn btn-ghost" onClick={() => setSelectedDoc(null)} style={{ marginBottom: 16 }}>
                            ← Back to Queue
                        </button>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
                            {/* Document Viewer */}
                            <div className="card" style={{ minHeight: 400 }}>
                                <div className="card-header">
                                    <h3>Document Preview</h3>
                                    <StatusBadge status={selectedDoc.status} />
                                </div>
                                <div style={{
                                    height: 350,
                                    borderRadius: 'var(--radius)',
                                    background: 'var(--surface-elevated)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid var(--border)',
                                    overflow: 'hidden',
                                }}>
                                    {(selectedDoc as any).fileUrl ? (
                                        <img
                                            src={(selectedDoc as any).fileUrl}
                                            alt={selectedDoc.documentType}
                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                            <FileText size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
                                            <p style={{ fontSize: '0.85rem' }}>{selectedDoc.documentType}</p>
                                            <p style={{ fontSize: '0.75rem' }}>No file uploaded</p>
                                            <p style={{ fontSize: '0.72rem', marginTop: 4 }}>File type: {selectedDoc.fileType}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Review Panel */}
                            <div>
                                <div className="card" style={{ marginBottom: 16 }}>
                                    <div className="card-header"><h3>User Information</h3></div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                        <div className="avatar avatar-md avatar-gold">{selectedDoc.userAvatar}</div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{selectedDoc.userName}</div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                                <StatusBadge status={selectedDoc.userRole} size="sm" />
                                            </div>
                                        </div>
                                        <Link href={`/users/${selectedDoc.userId}`} className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}>
                                            <User size={14} /> View Profile
                                        </Link>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.82rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Document Type</span>
                                            <span style={{ fontWeight: 500 }}>{selectedDoc.documentType}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Upload Date</span>
                                            <span>{new Date(selectedDoc.uploadDate).toLocaleDateString()}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Priority</span>
                                            <StatusBadge status={selectedDoc.priority} size="sm" />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Time in Queue</span>
                                            <span style={{ color: getTimeInQueue(selectedDoc.uploadDate).color, fontWeight: 600 }}>
                                                {getTimeInQueue(selectedDoc.uploadDate).text}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {selectedDoc.status === 'pending' && (
                                    <div className="card">
                                        <div className="card-header"><h3>Review Actions</h3></div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            <button className="btn btn-success" onClick={() => handleReview('approve')} style={{ width: '100%' }}>
                                                <CheckCircle size={16} /> Approve Document
                                            </button>
                                            <button className="btn btn-danger" onClick={() => setReviewModal({ action: 'reject', open: true })} style={{ width: '100%' }}>
                                                <XCircle size={16} /> Reject Document
                                            </button>
                                            <button className="btn btn-secondary" onClick={() => handleReview('reupload')} style={{ width: '100%' }}>
                                                <RotateCcw size={16} /> Request Re-upload
                                            </button>
                                            <button className="btn btn-secondary" onClick={() => handleReview('flag')} style={{ width: '100%' }}>
                                                <Flag size={16} /> Flag for Review
                                            </button>
                                            <button className="btn btn-ghost" onClick={() => setSelectedDoc(null)} style={{ width: '100%' }}>
                                                <SkipForward size={16} /> Skip
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Rejection Modal */}
                        {reviewModal.action === 'reject' && reviewModal.open && (
                            <div className="modal-overlay" onClick={() => setReviewModal({ action: '', open: false })}>
                                <div className="modal" onClick={e => e.stopPropagation()}>
                                    <h2>Reject Document</h2>
                                    <p>Select a reason for rejecting this {selectedDoc.documentType}.</p>
                                    <div className="form-group">
                                        <label className="form-label">Rejection Reason *</label>
                                        <select className="form-select" value={rejectionReason} onChange={e => setRejectionReason(e.target.value)}>
                                            <option value="">Select a reason...</option>
                                            {REJECTION_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Additional Notes</label>
                                        <textarea
                                            className="form-textarea"
                                            value={rejectionNote}
                                            onChange={e => setRejectionNote(e.target.value)}
                                            placeholder="Any additional details for the user..."
                                            rows={2}
                                        />
                                    </div>
                                    <div className="modal-actions">
                                        <button className="btn btn-secondary" onClick={() => setReviewModal({ action: '', open: false })}>Cancel</button>
                                        <button className="btn btn-danger" onClick={() => handleReview('reject')} disabled={!rejectionReason}>Reject</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Queue Table */
                    <div className="table-container">
                        <div className="table-toolbar">
                            <div className="table-search">
                                <Search size={16} className="search-icon" />
                                <input placeholder="Search by user or document type..." value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                            <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 140 }}>
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="flagged">Flagged</option>
                                <option value="reupload_requested">Re-upload</option>
                            </select>
                            <select className="form-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ width: 180 }}>
                                <option value="">All Types</option>
                                {docTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <select className="form-select" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={{ width: 120 }}>
                                <option value="">All Priority</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Document Type</th>
                                    <th>Uploaded</th>
                                    <th>Time in Queue</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Assigned To</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan={8} className="empty-state">Loading documents...</td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={8} className="empty-state">No documents match your filters</td></tr>
                                ) : filtered.map(doc => {
                                    const tiq = getTimeInQueue(doc.uploadDate);
                                    return (
                                        <tr key={doc.id}>
                                            <td>
                                                <div className="user-cell">
                                                    <div className="avatar avatar-sm avatar-gold">{doc.userAvatar}</div>
                                                    <div>
                                                        <div className="user-name">{doc.userName}</div>
                                                        <div className="user-sub"><StatusBadge status={doc.userRole} size="sm" /></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: 500 }}>{doc.documentType}</td>
                                            <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{new Date(doc.uploadDate).toLocaleDateString()}</td>
                                            <td>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: '0.82rem', color: tiq.color }}>
                                                    <Clock size={13} /> {tiq.text}
                                                </span>
                                            </td>
                                            <td><StatusBadge status={doc.priority} size="sm" /></td>
                                            <td><StatusBadge status={doc.status} size="sm" /></td>
                                            <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                                {doc.assignedToName || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}
                                            </td>
                                            <td>
                                                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDoc(doc)}>
                                                    Review
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </ProtectedLayout>
    );
}
