import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { insforge } from '../../lib/insforge';
import { showAlert } from '../../utils/alert';

interface DocumentSlot {
    type: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    description: string;
    required: boolean;
}

const DRIVER_DOCUMENTS: DocumentSlot[] = [
    { type: 'Drivers Licence', label: "Driver's Licence", icon: 'card-outline', description: 'Front of your valid driver\'s licence', required: true },
    { type: 'PPV Badge', label: 'PPV Badge', icon: 'shield-outline', description: 'Your Public Passenger Vehicle badge', required: true },
    { type: 'Police Record', label: 'Police Record', icon: 'document-text-outline', description: 'Clean police record from JCF', required: true },
    { type: 'TRN Card', label: 'TRN Card', icon: 'id-card-outline', description: 'Your Taxpayer Registration Number card', required: false },
];

const OWNER_DOCUMENTS: DocumentSlot[] = [
    { type: 'Route Licence', label: 'Route Licence', icon: 'document-text-outline', description: 'Your transport route licence', required: true },
    { type: 'Insurance Certificate', label: 'Insurance Certificate', icon: 'shield-checkmark-outline', description: 'Valid vehicle insurance certificate', required: true },
    { type: 'Fitness Certificate', label: 'Fitness Certificate', icon: 'car-outline', description: 'Vehicle fitness certificate', required: true },
    { type: 'TRN Card', label: 'TRN Card', icon: 'id-card-outline', description: 'Your Taxpayer Registration Number card', required: false },
];

interface UploadState {
    uri?: string;
    uploading: boolean;
    uploaded: boolean;
    dbId?: string;
    fileUrl?: string;
}

export default function DocumentUploadScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const isOwner = user?.role === 'owner';
    const documents = isOwner ? OWNER_DOCUMENTS : DRIVER_DOCUMENTS;

    const [uploads, setUploads] = useState<Record<string, UploadState>>({});
    const [submitting, setSubmitting] = useState(false);

    const uploadedCount = Object.values(uploads).filter(u => u.uploaded).length;
    const requiredDocs = documents.filter(d => d.required);
    const allRequiredUploaded = requiredDocs.every(d => uploads[d.type]?.uploaded);

    const pickAndUpload = useCallback(async (docType: string) => {
        if (!user) return;

        // Request permissions
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            showAlert('Permission Required', 'Please allow access to your photo library to upload documents.');
            return;
        }

        // Pick image
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        });

        if (result.canceled || !result.assets?.[0]) return;

        const asset = result.assets[0];
        setUploads(prev => ({ ...prev, [docType]: { uri: asset.uri, uploading: true, uploaded: false } }));

        try {
            // Convert URI to blob for upload
            const response = await fetch(asset.uri);
            const blob = await response.blob();

            // Upload to InsForge storage
            const ext = asset.uri.split('.').pop() || 'jpg';
            const path = `${user.id}/${docType.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.${ext}`;

            const { data: storageData, error: storageError } = await insforge.storage
                .from('documents')
                .upload(path, blob);

            if (storageError || !storageData) {
                throw new Error(storageError?.message || 'Upload failed');
            }

            // Create user_documents record
            const { data: docRecord, error: dbError } = await insforge.database
                .from('user_documents')
                .insert({
                    user_id: user.id,
                    type: docType,
                    file_url: storageData.url,
                    status: 'pending',
                    priority: 'medium',
                    file_type: asset.mimeType || 'image/jpeg',
                    metadata: {
                        originalName: asset.fileName || `${docType}.${ext}`,
                        size: asset.fileSize || blob.size,
                        storageKey: storageData.key,
                    },
                })
                .select('id')
                .single();

            if (dbError) {
                throw new Error(dbError.message || 'Failed to save document record');
            }

            setUploads(prev => ({
                ...prev,
                [docType]: {
                    uri: asset.uri,
                    uploading: false,
                    uploaded: true,
                    dbId: docRecord?.id,
                    fileUrl: storageData.url,
                },
            }));
        } catch (err) {
            console.error('Document upload error:', err);
            const msg = err instanceof Error ? err.message : 'Upload failed';
            showAlert('Upload Failed', msg);
            setUploads(prev => ({ ...prev, [docType]: { uri: asset.uri, uploading: false, uploaded: false } }));
        }
    }, [user]);

    const handleSubmit = () => {
        setSubmitting(true);
        showAlert(
            'Documents Submitted',
            'Your documents have been submitted for review. You\'ll be notified once they\'re verified.',
        );
        setTimeout(() => {
            setSubmitting(false);
            router.replace(isOwner ? '/(owner)' : '/(driver)');
        }, 600);
    };

    return (
        <ScreenWrapper
            title="Upload Documents"
            subtitle="Submit your credentials for verification"
        >
            {/* Progress Card */}
            <Card variant="highlighted" style={styles.progressCard}>
                <View style={styles.progressHeader}>
                    <View style={styles.progressInfo}>
                        <Text style={styles.progressTitle}>Upload Progress</Text>
                        <Text style={styles.progressSubtitle}>
                            {uploadedCount} of {documents.length} uploaded
                        </Text>
                    </View>
                    <View style={styles.progressBadge}>
                        <Text style={styles.progressBadgeText}>
                            {Math.round((uploadedCount / documents.length) * 100)}%
                        </Text>
                    </View>
                </View>
                <View style={styles.progressTrack}>
                    <View style={[styles.progressBar, { width: `${(uploadedCount / documents.length) * 100}%` }]} />
                </View>
            </Card>

            {/* Document Slots */}
            {documents.map((doc) => {
                const state = uploads[doc.type];
                const isUploading = state?.uploading;
                const isUploaded = state?.uploaded;

                return (
                    <Card key={doc.type} style={styles.docCard}>
                        <View style={styles.docRow}>
                            <View style={[
                                styles.docIcon,
                                isUploaded && styles.docIconDone,
                            ]}>
                                <Ionicons
                                    name={isUploaded ? 'checkmark' : doc.icon}
                                    size={22}
                                    color={isUploaded ? '#fff' : Colors.textMuted}
                                />
                            </View>
                            <View style={styles.docInfo}>
                                <View style={styles.docLabelRow}>
                                    <Text style={styles.docLabel}>{doc.label}</Text>
                                    {doc.required && <Badge label="Required" variant="warning" size="sm" />}
                                    {isUploaded && <Badge label="Uploaded" variant="success" size="sm" />}
                                </View>
                                <Text style={styles.docDesc}>{doc.description}</Text>
                            </View>
                        </View>

                        {/* Preview */}
                        {state?.uri && (
                            <View style={styles.preview}>
                                <Image source={{ uri: state.uri }} style={styles.previewImage} resizeMode="cover" />
                                {isUploading && (
                                    <View style={styles.previewOverlay}>
                                        <ActivityIndicator color={Colors.primary} size="large" />
                                        <Text style={styles.uploadingText}>Uploading...</Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Action */}
                        <TouchableOpacity
                            style={[styles.uploadBtn, isUploaded && styles.uploadBtnDone]}
                            onPress={() => pickAndUpload(doc.type)}
                            disabled={isUploading}
                        >
                            <Ionicons
                                name={isUploaded ? 'refresh-outline' : 'cloud-upload-outline'}
                                size={18}
                                color={isUploaded ? Colors.textSecondary : Colors.primary}
                            />
                            <Text style={[styles.uploadBtnText, isUploaded && styles.uploadBtnTextDone]}>
                                {isUploading ? 'Uploading...' : isUploaded ? 'Replace' : 'Choose File'}
                            </Text>
                        </TouchableOpacity>
                    </Card>
                );
            })}

            {/* Submit */}
            <View style={styles.submitSection}>
                <Button
                    title="Submit for Review"
                    onPress={handleSubmit}
                    size="lg"
                    fullWidth
                    loading={submitting}
                    disabled={!allRequiredUploaded || submitting}
                />
                <TouchableOpacity onPress={() => router.replace(isOwner ? '/(owner)' : '/(driver)')}>
                    <Text style={styles.skipText}>Skip for now</Text>
                </TouchableOpacity>
                {!allRequiredUploaded && (
                    <Text style={styles.hint}>
                        Upload all required documents to submit for verification
                    </Text>
                )}
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    progressCard: { marginBottom: Spacing.xl },
    progressHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: Spacing.lg,
    },
    progressInfo: { flex: 1, gap: 4 },
    progressTitle: { ...Typography.h4, color: Colors.textPrimary },
    progressSubtitle: { ...Typography.caption, color: Colors.textSecondary },
    progressBadge: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: Colors.primaryMuted,
        alignItems: 'center', justifyContent: 'center',
    },
    progressBadgeText: { ...Typography.bodyBold, color: Colors.primary },
    progressTrack: {
        height: 8, backgroundColor: Colors.surfaceLight,
        borderRadius: 4, overflow: 'hidden',
    },
    progressBar: {
        height: '100%', backgroundColor: Colors.primary, borderRadius: 4,
    },
    docCard: { marginBottom: Spacing.md },
    docRow: {
        flexDirection: 'row', gap: Spacing.md,
        alignItems: 'flex-start', marginBottom: Spacing.md,
    },
    docIcon: {
        width: 44, height: 44, borderRadius: 12,
        backgroundColor: Colors.surfaceLight,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: Colors.surfaceBorder,
    },
    docIconDone: {
        backgroundColor: Colors.success, borderColor: Colors.success,
    },
    docInfo: { flex: 1, gap: 4 },
    docLabelRow: {
        flexDirection: 'row', alignItems: 'center',
        gap: Spacing.sm, flexWrap: 'wrap',
    },
    docLabel: { ...Typography.bodyBold, color: Colors.textPrimary },
    docDesc: { ...Typography.caption, color: Colors.textMuted, lineHeight: 18 },
    preview: {
        height: 160, borderRadius: BorderRadius.lg,
        overflow: 'hidden', marginBottom: Spacing.md,
        backgroundColor: Colors.surfaceLight,
    },
    previewImage: { width: '100%', height: '100%' },
    previewOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    },
    uploadingText: { ...Typography.caption, color: '#fff' },
    uploadBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: Spacing.sm, paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.primaryMuted,
        borderWidth: 1, borderColor: Colors.primary + '30',
    },
    uploadBtnDone: {
        backgroundColor: Colors.surfaceLight,
        borderColor: Colors.surfaceBorder,
    },
    uploadBtnText: { ...Typography.bodyBold, color: Colors.primary },
    uploadBtnTextDone: { color: Colors.textSecondary },
    submitSection: {
        marginTop: Spacing.xl, gap: Spacing.lg, alignItems: 'center',
        paddingBottom: Spacing['3xl'],
    },
    skipText: { ...Typography.bodyBold, color: Colors.textMuted },
    hint: {
        ...Typography.caption, color: Colors.textMuted,
        textAlign: 'center', lineHeight: 18,
    },
});
