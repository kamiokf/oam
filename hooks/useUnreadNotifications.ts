import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { insforge } from '../lib/insforge';

export function useUnreadNotifications() {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user?.id) return;

        let cancelled = false;

        async function fetchCount() {
            try {
                const { data, error } = await insforge.database
                    .from('notifications')
                    .select('id')
                    .eq('user_id', user!.id)
                    .eq('is_read', false)
                    .limit(99);

                if (!error && data && !cancelled) {
                    setUnreadCount(data.length);
                }
            } catch (err) {
                // silently fail — badge is non-critical
            }
        }

        fetchCount();

        // Poll every 30 seconds for new notifications
        const interval = setInterval(fetchCount, 30000);
        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [user?.id]);

    return unreadCount;
}
