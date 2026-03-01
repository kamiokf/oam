import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
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
    const [activeView, setActiveView] = useState<ActiveView>('driver');

    // Derive isDualRole from the user's registered role
    const isDualRole = user?.role === 'both';

    // Sync activeView when user logs in or role changes
    useEffect(() => {
        if (user) {
            if (user.role === 'owner') {
                setActiveView('owner');
            } else if (user.role === 'driver') {
                setActiveView('driver');
            }
            // If 'both', keep current activeView
        }
    }, [user?.role]);

    const switchRole = useCallback((role: ActiveView) => {
        setActiveView(role);
    }, []);

    const toggleRole = useCallback(() => {
        setActiveView((prev) => (prev === 'driver' ? 'owner' : 'driver'));
    }, []);

    return (
        <RoleContext.Provider value={{ activeView, switchRole, toggleRole, isDualRole }}>
            {children}
        </RoleContext.Provider>
    );
}

export const useRole = () => useContext(RoleContext);
