'use client';

import ProtectedLayout from '../components/ProtectedLayout';
import StatusBadge from '../components/StatusBadge';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, ChevronUp, ChevronDown, ArrowUpDown, MapPin, Clock } from 'lucide-react';
import { insforge } from '../../lib/insforge';

type SortKey = 'driverName' | 'route' | 'startTime' | 'distanceKm' | 'fare' | 'status';
type SortDir = 'asc' | 'desc';

export default function TripsPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('startTime');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [page, setPage] = useState(1);
    const [trips, setTrips] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const perPage = 10;

    useEffect(() => {
        async function fetchTrips() {
            setIsLoading(true);
            try {
                const [tripsRes, usersRes] = await Promise.all([
                    insforge.database.from('trips').select('*'),
                    insforge.database.from('users').select('id, name, avatar, rating')
                ]);

                if (tripsRes.error) throw tripsRes.error;

                const usersMap = new Map((usersRes.data || []).map((u: any) => [u.id, u]));

                const formattedTrips = (tripsRes.data || []).map((t: any) => {
                    const driver = (usersMap.get(t.driver_id) || {}) as any;
                    return {
                        id: t.id,
                        driverId: t.driver_id,
                        driverName: driver?.name || 'Unknown Driver',
                        driverRating: driver?.rating || 0,
                        driverAvatar: driver?.avatar || '',
                        vehiclePlate: t.vehicle_plate,
                        routeFrom: t.route_from,
                        routeTo: t.route_to,
                        startTime: new Date(t.start_time).toLocaleString(),
                        endTime: t.end_time ? new Date(t.end_time).toLocaleTimeString() : '-',
                        distanceKm: parseFloat(t.distance_km) || 0,
                        durationMinutes: t.duration_minutes,
                        fare: parseFloat(t.fare) || 0,
                        status: t.status,
                        gpsVerified: t.gps_verified,
                        fuelEstimate: parseFloat(t.fuel_estimate) || 0,
                    };
                });

                setTrips(formattedTrips);
            } catch (err: any) {
                console.error("Failed to fetch trips:", err);
                setError("Failed to load trips from the platform.");
            } finally {
                setIsLoading(false);
            }
        }

        fetchTrips();
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
        let currentTrips = [...trips];

        if (search) {
            const q = search.toLowerCase();
            currentTrips = currentTrips.filter(t =>
                t.driverName.toLowerCase().includes(q) ||
                t.routeFrom.toLowerCase().includes(q) ||
                t.routeTo.toLowerCase().includes(q) ||
                t.vehiclePlate.toLowerCase().includes(q)
            );
        }

        if (statusFilter) currentTrips = currentTrips.filter(t => t.status === statusFilter);

        currentTrips.sort((a, b) => {
            let av: any = a[sortKey];
            let bv: any = b[sortKey];

            if (sortKey === 'route') {
                av = `${a.routeFrom} ${a.routeTo}`;
                bv = `${b.routeFrom} ${b.routeTo}`;
            }

            const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
            return sortDir === 'asc' ? cmp : -cmp;
        });

        return currentTrips;
    }, [search, statusFilter, sortKey, sortDir, trips]);

    const totalPages = Math.ceil(filtered.length / perPage);
    const paged = filtered.slice((page - 1) * perPage, page * perPage);

    return (
        <ProtectedLayout>
            <div className="animate-in">
                <div className="page-header">
                    <div>
                        <h1>Trip Management</h1>
                        <p>{isLoading ? 'Loading...' : `${trips.length} active trips recorded on the platform`}</p>
                    </div>
                </div>

                <div className="card">
                    <div className="table-toolbar">
                        <div className="table-search">
                            <Search size={16} color="var(--text-muted)" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search by driver, route, or plate..."
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
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                                <option value="disputed">Disputed</option>
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
                                    <th>Driver</th>
                                    <th onClick={() => handleSort('route')} style={{ cursor: 'pointer' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>Route <SortIcon columnKey="route" /></div>
                                    </th>
                                    <th onClick={() => handleSort('startTime')} style={{ cursor: 'pointer' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>Start Time <SortIcon columnKey="startTime" /></div>
                                    </th>
                                    <th onClick={() => handleSort('distanceKm')} style={{ cursor: 'pointer' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>Distance <SortIcon columnKey="distanceKm" /></div>
                                    </th>
                                    <th onClick={() => handleSort('fare')} style={{ cursor: 'pointer' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>Fare <SortIcon columnKey="fare" /></div>
                                    </th>
                                    <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>Status <SortIcon columnKey="status" /></div>
                                    </th>
                                    <th>Verified</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>Loading trips...</td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--error)' }}>{error}</td>
                                    </tr>
                                ) : paged.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No trips found matching your filters.</td>
                                    </tr>
                                ) : paged.map(trip => (
                                    <tr key={trip.id} style={{ cursor: 'pointer' }}>
                                        <td>
                                            <div className="user-cell">
                                                <div className="avatar avatar-sm avatar-gold">{trip.driverAvatar}</div>
                                                <div>
                                                    <div className="user-name">{trip.driverName}</div>
                                                    <div className="user-sub">Plate: {trip.vehiclePlate}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{trip.routeFrom}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>To {trip.routeTo}</div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Clock size={14} color="var(--text-muted)" />
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>{trip.startTime}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{trip.durationMinutes ? `${trip.durationMinutes} mins` : 'In Progress'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{trip.distanceKm.toFixed(1)} km</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600, color: 'var(--success)' }}>
                                                JMD ${(trip.fare || 0).toLocaleString()}
                                            </div>
                                        </td>
                                        <td><StatusBadge status={trip.status} size="sm" /></td>
                                        <td>
                                            {trip.gpsVerified ? (
                                                <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', fontWeight: 500 }}>
                                                    <MapPin size={14} /> Verified
                                                </div>
                                            ) : (
                                                <div style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', fontWeight: 500 }}>
                                                    <MapPin size={14} /> Unverified
                                                </div>
                                            )}
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
            </div>
        </ProtectedLayout>
    );
}
