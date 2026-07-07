import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { insforge } from '../lib/insforge';

// Platform-specific Firebase imports
let nativeAuth: any = null;
let webAuth: any = null;
let webSignInWithPhoneNumber: any = null;
let WebRecaptchaVerifier: any = null;

if (Platform.OS === 'web') {
    // Firebase JS SDK for web
    const firebaseWeb = require('../lib/firebase-web');
    webAuth = firebaseWeb.webAuth;
    webSignInWithPhoneNumber = firebaseWeb.signInWithPhoneNumber;
    WebRecaptchaVerifier = firebaseWeb.RecaptchaVerifier;
} else {
    // Native Firebase for iOS/Android
    nativeAuth = require('@react-native-firebase/auth').default;
}

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
    // True only until the stored session has been read on cold start. Distinct
    // from isLoading, which also toggles during login/verify/register — gating
    // navigation on isLoading would unmount screens mid-auth-action.
    isBootstrapping: boolean;
    isNewUser: boolean;
    login: (phone: string) => Promise<void>;
    verifyOtp: (code: string) => Promise<{ success: boolean; user: AuthUser | null }>;
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
    isBootstrapping: true,
    isNewUser: true,
    login: async () => { },
    verifyOtp: async () => ({ success: false, user: null }),
    setUserRole: () => { },
    updateProfile: () => { },
    register: async () => { },
    logout: () => { },
    setIsNewUser: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Start loading to check session
    const [isBootstrapping, setIsBootstrapping] = useState(true);
    const [isNewUser, setIsNewUser] = useState(true);
    const confirmationRef = useRef<any>(null);
    const recaptchaVerifierRef = useRef<any>(null);
    // Looked up during login() but only committed to state/storage after the
    // OTP is verified — knowing a phone number must not grant a session.
    const pendingUserRef = useRef<AuthUser | null>(null);

    // Initial session load
    useEffect(() => {
        const loadSession = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('authUser');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                    setIsNewUser(false);
                }
            } catch (e) {
                console.error('Failed to load session from storage', e);
            } finally {
                setIsLoading(false);
                setIsBootstrapping(false);
            }
        };
        loadSession();
    }, []);

    const login = useCallback(async (phone: string) => {
        setIsLoading(true);
        try {
            // 1. Check if user exists in the database
            const { data, error } = await insforge.database
                .from('users')
                .select('*')
                .eq('phone', phone)
                .single();

            if (error || !data) {
                // Not found, user is new
                pendingUserRef.current = null;
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
                pendingUserRef.current = userObj;
                setIsNewUser(false);
            }

            // 2. Send OTP via Firebase Phone Auth
            // Normalize phone to E.164 format for Firebase: +18765550100
            const e164Phone = phone.replace(/\s/g, '');

            if (Platform.OS === 'web') {
                // Web: Use Firebase JS SDK with RecaptchaVerifier
                if (!recaptchaVerifierRef.current) {
                    recaptchaVerifierRef.current = new WebRecaptchaVerifier(webAuth, 'recaptcha-container', {
                        size: 'invisible',
                    });
                }
                const confirmation = await webSignInWithPhoneNumber(webAuth, e164Phone, recaptchaVerifierRef.current);
                confirmationRef.current = confirmation;
            } else {
                // Native: Use @react-native-firebase/auth
                const confirmation = await nativeAuth().signInWithPhoneNumber(e164Phone);
                confirmationRef.current = confirmation;
            }
        } catch (error) {
            console.error('Login error:', error);
            setIsNewUser(true);
            // Reset reCAPTCHA on error so it can be retried
            if (Platform.OS === 'web' && recaptchaVerifierRef.current) {
                try { recaptchaVerifierRef.current.clear(); } catch (_) { }
                recaptchaVerifierRef.current = null;
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const verifyOtp = useCallback(async (code: string) => {
        setIsLoading(true);
        try {
            if (!confirmationRef.current) {
                console.error('No confirmation result found. Did you call login() first?');
                return { success: false, user: null };
            }
            await confirmationRef.current.confirm(code);
            // If confirm() doesn't throw, the code is valid — commit the
            // session for existing users now (null for new registrations).
            confirmationRef.current = null;
            const verifiedUser = pendingUserRef.current;
            pendingUserRef.current = null;
            if (verifiedUser) {
                setUser(verifiedUser);
                AsyncStorage.setItem('authUser', JSON.stringify(verifiedUser)).catch(console.error);
            }
            return { success: true, user: verifiedUser };
        } catch (error) {
            console.error('OTP verification failed:', error);
            return { success: false, user: null };
        } finally {
            setIsLoading(false);
        }
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
            AsyncStorage.setItem('authUser', JSON.stringify(newUser)).catch(console.error);
        } catch (error) {
            console.error('Error during registration:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const setUserRole = useCallback((role: UserRole) => {
        setUser((prev) => {
            if (!prev) return null;
            const updated = { ...prev, role };
            AsyncStorage.setItem('authUser', JSON.stringify(updated)).catch(console.error);
            return updated;
        });
    }, []);

    const updateProfile = useCallback((data: Partial<AuthUser>) => {
        setUser((prev) => {
            if (!prev) return null;
            const updated = { ...prev, ...data };
            AsyncStorage.setItem('authUser', JSON.stringify(updated)).catch(console.error);
            return updated;
        });
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setIsNewUser(true);
        confirmationRef.current = null;
        pendingUserRef.current = null;
        AsyncStorage.removeItem('authUser').catch(console.error);
        if (Platform.OS === 'web') {
            webAuth?.signOut().catch(console.error);
        } else {
            nativeAuth?.().signOut().catch(console.error);
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                isBootstrapping,
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
