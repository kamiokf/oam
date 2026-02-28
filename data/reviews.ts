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

export const mockReviews: Review[] = [
    {
        id: 'r1',
        fromId: 'o1',
        fromName: 'Marcus Thompson',
        fromAvatar: 'MT',
        fromRole: 'owner',
        toId: 'd1',
        toName: 'Devon Smith',
        rating: 5,
        comment: 'Excellent driver! Always on time and keeps the vehicle clean. Passengers love him.',
        date: '2026-02-26',
        route: { from: 'Kingston', to: 'Spanish Town' },
    },
    {
        id: 'r2',
        fromId: 'd1',
        fromName: 'Devon Smith',
        fromAvatar: 'DS',
        fromRole: 'driver',
        toId: 'o1',
        toName: 'Marcus Thompson',
        rating: 4,
        comment: 'Good owner. Vehicle is well maintained, payments usually on time.',
        date: '2026-02-25',
        route: { from: 'Kingston', to: 'Spanish Town' },
    },
    {
        id: 'r3',
        fromId: 'o2',
        fromName: 'Davina Brown',
        fromAvatar: 'DB',
        fromRole: 'owner',
        toId: 'd2',
        toName: 'Kemar Johnson',
        rating: 5,
        comment: 'Top-tier driver. My coaster has never been in better hands. Highly recommend!',
        date: '2026-02-24',
        route: { from: 'Kingston', to: 'Montego Bay' },
    },
    {
        id: 'r4',
        fromId: 'd3',
        fromName: 'Tricia Murray',
        fromAvatar: 'TM',
        fromRole: 'driver',
        toId: 'o1',
        toName: 'Marcus Thompson',
        rating: 5,
        comment: 'Best owner I have worked with. Fair payment, great communication, and always supportive.',
        date: '2026-02-22',
        route: { from: 'Spanish Town', to: 'Linstead' },
    },
    {
        id: 'r5',
        fromId: 'o4',
        fromName: 'Shereen Clarke',
        fromAvatar: 'SC',
        fromRole: 'owner',
        toId: 'd5',
        toName: 'Shanice Brown',
        rating: 4,
        comment: 'Reliable driver. Occasionally late but overall a good addition to my team.',
        date: '2026-02-20',
        route: { from: 'Montego Bay', to: 'Negril' },
    },
];
