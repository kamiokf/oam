import { Alert, Platform } from 'react-native';

interface AlertButton {
    text: string;
    style?: 'default' | 'cancel' | 'destructive';
    onPress?: () => void;
}

/**
 * Cross-platform alert that works on both native and web.
 * On native: uses Alert.alert()
 * On web: uses window.alert() for simple messages,
 *          window.confirm() when there are Cancel/OK-style buttons.
 */
export function showAlert(
    title: string,
    message?: string,
    buttons?: AlertButton[]
): void {
    if (Platform.OS === 'web') {
        const fullMessage = message ? `${title}\n\n${message}` : title;

        if (!buttons || buttons.length <= 1) {
            // Simple alert — just show and optionally call onPress
            window.alert(fullMessage);
            buttons?.[0]?.onPress?.();
        } else {
            // Has multiple buttons — use confirm for cancel/ok pattern
            const destructiveOrDefault = buttons.find(
                (b) => b.style !== 'cancel'
            );
            const cancelBtn = buttons.find((b) => b.style === 'cancel');

            const confirmed = window.confirm(fullMessage);
            if (confirmed) {
                destructiveOrDefault?.onPress?.();
            } else {
                cancelBtn?.onPress?.();
            }
        }
    } else {
        Alert.alert(title, message, buttons);
    }
}
