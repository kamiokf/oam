import { TextStyle, Platform } from 'react-native';

const fontFamily = Platform.select({
    ios: 'System',
    android: 'Roboto',
    web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
});

export const Typography: Record<string, TextStyle> = {
    hero: {
        fontFamily,
        fontSize: 32,
        fontWeight: '800',
        lineHeight: 40,
        letterSpacing: -0.5,
    },
    h1: {
        fontFamily,
        fontSize: 28,
        fontWeight: '700',
        lineHeight: 36,
        letterSpacing: -0.3,
    },
    h2: {
        fontFamily,
        fontSize: 22,
        fontWeight: '700',
        lineHeight: 28,
    },
    h3: {
        fontFamily,
        fontSize: 18,
        fontWeight: '600',
        lineHeight: 24,
    },
    h4: {
        fontFamily,
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 22,
    },
    body: {
        fontFamily,
        fontSize: 15,
        fontWeight: '400',
        lineHeight: 22,
    },
    bodyBold: {
        fontFamily,
        fontSize: 15,
        fontWeight: '600',
        lineHeight: 22,
    },
    caption: {
        fontFamily,
        fontSize: 13,
        fontWeight: '400',
        lineHeight: 18,
    },
    captionBold: {
        fontFamily,
        fontSize: 13,
        fontWeight: '600',
        lineHeight: 18,
    },
    small: {
        fontFamily,
        fontSize: 11,
        fontWeight: '400',
        lineHeight: 16,
    },
    button: {
        fontFamily,
        fontSize: 15,
        fontWeight: '700',
        lineHeight: 20,
        letterSpacing: 0.3,
    },
    tabLabel: {
        fontFamily,
        fontSize: 10,
        fontWeight: '600',
        lineHeight: 14,
    },
    number: {
        fontFamily,
        fontSize: 24,
        fontWeight: '800',
        lineHeight: 30,
        letterSpacing: -0.5,
    },
    numberLarge: {
        fontFamily,
        fontSize: 36,
        fontWeight: '800',
        lineHeight: 42,
        letterSpacing: -1,
    },
};
