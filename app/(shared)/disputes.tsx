import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Ionicons } from '@expo/vector-icons';
import { formatRelativeDate } from '../../utils/formatting';
import { DISPUTE_TYPES } from '../../data/disputes';
import { insforge } from '../../lib/insforge';
import { useAuth } from '../../context/AuthContext';

export default function DisputesScreen() {
    const { user } = useAuth();
    const [disputes, setDisputes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [tab, setTab] = useState<'active' | 'resolved'>('active');
    const [showForm, setShowForm] = useState(false);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [disputeDesc, setDisputeDesc] = useState('');
    const [againstName, setAgainstName] = useState('');

    React.useEffect(() => {
        fetchDisputes();
    }, [user?.id]);

    async function fetchDisputes() {
        if (!user) return;
        try {
            setIsLoading(true);
            const { data, error } = await insforge.database
                .from('disputes')
                .select('*, filed_by:filed_by_id(name, avatar_url, role), filed_against:filed_against_id(name, avatar_url, role)')
                .or(`filed_by_id.eq.${user.id},filed_against_id.eq.${user.id}`)
                .order('date_opened', { ascending: false });

            if (error) throw error;

            const mapped = (data || []).map(d => {
                const fByObj = Array.isArray(d.filed_by) ? d.filed_by[0] : (d.filed_by || {});
                const fAgObj = Array.isArray(d.filed_against) ? d.filed_against[0] : (d.filed_against || {});

                // Fallback rendering
                let byName = fByObj.name || 'Me';
                let byRole = fByObj.role || 'driver';
                let byAvatar = byName.substring(0, 2).toUpperCase();

                let againstN = fAgObj.name || 'Unknown';
                // If evidence/timeline contains real againstName we could parse it, but we can't easily.

                return {
                    id: d.id,
                    filedById: d.filed_by_id,
                    filedByName: byName,
                    filedByAvatar: byAvatar,
                    filedByRole: byRole,
                    againstId: d.filed_against_id,
                    againstName: againstN,
                    againstAvatar: againstN.substring(0, 2).toUpperCase() || '??',
                    againstRole: fAgObj.role || 'owner',
                    type: d.type || 'billing',
                    category: d.category,
                    description: d.description,
                    status: d.status,
                    priority: d.priority,
                    evidence: d.evidence || [],
                    timeline: d.timeline || [],
                    resolution: d.resolution,
                    dateOpened: d.date_opened,
                };
            });
            setDisputes(mapped);
        } catch (err) {
            console.error('Failed to fetch disputes:', err);
        } finally {
            setIsLoading(false);
        }
    }

    const active = disputes.filter((d) => ['open', 'under_review', 'escalated'].includes(d.status));
    const resolved = disputes.filter((d) => ['resolved', 'dismissed'].includes(d.status));
    const displayed = tab === 'active' ? active : resolved;

    const statusCfg: Record<string, { color: string; label: string }> = {
        open: { color: Colors.warning, label: 'Open' },
        under_review: { color: Colors.info, label: 'Under Review' },
        resolved: { color: Colors.success, label: 'Resolved' },
        escalated: { color: Colors.error, label: 'Escalated' },
        dismissed: { color: Colors.textMuted, label: 'Dismissed' },
    };

    const priorityCfg: Record<string, { color: string }> = {
        low: { color: Colors.textMuted },
        medium: { color: Colors.warning },
        high: { color: Colors.error },
        urgent: { color: '#FF0000' },
    };

    return (
        <ScreenWrapper title="Dispute Resolution" subtitle={`${active.length} active disputes`}>
            {/* File New Dispute */}
            {!showForm ? (
                <Button title="File a Dispute" variant="outline" fullWidth onPress={() => setShowForm(true)} icon={<Ionicons name="add-circle" size={18} color={Colors.primary} />} />
            ) : (
                <Card variant="highlighted" style={styles.formCard}>
                    <Text style={styles.formTitle}>Select Dispute Type</Text>
                    <View style={styles.typeGrid}>
                        {Object.entries(DISPUTE_TYPES).map(([key, type]) => (
                            <TouchableOpacity
                                key={key}
                                style={[styles.typeBtn, selectedType === key && styles.typeBtnActive]}
                                onPress={() => setSelectedType(key)}
                            >
                                <Ionicons name={type.icon as any} size={22} color={selectedType === key ? Colors.textInverse : type.color} />
                                <Text style={[styles.typeLabel, selectedType === key && styles.typeLabelActive]}>{type.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {selectedType && (
                        <Text style={styles.typeDesc}>
                            {DISPUTE_TYPES[selectedType as keyof typeof DISPUTE_TYPES].description}
                        </Text>
                    )}
                    {selectedType && (
                        <>
                            <View style={styles.formField}>
                                <Text style={styles.fieldLabel}>Against</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={againstName}
                                    onChangeText={setAgainstName}
                                    placeholder="Name of the person"
                                    placeholderTextColor={Colors.textMuted}
                                />
                            </View>
                            <View style={styles.formField}>
                                <Text style={styles.fieldLabel}>Description</Text>
                                <TextInput
                                    style={[styles.formInput, { minHeight: 80 }]}
                                    value={disputeDesc}
                                    onChangeText={setDisputeDesc}
                                    placeholder="Describe the issue..."
                                    placeholderTextColor={Colors.textMuted}
                                    multiline
                                    textAlignVertical="top"
                                />
                            </View>
                        </>
                    )}
                    <View style={styles.formActions}>
                        <Button title="Cancel" variant="ghost" size="sm" onPress={() => { setShowForm(false); setSelectedType(null); setDisputeDesc(''); setAgainstName(''); }} />
                        <Button title="File Dispute" variant="primary" size="sm" onPress={async () => {
                            if (!selectedType) {
                                Alert.alert('Select Type', 'Please select a dispute type.');
                                return;
                            }
                            if (!user) return;
                            try {
                                const typeInfo = DISPUTE_TYPES[selectedType as keyof typeof DISPUTE_TYPES];
                                const timelineEntry = {
                                    date: new Date().toISOString(),
                                    action: 'Dispute Filed',
                                    description: `${againstName || 'Someone'} reported for ${typeInfo.label.toLowerCase()}`,
                                    actor: 'reporter'
                                };

                                const { error } = await insforge.database
                                    .from('disputes')
                                    .insert({
                                        filed_by_id: user.id,
                                        type: selectedType,
                                        category: typeInfo.label,
                                        description: disputeDesc ? `[Against: ${againstName}] ${disputeDesc}` : `Dispute against ${againstName} regarding: ${typeInfo.label}`,
                                        status: 'open',
                                        priority: 'medium',
                                        timeline: [timelineEntry],
                                    });

                                if (error) throw error;

                                Alert.alert('Dispute Filed ⚖️', `Your ${typeInfo.label} dispute has been submitted and will be reviewed within 24 hours.`);
                                setShowForm(false);
                                setSelectedType(null);
                                setDisputeDesc('');
                                setAgainstName('');
                                fetchDisputes();
                            } catch (err) {
                                console.error("Error filing dispute:", err);
                                Alert.alert('Error', 'Could not file the dispute.');
                            }
                        }} />
                    </View>
                </Card>
            )}

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity style={[styles.tab, tab === 'active' && styles.tabActive]} onPress={() => setTab('active')}>
                    <Text style={[styles.tabText, tab === 'active' && styles.tabTextActive]}>Active ({active.length})</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, tab === 'resolved' && styles.tabActive]} onPress={() => setTab('resolved')}>
                    <Text style={[styles.tabText, tab === 'resolved' && styles.tabTextActive]}>Resolved ({resolved.length})</Text>
                </TouchableOpacity>
            </View>

            {isLoading && (
                <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
                    <Text style={{ ...Typography.body, color: Colors.textMuted }}>Loading disputes...</Text>
                </View>
            )}

            {/* Dispute Cards */}
            {!isLoading && displayed.map((dispute) => {
                const sCfg = statusCfg[dispute.status] || { color: Colors.textMuted, label: dispute.status };
                const pCfg = priorityCfg[dispute.priority] || { color: Colors.textMuted };
                const typeInfo = DISPUTE_TYPES[dispute.type as keyof typeof DISPUTE_TYPES] || { label: dispute.category, icon: 'alert-circle', color: Colors.warning };

                return (
                    <Card key={dispute.id} style={styles.disputeCard}>
                        {/* Header */}
                        <View style={styles.disputeHeader}>
                            <View style={[styles.typeIcon, { backgroundColor: `${typeInfo.color}20` }]}>
                                <Ionicons name={typeInfo.icon as any} size={20} color={typeInfo.color} />
                            </View>
                            <View style={styles.disputeInfo}>
                                <Text style={styles.disputeType}>{typeInfo.label}</Text>
                                <Text style={styles.disputeDate}>{formatRelativeDate(dispute.dateOpened)}</Text>
                            </View>
                            <View style={styles.disputeBadges}>
                                <Badge label={sCfg.label} variant={dispute.status === 'resolved' ? 'success' : dispute.status === 'escalated' ? 'error' : 'warning'} size="sm" />
                                {dispute.priority === 'urgent' || dispute.priority === 'high' ? (
                                    <View style={[styles.priorityDot, { backgroundColor: pCfg.color }]} />
                                ) : null}
                            </View>
                        </View>

                        {/* Parties */}
                        <View style={styles.parties}>
                            <View style={styles.party}>
                                <Avatar initials={dispute.filedByAvatar} size={28} />
                                <Text style={styles.partyName}>{dispute.filedByName}</Text>
                                <Badge label={dispute.filedByRole === 'driver' ? 'Driver' : 'Owner'} variant="neutral" size="sm" />
                            </View>
                            <Ionicons name="arrow-forward" size={14} color={Colors.textMuted} />
                            <View style={styles.party}>
                                <Avatar initials={dispute.againstAvatar} size={28} />
                                <Text style={styles.partyName}>{dispute.againstName}</Text>
                            </View>
                        </View>

                        {/* Description */}
                        <Text style={styles.disputeDesc} numberOfLines={2}>{dispute.description}</Text>

                        {/* Evidence */}
                        {dispute.evidence.length > 0 && (
                            <View style={styles.evidenceRow}>
                                <Ionicons name="attach" size={14} color={Colors.textMuted} />
                                <Text style={styles.evidenceText}>{dispute.evidence.length} evidence items</Text>
                            </View>
                        )}

                        {/* Timeline Preview (latest entry) */}
                        {dispute.timeline.length > 0 && (
                            <View style={styles.timelinePreview}>
                                <View style={styles.timelineDot} />
                                <View style={styles.timelineContent}>
                                    <Text style={styles.timelineAction}>{dispute.timeline[dispute.timeline.length - 1].action}</Text>
                                    <Text style={styles.timelineDesc}>{dispute.timeline[dispute.timeline.length - 1].description}</Text>
                                </View>
                            </View>
                        )}

                        {/* Resolution */}
                        {dispute.resolution && (
                            <View style={styles.resolutionBox}>
                                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                                <View style={styles.resolutionText}>
                                    <Text style={styles.resolutionOutcome}>
                                        Outcome: {dispute.resolution.outcome.charAt(0).toUpperCase() + dispute.resolution.outcome.slice(1)}
                                    </Text>
                                    <Text style={styles.resolutionDesc}>{dispute.resolution.description}</Text>
                                </View>
                            </View>
                        )}
                    </Card>
                );
            })}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    formCard: { marginBottom: Spacing.xl, gap: Spacing.lg },
    formTitle: { ...Typography.h4, color: Colors.textPrimary },
    typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    typeBtn: {
        width: '31%',
        flexGrow: 1,
        alignItems: 'center',
        gap: 4,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.surfaceLight,
    },
    typeBtnActive: { backgroundColor: Colors.primary },
    typeLabel: { ...Typography.small, color: Colors.textSecondary },
    typeLabelActive: { color: Colors.textInverse, fontWeight: '700' },
    typeDesc: { ...Typography.caption, color: Colors.textMuted, textAlign: 'center' },
    formField: { gap: Spacing.xs },
    fieldLabel: { ...Typography.captionBold, color: Colors.textSecondary, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
    formInput: { ...Typography.body, color: Colors.textPrimary, backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, borderWidth: 1, borderColor: Colors.surfaceBorder },
    formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.md },
    tabs: { flexDirection: 'row', gap: Spacing.sm, marginVertical: Spacing.xl },
    tab: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center', borderRadius: BorderRadius.full, backgroundColor: Colors.surfaceLight },
    tabActive: { backgroundColor: Colors.primary },
    tabText: { ...Typography.captionBold, color: Colors.textMuted },
    tabTextActive: { color: Colors.textInverse },
    disputeCard: { marginBottom: Spacing.lg },
    disputeHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
    typeIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    disputeInfo: { flex: 1, gap: 2 },
    disputeType: { ...Typography.bodyBold, color: Colors.textPrimary },
    disputeDate: { ...Typography.small, color: Colors.textMuted },
    disputeBadges: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    priorityDot: { width: 8, height: 8, borderRadius: 4 },
    parties: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
    party: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    partyName: { ...Typography.caption, color: Colors.textSecondary },
    disputeDesc: { ...Typography.body, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.md },
    evidenceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.md },
    evidenceText: { ...Typography.small, color: Colors.textMuted },
    timelinePreview: { flexDirection: 'row', gap: Spacing.md, padding: Spacing.md, backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md, marginBottom: Spacing.md },
    timelineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginTop: 4 },
    timelineContent: { flex: 1, gap: 2 },
    timelineAction: { ...Typography.captionBold, color: Colors.textPrimary },
    timelineDesc: { ...Typography.small, color: Colors.textMuted },
    resolutionBox: { flexDirection: 'row', gap: Spacing.md, padding: Spacing.md, backgroundColor: Colors.successMuted, borderRadius: BorderRadius.md },
    resolutionText: { flex: 1, gap: 2 },
    resolutionOutcome: { ...Typography.captionBold, color: Colors.success },
    resolutionDesc: { ...Typography.small, color: Colors.textSecondary },
});
