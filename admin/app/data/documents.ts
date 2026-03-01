export interface DocumentQueueItem {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    userRole: 'driver' | 'owner' | 'dual';
    documentType: string;
    uploadDate: string;
    status: 'pending' | 'approved' | 'rejected' | 'flagged' | 'reupload_requested';
    priority: 'high' | 'medium' | 'low';
    assignedTo: string | null;
    assignedToName: string | null;
    expiryDate?: string;
    rejectionReason?: string;
    notes?: string;
    fileType: string;
}

export const REJECTION_REASONS = [
    'Document is blurry or unreadable',
    'Document is expired',
    'Name on document does not match registration',
    'Document type does not match what was requested',
    'Document appears to be altered or manipulated',
    'Photo is cropped — full document required',
    'Selfie does not match ID photo',
    'Other',
];

export const mockDocumentQueue: DocumentQueueItem[] = [
    {
        id: 'dq-1',
        userId: 'd6',
        userName: 'Michelle Grant',
        userAvatar: 'MG',
        userRole: 'driver',
        documentType: 'Driver Licence',
        uploadDate: '2026-02-26T10:30:00',
        status: 'pending',
        priority: 'high',
        assignedTo: null,
        assignedToName: null,
        fileType: 'image/jpeg',
    },
    {
        id: 'dq-2',
        userId: 'd6',
        userName: 'Michelle Grant',
        userAvatar: 'MG',
        userRole: 'driver',
        documentType: 'ID Photo',
        uploadDate: '2026-02-26T10:32:00',
        status: 'pending',
        priority: 'medium',
        assignedTo: null,
        assignedToName: null,
        fileType: 'image/jpeg',
    },
    {
        id: 'dq-3',
        userId: 'd6',
        userName: 'Michelle Grant',
        userAvatar: 'MG',
        userRole: 'driver',
        documentType: 'Selfie',
        uploadDate: '2026-02-26T10:35:00',
        status: 'pending',
        priority: 'medium',
        assignedTo: null,
        assignedToName: null,
        fileType: 'image/jpeg',
    },
    {
        id: 'dq-4',
        userId: 'd7',
        userName: 'Jason Palmer',
        userAvatar: 'JP',
        userRole: 'driver',
        documentType: 'Driver Licence',
        uploadDate: '2026-02-27T09:15:00',
        status: 'pending',
        priority: 'high',
        assignedTo: null,
        assignedToName: null,
        fileType: 'image/png',
    },
    {
        id: 'dq-5',
        userId: 'd7',
        userName: 'Jason Palmer',
        userAvatar: 'JP',
        userRole: 'driver',
        documentType: 'PPV Badge',
        uploadDate: '2026-02-27T09:18:00',
        status: 'pending',
        priority: 'high',
        assignedTo: 'admin-2',
        assignedToName: 'Natasha Campbell',
        fileType: 'image/jpeg',
    },
    {
        id: 'dq-6',
        userId: 'o2',
        userName: 'Davina Brown',
        userAvatar: 'DB',
        userRole: 'owner',
        documentType: 'Insurance Certificate',
        uploadDate: '2026-02-20T14:00:00',
        status: 'pending',
        priority: 'medium',
        assignedTo: null,
        assignedToName: null,
        expiryDate: '2028-02-20',
        fileType: 'application/pdf',
    },
    {
        id: 'dq-7',
        userId: 'o3',
        userName: 'Andrew Williams',
        userAvatar: 'AW',
        userRole: 'owner',
        documentType: 'Route Licence',
        uploadDate: '2024-11-01T11:00:00',
        status: 'pending',
        priority: 'low',
        assignedTo: null,
        assignedToName: null,
        fileType: 'application/pdf',
    },
    {
        id: 'dq-8',
        userId: 'dual-1',
        userName: 'Ricardo Henry',
        userAvatar: 'RH',
        userRole: 'dual',
        documentType: 'Police Record',
        uploadDate: '2026-02-20T16:45:00',
        status: 'pending',
        priority: 'medium',
        assignedTo: null,
        assignedToName: null,
        fileType: 'image/jpeg',
    },
    {
        id: 'dq-9',
        userId: 'd4',
        userName: 'Omar Lewis',
        userAvatar: 'OL',
        userRole: 'driver',
        documentType: 'TLC Badge',
        uploadDate: '2025-06-20T08:30:00',
        status: 'pending',
        priority: 'high',
        assignedTo: null,
        assignedToName: null,
        fileType: 'image/jpeg',
    },
];
