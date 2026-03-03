import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface RegistrationData {
    // Role
    selectedRole: 'driver' | 'owner';

    // Shared fields (Step 2)
    fullName: string;
    trn: string;
    parish: string;
    phone: string;

    // Owner-specific (Steps 2-3)
    businessName: string;
    numberOfVehicles: number;
    routeLicenceNumber: string;
    primaryRoutes: string[];

    // Driver-specific (Step 3)
    driversLicenceNumber: string;
    licenceClass: string;
    tlcNumber: string;
    routeExperience: string[];
    yearsOfExperience: number;

    // Terms (Step 4)
    agreedToTerms: boolean;
    agreedToPrivacy: boolean;
    availableForHire: boolean;
    referralCode: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
}

const defaultData: RegistrationData = {
    selectedRole: 'driver',
    fullName: '',
    trn: '',
    parish: '',
    phone: '',
    businessName: '',
    numberOfVehicles: 1,
    routeLicenceNumber: '',
    primaryRoutes: [],
    driversLicenceNumber: '',
    licenceClass: '',
    tlcNumber: '',
    routeExperience: [],
    yearsOfExperience: 0,
    agreedToTerms: false,
    agreedToPrivacy: false,
    availableForHire: true,
    referralCode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
};

interface RegistrationContextType {
    data: RegistrationData;
    updateField: <K extends keyof RegistrationData>(key: K, value: RegistrationData[K]) => void;
    updateFields: (fields: Partial<RegistrationData>) => void;
    reset: () => void;
    validateStep2: () => Record<string, string>;
    validateStep3: () => Record<string, string>;
    validateStep4: () => Record<string, string>;
}

const RegistrationContext = createContext<RegistrationContextType | null>(null);

export function useRegistration() {
    const ctx = useContext(RegistrationContext);
    if (!ctx) throw new Error('useRegistration must be used within RegistrationProvider');
    return ctx;
}

export function RegistrationProvider({ children }: { children: ReactNode }) {
    const [data, setData] = useState<RegistrationData>({ ...defaultData });

    const updateField = useCallback(<K extends keyof RegistrationData>(key: K, value: RegistrationData[K]) => {
        setData((prev) => ({ ...prev, [key]: value }));
    }, []);

    const updateFields = useCallback((fields: Partial<RegistrationData>) => {
        setData((prev) => ({ ...prev, ...fields }));
    }, []);

    const reset = useCallback(() => {
        setData({ ...defaultData });
    }, []);

    // Step 2 validation: Personal Details
    const validateStep2 = useCallback((): Record<string, string> => {
        const errors: Record<string, string> = {};
        if (!data.fullName || data.fullName.trim().length < 3) {
            errors.fullName = 'Full name must be at least 3 characters';
        }
        if (!/^[a-zA-Z\s]+$/.test(data.fullName)) {
            errors.fullName = 'Name must contain only letters and spaces';
        }
        if (!data.trn || data.trn.length !== 9 || !/^\d{9}$/.test(data.trn)) {
            errors.trn = 'TRN must be exactly 9 digits';
        }
        if (!data.parish) {
            errors.parish = 'Please select your parish';
        }
        if (data.selectedRole === 'owner' && data.numberOfVehicles < 1) {
            errors.numberOfVehicles = 'Must have at least 1 vehicle';
        }
        return errors;
    }, [data]);

    // Step 3 validation: Licensing
    const validateStep3 = useCallback((): Record<string, string> => {
        const errors: Record<string, string> = {};
        if (data.selectedRole === 'owner') {
            if (!data.routeLicenceNumber) {
                errors.routeLicenceNumber = 'Route Licence Number is required';
            }
            if (data.primaryRoutes.length === 0) {
                errors.primaryRoutes = 'Select at least one primary route';
            }
        } else {
            if (!data.driversLicenceNumber) {
                errors.driversLicenceNumber = "Driver's Licence Number is required";
            }
            if (!data.licenceClass) {
                errors.licenceClass = 'Please select your licence class';
            }
            if (!data.tlcNumber) {
                errors.tlcNumber = 'PPV Badge Number is required';
            }
            if (data.routeExperience.length === 0) {
                errors.routeExperience = 'Select at least one route you have experience with';
            }
        }
        return errors;
    }, [data]);

    // Step 4 validation: Terms
    const validateStep4 = useCallback((): Record<string, string> => {
        const errors: Record<string, string> = {};
        if (!data.agreedToTerms) {
            errors.agreedToTerms = 'You must agree to the Terms of Service';
        }
        if (!data.agreedToPrivacy) {
            errors.agreedToPrivacy = 'You must agree to the Privacy Policy';
        }
        return errors;
    }, [data]);

    return (
        <RegistrationContext.Provider
            value={{
                data,
                updateField,
                updateFields,
                reset,
                validateStep2,
                validateStep3,
                validateStep4,
            }}
        >
            {children}
        </RegistrationContext.Provider>
    );
}
