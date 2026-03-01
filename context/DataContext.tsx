import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Vehicle, mockVehicles } from '../data/vehicles';
import { Driver, mockDrivers } from '../data/drivers';
import { Job, mockJobs } from '../data/jobs';
import { Dispute, mockDisputes } from '../data/disputes';
import { EarningEntry, mockEarnings } from '../data/earnings';

interface DataContextType {
    // Vehicles
    vehicles: Vehicle[];
    addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
    deleteVehicle: (id: string) => void;

    // Drivers
    drivers: Driver[];
    addDriver: (driver: Omit<Driver, 'id'>) => void;
    deleteDriver: (id: string) => void;

    // Jobs
    jobs: Job[];
    addJob: (job: Omit<Job, 'id'>) => void;

    // Disputes
    disputes: Dispute[];
    addDispute: (dispute: Omit<Dispute, 'id'>) => void;

    // Earnings
    earnings: EarningEntry[];
    addEarning: (entry: Omit<EarningEntry, 'id'>) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function useData() {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error('useData must be used within DataProvider');
    return ctx;
}

let nextId = 100;
const genId = (prefix: string) => `${prefix}-${++nextId}`;

export function DataProvider({ children }: { children: ReactNode }) {
    const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
    const [drivers, setDrivers] = useState<Driver[]>(mockDrivers);
    const [jobs, setJobs] = useState<Job[]>(mockJobs);
    const [disputes, setDisputes] = useState<Dispute[]>(mockDisputes);
    const [earnings, setEarnings] = useState<EarningEntry[]>(mockEarnings);

    const addVehicle = (v: Omit<Vehicle, 'id'>) =>
        setVehicles((prev) => [{ ...v, id: genId('v') }, ...prev]);

    const deleteVehicle = (id: string) =>
        setVehicles((prev) => prev.filter((v) => v.id !== id));

    const addDriver = (d: Omit<Driver, 'id'>) =>
        setDrivers((prev) => [{ ...d, id: genId('d') }, ...prev]);

    const deleteDriver = (id: string) =>
        setDrivers((prev) => prev.filter((d) => d.id !== id));

    const addJob = (j: Omit<Job, 'id'>) =>
        setJobs((prev) => [{ ...j, id: genId('j') }, ...prev]);

    const addDispute = (d: Omit<Dispute, 'id'>) =>
        setDisputes((prev) => [{ ...d, id: genId('disp') }, ...prev]);

    const addEarning = (e: Omit<EarningEntry, 'id'>) =>
        setEarnings((prev) => [{ ...e, id: genId('e') }, ...prev]);

    return (
        <DataContext.Provider
            value={{
                vehicles, addVehicle, deleteVehicle,
                drivers, addDriver, deleteDriver,
                jobs, addJob,
                disputes, addDispute,
                earnings, addEarning,
            }}
        >
            {children}
        </DataContext.Provider>
    );
}
