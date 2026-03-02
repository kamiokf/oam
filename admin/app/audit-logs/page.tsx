'use client';

import ProtectedLayout from '../components/ProtectedLayout';
import StatusBadge from '../components/StatusBadge';
import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Shield, AlertTriangle } from 'lucide-react';
import { insforge } from '../../lib/insforge';

export default function AuditLogsPage() {
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [adminFilter, setAdminFilter] = useState('');
    const [logs, setLogs] = useState<any[]>([]);
    const [admins, setAdmins] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    async function fetchLogs() {
        try {
            setIsLoading(true);
            const { data: logData, error: logErr } = await insforge.database
                .from('audit_logs')
                .select('*')
                .order('created_at', { ascending: false });

            if (logErr) throw logErr;
            setLogs(logData || []);

            const { data: adminData, error: adminErr } = await insforge.database
                .from('admin_users')
                .select('id, full_name, avatar');

            if (adminErr) throw adminErr;
            setAdmins(adminData || []);

        } catch (err) {
            console.error('Failed to fetch audit logs:', err);
        } finally {
            setIsLoading(false);
        }
    }

    const filteredLogs = useMemo(() => {
        let list = [...logs];

        if (search) {
            const q = search.toLowerCase();
            list = list.filter(l =>
                l.details?.toLowerCase().includes(q) ||
                l.target_id?.toLowerCase().includes(q) ||
                l.ip_address?.toLowerCase().includes(q)
            );
        }

        if (actionFilter) {
            list = list.filter(l => l.action_type === actionFilter);
        }

        if (adminFilter) {
            list = list.filter(l => l.admin_user_id === adminFilter);
        }

        return list; // Assuming already sorted from Supabase
    }, [search, actionFilter, adminFilter, logs]);

    // Extract unique action types for the filter dropdown
    const actionTypes = useMemo(() => {
        const types = new Set(logs.map(l => l.action_type));
        return Array.from(types).sort();
    }, [logs]);

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
                            {admins.map(admin => (
                                <option key={admin.id} value={admin.id}>{admin.full_name}</option>
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
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="empty-state">
                                        Loading audit logs...
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="empty-state">
                                        No audit logs found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map(log => {
                                    const admin = admins.find(a => a.id === log.admin_user_id);
                                    return (
                                        <tr key={log.id}>
                                            <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div className="avatar avatar-sm avatar-gold">
                                                        {admin?.avatar || 'AD'}
                                                    </div>
                                                    <span style={{ fontWeight: 500 }}>{admin?.full_name || 'Unknown Admin'}</span>
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
                                                    {formatActionType(log.action_type)}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '0.88rem', maxWidth: 400, lineHeight: 1.4 }}>
                                                    {log.details}
                                                    {log.target_id && (
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                                            Target: <span style={{ fontFamily: 'monospace' }}>{log.target_type}:{log.target_id}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                {log.ip_address}
                                            </td>
                                        </tr>
                                    );
                                })
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
