'use client';

import { useState } from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    confirmVariant?: 'danger' | 'primary' | 'success';
    requireReason?: boolean;
    reasonLabel?: string;
    onConfirm: (reason?: string) => void;
    onCancel: () => void;
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    confirmVariant = 'primary',
    requireReason = false,
    reasonLabel = 'Reason',
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    const btnClass = confirmVariant === 'danger' ? 'btn btn-danger' : confirmVariant === 'success' ? 'btn btn-success' : 'btn btn-primary';

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h2>{title}</h2>
                <p>{message}</p>
                {requireReason && (
                    <div className="form-group">
                        <label className="form-label">{reasonLabel} *</label>
                        <textarea
                            className="form-textarea"
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="Enter a reason..."
                            rows={3}
                        />
                    </div>
                )}
                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                    <button
                        className={btnClass}
                        onClick={() => { onConfirm(reason); setReason(''); }}
                        disabled={requireReason && !reason.trim()}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
