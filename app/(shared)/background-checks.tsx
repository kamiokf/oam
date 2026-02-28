import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Ionicons } from '@expo/vector-icons';

const checks = [
    { id: 'police', name: 'Police Record', icon: 'shield-checkmark', description: 'Clean criminal record from JCF', status: 'verified', verifiedDate: '2026-01-15', expiryDate: '2027-01-15' },
    { id: 'license', name: 'License Validation', icon: 'card', description: 'Valid PPV/TLC license from ITA', status: 'verified', verifiedDate: '2026-01-10', expiryDate: '2026-12-01' },
    { id: 'references', name: 'Reference Checks', icon: 'people', description: 'Two professional references verified', status: 'verified', verifiedDate: '2026-02-01' },
];

const TIERS = [
    { level: 'basic', label: 'Basic', desc: 'License only', min: 1, color: Colors.textMuted },
    { level: 'standard', label: 'Standard', desc: '+ Police record', min: 2, color: Colors.info },
    { level: 'premium', label: 'Premium', desc: '+ References', min: 3, color: Colors.primary },
];

const statusCfg: Record<string, { icon: string; color: string; label: string }> = {
    verified: { icon: 'checkmark-circle', color: Colors.success, label: 'Verified' },
    pending: { icon: 'time', color: Colors.warning, label: 'Pending' },
    expired: { icon: 'alert-circle', color: Colors.error, label: 'Expired' },
    not_submitted: { icon: 'add-circle', color: Colors.textMuted, label: 'Not Submitted' },
};

export default function BackgroundChecksScreen() {
    const verified = checks.filter((c) => c.status === 'verified').length;
    const tier = [...TIERS].reverse().find((t) => verified >= t.min) || TIERS[0];

    return (
        <ScreenWrapper title="Background Checks" subtitle="Build trust with verified credentials">
            {/* Trust Badge */}
            <Card variant="highlighted" style={styles.badgeCard}>
                <View style={styles.badgeRow}>
                    <View style={[styles.badgeIcon, { backgroundColor: `${tier.color}20` }]}>
                        <Ionicons name="shield-checkmark" size={32} color={tier.color} />
                    </View>
                    <View style={styles.badgeInfo}>
                        <Badge label={`${tier.label} Verified`} variant={tier.level === 'premium' ? 'primary' : 'info'} />
                        <Text style={styles.badgeDesc}>{tier.desc}</Text>
                    </View>
                </View>
                <View style={styles.progressWrap}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>Progress</Text>
                        <Text style={styles.progressCount}>{verified}/{checks.length}</Text>
                    </View>
                    <View style={styles.progressTrack}>
                        <View style={[styles.progressBar, { width: `${(verified / checks.length) * 100}%` }]} />
                    </View>
                </View>
            </Card>

            {/* Steps */}
            <SectionHeader title="Verification Steps" style={styles.section} />
            {checks.map((check, i) => {
                const cfg = statusCfg[check.status];
                return (
                    <Card key={check.id} style={styles.checkCard}>
                        <View style={styles.checkRow}>
                            <View style={styles.stepNum}><Text style={styles.stepNumText}>{i + 1}</Text></View>
                            <View style={styles.checkInfo}>
                                <Text style={styles.checkName}>{check.name}</Text>
                                <Text style={styles.checkDesc}>{check.description}</Text>
                            </View>
                            <Ionicons name={cfg.icon as any} size={24} color={cfg.color} />
                        </View>
                        <View style={styles.checkMeta}>
                            <Badge label={cfg.label} variant={check.status === 'verified' ? 'success' : 'warning'} size="sm" />
                            {check.verifiedDate && <Text style={styles.metaDate}>Verified: {check.verifiedDate}</Text>}
                            {check.expiryDate && <Text style={styles.metaDate}>Expires: {check.expiryDate}</Text>}
                        </View>
                    </Card>
                );
            })}

            {/* Tiers */}
            <SectionHeader title="Verification Tiers" style={styles.section} />
            <Card>{TIERS.map((t, i) => (
                <View key={i} style={[styles.tierRow, i < 2 && styles.tierBorder]}>
                    <View style={[styles.tierDot, { backgroundColor: `${t.color}20` }]}>
                        <Ionicons name="shield" size={16} color={t.color} />
                    </View>
                    <View style={styles.tierText}>
                        <Text style={styles.tierName}>{t.label}</Text>
                        <Text style={styles.tierDesc}>{t.desc}</Text>
                    </View>
                    {tier.level === t.level && <Badge label="Current" variant="primary" size="sm" />}
                </View>
            ))}</Card>

            {/* Benefits */}
            <SectionHeader title="Benefits" style={styles.section} />
            <Card>{[
                { icon: 'trending-up' as const, t: '+10 bonus match points' },
                { icon: 'star' as const, t: 'Verified badge on profile' },
                { icon: 'flash' as const, t: 'Priority in job searches' },
                { icon: 'shield-checkmark' as const, t: 'Faster hiring from owners' },
            ].map((b, i) => (
                <View key={i} style={[styles.benefitRow, i < 3 && styles.tierBorder]}>
                    <Ionicons name={b.icon} size={16} color={Colors.primary} />
                    <Text style={styles.benefitText}>{b.t}</Text>
                </View>
            ))}</Card>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    badgeCard: { marginBottom: Spacing.lg },
    badgeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, marginBottom: Spacing.xl },
    badgeIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
    badgeInfo: { flex: 1, gap: Spacing.sm },
    badgeDesc: { ...Typography.caption, color: Colors.textSecondary },
    progressWrap: { gap: Spacing.sm },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    progressLabel: { ...Typography.captionBold, color: Colors.textSecondary },
    progressCount: { ...Typography.captionBold, color: Colors.primary },
    progressTrack: { height: 8, backgroundColor: Colors.surfaceLight, borderRadius: 4, overflow: 'hidden' },
    progressBar: { height: '100%', backgroundColor: Colors.primary, borderRadius: 4 },
    section: { marginTop: Spacing.xl },
    checkCard: { marginBottom: Spacing.md },
    checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, marginBottom: Spacing.md },
    stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center' },
    stepNumText: { ...Typography.captionBold, color: Colors.primary },
    checkInfo: { flex: 1, gap: 4 },
    checkName: { ...Typography.bodyBold, color: Colors.textPrimary },
    checkDesc: { ...Typography.caption, color: Colors.textMuted },
    checkMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    metaDate: { ...Typography.small, color: Colors.textMuted },
    tierRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.lg },
    tierBorder: { borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder },
    tierDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    tierText: { flex: 1, gap: 2 },
    tierName: { ...Typography.bodyBold, color: Colors.textPrimary },
    tierDesc: { ...Typography.caption, color: Colors.textMuted },
    benefitRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md },
    benefitText: { ...Typography.body, color: Colors.textSecondary, flex: 1 },
});
