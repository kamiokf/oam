import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Platform } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency, formatRelativeDate } from '../../utils/formatting';
import { getReferralStats, REFERRAL_BONUSES, REFERRAL_TIERS, Referral } from '../../data/referrals';
import { insforge } from '../../lib/insforge';
import { useAuth } from '../../context/AuthContext';
import { showAlert } from '../../utils/alert';

export default function ReferralsScreen() {
    const { user } = useAuth();
    const [referrals, setReferrals] = React.useState<Referral[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchReferrals() {
            if (!user) return;
            try {
                const { data, error } = await insforge.database
                    .from('referrals')
                    .select(`
                        id,
                        referred_by,
                        referred_user,
                        type,
                        status,
                        bonus_amount,
                        referral_code,
                        date_referred,
                        date_completed,
                        date_paid,
                        refUser:referred_user ( name, avatar )
                    `)
                    .eq('referred_by', user.id)
                    .order('date_referred', { ascending: false });

                if (error) throw error;

                const mapped: Referral[] = (data || []).map(r => {
                    const refUserObj = Array.isArray(r.refUser) ? r.refUser[0] : r.refUser;
                    return {
                        id: r.id,
                        referredBy: r.referred_by,
                        referredByName: user.name,
                        referredByAvatar: user.avatar || '',
                        referredUser: r.referred_user,
                        referredUserName: refUserObj?.name || 'Unknown',
                        referredUserAvatar: refUserObj?.avatar || '?',
                        type: r.type as 'driver' | 'owner',
                        status: r.status as any,
                        bonusAmount: Number(r.bonus_amount),
                        referralCode: r.referral_code,
                        dateReferred: r.date_referred,
                        dateCompleted: r.date_completed,
                        datePaid: r.date_paid,
                    };
                });

                setReferrals(mapped);
            } catch (err) {
                console.error("Failed to fetch referrals:", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchReferrals();
    }, [user?.id]);

    const stats = getReferralStats(referrals, user?.id || '');

    const myCode = referrals[0]?.referralCode
        || (user?.name ? user.name.split(' ')[0].toUpperCase() + new Date().getFullYear() : 'CODE2026');

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Join One'N'Move — Jamaica's smart transport platform! Use my code ${myCode} to sign up and we both earn a bonus. Download now: https://onenmove.web.app`,
            });
        } catch (e) { }
    };

    const statusConfig = {
        pending: { label: 'Pending', variant: 'warning' as const },
        active: { label: 'Active', variant: 'info' as const },
        completed: { label: 'Completed', variant: 'success' as const },
        paid: { label: 'Paid', variant: 'primary' as const },
    };

    return (
        <ScreenWrapper title="Referrals" subtitle="Earn bonuses by growing the community">
            {/* Referral Code Card */}
            <Card variant="highlighted" style={styles.codeCard}>
                <View style={styles.codeHeader}>
                    <Ionicons name="gift" size={28} color={Colors.primary} />
                    <Text style={styles.codeTitle}>Your Referral Code</Text>
                </View>
                <View style={styles.codeDisplay}>
                    <Text style={styles.codeText}>{user?.name ? user.name.split(' ')[0].toUpperCase() + '2026' : 'CODE2026'}</Text>
                </View>
                <View style={styles.codeActions}>
                    <TouchableOpacity style={styles.codeBtn} onPress={handleShare}>
                        <Ionicons name="share-social" size={18} color={Colors.primary} />
                        <Text style={styles.codeBtnText}>Share</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.codeBtn} onPress={() => {
                        showAlert('Code Copied! 📋', 'Your referral code has been copied to your clipboard. Share it with friends to earn bonuses!');
                    }}>
                        <Ionicons name="copy" size={18} color={Colors.primary} />
                        <Text style={styles.codeBtnText}>Copy</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.codeBonus}>
                    Earn {formatCurrency(REFERRAL_BONUSES.driver)} per driver • {formatCurrency(REFERRAL_BONUSES.owner)} per owner
                </Text>
            </Card>

            {/* Stats */}
            <View style={styles.statsRow}>
                <Card style={styles.statCard}>
                    <Text style={styles.statValue}>{stats.totalReferred}</Text>
                    <Text style={styles.statLabel}>Referred</Text>
                </Card>
                <Card style={styles.statCard}>
                    <Text style={[styles.statValue, { color: Colors.success }]}>{formatCurrency(stats.totalEarned)}</Text>
                    <Text style={styles.statLabel}>Earned</Text>
                </Card>
                <Card style={styles.statCard}>
                    <Text style={[styles.statValue, { color: Colors.warning }]}>{formatCurrency(stats.pendingAmount)}</Text>
                    <Text style={styles.statLabel}>Pending</Text>
                </Card>
            </View>

            {/* Tier Progress */}
            <SectionHeader title="Referral Tier" style={styles.section} />
            <Card>
                <View style={styles.tierHeader}>
                    <Badge label={stats.tier} variant="primary" />
                    {stats.nextTier && (
                        <Text style={styles.tierNext}>
                            {stats.nextTier.count - stats.totalReferred} more to reach {stats.nextTier.label}
                        </Text>
                    )}
                </View>
                <View style={styles.tierTrack}>
                    {REFERRAL_TIERS.map((tier, i) => {
                        const isReached = stats.totalReferred >= tier.count;
                        return (
                            <View key={i} style={styles.tierStep}>
                                <View style={[styles.tierDot, isReached && styles.tierDotActive]} />
                                <Text style={[styles.tierStepLabel, isReached && styles.tierStepLabelActive]}>
                                    {tier.label}
                                </Text>
                                <Text style={styles.tierStepCount}>{tier.count}+</Text>
                            </View>
                        );
                    })}
                </View>
            </Card>

            {/* How It Works */}
            <SectionHeader title="How It Works" style={styles.section} />
            <Card>
                {[
                    { step: '1', icon: 'share-social' as const, title: 'Share your code', desc: 'Send your unique code to drivers or owners' },
                    { step: '2', icon: 'person-add' as const, title: 'They sign up', desc: 'New user registers using your referral code' },
                    { step: '3', icon: 'checkmark-circle' as const, title: 'They complete a trip', desc: 'Once they complete their first transaction' },
                    { step: '4', icon: 'cash' as const, title: 'You both earn', desc: `You get ${formatCurrency(REFERRAL_BONUSES.driver)}-${formatCurrency(REFERRAL_BONUSES.owner)} bonus` },
                ].map((item, i) => (
                    <View key={i} style={[styles.howRow, i < 3 && styles.howRowBorder]}>
                        <View style={styles.howIcon}>
                            <Ionicons name={item.icon} size={20} color={Colors.primary} />
                        </View>
                        <View style={styles.howText}>
                            <Text style={styles.howTitle}>{item.title}</Text>
                            <Text style={styles.howDesc}>{item.desc}</Text>
                        </View>
                    </View>
                ))}
            </Card>

            {/* Referral History */}
            <SectionHeader title="Referral History" style={styles.section} />
            {isLoading ? (
                <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
                    <Text style={{ ...Typography.body, color: Colors.textMuted }}>Loading referrals...</Text>
                </View>
            ) : stats.referrals.map((ref) => (
                <Card key={ref.id} style={styles.refCard}>
                    <View style={styles.refRow}>
                        <Avatar initials={ref.referredUserAvatar} size={40} />
                        <View style={styles.refInfo}>
                            <Text style={styles.refName}>{ref.referredUserName}</Text>
                            <Text style={styles.refMeta}>{ref.type === 'driver' ? 'Driver' : 'Owner'} • {formatRelativeDate(ref.dateReferred)}</Text>
                        </View>
                        <View style={styles.refRight}>
                            <Badge label={statusConfig[ref.status].label} variant={statusConfig[ref.status].variant} size="sm" />
                            <Text style={styles.refBonus}>{formatCurrency(ref.bonusAmount)}</Text>
                        </View>
                    </View>
                </Card>
            ))}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    codeCard: { marginBottom: Spacing.xl, alignItems: 'center', gap: Spacing.md },
    codeHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    codeTitle: { ...Typography.h4, color: Colors.textPrimary },
    codeDisplay: {
        backgroundColor: Colors.surfaceLight,
        borderRadius: BorderRadius.lg,
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing['3xl'],
        borderWidth: 2,
        borderColor: Colors.primary,
        borderStyle: 'dashed',
    },
    codeText: {
        ...Typography.hero,
        color: Colors.primary,
        fontSize: 28,
        letterSpacing: 3,
    },
    codeActions: { flexDirection: 'row', gap: Spacing.xl },
    codeBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    codeBtnText: { ...Typography.bodyBold, color: Colors.primary },
    codeBonus: { ...Typography.caption, color: Colors.textMuted, textAlign: 'center' },
    statsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
    statCard: { flex: 1, alignItems: 'center', gap: 2 },
    statValue: { ...Typography.h3, color: Colors.textPrimary },
    statLabel: { ...Typography.small, color: Colors.textMuted },
    section: { marginTop: Spacing.xl },
    tierHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
    tierNext: { ...Typography.caption, color: Colors.textSecondary, flex: 1 },
    tierTrack: { flexDirection: 'row', justifyContent: 'space-between' },
    tierStep: { alignItems: 'center', gap: 4 },
    tierDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: Colors.surfaceBorder,
        borderWidth: 2,
        borderColor: Colors.surfaceBorder,
    },
    tierDotActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    tierStepLabel: { ...Typography.small, color: Colors.textMuted },
    tierStepLabelActive: { color: Colors.primary, fontWeight: '700' },
    tierStepCount: { ...Typography.small, color: Colors.textMuted, fontSize: 10 },
    howRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.lg },
    howRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder },
    howIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primaryMuted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    howText: { flex: 1, gap: 2 },
    howTitle: { ...Typography.bodyBold, color: Colors.textPrimary },
    howDesc: { ...Typography.caption, color: Colors.textMuted },
    refCard: { marginBottom: Spacing.md },
    refRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    refInfo: { flex: 1, gap: 2 },
    refName: { ...Typography.bodyBold, color: Colors.textPrimary },
    refMeta: { ...Typography.small, color: Colors.textMuted },
    refRight: { alignItems: 'flex-end', gap: 4 },
    refBonus: { ...Typography.bodyBold, color: Colors.success },
});
