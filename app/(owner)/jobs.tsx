import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar, StarRating } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/formatting';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { insforge } from '../../lib/insforge';
import { showAlert } from '../../utils/alert';

export default function OwnerJobsScreen() {
    const { user } = useAuth();
    const { jobs, drivers } = useData();
    const [applications, setApplications] = useState<any[]>([]);

    const myJobs = jobs.filter(j => j.ownerId === user?.id || j.ownerId === 'owner1');

    useEffect(() => {
        if (!user) return;

        async function fetchApplications() {
            if (!user) return;
            const { data, error } = await insforge.database
                .from('applications')
                .select('*')
                .eq('owner_id', user.id)
                .order('applied_at', { ascending: false });

            if (!error && data) {
                setApplications(data);
            }
        }

        fetchApplications();
    }, [user]);

    const handleApplicationAction = async (appId: string, action: 'accepted' | 'rejected', driverName: string) => {
        showAlert(
            action === 'accepted' ? 'Accept Driver?' : 'Reject Driver?',
            `Are you sure you want to ${action === 'accepted' ? 'accept' : 'reject'} application from ${driverName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Confirm', style: action === 'rejected' ? 'destructive' : 'default', onPress: () => processAction(appId, action) }
            ]
        );
    };

    const processAction = async (appId: string, action: 'accepted' | 'rejected') => {
        const { error } = await insforge.database
            .from('applications')
            .update({ status: action })
            .eq('id', appId);

        if (!error) {
            setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: action } : a));
            showAlert('Success', `Application ${action}!`);
        } else {
            showAlert('Error', 'Failed to update application status.');
        }
    };

    return (
        <ScreenWrapper
            title="Jobs & Applications"
            subtitle={`${myJobs.length} active postings`}
        >
            {myJobs.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="document-text-outline" size={48} color={Colors.surfaceBorder} />
                    <Text style={styles.emptyTitle}>No Jobs Posted</Text>
                    <Text style={styles.emptyDesc}>Create a job listing to start receiving applications from qualified drivers.</Text>
                </View>
            ) : null}

            {myJobs.map(job => {
                const jobApps = applications.filter(a => a.job_id === job.id);
                const pendingCount = jobApps.filter(a => a.status === 'pending').length;

                return (
                    <View key={job.id} style={styles.jobGroup}>
                        <Card variant="elevated" style={styles.jobHeaderCard}>
                            <View style={styles.jobHeaderInfo}>
                                <View style={styles.jobRoute}>
                                    <Ionicons name="navigate" size={18} color={Colors.primary} />
                                    <Text style={styles.jobRouteText}>
                                        {job.route?.from || ''} → {job.route?.to || ''}
                                    </Text>
                                </View>
                                <View style={styles.jobMetaRow}>
                                    <Badge label={`${formatCurrency(job.dailyPay || 0)}/day`} variant="secondary" />
                                    <Badge label={job.schedule} variant="neutral" />
                                </View>
                            </View>
                            <View style={styles.jobStats}>
                                <Text style={styles.statsCount}>{jobApps.length}</Text>
                                <Text style={styles.statsLabel}>Applicants</Text>
                            </View>
                        </Card>

                        {pendingCount > 0 && <SectionHeader title={`${pendingCount} Pending Applications`} style={styles.subSection} />}

                        {jobApps.map(app => {
                            const driver = drivers.find(d => d.id === app.driver_id);
                            if (!driver) return null;

                            return (
                                <Card key={app.id} style={styles.applicantCard}>
                                    <View style={styles.applicantHeader}>
                                        <Avatar initials={driver.avatar || 'DR'} size={48} />
                                        <View style={styles.applicantInfo}>
                                            <Text style={styles.applicantName}>{driver.name}</Text>
                                            <StarRating rating={driver.rating} size={12} />
                                        </View>
                                        <Badge
                                            label={app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                            variant={app.status === 'pending' ? 'warning' : app.status === 'accepted' ? 'success' : 'neutral'}
                                        />
                                    </View>

                                    <View style={styles.applicantDetails}>
                                        <View style={styles.detailItem}>
                                            <Ionicons name="time" size={14} color={Colors.textMuted} />
                                            <Text style={styles.detailText}>{driver.experience} years</Text>
                                        </View>
                                        <View style={styles.detailItem}>
                                            <Ionicons name="card" size={14} color={Colors.textMuted} />
                                            <Text style={styles.detailText}>{driver.licenseType} License</Text>
                                        </View>
                                        <View style={styles.detailItem}>
                                            <Ionicons name="car" size={14} color={Colors.textMuted} />
                                            <Text style={styles.detailText}>{driver.totalTrips || 0} trips</Text>
                                        </View>
                                    </View>

                                    {app.status === 'pending' && (
                                        <View style={styles.actionButtons}>
                                            <Button
                                                title="Decline"
                                                variant="ghost"
                                                size="sm"
                                                style={styles.actionBtn}
                                                onPress={() => handleApplicationAction(app.id, 'rejected', driver.name)}
                                            />
                                            <Button
                                                title="Accept Driver"
                                                variant="primary"
                                                size="sm"
                                                style={styles.actionBtn}
                                                onPress={() => handleApplicationAction(app.id, 'accepted', driver.name)}
                                            />
                                        </View>
                                    )}
                                </Card>
                            );
                        })}
                    </View>
                );
            })}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    emptyState: {
        alignItems: 'center',
        padding: Spacing['3xl'],
        gap: Spacing.md,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
        borderStyle: 'dashed',
        marginTop: Spacing.xl,
    },
    emptyTitle: {
        ...Typography.h4,
        color: Colors.textPrimary,
    },
    emptyDesc: {
        ...Typography.body,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    jobGroup: {
        marginBottom: Spacing['2xl'],
    },
    jobHeaderCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.primaryMuted,
    },
    jobHeaderInfo: {
        flex: 1,
        gap: Spacing.sm,
    },
    jobRoute: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    jobRouteText: {
        ...Typography.h4,
        color: Colors.textPrimary,
    },
    jobMetaRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    jobStats: {
        alignItems: 'center',
        paddingLeft: Spacing.lg,
        borderLeftWidth: 1,
        borderColor: Colors.surfaceBorder,
    },
    statsCount: {
        ...Typography.h3,
        color: Colors.primary,
    },
    statsLabel: {
        ...Typography.caption,
        color: Colors.textMuted,
    },
    subSection: {
        marginTop: Spacing.md,
        marginBottom: Spacing.sm,
    },
    applicantCard: {
        marginBottom: Spacing.sm,
        marginLeft: Spacing.md,
        borderLeftWidth: 3,
        borderLeftColor: Colors.primary,
    },
    applicantHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        marginBottom: Spacing.md,
    },
    applicantInfo: {
        flex: 1,
        gap: 2,
    },
    applicantName: {
        ...Typography.bodyBold,
        color: Colors.textPrimary,
    },
    applicantDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        marginBottom: Spacing.md,
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.surfaceBorder,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    detailText: {
        ...Typography.caption,
        color: Colors.textSecondary,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    actionBtn: {
        flex: 1,
    }
});
