import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
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

interface Applicant {
    appId: string;
    jobId: string;
    driverId: string;
    status: string;
    appliedAt: string;
    // Driver info from users table
    name: string;
    avatar: string;
    rating: number;
    phone: string;
    experience: string;
    licenceClass: string;
    verificationTier: string;
}

export default function OwnerJobsScreen() {
    const { user } = useAuth();
    const { jobs } = useData();
    const [applications, setApplications] = useState<Applicant[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const myJobs = jobs.filter(j => j.ownerId === user?.id);

    const fetchApplications = useCallback(async () => {
        if (!user) return;
        try {
            setIsLoading(true);
            // Fetch applications with driver info from users table
            const { data, error } = await insforge.database
                .from('applications')
                .select('*, driver:driver_id(name, avatar, rating, phone, experience, licence_class, verification_tier)')
                .eq('owner_id', user.id)
                .order('applied_at', { ascending: false });

            if (error) throw error;

            const mapped: Applicant[] = (data || []).map((a: any) => {
                const driverObj = Array.isArray(a.driver) ? a.driver[0] : (a.driver || {});
                return {
                    appId: a.id,
                    jobId: a.job_id,
                    driverId: a.driver_id,
                    status: a.status,
                    appliedAt: a.applied_at,
                    name: driverObj.name || 'Unknown Driver',
                    avatar: driverObj.avatar || '??',
                    rating: driverObj.rating || 0,
                    phone: driverObj.phone || '',
                    experience: driverObj.experience || '',
                    licenceClass: driverObj.licence_class || '',
                    verificationTier: driverObj.verification_tier || 'registered',
                };
            });
            setApplications(mapped);
        } catch (err) {
            console.error('Failed to fetch applications:', err);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const handleApplicationAction = async (app: Applicant, action: 'accepted' | 'rejected') => {
        showAlert(
            action === 'accepted' ? 'Accept Driver?' : 'Reject Driver?',
            `Are you sure you want to ${action === 'accepted' ? 'accept' : 'reject'} ${app.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    style: action === 'rejected' ? 'destructive' : 'default',
                    onPress: () => processAction(app, action),
                },
            ]
        );
    };

    const processAction = async (app: Applicant, action: 'accepted' | 'rejected') => {
        try {
            // 1. Update this application's status
            const { error } = await insforge.database
                .from('applications')
                .update({ status: action, updated_at: new Date().toISOString() })
                .eq('id', app.appId);
            if (error) throw error;

            if (action === 'accepted') {
                // 2. Mark job as filled
                await insforge.database
                    .from('jobs')
                    .update({ status: 'filled', updated_at: new Date().toISOString() })
                    .eq('id', app.jobId);

                // 3. Reject all other pending applications for this job
                const otherPending = applications.filter(
                    a => a.jobId === app.jobId && a.appId !== app.appId && a.status === 'pending'
                );
                if (otherPending.length > 0) {
                    await insforge.database
                        .from('applications')
                        .update({ status: 'rejected', updated_at: new Date().toISOString() })
                        .eq('job_id', app.jobId)
                        .neq('id', app.appId)
                        .eq('status', 'pending');

                    // 4. Notify rejected drivers
                    const rejectionNotifications = otherPending.map(a => ({
                        user_id: a.driverId,
                        type: 'application_update',
                        title: 'Application Update',
                        message: `Your application has been closed — the position has been filled.`,
                        data: { jobId: app.jobId, status: 'rejected' },
                    }));
                    await insforge.database.from('notifications').insert(rejectionNotifications);
                }

                // 5. Notify accepted driver
                const job = myJobs.find(j => j.id === app.jobId);
                await insforge.database.from('notifications').insert({
                    user_id: app.driverId,
                    type: 'application_update',
                    title: 'Application Accepted! 🎉',
                    message: `${user?.name || 'An owner'} accepted your application for the ${job?.route?.from || ''} → ${job?.route?.to || ''} route.`,
                    data: { jobId: app.jobId, status: 'accepted' },
                });

                // 6. Notify self (owner)
                await insforge.database.from('notifications').insert({
                    user_id: user!.id,
                    type: 'application_update',
                    title: 'Driver Hired',
                    message: `You accepted ${app.name} for the ${job?.route?.from || ''} → ${job?.route?.to || ''} route.`,
                    data: { jobId: app.jobId, driverId: app.driverId },
                });

                // Update local state — mark all apps for this job
                setApplications(prev => prev.map(a => {
                    if (a.jobId === app.jobId) {
                        return { ...a, status: a.appId === app.appId ? 'accepted' : 'rejected' };
                    }
                    return a;
                }));

                showAlert('Driver Accepted! 🎉', `${app.name} has been assigned. All other applicants have been notified.`);
            } else {
                // Reject — notify that driver
                const job = myJobs.find(j => j.id === app.jobId);
                await insforge.database.from('notifications').insert({
                    user_id: app.driverId,
                    type: 'application_update',
                    title: 'Application Not Selected',
                    message: `Your application for ${job?.route?.from || ''} → ${job?.route?.to || ''} was not selected.`,
                    data: { jobId: app.jobId, status: 'rejected' },
                });

                setApplications(prev => prev.map(a => a.appId === app.appId ? { ...a, status: 'rejected' } : a));
                showAlert('Application Rejected', `${app.name} has been notified.`);
            }
        } catch (err) {
            console.error('Failed to process application:', err);
            showAlert('Error', 'Failed to update application status.');
        }
    };

    return (
        <ScreenWrapper
            title="Jobs & Applications"
            subtitle={`${myJobs.length} active posting${myJobs.length !== 1 ? 's' : ''}`}
        >
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Loading applications...</Text>
                </View>
            )}

            {!isLoading && myJobs.length === 0 && (
                <View style={styles.emptyState}>
                    <Ionicons name="document-text-outline" size={48} color={Colors.surfaceBorder} />
                    <Text style={styles.emptyTitle}>No Jobs Posted</Text>
                    <Text style={styles.emptyDesc}>Create a job listing to start receiving applications from qualified drivers.</Text>
                </View>
            )}

            {!isLoading && myJobs.map(job => {
                const jobApps = applications.filter(a => a.jobId === job.id);
                const pendingCount = jobApps.filter(a => a.status === 'pending').length;
                const isFilled = job.status === 'filled' || jobApps.some(a => a.status === 'accepted');

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
                                    {isFilled && <Badge label="Filled" variant="success" />}
                                </View>
                            </View>
                            <View style={styles.jobStats}>
                                <Text style={styles.statsCount}>{jobApps.length}</Text>
                                <Text style={styles.statsLabel}>Applicants</Text>
                            </View>
                        </Card>

                        {pendingCount > 0 && <SectionHeader title={`${pendingCount} Pending Applications`} style={styles.subSection} />}

                        {jobApps.length === 0 && (
                            <View style={styles.noApplicants}>
                                <Ionicons name="hourglass-outline" size={24} color={Colors.textMuted} />
                                <Text style={styles.noApplicantsText}>No applications yet — check back soon</Text>
                            </View>
                        )}

                        {jobApps.map(app => (
                            <Card key={app.appId} style={styles.applicantCard}>
                                <View style={styles.applicantHeader}>
                                    <Avatar initials={app.avatar || app.name.substring(0, 2).toUpperCase()} size={48} />
                                    <View style={styles.applicantInfo}>
                                        <Text style={styles.applicantName}>{app.name}</Text>
                                        <StarRating rating={app.rating} size={12} />
                                    </View>
                                    <Badge
                                        label={app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                        variant={app.status === 'pending' ? 'warning' : app.status === 'accepted' ? 'success' : 'neutral'}
                                    />
                                </View>

                                <View style={styles.applicantDetails}>
                                    {app.experience ? (
                                        <View style={styles.detailItem}>
                                            <Ionicons name="time" size={14} color={Colors.textMuted} />
                                            <Text style={styles.detailText}>{app.experience} yrs experience</Text>
                                        </View>
                                    ) : null}
                                    {app.licenceClass ? (
                                        <View style={styles.detailItem}>
                                            <Ionicons name="card" size={14} color={Colors.textMuted} />
                                            <Text style={styles.detailText}>{app.licenceClass} Licence</Text>
                                        </View>
                                    ) : null}
                                    <View style={styles.detailItem}>
                                        <Ionicons name="shield-checkmark" size={14} color={
                                            app.verificationTier === 'verified' || app.verificationTier === 'fully_verified'
                                                ? Colors.success : Colors.textMuted
                                        } />
                                        <Text style={styles.detailText}>
                                            {app.verificationTier === 'fully_verified' ? 'Fully Verified'
                                                : app.verificationTier === 'verified' ? 'Verified'
                                                    : 'Registered'}
                                        </Text>
                                    </View>
                                    {app.appliedAt && (
                                        <View style={styles.detailItem}>
                                            <Ionicons name="calendar" size={14} color={Colors.textMuted} />
                                            <Text style={styles.detailText}>Applied {new Date(app.appliedAt).toLocaleDateString()}</Text>
                                        </View>
                                    )}
                                </View>

                                {app.status === 'pending' && (
                                    <View style={styles.actionButtons}>
                                        <Button
                                            title="Decline"
                                            variant="ghost"
                                            size="sm"
                                            style={styles.actionBtn}
                                            onPress={() => handleApplicationAction(app, 'rejected')}
                                        />
                                        <Button
                                            title="Accept Driver"
                                            variant="primary"
                                            size="sm"
                                            style={styles.actionBtn}
                                            onPress={() => handleApplicationAction(app, 'accepted')}
                                        />
                                    </View>
                                )}
                            </Card>
                        ))}
                    </View>
                );
            })}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: Spacing['3xl'],
        gap: Spacing.md,
    },
    loadingText: {
        ...Typography.body,
        color: Colors.textMuted,
    },
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
        flexWrap: 'wrap',
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
    noApplicants: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        padding: Spacing.xl,
        backgroundColor: Colors.surfaceLight,
        borderRadius: BorderRadius.lg,
    },
    noApplicantsText: {
        ...Typography.body,
        color: Colors.textMuted,
        flex: 1,
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
