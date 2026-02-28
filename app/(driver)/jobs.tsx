import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/formatting';
import { mockJobs } from '../../data/jobs';

export default function JobsScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
    const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

    const handleApply = (jobId: string, ownerName: string) => {
        Alert.alert(
            'Apply for this position?',
            `You're about to apply to drive for ${ownerName}. They'll be able to see your profile, ratings, and documents.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Apply Now',
                    onPress: () => {
                        setAppliedJobs((prev) => new Set(prev).add(jobId));
                        Alert.alert('Application Sent! ✅', 'The owner will review your profile and get back to you.');
                    },
                },
            ]
        );
    };

    const handleSave = (jobId: string) => {
        setSavedJobs((prev) => {
            const next = new Set(prev);
            if (next.has(jobId)) {
                next.delete(jobId);
            } else {
                next.add(jobId);
            }
            return next;
        });
    };

    const filters = [
        { id: 'all', label: 'All Jobs' },
        { id: 'match', label: 'Smart Match' },
        { id: 'kingston', label: 'Kingston' },
        { id: 'mobay', label: 'Montego Bay' },
    ];

    const filteredJobs = mockJobs.filter((job) => {
        if (activeFilter === 'match') return job.isSmartMatch;
        if (activeFilter === 'kingston') return job.route.from === 'Kingston';
        if (activeFilter === 'mobay') return job.route.from === 'Montego Bay' || job.route.to === 'Montego Bay';
        return true;
    });

    return (
        <ScreenWrapper title="Browse Jobs" subtitle={`${mockJobs.length} positions available`}>
            {/* Search Bar */}
            <View style={styles.searchBar}>
                <Ionicons name="search" size={18} color={Colors.textMuted} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by route, vehicle, or owner..."
                    placeholderTextColor={Colors.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <TouchableOpacity style={styles.filterBtn}>
                    <Ionicons name="options" size={18} color={Colors.secondary} />
                </TouchableOpacity>
            </View>

            {/* Filters */}
            <View style={styles.filtersRow}>
                {filters.map((filter) => (
                    <TouchableOpacity
                        key={filter.id}
                        style={[styles.filterChip, activeFilter === filter.id && styles.filterChipActive]}
                        onPress={() => setActiveFilter(filter.id)}
                    >
                        <Text style={[styles.filterText, activeFilter === filter.id && styles.filterTextActive]}>
                            {filter.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Job Cards */}
            {filteredJobs.map((job) => (
                <Card key={job.id} variant={job.isSmartMatch ? 'highlighted' : 'default'} style={styles.jobCard}>
                    {job.isSmartMatch && (
                        <View style={styles.smartBadge}>
                            <Ionicons name="flash" size={12} color={Colors.secondary} />
                            <Text style={styles.smartBadgeText}>{job.matchScore}% Match</Text>
                        </View>
                    )}

                    <View style={styles.jobHeader}>
                        <Avatar initials={job.ownerAvatar} size={44} />
                        <View style={styles.jobOwnerInfo}>
                            <Text style={styles.jobOwnerName}>{job.ownerName}</Text>
                            <View style={styles.ratingRow}>
                                <Ionicons name="star" size={12} color={Colors.secondary} />
                                <Text style={styles.ratingText}>{job.ownerRating}</Text>
                            </View>
                        </View>
                        <Text style={styles.jobPay}>{formatCurrency(job.dailyPay)}<Text style={styles.jobPayUnit}>/day</Text></Text>
                    </View>

                    <View style={styles.routeRow}>
                        <View style={styles.routeDot} />
                        <Text style={styles.routeText}>{job.route.from}</Text>
                        <Ionicons name="arrow-forward" size={14} color={Colors.textMuted} />
                        <Text style={styles.routeText}>{job.route.to}</Text>
                    </View>

                    <View style={styles.jobDetails}>
                        <View style={styles.detailItem}>
                            <Ionicons name="car" size={14} color={Colors.textMuted} />
                            <Text style={styles.detailText}>{job.vehicleType}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Ionicons name="time" size={14} color={Colors.textMuted} />
                            <Text style={styles.detailText}>{job.schedule.split(',')[0]}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Ionicons name="people" size={14} color={Colors.textMuted} />
                            <Text style={styles.detailText}>{job.applicants} applicants</Text>
                        </View>
                    </View>

                    <View style={styles.requirementsList}>
                        {job.requirements.slice(0, 2).map((req, i) => (
                            <View key={i} style={styles.requirementChip}>
                                <Ionicons name="checkmark-circle" size={12} color={Colors.success} />
                                <Text style={styles.requirementText}>{req}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.jobActions}>
                        <Button
                            title={appliedJobs.has(job.id) ? 'Applied ✓' : 'Apply Now'}
                            onPress={() => handleApply(job.id, job.ownerName)}
                            size="sm"
                            style={styles.applyBtn}
                            disabled={appliedJobs.has(job.id)}
                        />
                        <TouchableOpacity style={styles.saveBtn} onPress={() => handleSave(job.id)}>
                            <Ionicons
                                name={savedJobs.has(job.id) ? 'bookmark' : 'bookmark-outline'}
                                size={20}
                                color={savedJobs.has(job.id) ? Colors.primary : Colors.textSecondary}
                            />
                        </TouchableOpacity>
                    </View>
                </Card>
            ))}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceLight,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
        gap: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        ...Typography.body,
        color: Colors.textPrimary,
        paddingVertical: Spacing.md,
    },
    filterBtn: {
        padding: Spacing.xs,
    },
    filtersRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.xl,
        flexWrap: 'wrap',
    },
    filterChip: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.surfaceLight,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
    },
    filterChipActive: {
        backgroundColor: Colors.primaryMuted,
        borderColor: Colors.primary,
    },
    filterText: {
        ...Typography.captionBold,
        color: Colors.textMuted,
    },
    filterTextActive: {
        color: Colors.primaryLight,
    },
    jobCard: {
        marginBottom: Spacing.lg,
    },
    smartBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: Spacing.md,
    },
    smartBadgeText: {
        ...Typography.captionBold,
        color: Colors.secondary,
    },
    jobHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        marginBottom: Spacing.md,
    },
    jobOwnerInfo: {
        flex: 1,
        gap: 2,
    },
    jobOwnerName: {
        ...Typography.bodyBold,
        color: Colors.textPrimary,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    ratingText: {
        ...Typography.caption,
        color: Colors.textSecondary,
    },
    jobPay: {
        ...Typography.h3,
        color: Colors.secondary,
    },
    jobPayUnit: {
        ...Typography.caption,
        color: Colors.textMuted,
    },
    routeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.surfaceLight,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.md,
    },
    routeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
    },
    routeText: {
        ...Typography.bodyBold,
        color: Colors.textPrimary,
    },
    jobDetails: {
        flexDirection: 'row',
        gap: Spacing.lg,
        marginBottom: Spacing.md,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        ...Typography.caption,
        color: Colors.textMuted,
    },
    requirementsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    requirementChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 3,
        paddingHorizontal: Spacing.sm,
        backgroundColor: Colors.successMuted,
        borderRadius: BorderRadius.sm,
    },
    requirementText: {
        ...Typography.small,
        color: Colors.success,
    },
    jobActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    applyBtn: {
        flex: 1,
    },
    saveBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.surfaceLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
