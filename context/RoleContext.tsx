import React, { createContext, useContext, useState, useCallback } from 'react';

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
    isDualRole: true,
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
    const [activeView, setActiveView] = useState<ActiveView>('driver');
    const [isDualRole] = useState(true);

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
