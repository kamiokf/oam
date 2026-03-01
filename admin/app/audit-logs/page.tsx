'use client';

import ProtectedLayout from '../components/ProtectedLayout';
import StatusBadge from '../components/StatusBadge';
import { useState, useMemo } from 'react';
import { Search, Filter, Shield, AlertTriangle } from 'lucide-react';
import { mockAuditLog, mockAdminUsers } from '../data/admin-users';

export default function AuditLogsPage() {
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [adminFilter, setAdminFilter] = useState('');

    const filteredLogs = useMemo(() => {
        let list = [...mockAuditLog];

        if (search) {
            const q = search.toLowerCase();
            list = list.filter(l =>
                l.details.toLowerCase().includes(q) ||
                l.targetId?.toLowerCase().includes(q) ||
                l.ipAddress?.toLowerCase().includes(q)
            );
        }

        if (actionFilter) {
            list = list.filter(l => l.actionType === actionFilter);
        }

        if (adminFilter) {
            list = list.filter(l => l.adminUserId === adminFilter);
        }

        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [search, actionFilter, adminFilter]);

    // Extract unique action types for the filter dropdown
    const actionTypes = useMemo(() => {
        const types = new Set(mockAuditLog.map(l => l.actionType));
        return Array.from(types).sort();
    }, []);

    const formatActionType = (type: string) => {
        return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    return (
        <ProtectedLayout requirePermission="viewAuditLog">
            <div className="animate-in">
                <div className="page-header">
                    <div>
                        <h1>Audit Logs</h1>
                        <p>Track and monitor all administrative actions across the platform.</p>
                    </div>
                </div>

                <div className="table-container">
                    <div className="table-toolbar">
                        <div className="table-search" style={{ flex: 1, minWidth: 250 }}>
                            <Search size={16} className="search-icon" />
                            <input
                                placeholder="Search details, target ID, or IP..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <select
                            className="form-select"
                            value={adminFilter}
                            onChange={e => setAdminFilter(e.target.value)}
                            style={{ width: 180 }}
                        >
                            <option value="">All Admins</option>
                            {mockAdminUsers.map(admin => (
                                <option key={admin.id} value={admin.id}>{admin.fullName}</option>
                            ))}
                        </select>
                        <select
                            className="form-select"
                            value={actionFilter}
                            onChange={e => setActionFilter(e.target.value)}
                            style={{ width: 180 }}
                        >
                            <option value="">All Actions</option>
                            {actionTypes.map(type => (
                                <option key={type} value={type}>{formatActionType(type)}</option>
                            ))}
                        </select>
                    </div>

                    <table style={{ minWidth: 900 }}>
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Admin User</th>
                                <th>Action</th>
                                <th>Details</th>
                                <th>IP Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="empty-state">
                                        No audit logs found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map(log => (
                                    <tr key={log.id}>
                                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div className="avatar avatar-sm avatar-gold">
                                                    {mockAdminUsers.find(a => a.id === log.adminUserId)?.avatar || 'AD'}
                                                </div>
                                                <span style={{ fontWeight: 500 }}>{log.adminName}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                padding: '4px 8px',
                                                background: 'var(--surface-elevated)',
                                                border: '1px solid var(--border)',
                                                borderRadius: 4,
                                                display: 'inline-block'
                                            }}>
                                                {formatActionType(log.actionType)}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.88rem', maxWidth: 400, lineHeight: 1.4 }}>
                                                {log.details}
                                                {log.targetId && (
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                                        Target: <span style={{ fontFamily: 'monospace' }}>{log.targetType}:{log.targetId}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {log.ipAddress}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    <div className="table-pagination">
                        <span>Showing {filteredLogs.length} log entr{filteredLogs.length !== 1 ? 'ies' : 'y'}</span>
                    </div>
                </div>
            </div>
        </ProtectedLayout>
    );
}
