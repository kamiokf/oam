import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { insforge } from '../../lib/insforge';

interface DocumentRecord {
    id: string;
    type: string;
    status: string;
    upload_date: string;
    expiry_date?: string;
    rejection_reason?: string;
    file_url?: string;
}

const TIERS = [
    { level: 'registered', label: 'Registered', desc: 'Account created', min: 0, color: Colors.textMuted },
    { level: 'verified', label: 'Verified', desc: 'Core docs approved', min: 2, color: Colors.info },
    { level: 'fully_verified', label: 'Fully Verified', desc: 'All docs + background', min: 3, color: Colors.primary },
];

const statusCfg: Record<string, { icon: string; color: string; label: string; badgeVariant: 'success' | 'warning' | 'error' | 'info' }> = {
    approved: { icon: 'checkmark-circle', color: Colors.success, label: 'Approved', badgeVariant: 'success' },
    pending: { icon: 'time', color: Colors.warning, label: 'Pending', badgeVariant: 'warning' },
    rejected: { icon: 'close-circle', color: Colors.error, label: 'Rejected', badgeVariant: 'error' },
    reupload_requested: { icon: 'refresh-circle', color: Colors.warning, label: 'Re-upload', badgeVariant: 'warning' },
    flagged: { icon: 'flag', color: Colors.error, label: 'Flagged', badgeVariant: 'error' },
    expired: { icon: 'alert-circle', color: Colors.error, label: 'Expired', badgeVariant: 'error' },
};

const DOC_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
    'Drivers Licence': 'card-outline',
    'PPV Badge': 'shield-outline',
    'Police Record': 'document-text-outline',
    'TRN Card': 'id-card-outline',
    'Route Licence': 'document-text-outline',
    'Insurance Certificate': 'shield-checkmark-outline',
    'Fitness Certificate': 'car-outline',
};

export default function BackgroundChecksScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [documents, setDocuments] = useState<DocumentRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDocuments = useCallback(async () => {
        if (!user) return;
        try {
            setIsLoading(true);
            const { data, error } = await insforge.database
                .from('user_documents')
                .select('*')
                .eq('user_id', user.id)
                .order('upload_date', { ascending: false });

            if (error) throw error;
            setDocuments(data || []);
        } catch (err) {
            console.error('Failed to fetch documents:', err);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const approvedCount = documents.filter(d => d.status === 'approved').length;
    const currentTier = [...TIERS].reverse().find(t => approvedCount >= t.min) || TIERS[0];

    if (isLoading) {
        return (
            <ScreenWrapper title="Background Checks" subtitle="Build trust with verified credentials">
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Loading your documents...</Text>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper title="Background Checks" subtitle="Build trust with verified credentials">
            {/* Trust Badge */}
            <Card variant="highlighted" style={styles.badgeCard}>
                <View style={styles.badgeRow}>
                    <View style={[styles.badgeIcon, { backgroundColor: `${currentTier.color}20` }]}>
                        <Ionicons name="shield-checkmark" size={32} color={currentTier.color} />
                    </View>
                    <View style={styles.badgeInfo}>
                        <Badge
                            label={`${currentTier.label}`}
                            variant={currentTier.level === 'fully_verified' ? 'primary' : currentTier.level === 'verified' ? 'info' : 'warning'}
                        />
                        <Text style={styles.badgeDesc}>{currentTier.desc}</Text>
                    </View>
                </View>
                <View style={styles.progressWrap}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>Documents Approved</Text>
                        <Text style={styles.progressCount}>{approvedCount}/{documents.length}</Text>
                    </View>
                    <View style={styles.progressTrack}>
                        <View style={[styles.progressBar, {
                            width: documents.length > 0 ? `${(approvedCount / documents.length) * 100}%` : '0%'
                        }]} />
                    </View>
                </View>
            </Card>

            {/* Documents */}
            <SectionHeader title="Your Documents" style={styles.section} />

            {documents.length === 0 ? (
                <Card style={styles.emptyCard}>
                    <View style={styles.emptyContent}>
                        <Ionicons name="document-text-outline" size={48} color={Colors.textMuted} />
                        <Text style={styles.emptyTitle}>No Documents Uploaded</Text>
                        <Text style={styles.emptyDesc}>Upload your credentials to get verified and unlock more opportunities.</Text>
                        <Button
                            title="Upload Documents"
                            onPress={() => router.push('/(shared)/document-upload')}
                            size="lg"
                        />
                    </View>
                </Card>
            ) : (
                <>
                    {documents.map((doc, i) => {
                        const cfg = statusCfg[doc.status] || statusCfg.pending;
                        const icon = DOC_ICONS[doc.type] || 'document-outline';

                        return (
                            <Card key={doc.id} style={styles.checkCard}>
                                <View style={styles.checkRow}>
                                    <View style={styles.stepNum}>
                                        <Ionicons name={icon} size={18} color={Colors.primary} />
                                    </View>
                                    <View style={styles.checkInfo}>
                                        <Text style={styles.checkName}>{doc.type}</Text>
                                        {doc.rejection_reason && (
                                            <Text style={styles.rejectionText}>
                                                Reason: {doc.rejection_reason}
                                            </Text>
                                        )}
                                    </View>
                                    <Ionicons name={cfg.icon as any} size={24} color={cfg.color} />
                                </View>
                                <View style={styles.checkMeta}>
                                    <Badge label={cfg.label} variant={cfg.badgeVariant} size="sm" />
                                    {doc.upload_date && (
                                        <Text style={styles.metaDate}>
                                            Uploaded: {new Date(doc.upload_date).toLocaleDateString()}
                                        </Text>
                                    )}
                                    {doc.expiry_date && (
                                        <Text style={styles.metaDate}>
                                            Expires: {new Date(doc.expiry_date).toLocaleDateString()}
                                        </Text>
                                    )}
                                </View>
                            </Card>
                        );
                    })}

                    {/* Upload more button */}
                    <TouchableOpacity
                        style={styles.uploadMoreBtn}
                        onPress={() => router.push('/(shared)/document-upload')}
                    >
                        <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
                        <Text style={styles.uploadMoreText}>Upload More Documents</Text>
                    </TouchableOpacity>
                </>
            )}

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
                    {currentTier.level === t.level && <Badge label="Current" variant="primary" size="sm" />}
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
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: Spacing.lg },
    loadingText: { ...Typography.body, color: Colors.textMuted },
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
    emptyCard: { marginBottom: Spacing.lg },
    emptyContent: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xl },
    emptyTitle: { ...Typography.h4, color: Colors.textPrimary },
    emptyDesc: { ...Typography.body, color: Colors.textMuted, textAlign: 'center', lineHeight: 22, paddingHorizontal: Spacing.lg },
    checkCard: { marginBottom: Spacing.md },
    checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, marginBottom: Spacing.md },
    stepNum: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center' },
    checkInfo: { flex: 1, gap: 4 },
    checkName: { ...Typography.bodyBold, color: Colors.textPrimary },
    rejectionText: { ...Typography.caption, color: Colors.error, lineHeight: 18 },
    checkMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flexWrap: 'wrap' },
    metaDate: { ...Typography.small, color: Colors.textMuted },
    uploadMoreBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: Spacing.sm, paddingVertical: Spacing.lg,
        borderRadius: BorderRadius.lg, borderWidth: 1, borderStyle: 'dashed',
        borderColor: Colors.primary + '50',
        marginBottom: Spacing.md,
    },
    uploadMoreText: { ...Typography.bodyBold, color: Colors.primary },
    tierRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.lg },
    tierBorder: { borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder },
    tierDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    tierText: { flex: 1, gap: 2 },
    tierName: { ...Typography.bodyBold, color: Colors.textPrimary },
    tierDesc: { ...Typography.caption, color: Colors.textMuted },
    benefitRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md },
    benefitText: { ...Typography.body, color: Colors.textSecondary, flex: 1 },
});
