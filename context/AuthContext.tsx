import React, { createContext, useContext, useState, useCallback } from 'react';

export type UserRole = 'driver' | 'owner' | 'both';
export type ActiveView = 'driver' | 'owner';

interface AuthUser {
    id: string;
    name: string;
    phone: string;
    avatar: string;
    role: UserRole;
    email?: string;
    verificationStatus: 'verified' | 'pending' | 'expired';
    joinedDate: string;
}

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (phone: string) => Promise<void>;
    verifyOtp: (code: string) => Promise<boolean>;
    setUserRole: (role: UserRole) => void;
    updateProfile: (data: Partial<AuthUser>) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    login: async () => { },
    verifyOtp: async () => false,
    setUserRole: () => { },
    updateProfile: () => { },
    logout: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(false);

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
            setUser({
                id: 'user1',
                name: 'Alex Morgan',
                phone: '+1 876 555 0100',
                avatar: 'AM',
                role: 'both',
                email: 'alex@oam.jm',
                verificationStatus: 'verified',
                joinedDate: '2024-01-15',
            });
            setIsLoading(false);
            return true;
        }
        setIsLoading(false);
        return false;
    }, []);

    const setUserRole = useCallback((role: UserRole) => {
        setUser((prev) => (prev ? { ...prev, role } : null));
    }, []);

    const updateProfile = useCallback((data: Partial<AuthUser>) => {
        setUser((prev) => (prev ? { ...prev, ...data } : null));
    }, []);

    const logout = useCallback(() => {
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                verifyOtp,
                setUserRole,
                updateProfile,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
