'use client';

import ProtectedLayout from '../components/ProtectedLayout';
import StatusBadge from '../components/StatusBadge';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, ChevronUp, ChevronDown, ArrowUpDown, Briefcase, Calendar, Flag, Trash2 } from 'lucide-react';
import { insforge } from '../../lib/insforge';
import ConfirmModal from '../components/ConfirmModal';

type SortKey = 'route' | 'vehicleType' | 'dailyPay' | 'status' | 'postedDate';
type SortDir = 'asc' | 'desc';

export default function JobsPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('postedDate');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [page, setPage] = useState(1);
    const [jobs, setJobs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionJob, setActionJob] = useState<{ job: any; action: 'flag' | 'remove' } | null>(null);
    const perPage = 10;

    useEffect(() => {
        async function fetchJobs() {
            setIsLoading(true);
            try {
                // Fetch jobs and users to map owner details
                const [jobsRes, usersRes] = await Promise.all([
                    insforge.database.from('jobs').select('*'),
                    insforge.database.from('users').select('id, name, avatar, rating')
                ]);

                if (jobsRes.error) throw jobsRes.error;

                const usersMap = new Map((usersRes.data || []).map((u: any) => [u.id, u]));

                const formattedJobs = (jobsRes.data || []).map((j: any) => {
                    const owner = (usersMap.get(j.owner_id) || {}) as any;
                    return {
                        id: j.id,
                        ownerId: j.owner_id,
                        ownerName: owner?.name || 'Unknown Owner',
                        ownerRating: owner?.rating || 0,
                        ownerAvatar: owner?.avatar || '',
                        vehicleType: j.vehicle_type,
                        vehiclePlate: j.vehicle_plate,
                        routeFrom: j.route_from,
                        routeTo: j.route_to,
                        dailyPay: parseFloat(j.daily_pay) || 0,
                        schedule: j.schedule,
                        requirements: j.requirements || [],
                        description: j.description || '',
                        postedDate: new Date(j.posted_date).toISOString().split('T')[0],
                        status: j.status,
                        applicants: j.applicants,
                        isSmartMatch: j.is_smart_match,
                        matchScore: j.match_score,
                    };
                });

                setJobs(formattedJobs);
            } catch (err: any) {
                console.error("Failed to fetch jobs:", err);
                setError("Failed to load jobs from the platform.");
            } finally {
                setIsLoading(false);
            }
        }

        fetchJobs();
    }, []);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
        if (sortKey !== columnKey) return <ArrowUpDown size={14} color="var(--text-muted)" style={{ opacity: 0.3 }} />;
        return sortDir === 'asc' ? <ChevronUp size={14} color="var(--primary)" /> : <ChevronDown size={14} color="var(--primary)" />;
    };

    const filtered = useMemo(() => {
        let currentJobs = [...jobs];

        if (search) {
            const q = search.toLowerCase();
            currentJobs = currentJobs.filter(j =>
                j.ownerName.toLowerCase().includes(q) ||
                j.routeFrom.toLowerCase().includes(q) ||
                j.routeTo.toLowerCase().includes(q) ||
                j.vehiclePlate.toLowerCase().includes(q)
            );
        }

        if (statusFilter) currentJobs = currentJobs.filter(j => j.status === statusFilter);

        currentJobs.sort((a, b) => {
            let av: any = a[sortKey];
            let bv: any = b[sortKey];

            if (sortKey === 'route') {
                av = `${a.routeFrom} ${a.routeTo}`;
                bv = `${b.routeFrom} ${b.routeTo}`;
            }

            const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
            return sortDir === 'asc' ? cmp : -cmp;
        });

        return currentJobs;
    }, [search, statusFilter, sortKey, sortDir, jobs]);

    const handleJobAction = async (reason?: string) => {
        if (!actionJob) return;
        const { job, action } = actionJob;
        const newStatus = action === 'flag' ? 'flagged' : 'closed';

        try {
            const { error: updateError } = await insforge.database
                .from('jobs')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', job.id);
            if (updateError) throw updateError;

            // Notify the job owner
            const notifMsg = action === 'flag'
                ? `Your job posting for ${job.routeFrom} → ${job.routeTo} has been flagged by an admin.${reason ? ` Reason: ${reason}` : ''}`
                : `Your job posting for ${job.routeFrom} → ${job.routeTo} has been removed by an admin.${reason ? ` Reason: ${reason}` : ''}`;

            await insforge.database.from('notifications').insert({
                user_id: job.ownerId,
                type: 'job_moderation',
                title: action === 'flag' ? 'Job Posting Flagged' : 'Job Posting Removed',
                message: notifMsg,
                data: { jobId: job.id, action: newStatus, reason },
            });

            setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: newStatus } : j));
        } catch (err) {
            console.error('Failed to update job:', err);
            alert('Failed to update job status.');
        }
        setActionJob(null);
    };

    const totalPages = Math.ceil(filtered.length / perPage);
    const paged = filtered.slice((page - 1) * perPage, page * perPage);

    return (
        <ProtectedLayout>
            <div className="animate-in">
                <div className="page-header">
                    <div>
                        <h1>Job Postings</h1>
                        <p>{isLoading ? 'Loading...' : `${jobs.length} active job listings on the platform`}</p>
                    </div>
                </div>

                <div className="card">
                    <div className="table-toolbar">
                        <div className="table-search">
                            <Search size={16} color="var(--text-muted)" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search by owner, route, or plate..."
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1); }}
                            />
                        </div>
                        <div className="table-filters">
                            <select
                                value={statusFilter}
                                onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                                className="filter-select"
                            >
                                <option value="">All Statuses</option>
                                <option value="open">Open</option>
                                <option value="filled">Filled</option>
                                <option value="closed">Closed</option>
                                <option value="flagged">Flagged</option>
                            </select>
                            <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Filter size={14} /> Filter
                            </button>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort('route')} style={{ cursor: 'pointer' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>Route <SortIcon columnKey="route" /></div>
                                    </th>
                                    <th>Owner</th>
                                    <th onClick={() => handleSort('vehicleType')} style={{ cursor: 'pointer' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>Vehicle <SortIcon columnKey="vehicleType" /></div>
                                    </th>
                                    <th onClick={() => handleSort('dailyPay')} style={{ cursor: 'pointer' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>Daily Pay <SortIcon columnKey="dailyPay" /></div>
                                    </th>
                                    <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>Status <SortIcon columnKey="status" /></div>
                                    </th>
                                    <th onClick={() => handleSort('postedDate')} style={{ cursor: 'pointer' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>Posted <SortIcon columnKey="postedDate" /></div>
                                    </th>
                                    <th>Applicants</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>Loading jobs...</td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--error)' }}>{error}</td>
                                    </tr>
                                ) : paged.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No jobs found matching your filters.</td>
                                    </tr>
                                ) : paged.map(job => (
                                    <tr key={job.id} style={{ cursor: 'pointer' }}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{job.routeFrom}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>To {job.routeTo}</div>
                                        </td>
                                        <td>
                                            <div className="user-cell">
                                                <div className="avatar avatar-sm avatar-gold">{job.ownerAvatar}</div>
                                                <div>
                                                    <div className="user-name">{job.ownerName}</div>
                                                    <div className="user-sub">★ {job.ownerRating.toFixed(1)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{job.vehicleType}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{job.vehiclePlate}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600, color: 'var(--success)' }}>
                                                JMD ${(job.dailyPay || 0).toLocaleString()}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ day</div>
                                        </td>
                                        <td><StatusBadge status={job.status} size="sm" /></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
                                                <Calendar size={14} color="var(--text-muted)" />
                                                {job.postedDate}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary-muted)', color: 'var(--primary)', width: 28, height: 28, borderRadius: 14, fontWeight: 600, fontSize: '0.85rem' }}>
                                                {job.applicants}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                {job.status === 'open' && (
                                                    <>
                                                        <button
                                                            className="btn btn-outline btn-sm"
                                                            title="Flag posting"
                                                            onClick={() => setActionJob({ job, action: 'flag' })}
                                                            style={{ padding: '4px 8px', minWidth: 0 }}
                                                        >
                                                            <Flag size={14} />
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            title="Remove posting"
                                                            onClick={() => setActionJob({ job, action: 'remove' })}
                                                            style={{ padding: '4px 8px', minWidth: 0 }}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </>
                                                )}
                                                {job.status === 'flagged' && (
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        title="Remove posting"
                                                        onClick={() => setActionJob({ job, action: 'remove' })}
                                                        style={{ padding: '4px 8px', minWidth: 0 }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {!isLoading && totalPages > 1 && (
                    <div className="pagination">
                        <button
                            className="btn btn-outline btn-sm"
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                        >
                            Previous
                        </button>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Page {page} of {totalPages}
                        </span>
                        <button
                            className="btn btn-outline btn-sm"
                            disabled={page === totalPages}
                            onClick={() => setPage(page + 1)}
                        >
                            Next
                        </button>
                    </div>
                )}

                <ConfirmModal
                    isOpen={!!actionJob && actionJob.action === 'flag'}
                    title="Flag Job Posting"
                    message={`Flag the ${actionJob?.job?.routeFrom || ''} → ${actionJob?.job?.routeTo || ''} posting by ${actionJob?.job?.ownerName || ''}? The owner will be notified.`}
                    confirmLabel="Flag Posting"
                    confirmVariant="danger"
                    requireReason
                    reasonLabel="Flag Reason"
                    onConfirm={handleJobAction}
                    onCancel={() => setActionJob(null)}
                />
                <ConfirmModal
                    isOpen={!!actionJob && actionJob.action === 'remove'}
                    title="Remove Job Posting"
                    message={`Permanently remove the ${actionJob?.job?.routeFrom || ''} → ${actionJob?.job?.routeTo || ''} posting by ${actionJob?.job?.ownerName || ''}? This will close the job and notify the owner.`}
                    confirmLabel="Remove Posting"
                    confirmVariant="danger"
                    requireReason
                    reasonLabel="Removal Reason"
                    onConfirm={handleJobAction}
                    onCancel={() => setActionJob(null)}
                />
            </div>
        </ProtectedLayout>
    );
}
