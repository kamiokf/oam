export interface Review {
    id: string;
    fromId: string;
    fromName: string;
    fromAvatar: string;
    fromRole: 'driver' | 'owner';
    toId: string;
    toName: string;
    rating: number;
    comment: string;
    date: string;
    route?: { from: string; to: string };
}
