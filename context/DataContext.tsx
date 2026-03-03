import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { insforge } from '../lib/insforge';
import { useAuth } from './AuthContext';
import { Vehicle } from '../data/vehicles';
import { Driver } from '../data/drivers';
import { Job } from '../data/jobs';
import { Dispute } from '../data/disputes';
import { EarningEntry } from '../data/earnings';
import { Trip } from '../data/trips';
import { Review } from '../data/reviews';
import { Referral } from '../data/referrals';
import { showAlert } from '../utils/alert';

interface DataContextType {
    // Vehicles
    vehicles: Vehicle[];
    addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<void>;
    editVehicle: (id: string, vehicle: Partial<Vehicle>) => Promise<void>;
    deleteVehicle: (id: string) => Promise<void>;

    // Drivers
    drivers: Driver[];
    addDriver: (driver: Omit<Driver, 'id'>) => Promise<void>;
    deleteDriver: (id: string) => Promise<void>;

    // Jobs
    jobs: Job[];
    addJob: (job: Omit<Job, 'id'>) => Promise<void>;

    // Disputes
    disputes: Dispute[];
    addDispute: (dispute: Omit<Dispute, 'id'>) => Promise<void>;

    // Earnings
    earnings: EarningEntry[];
    addEarning: (entry: Omit<EarningEntry, 'id'>) => Promise<void>;

    // Trips
    trips: Trip[];
    addTrip: (trip: Omit<Trip, 'id'>) => Promise<void>;

    // Reviews
    reviews: Review[];
    addReview: (review: Omit<Review, 'id'>) => Promise<void>;

    // Referrals
    referrals: Referral[];
    addReferral: (referral: Omit<Referral, 'id'>) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function useData() {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error('useData must be used within DataProvider');
    return ctx;
}

export function DataProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();

    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [earnings, setEarnings] = useState<EarningEntry[]>([]);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        async function loadData() {
            try {
                // Fetch vehicles from Supabase
                const { data: vData, error: vError } = await insforge.database
                    .from('vehicles')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!vError && vData) {
                    const mappedVehicles: Vehicle[] = vData.map(v => ({
                        id: v.id,
                        ownerId: v.owner_id,
                        make: v.make,
                        model: v.model,
                        year: v.year,
                        plate: v.plate,
                        type: v.type,
                        status: v.status,
                        assignedDriver: v.assigned_driver,
                        assignedDriverName: v.assigned_driver_name,
                        dailyRevenue: v.daily_revenue || 0,
                        fitnessExpiry: v.fitness_expiry,
                        insuranceExpiry: v.insurance_expiry,
                        registrationExpiry: v.registration_expiry,
                        image: v.image,
                        route: v.route,
                    }));
                    setVehicles(mappedVehicles);
                } else if (vError) {
                    console.error("Supabase fetch error for vehicles", vError);
                }

                // Fetch drivers from Supabase
                const { data: dData, error: dError } = await insforge.database
                    .from('drivers')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!dError && dData) {
                    setDrivers(dData.map(d => ({
                        id: d.id,
                        name: d.name,
                        avatar: d.avatar,
                        phone: d.phone,
                        rating: d.rating,
                        totalTrips: d.total_trips,
                        experience: d.experience,
                        licenseType: d.license_type,
                        licenseExpiry: d.license_expiry,
                        status: d.status,
                        assignedVehicle: d.assigned_vehicle,
                        assignedRoute: d.assigned_route,
                        weeklyEarnings: d.weekly_earnings,
                        joinedDate: d.joined_date,
                        verificationStatus: d.verification_status,
                        documents: d.documents || [],
                        routeHistory: d.route_history || [],
                        backgroundCheck: d.background_check || {},
                    })));
                }

                // Fetch jobs from Supabase
                const { data: jData, error: jError } = await insforge.database
                    .from('jobs')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!jError && jData) {
                    setJobs(jData.map(j => ({
                        id: j.id,
                        ownerId: j.owner_id,
                        ownerName: j.owner_name,
                        ownerRating: j.owner_rating,
                        ownerAvatar: j.owner_avatar,
                        vehicleType: j.vehicle_type,
                        vehiclePlate: j.vehicle_plate,
                        route: { from: j.route_from, to: j.route_to },
                        dailyPay: j.daily_pay,
                        schedule: j.schedule,
                        requirements: j.requirements || [],
                        description: j.description,
                        postedDate: j.posted_date,
                        status: j.status,
                        applicants: j.applicants,
                        isSmartMatch: j.is_smart_match,
                        matchScore: j.match_score,
                    })));
                }

                // Fetch earnings from Supabase
                const { data: eData } = await insforge.database
                    .from('earnings')
                    .select('*')
                    .order('date', { ascending: false });

                if (eData) {
                    setEarnings(eData.map(e => ({
                        id: e.id,
                        date: e.date,
                        amount: e.amount,
                        route: e.route,
                        vehiclePlate: e.vehicle_plate,
                        status: e.status,
                        trips: e.trips,
                    })));
                }

                // Fetch disputes from Supabase
                const { data: dispData } = await insforge.database
                    .from('disputes')
                    .select('*')
                    .order('date_opened', { ascending: false });

                if (dispData) {
                    setDisputes(dispData.map(d => ({
                        id: d.id,
                        filedBy: d.filed_by,
                        filedByName: d.filed_by_name,
                        filedByAvatar: d.filed_by_avatar,
                        filedByRole: d.filed_by_role,
                        against: d.against,
                        againstName: d.against_name,
                        againstAvatar: d.against_avatar,
                        againstRole: d.against_role,
                        type: d.type,
                        category: d.category,
                        description: d.description,
                        status: d.status,
                        priority: d.priority,
                        evidence: d.evidence || [],
                        timeline: d.timeline || [],
                        resolution: d.resolution,
                        relatedTripId: d.related_trip_id,
                        dateOpened: d.date_opened,
                        dateResolved: d.date_resolved,
                    })));
                }

                // Fetch trips from Supabase
                const { data: tData, error: tError } = await insforge.database
                    .from('trips')
                    .select('*, driver:driver_id(name)')
                    .order('start_time', { ascending: false });

                if (!tError && tData) {
                    setTrips(tData.map(t => {
                        const driverObj = Array.isArray(t.driver) ? t.driver[0] : t.driver;
                        return {
                            id: t.id,
                            driverId: t.driver_id,
                            driverName: driverObj?.name || 'Unknown',
                            vehicleId: t.vehicle_id || '',
                            vehiclePlate: t.vehicle_plate,
                            route: { from: t.route_from, to: t.route_to },
                            startLocation: { lat: t.start_lat, lng: t.start_lng, accuracy: 0, timestamp: t.start_time },
                            endLocation: t.end_time ? { lat: t.end_lat, lng: t.end_lng, accuracy: 0, timestamp: t.end_time } : null,
                            distanceKm: Number(t.distance_km),
                            startTime: t.start_time,
                            endTime: t.end_time,
                            durationMinutes: t.duration_minutes,
                            fare: Number(t.fare),
                            status: t.status as 'active' | 'completed' | 'disputed',
                            gpsVerified: t.gps_verified || false,
                            waypoints: t.waypoints || [],
                            fuelEstimate: Number(t.fuel_estimate),
                            notes: t.notes,
                        };
                    }));
                } else if (tError) {
                    console.error("Supabase fetch error for trips", tError);
                }

                // Fetch reviews from Supabase
                const { data: rData, error: rError } = await insforge.database
                    .from('reviews')
                    .select(`
                        id,
                        from_id,
                        to_id,
                        rating,
                        comment,
                        date,
                        route_from,
                        route_to,
                        created_at,
                        author:from_id ( name, avatar, role )
                    `)
                    .order('created_at', { ascending: false });

                if (!rError && rData) {
                    setReviews(rData.map(r => {
                        const author = Array.isArray(r.author) ? r.author[0] : r.author;
                        return {
                            id: r.id,
                            fromId: r.from_id,
                            fromName: author?.name || 'Unknown',
                            fromAvatar: author?.avatar || '?',
                            fromRole: (author?.role as 'driver' | 'owner') || 'driver',
                            toId: r.to_id,
                            toName: '', // will be resolved on display side if needed
                            rating: r.rating,
                            comment: r.comment,
                            date: r.date,
                            route: r.route_from ? { from: r.route_from, to: r.route_to } : undefined,
                        };
                    }));
                } else if (rError) {
                    console.error("Supabase fetch error for reviews", rError);
                }

                // Fetch referrals from Supabase
                const { data: refData, error: refError } = await insforge.database
                    .from('referrals')
                    .select(`
                        id,
                        referred_by,
                        referred_user,
                        type,
                        status,
                        bonus_amount,
                        referral_code,
                        date_referred,
                        date_completed,
                        date_paid,
                        refUser:referred_user ( name, avatar )
                    `)
                    .order('date_referred', { ascending: false });

                if (!refError && refData) {
                    setReferrals(refData.map(r => {
                        const refUserObj = Array.isArray(r.refUser) ? r.refUser[0] : r.refUser;
                        return {
                            id: r.id,
                            referredBy: r.referred_by,
                            referredByName: user?.name || '',
                            referredByAvatar: user?.avatar || '',
                            referredUser: r.referred_user,
                            referredUserName: refUserObj?.name || 'Unknown',
                            referredUserAvatar: refUserObj?.avatar || '?',
                            type: r.type as 'driver' | 'owner',
                            status: r.status as any,
                            bonusAmount: Number(r.bonus_amount),
                            referralCode: r.referral_code,
                            dateReferred: r.date_referred,
                            dateCompleted: r.date_completed,
                            datePaid: r.date_paid,
                        };
                    }));
                } else if (refError) {
                    console.error("Supabase fetch error for referrals", refError);
                }

            } catch (e) {
                console.error('Failed to load database data', e);
            } finally {
                setIsLoaded(true);
            }
        }
        loadData();
    }, []);

    const addVehicle = async (v: Omit<Vehicle, 'id'>) => {
        const payload = {
            owner_id: user?.id || v.ownerId,
            make: v.make,
            model: v.model,
            year: v.year,
            plate: v.plate,
            type: v.type,
            status: v.status,
            assigned_driver: v.assignedDriver,
            assigned_driver_name: v.assignedDriverName,
            daily_revenue: v.dailyRevenue,
            fitness_expiry: v.fitnessExpiry,
            insurance_expiry: v.insuranceExpiry,
            image: v.image,
            route: v.route,
        };

        const { data, error } = await insforge.database.from('vehicles').insert([payload]).select().single();
        if (error) {
            console.error('Failed to add vehicle to Supabase', error);
            showAlert('Error', 'Failed to save vehicle: ' + error.message);
            return;
        }

        const newVehicle: Vehicle = { ...v, id: data.id, ownerId: data.owner_id };
        setVehicles(prev => [newVehicle, ...prev]);
    };

    const editVehicle = async (id: string, v: Partial<Vehicle>) => {
        const payload: any = {};
        if (v.make !== undefined) payload.make = v.make;
        if (v.model !== undefined) payload.model = v.model;
        if (v.year !== undefined) payload.year = v.year;
        if (v.plate !== undefined) payload.plate = v.plate;
        if (v.type !== undefined) payload.type = v.type;
        if (v.status !== undefined) payload.status = v.status;
        if (v.assignedDriver !== undefined) payload.assigned_driver = v.assignedDriver;
        if (v.assignedDriverName !== undefined) payload.assigned_driver_name = v.assignedDriverName;
        if (v.dailyRevenue !== undefined) payload.daily_revenue = v.dailyRevenue;
        if (v.fitnessExpiry !== undefined) payload.fitness_expiry = v.fitnessExpiry;
        if (v.insuranceExpiry !== undefined) payload.insurance_expiry = v.insuranceExpiry;
        if (v.registrationExpiry !== undefined) payload.registration_expiry = v.registrationExpiry;

        const { error } = await insforge.database.from('vehicles').update(payload).eq('id', id);

        if (error) {
            console.error('Failed to edit vehicle in Supabase', error);
            showAlert('Error', 'Failed to update vehicle: ' + error.message);
            return;
        }

        setVehicles(prev => prev.map((item) => (item.id === id ? { ...item, ...v } : item)));
    };

    const deleteVehicle = async (id: string) => {
        const { error } = await insforge.database.from('vehicles').delete().eq('id', id);
        if (error) {
            console.error('Failed to delete vehicle', error);
            showAlert('Error', 'Failed to delete vehicle: ' + error.message);
            return;
        }

        setVehicles(prev => prev.filter((v) => v.id !== id));
    };

    const addDriver = async (d: Omit<Driver, 'id'>) => {
        const payload = {
            owner_id: user?.id || 'unknown',
            name: d.name,
            avatar: d.avatar,
            phone: d.phone,
            rating: d.rating,
            total_trips: d.totalTrips,
            experience: d.experience,
            license_type: d.licenseType,
            license_expiry: d.licenseExpiry,
            status: d.status,
            assigned_vehicle: d.assignedVehicle,
            assigned_route: d.assignedRoute,
            weekly_earnings: d.weeklyEarnings,
            joined_date: d.joinedDate,
            verification_status: d.verificationStatus,
            documents: d.documents,
            route_history: d.routeHistory,
            background_check: d.backgroundCheck,
        };

        const { data, error } = await insforge.database.from('drivers').insert([payload]).select().single();
        if (error) {
            console.error('Failed to add driver', error);
            showAlert('Error', 'Failed to save driver: ' + error.message);
            return;
        }

        setDrivers(prev => [{ ...d, id: data.id }, ...prev]);
    };

    const deleteDriver = async (id: string) => {
        const { error } = await insforge.database.from('drivers').delete().eq('id', id);
        if (error) {
            console.error('Failed to delete driver', error);
            return;
        }
        setDrivers((prev) => prev.filter((d) => d.id !== id));
    };

    const addJob = async (j: Omit<Job, 'id'>) => {
        const payload = {
            owner_id: user?.id || (j.ownerId === 'owner1' ? '00000000-0000-0000-0000-000000000000' : j.ownerId),
            owner_name: j.ownerName,
            owner_rating: j.ownerRating,
            owner_avatar: j.ownerAvatar,
            vehicle_type: j.vehicleType,
            vehicle_plate: j.vehiclePlate,
            route_from: j.route.from,
            route_to: j.route.to,
            daily_pay: j.dailyPay,
            schedule: j.schedule,
            requirements: j.requirements,
            description: j.description,
            posted_date: j.postedDate,
            status: j.status,
            applicants: j.applicants,
            is_smart_match: j.isSmartMatch,
            match_score: j.matchScore,
        };

        const { data, error } = await insforge.database.from('jobs').insert([payload]).select().single();
        if (error) {
            console.error('Failed to post job', error);
            showAlert('Error', 'Failed to post job: ' + error.message);
            return;
        }

        setJobs(prev => [{ ...j, id: data.id }, ...prev]);
    };

    const addDispute = async (d: Omit<Dispute, 'id'>) => {
        const payload = {
            filed_by: d.filedBy,
            filed_by_name: d.filedByName,
            filed_by_avatar: d.filedByAvatar,
            filed_by_role: d.filedByRole,
            against: d.against,
            against_name: d.againstName,
            against_avatar: d.againstAvatar,
            against_role: d.againstRole,
            type: d.type,
            category: d.category,
            description: d.description,
            status: d.status,
            priority: d.priority,
            evidence: d.evidence,
            timeline: d.timeline,
            resolution: d.resolution,
            related_trip_id: d.relatedTripId,
            date_opened: d.dateOpened,
            date_resolved: d.dateResolved,
        };

        const { data, error } = await insforge.database.from('disputes').insert([payload]).select().single();
        if (error) {
            console.error('Failed to file dispute', error);
            showAlert('Error', 'Failed to file dispute: ' + error.message);
            return;
        }

        setDisputes(prev => [{ ...d, id: data.id }, ...prev]);
    };

    const addEarning = async (e: Omit<EarningEntry, 'id'>) => {
        const payload = {
            date: e.date,
            amount: e.amount,
            route: e.route,
            vehicle_plate: e.vehiclePlate,
            status: e.status,
            trips: e.trips,
        };

        const { data, error } = await insforge.database.from('earnings').insert([payload]).select().single();
        if (error) {
            console.error('Failed to log earning', error);
            showAlert('Error', 'Failed to log earning: ' + error.message);
            return;
        }

        setEarnings(prev => [{ ...e, id: data.id }, ...prev]);
    };

    const addTrip = async (t: Omit<Trip, 'id'>) => {
        const payload = {
            driver_id: t.driverId,
            vehicle_id: t.vehicleId || null,
            vehicle_plate: t.vehiclePlate,
            route_from: t.route.from,
            route_to: t.route.to,
            start_lat: t.startLocation.lat,
            start_lng: t.startLocation.lng,
            end_lat: t.endLocation?.lat || null,
            end_lng: t.endLocation?.lng || null,
            distance_km: t.distanceKm,
            start_time: t.startTime,
            end_time: t.endTime,
            duration_minutes: t.durationMinutes,
            fare: t.fare,
            status: t.status,
            gps_verified: t.gpsVerified,
            waypoints: t.waypoints,
            fuel_estimate: t.fuelEstimate,
            notes: t.notes,
        };

        const { data, error } = await insforge.database.from('trips').insert([payload]).select().single();
        if (error) {
            console.error('Failed to log trip', error);
            showAlert('Error', 'Failed to log trip: ' + error.message);
            return;
        }

        setTrips(prev => [{ ...t, id: data.id }, ...prev]);
    };

    const addReview = async (r: Omit<Review, 'id'>) => {
        const payload = {
            from_id: r.fromId,
            to_id: r.toId,
            rating: r.rating,
            comment: r.comment,
            date: r.date,
            route_from: r.route?.from || null,
            route_to: r.route?.to || null,
        };

        const { data, error } = await insforge.database.from('reviews').insert([payload]).select().single();
        if (error) {
            console.error('Failed to add review', error);
            showAlert('Error', 'Failed to submit review: ' + error.message);
            return;
        }

        setReviews(prev => [{ ...r, id: data.id }, ...prev]);
    };

    const addReferral = async (ref: Omit<Referral, 'id'>) => {
        const payload = {
            referred_by: ref.referredBy,
            referred_user: ref.referredUser,
            type: ref.type,
            status: ref.status,
            bonus_amount: ref.bonusAmount,
            referral_code: ref.referralCode,
            date_referred: ref.dateReferred,
            date_completed: ref.dateCompleted || null,
            date_paid: ref.datePaid || null,
        };

        const { data, error } = await insforge.database.from('referrals').insert([payload]).select().single();
        if (error) {
            console.error('Failed to create referral', error);
            showAlert('Error', 'Failed to create referral: ' + error.message);
            return;
        }

        setReferrals(prev => [{ ...ref, id: data.id }, ...prev]);
    };

    if (!isLoaded) return null; // Or a loading spinner

    return (
        <DataContext.Provider
            value={{
                vehicles, addVehicle, editVehicle, deleteVehicle,
                drivers, addDriver, deleteDriver,
                jobs, addJob,
                disputes, addDispute,
                earnings, addEarning,
                trips, addTrip,
                reviews, addReview,
                referrals, addReferral,
            }}
        >
            {children}
        </DataContext.Provider>
    );
}
