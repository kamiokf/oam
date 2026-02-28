export interface Referral {
    id: string;
    referredBy: string;
    referredByName: string;
    referredByAvatar: string;
    referredUser: string;
    referredUserName: string;
    referredUserAvatar: string;
    type: 'driver' | 'owner';
    status: 'pending' | 'active' | 'completed' | 'paid';
    bonusAmount: number;
    referralCode: string;
    dateReferred: string;
    dateCompleted?: string;
    datePaid?: string;
}

export const REFERRAL_BONUSES = {
    driver: 2500, // J$2,500
    owner: 5000,  // J$5,000
};

export const REFERRAL_TIERS = [
    { count: 1, label: 'Starter', bonus: 0 },
    { count: 5, label: 'Connector', bonus: 500 },
    { count: 10, label: 'Ambassador', bonus: 1000 },
    { count: 25, label: 'Champion', bonus: 2500 },
];

export const mockReferrals: Referral[] = [
    {
        id: 'ref-001',
        referredBy: 'd1',
        referredByName: 'Devon Smith',
        referredByAvatar: 'DS',
        referredUser: 'new-d1',
        referredUserName: 'Andre Campbell',
        referredUserAvatar: 'AC',
        type: 'driver',
        status: 'paid',
        bonusAmount: REFERRAL_BONUSES.driver,
        referralCode: 'DEVON2026',
        dateReferred: '2026-01-15',
        dateCompleted: '2026-01-28',
        datePaid: '2026-02-01',
    },
    {
        id: 'ref-002',
        referredBy: 'd1',
        referredByName: 'Devon Smith',
        referredByAvatar: 'DS',
        referredUser: 'new-d2',
        referredUserName: 'Michelle Grant',
        referredUserAvatar: 'MG',
        type: 'driver',
        status: 'completed',
        bonusAmount: REFERRAL_BONUSES.driver,
        referralCode: 'DEVON2026',
        dateReferred: '2026-02-10',
        dateCompleted: '2026-02-22',
    },
    {
        id: 'ref-003',
        referredBy: 'd1',
        referredByName: 'Devon Smith',
        referredByAvatar: 'DS',
        referredUser: 'new-d3',
        referredUserName: 'Patrick Reid',
        referredUserAvatar: 'PR',
        type: 'driver',
        status: 'active',
        bonusAmount: REFERRAL_BONUSES.driver,
        referralCode: 'DEVON2026',
        dateReferred: '2026-02-25',
    },
    {
        id: 'ref-004',
        referredBy: 'd1',
        referredByName: 'Devon Smith',
        referredByAvatar: 'DS',
        referredUser: 'new-o1',
        referredUserName: 'Sandra Walcott',
        referredUserAvatar: 'SW',
        type: 'owner',
        status: 'pending',
        bonusAmount: REFERRAL_BONUSES.owner,
        referralCode: 'DEVON2026',
        dateReferred: '2026-02-27',
    },
    {
        id: 'ref-005',
        referredBy: 'd2',
        referredByName: 'Kemar Johnson',
        referredByAvatar: 'KJ',
        referredUser: 'new-d4',
        referredUserName: 'Ryan Foster',
        referredUserAvatar: 'RF',
        type: 'driver',
        status: 'paid',
        bonusAmount: REFERRAL_BONUSES.driver,
        referralCode: 'KEMAR2026',
        dateReferred: '2026-01-20',
        dateCompleted: '2026-02-05',
        datePaid: '2026-02-10',
    },
];

export const getReferralStats = (referrals: Referral[], userId: string) => {
    const myReferrals = referrals.filter((r) => r.referredBy === userId);
    const paid = myReferrals.filter((r) => r.status === 'paid');
    const pending = myReferrals.filter((r) => r.status === 'pending' || r.status === 'active' || r.status === 'completed');
    const totalEarned = paid.reduce((s, r) => s + r.bonusAmount, 0);
    const pendingAmount = pending.reduce((s, r) => s + r.bonusAmount, 0);

    // Determine tier
    const count = myReferrals.length;
    const tier = [...REFERRAL_TIERS].reverse().find((t) => count >= t.count) || REFERRAL_TIERS[0];

    return {
        totalReferred: myReferrals.length,
        totalEarned,
        pendingAmount,
        pendingCount: pending.length,
        tier: tier.label,
        nextTier: REFERRAL_TIERS.find((t) => t.count > count),
        referrals: myReferrals,
    };
};
