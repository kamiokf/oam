import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
    const [smsEnabled, setSmsEnabled] = useState(true);
    const [smsJobMatch, setSmsJobMatch] = useState(true);
    const [smsDocExpiry, setSmsDocExpiry] = useState(true);
    const [smsDispute, setSmsDispute] = useState(true);

    const sections = [
        {
            title: 'Notifications',
            items: [
                { icon: 'notifications' as const, label: 'Push Notifications', type: 'toggle' as const, value: true, onToggle: () => { } },
                { icon: 'chatbubble-ellipses' as const, label: 'SMS Alerts', type: 'toggle' as const, value: smsEnabled, onToggle: () => setSmsEnabled(!smsEnabled) },
            ],
        },
        ...(smsEnabled ? [{
            title: 'SMS Alert Categories',
            subtitle: 'Critical alerts sent via SMS when data is spotty',
            items: [
                { icon: 'briefcase' as const, label: 'Job Match Alerts', type: 'toggle' as const, value: smsJobMatch, onToggle: () => setSmsJobMatch(!smsJobMatch) },
                { icon: 'document-text' as const, label: 'Document Expiry', type: 'toggle' as const, value: smsDocExpiry, onToggle: () => setSmsDocExpiry(!smsDocExpiry) },
                { icon: 'alert-circle' as const, label: 'Dispute Updates', type: 'toggle' as const, value: smsDispute, onToggle: () => setSmsDispute(!smsDispute) },
            ],
        }] : []),
        {
            title: 'Preferences',
            items: [
                { icon: 'moon' as const, label: 'Dark Mode', type: 'toggle' as const, value: true, onToggle: () => { } },
                { icon: 'location' as const, label: 'GPS Tracking', type: 'toggle' as const, value: true, onToggle: () => { } },
                { icon: 'language' as const, label: 'Language', type: 'nav' as const, subtitle: 'English' },
            ],
        },
        {
            title: 'Support',
            items: [
                { icon: 'help-circle' as const, label: 'Help Center', type: 'nav' as const },
                { icon: 'chatbubble-ellipses' as const, label: 'Contact Support', type: 'nav' as const },
                { icon: 'document-text' as const, label: 'Terms of Service', type: 'nav' as const },
                { icon: 'shield' as const, label: 'Privacy Policy', type: 'nav' as const },
            ],
        },
        {
            title: 'About',
            items: [
                { icon: 'information-circle' as const, label: "About One'N'Move", type: 'nav' as const, subtitle: 'Version 1.0.0' },
                { icon: 'star' as const, label: 'Rate the App', type: 'nav' as const },
            ],
        },
    ];

    return (
        <ScreenWrapper title="Settings">
            {sections.map((section, si) => (
                <View key={si} style={styles.section}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    {'subtitle' in section && section.subtitle && <Text style={styles.sectionSub}>{section.subtitle}</Text>}
                    <Card padding="none">
                        {section.items.map((item, ii) => (
                            <TouchableOpacity key={ii} style={[styles.menuItem, ii < section.items.length - 1 && styles.menuItemBorder]} activeOpacity={0.7}>
                                <View style={styles.menuIcon}>
                                    <Ionicons name={item.icon} size={20} color={Colors.textSecondary} />
                                </View>
                                <View style={styles.menuBody}>
                                    <Text style={styles.menuLabel}>{item.label}</Text>
                                    {'subtitle' in item && item.subtitle && <Text style={styles.menuSub}>{item.subtitle}</Text>}
                                </View>
                                {item.type === 'toggle' ? (
                                    <Switch
                                        value={item.value}
                                        onValueChange={item.onToggle}
                                        trackColor={{ false: Colors.surfaceBorder, true: Colors.primaryLight }}
                                        thumbColor="#fff"
                                    />
                                ) : (
                                    <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </Card>
                </View>
            ))}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    section: { marginBottom: Spacing.xl, gap: Spacing.sm },
    sectionTitle: { ...Typography.captionBold, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
    sectionSub: { ...Typography.small, color: Colors.textMuted, marginBottom: Spacing.xs },
    menuItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.lg, paddingHorizontal: Spacing.lg },
    menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder },
    menuIcon: { width: 32, alignItems: 'center' },
    menuBody: { flex: 1, gap: 2 },
    menuLabel: { ...Typography.body, color: Colors.textPrimary },
    menuSub: { ...Typography.caption, color: Colors.textMuted },
});
