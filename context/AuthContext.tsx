import React, { createContext, useContext, useState, useCallback } from 'react';
import { insforge } from '../lib/insforge';

export type UserRole = 'driver' | 'owner' | 'both';
export type ActiveView = 'driver' | 'owner';
export type VerificationTier = 'registered' | 'verified' | 'fully_verified';

export interface AuthUser {
    id: string;
    name: string;
    phone: string;
    avatar: string;
    role: UserRole;
    email?: string;
    verificationStatus: 'verified' | 'pending' | 'expired';
    joinedDate: string;

    // Registration fields
    trn?: string;
    parish?: string;
    businessName?: string;
    routeLicenceNumber?: string;
    driversLicenceNumber?: string;
    licenceClass?: string;
    tlcNumber?: string;
    verificationTier: VerificationTier;
    availableForHire?: boolean;
    registrationDate: string;
    primaryRoutes?: string[];
    routeExperience?: string[];
    yearsOfExperience?: number;
    numberOfVehicles?: number;
}

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isNewUser: boolean;
    login: (phone: string) => Promise<void>;
    verifyOtp: (code: string) => Promise<boolean>;
    setUserRole: (role: UserRole) => void;
    updateProfile: (data: Partial<AuthUser>) => void;
    register: (data: Partial<AuthUser>) => Promise<void>;
    logout: () => void;
    setIsNewUser: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    isNewUser: true,
    login: async () => { },
    verifyOtp: async () => false,
    setUserRole: () => { },
    updateProfile: () => { },
    register: async () => { },
    logout: () => { },
    setIsNewUser: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isNewUser, setIsNewUser] = useState(true);

    const login = useCallback(async (phone: string) => {
        setIsLoading(true);
        try {
            const { data, error } = await insforge.database
                .from('users')
                .select('*')
                .eq('phone', phone)
                .single();

            if (error || !data) {
                // Not found, user is new
                setIsNewUser(true);
            } else {
                const dbUser = data;
                const userObj: AuthUser = {
                    id: dbUser.id,
                    name: dbUser.name,
                    phone: dbUser.phone || '',
                    avatar: dbUser.avatar || '',
                    role: dbUser.role as UserRole,
                    email: dbUser.email || undefined,
                    verificationStatus: dbUser.status === 'active' ? 'verified' : 'pending',
                    joinedDate: dbUser.registered_date ? new Date(dbUser.registered_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    verificationTier: dbUser.verification_tier as VerificationTier,
                    registrationDate: dbUser.registered_date ? new Date(dbUser.registered_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    trn: dbUser.trn || undefined,
                    parish: dbUser.parish || undefined,
                    businessName: dbUser.business_name || undefined,
                    routeLicenceNumber: dbUser.route_licence_number || undefined,
                    licenceClass: dbUser.licence_class || undefined,
                    tlcNumber: dbUser.tlc_number || undefined,
                    primaryRoutes: dbUser.primary_routes || undefined,
                    yearsOfExperience: dbUser.experience || undefined,
                    numberOfVehicles: dbUser.number_of_vehicles || undefined,
                    driversLicenceNumber: dbUser.drivers_licence_number || undefined,
                    routeExperience: dbUser.route_experience || undefined,
                    availableForHire: dbUser.available_for_hire ?? undefined,
                };
                setUser(userObj);
                setIsNewUser(false);
            }
        } catch (error) {
            console.error('Login error:', error);
            setIsNewUser(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const verifyOtp = useCallback(async (code: string) => {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));
        if (code === '123456' || code.length === 6) {
            setIsLoading(false);
            return true;
        }
        setIsLoading(false);
        return false;
    }, []);

    const register = useCallback(async (data: Partial<AuthUser>) => {
        setIsLoading(true);
        try {
            const initials = (data.name || 'NU')
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

            const dbData = {
                name: data.name || 'New User',
                phone: data.phone || '+1 876 555 0000',
                avatar: initials,
                role: data.role || 'driver',
                status: 'active',
                verification_tier: 'registered',
                trn: data.trn || `TRN${Date.now()}`, // Temporary unique TRN for mock
                parish: data.parish || null,
                business_name: data.businessName || null,
                route_licence_number: data.routeLicenceNumber || null,
                licence_class: data.licenceClass || null,
                tlc_number: data.tlcNumber || null,
                primary_routes: data.primaryRoutes || [],
                experience: data.yearsOfExperience || 0,
                number_of_vehicles: data.numberOfVehicles || 0,
                drivers_licence_number: data.driversLicenceNumber || null,
                route_experience: data.routeExperience || [],
                available_for_hire: typeof data.availableForHire === 'boolean' ? data.availableForHire : true,
            };

            const response = await insforge.database.from('users').insert(dbData).select('*').single();

            if (response.error) {
                console.error('Failed to register user:', response.error);
                throw new Error(response.error.message || 'Registration failed');
            }

            const dbUser = response.data;
            const newUser: AuthUser = {
                id: dbUser.id,
                name: dbUser.name,
                phone: dbUser.phone || '',
                avatar: dbUser.avatar || initials,
                role: dbUser.role as UserRole,
                email: dbUser.email || undefined,
                verificationStatus: 'pending',
                joinedDate: dbUser.registered_date ? new Date(dbUser.registered_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                verificationTier: dbUser.verification_tier as VerificationTier,
                registrationDate: dbUser.registered_date ? new Date(dbUser.registered_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                trn: dbUser.trn || undefined,
                parish: dbUser.parish || undefined,
                businessName: dbUser.business_name || undefined,
                routeLicenceNumber: dbUser.route_licence_number || undefined,
                licenceClass: dbUser.licence_class || undefined,
                tlcNumber: dbUser.tlc_number || undefined,
                primaryRoutes: dbUser.primary_routes || undefined,
                yearsOfExperience: dbUser.experience || undefined,
                numberOfVehicles: dbUser.number_of_vehicles || undefined,
                driversLicenceNumber: dbUser.drivers_licence_number || undefined,
                routeExperience: dbUser.route_experience || undefined,
                availableForHire: dbUser.available_for_hire ?? undefined,
            };

            setUser(newUser);
            setIsNewUser(false);
        } catch (error) {
            console.error('Error during registration:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const setUserRole = useCallback((role: UserRole) => {
        setUser((prev) => (prev ? { ...prev, role } : null));
    }, []);

    const updateProfile = useCallback((data: Partial<AuthUser>) => {
        setUser((prev) => (prev ? { ...prev, ...data } : null));
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setIsNewUser(true);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                isNewUser,
                login,
                verifyOtp,
                setUserRole,
                updateProfile,
                register,
                logout,
                setIsNewUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
