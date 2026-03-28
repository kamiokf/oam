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
