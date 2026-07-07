import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

export type ActiveView = 'driver' | 'owner';

interface RoleContextType {
    activeView: ActiveView;
    switchRole: (role: ActiveView) => void;
    toggleRole: () => void;
    isDualRole: boolean;
}

const RoleContext = createContext<RoleContextType>({
    activeView: 'driver',
    switchRole: () => { },
    toggleRole: () => { },
    isDualRole: false,
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    // Manual selection only applies to dual-role users; single-role users
    // derive their view directly so it's correct on the very first render.
    const [manualView, setManualView] = useState<ActiveView>('driver');

    // Derive isDualRole from the user's registered role
    const isDualRole = user?.role === 'both';

    const activeView: ActiveView = isDualRole
        ? manualView
        : user?.role === 'owner' ? 'owner' : 'driver';

    const switchRole = useCallback((role: ActiveView) => {
        setManualView(role);
    }, []);

    const toggleRole = useCallback(() => {
        setManualView((prev) => (prev === 'driver' ? 'owner' : 'driver'));
    }, []);

    return (
        <RoleContext.Provider value={{ activeView, switchRole, toggleRole, isDualRole }}>
            {children}
        </RoleContext.Provider>
    );
}

export const useRole = () => useContext(RoleContext);
