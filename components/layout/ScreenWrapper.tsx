import React from 'react';
import { View, Text, StyleSheet, ScrollView, ViewStyle, StatusBar, RefreshControlProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';

interface ScreenWrapperProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    headerRight?: React.ReactNode;
    scrollable?: boolean;
    padded?: boolean;
    style?: ViewStyle;
    refreshControl?: React.ReactElement<RefreshControlProps>;
}

export function ScreenWrapper({
    children,
    title,
    subtitle,
    headerRight,
    scrollable = true,
    padded = true,
    style,
    refreshControl,
}: ScreenWrapperProps) {
    const insets = useSafeAreaInsets();

    const content = (
        <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }, style]}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
            {(title || headerRight) && (
                <View style={[styles.header, padded && styles.padded]}>
                    <View style={styles.headerLeft}>
                        {title && <Text style={styles.title}>{title}</Text>}
                        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                    </View>
                    {headerRight && <View style={styles.headerRight}>{headerRight}</View>}
                </View>
            )}
            {scrollable ? (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[styles.scrollContent, padded && styles.padded]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={refreshControl}
                >
                    {children}
                </ScrollView>
            ) : (
                <View style={[styles.body, padded && styles.padded]}>{children}</View>
            )}
        </View>
    );

    return content;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        maxWidth: 1024,
        width: '100%',
        alignSelf: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingTop: Spacing.md,
        paddingBottom: Spacing.lg,
    },
    headerLeft: {
        flex: 1,
        gap: Spacing.xs,
    },
    headerRight: {
        marginLeft: Spacing.lg,
    },
    title: {
        ...Typography.h1,
        color: Colors.textPrimary,
    },
    subtitle: {
        ...Typography.body,
        color: Colors.textSecondary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    body: {
        flex: 1,
    },
    padded: {
        paddingHorizontal: Spacing.xl,
    },
});
