'use client';

import ProtectedLayout from '../components/ProtectedLayout';
import StatusBadge from '../components/StatusBadge';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';
import { insforge } from '../../lib/insforge';
import type { PlatformUser } from '../data/users';

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
    const [users, setUsers] = useState<PlatformUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const perPage = 10;

    useEffect(() => {
        async function fetchUsers() {
            setIsLoading(true);
            try {
                const { data, error: dbError } = await insforge.database
                    .from('users')
                    .select('*');

                if (dbError) throw dbError;

                // Map database snake_case columns back to the camelCase frontend types
                const formattedUsers: PlatformUser[] = (data || []).map((u: any) => ({
                    id: u.id,
                    name: u.name,
                    avatar: u.avatar || '',
                    phone: u.phone || '',
                    email: u.email || '',
                    trn: u.trn || '',
                    parish: u.parish || '',
                    role: u.role,
                    status: u.status,
                    verificationTier: u.verification_tier,
                    rating: parseFloat(u.rating) || 0,
                    registeredDate: new Date(u.registered_date).toISOString().split('T')[0],
                    lastActive: new Date(u.last_active).toISOString().split('T')[0],
                    documents: [], // To be fetched separately if needed
                    notes: [],
                    statusHistory: [],
                    licenceClass: u.licence_class,
                    licenceExpiry: u.licence_expiry,
                    tlcNumber: u.tlc_number,
                    totalTrips: u.total_trips,
                    experience: u.experience,
                    businessName: u.business_name,
                    routeLicenceNumber: u.route_licence_number,
                    numberOfVehicles: u.number_of_vehicles,
                    primaryRoutes: u.primary_routes || [],
                }));

                setUsers(formattedUsers);
            } catch (err: any) {
                console.error("Failed to fetch users:", err);
                setError("Failed to load users from the platform.");
            } finally {
                setIsLoading(false);
            }
        }

        fetchUsers();
    }, []);

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
        let currentUsers = [...users];

        if (search) {
            const q = search.toLowerCase();
            currentUsers = currentUsers.filter(u =>
                u.name.toLowerCase().includes(q) ||
                u.phone.includes(q) ||
                u.trn.includes(q) ||
                (u.email && u.email.toLowerCase().includes(q))
            );
        }
        if (roleFilter) currentUsers = currentUsers.filter(u => u.role === roleFilter);
        if (statusFilter) currentUsers = currentUsers.filter(u => u.status === statusFilter);
        if (tierFilter) currentUsers = currentUsers.filter(u => u.verificationTier === tierFilter);

        currentUsers.sort((a, b) => {
            const av = a[sortKey] ?? '';
            const bv = b[sortKey] ?? '';
            const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
            return sortDir === 'asc' ? cmp : -cmp;
        });

        return currentUsers;
    }, [search, roleFilter, statusFilter, tierFilter, sortKey, sortDir, users]);

    const totalPages = Math.ceil(filtered.length / perPage);
    const paged = filtered.slice((page - 1) * perPage, page * perPage);

    const maskTrn = (trn: string) => '***' + trn.slice(-6);

    return (
        <ProtectedLayout>
            <div className="animate-in">
                <div className="page-header">
                    <div>
                        <h1>User Management</h1>
                        <p>{isLoading ? 'Loading...' : `${users.length} registered users on the platform`}</p>
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
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={9} style={{ textAlign: 'center', padding: '40px' }}>
                                            Loading users...
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--error)' }}>
                                            {error}
                                        </td>
                                    </tr>
                                ) : paged.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                            No users found matching your filters.
                                        </td>
                                    </tr>
                                ) : paged.map(user => (
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
