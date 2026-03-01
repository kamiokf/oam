import React, { createContext, useContext, useState, useCallback } from 'react';

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
    register: (data: Partial<AuthUser>) => void;
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
    register: () => { },
    logout: () => { },
    setIsNewUser: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isNewUser, setIsNewUser] = useState(true);

    const login = useCallback(async (_phone: string) => {
        setIsLoading(true);
        // Mock delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsLoading(false);
    }, []);

    const verifyOtp = useCallback(async (code: string) => {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));
        if (code === '123456' || code.length === 6) {
            // Don't create user yet — registration flow will do that
            setIsLoading(false);
            return true;
        }
        setIsLoading(false);
        return false;
    }, []);

    const register = useCallback((data: Partial<AuthUser>) => {
        const initials = (data.name || 'NU')
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

        const newUser: AuthUser = {
            id: `user-${Date.now()}`,
            name: data.name || 'New User',
            phone: data.phone || '+1 876 555 0000',
            avatar: initials,
            role: data.role || 'driver',
            verificationStatus: 'pending',
            joinedDate: new Date().toISOString().split('T')[0],
            verificationTier: 'registered',
            registrationDate: new Date().toISOString().split('T')[0],
            ...data,
        };

        setUser(newUser);
        setIsNewUser(false);
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
