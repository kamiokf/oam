'use client';

import ProtectedLayout from '../components/ProtectedLayout';
import StatusBadge from '../components/StatusBadge';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Search, Filter, ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';
import { mockUsers, type PlatformUser } from '../data/users';

type SortKey = 'name' | 'role' | 'parish' | 'verificationTier' | 'status' | 'registeredDate' | 'lastActive' | 'rating';
type SortDir = 'asc' | 'desc';

export default function UsersPage() {
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [tierFilter, setTierFilter] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('registeredDate');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [page, setPage] = useState(1);
    const perPage = 10;

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    const SortIcon = ({ col }: { col: SortKey }) => {
        if (sortKey !== col) return <ArrowUpDown size={12} style={{ opacity: 0.3 }} />;
        return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
    };

    const filtered = useMemo(() => {
        let users = [...mockUsers];

        if (search) {
            const q = search.toLowerCase();
            users = users.filter(u =>
                u.name.toLowerCase().includes(q) ||
                u.phone.includes(q) ||
                u.trn.includes(q) ||
                (u.email && u.email.toLowerCase().includes(q))
            );
        }
        if (roleFilter) users = users.filter(u => u.role === roleFilter);
        if (statusFilter) users = users.filter(u => u.status === statusFilter);
        if (tierFilter) users = users.filter(u => u.verificationTier === tierFilter);

        users.sort((a, b) => {
            const av = a[sortKey] ?? '';
            const bv = b[sortKey] ?? '';
            const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
            return sortDir === 'asc' ? cmp : -cmp;
        });

        return users;
    }, [search, roleFilter, statusFilter, tierFilter, sortKey, sortDir]);

    const totalPages = Math.ceil(filtered.length / perPage);
    const paged = filtered.slice((page - 1) * perPage, page * perPage);

    const maskTrn = (trn: string) => '***' + trn.slice(-6);

    return (
        <ProtectedLayout>
            <div className="animate-in">
                <div className="page-header">
                    <div>
                        <h1>User Management</h1>
                        <p>{mockUsers.length} registered users on the platform</p>
                    </div>
                </div>

                <div className="table-container">
                    <div className="table-toolbar">
                        <div className="table-search">
                            <Search size={16} className="search-icon" />
                            <input
                                placeholder="Search by name, phone, TRN, or email..."
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1); }}
                            />
                        </div>
                        <select
                            className="form-select"
                            value={roleFilter}
                            onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
                            style={{ width: 130 }}
                        >
                            <option value="">All Roles</option>
                            <option value="driver">Driver</option>
                            <option value="owner">Owner</option>
                            <option value="dual">Dual</option>
                        </select>
                        <select
                            className="form-select"
                            value={statusFilter}
                            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                            style={{ width: 140 }}
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                            <option value="deactivated">Deactivated</option>
                            <option value="banned">Banned</option>
                        </select>
                        <select
                            className="form-select"
                            value={tierFilter}
                            onChange={e => { setTierFilter(e.target.value); setPage(1); }}
                            style={{ width: 160 }}
                        >
                            <option value="">All Tiers</option>
                            <option value="registered">Registered</option>
                            <option value="verified">Verified</option>
                            <option value="fully_verified">Fully Verified</option>
                        </select>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort('name')} className={sortKey === 'name' ? 'sorted' : ''}>User <SortIcon col="name" /></th>
                                    <th>TRN</th>
                                    <th onClick={() => handleSort('role')} className={sortKey === 'role' ? 'sorted' : ''}>Role <SortIcon col="role" /></th>
                                    <th onClick={() => handleSort('parish')} className={sortKey === 'parish' ? 'sorted' : ''}>Parish <SortIcon col="parish" /></th>
                                    <th onClick={() => handleSort('verificationTier')} className={sortKey === 'verificationTier' ? 'sorted' : ''}>Tier <SortIcon col="verificationTier" /></th>
                                    <th onClick={() => handleSort('status')} className={sortKey === 'status' ? 'sorted' : ''}>Status <SortIcon col="status" /></th>
                                    <th onClick={() => handleSort('rating')} className={sortKey === 'rating' ? 'sorted' : ''}>Rating <SortIcon col="rating" /></th>
                                    <th onClick={() => handleSort('registeredDate')} className={sortKey === 'registeredDate' ? 'sorted' : ''}>Registered <SortIcon col="registeredDate" /></th>
                                    <th onClick={() => handleSort('lastActive')} className={sortKey === 'lastActive' ? 'sorted' : ''}>Last Active <SortIcon col="lastActive" /></th>
                                </tr>
                            </thead>
                            <tbody>
                                {paged.map(user => (
                                    <tr key={user.id} style={{ cursor: 'pointer' }}>
                                        <td>
                                            <Link href={`/users/${user.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <div className="user-cell">
                                                    <div className={`avatar avatar-sm ${user.role === 'owner' ? 'avatar-purple' : user.role === 'dual' ? 'avatar-blue' : 'avatar-gold'}`}>
                                                        {user.avatar}
                                                    </div>
                                                    <div>
                                                        <div className="user-name">{user.name}</div>
                                                        <div className="user-sub">{user.phone}</div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </td>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{maskTrn(user.trn)}</td>
                                        <td><StatusBadge status={user.role} size="sm" /></td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{user.parish}</td>
                                        <td><StatusBadge status={user.verificationTier} size="sm" /></td>
                                        <td><StatusBadge status={user.status} size="sm" /></td>
                                        <td>
                                            {user.rating > 0 ? (
                                                <span style={{ fontWeight: 600 }}>⭐ {user.rating}</span>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)' }}>—</span>
                                            )}
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{user.registeredDate}</td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{user.lastActive}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="table-pagination">
                        <span>Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length} users</span>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedLayout>
    );
}
