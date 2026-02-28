// Route-weighted smart matching for the Jamaican transport market
// Route experience is the #1 signal — a 3-year Kingston→Ocho Rios driver
// far outmatches a nearby driver with no route knowledge.

export interface RouteExperience {
    from: string;
    to: string;
    yearsOnRoute: number;
    tripCount: number;
}

export interface BackgroundCheck {
    policeRecord: 'verified' | 'pending' | 'expired' | 'not_submitted';
    licenseValidation: 'verified' | 'pending' | 'expired' | 'not_submitted';
    references: 'verified' | 'pending' | 'not_submitted';
    overallStatus: 'premium' | 'standard' | 'basic' | 'incomplete';
}

export interface MatchResult {
    score: number;
    reasons: string[];
    breakdown: {
        route: number;
        rating: number;
        experience: number;
        license: number;
        background: number;
    };
}

// Check if two routes share stops (adjacent route credit)
const routeSharesStop = (
    routeA: { from: string; to: string },
    routeB: { from: string; to: string }
): boolean => {
    return (
        routeA.from === routeB.from ||
        routeA.from === routeB.to ||
        routeA.to === routeB.from ||
        routeA.to === routeB.to
    );
};

// Calculate route-specific weight (0-40 pts)
export const calculateRouteWeight = (
    driverRoutes: RouteExperience[],
    jobRoute: { from: string; to: string }
): { score: number; reason: string } => {
    // Exact route match
    const exact = driverRoutes.find(
        (r) =>
            (r.from === jobRoute.from && r.to === jobRoute.to) ||
            (r.from === jobRoute.to && r.to === jobRoute.from) // reverse route counts
    );

    if (exact) {
        let pts = 15; // base for knowing the route
        pts += Math.min(exact.yearsOnRoute * 5, 15); // up to 15 pts for years
        pts += Math.min(Math.floor(exact.tripCount / 100) * 2, 10); // up to 10 pts for trip volume
        const capped = Math.min(pts, 40);
        return {
            score: capped,
            reason: `${exact.yearsOnRoute}yr on ${jobRoute.from}→${jobRoute.to} (${exact.tripCount.toLocaleString()} trips)`,
        };
    }

    // Adjacent route (shared stop) — partial credit
    const adjacent = driverRoutes.find((r) => routeSharesStop(r, jobRoute));
    if (adjacent) {
        const pts = Math.min(5 + adjacent.yearsOnRoute * 2, 15);
        return {
            score: pts,
            reason: `Adjacent route experience (${adjacent.from}→${adjacent.to})`,
        };
    }

    return { score: 0, reason: '' };
};

// Full match scoring (rebalanced: route=40, rating=20, exp=20, license=10, background=10)
export const calculateMatchScore = (
    driverExperience: number,
    driverRating: number,
    driverLicense: string,
    requiredExperience: number,
    requiredLicense: string,
    driverRoutes: RouteExperience[],
    jobRoute: { from: string; to: string },
    backgroundCheck?: BackgroundCheck
): MatchResult => {
    const reasons: string[] = [];
    const breakdown = { route: 0, rating: 0, experience: 0, license: 0, background: 0 };

    // 1. Route Experience (0-40 pts) — THE #1 SIGNAL
    const routeResult = calculateRouteWeight(driverRoutes, jobRoute);
    breakdown.route = routeResult.score;
    if (routeResult.reason) reasons.push(routeResult.reason);

    // 2. Driver Rating (0-20 pts)
    if (driverRating >= 4.7) {
        breakdown.rating = 20;
        reasons.push('Outstanding rating');
    } else if (driverRating >= 4.3) {
        breakdown.rating = 15;
        reasons.push('Strong rating');
    } else if (driverRating >= 4.0) {
        breakdown.rating = 10;
    } else {
        breakdown.rating = Math.round(driverRating * 2.5);
    }

    // 3. General Experience (0-20 pts)
    if (driverExperience >= requiredExperience) {
        const bonus = Math.min((driverExperience - requiredExperience) * 3, 10);
        breakdown.experience = 10 + bonus;
        reasons.push(`${driverExperience} years experience`);
    } else {
        breakdown.experience = Math.round((driverExperience / requiredExperience) * 10);
    }

    // 4. License Match (0-10 pts)
    if (driverLicense === requiredLicense || driverLicense === 'PPV') {
        breakdown.license = 10;
        reasons.push('License type matches');
    } else {
        breakdown.license = 3; // partial — some license is better than none
    }

    // 5. Background Check Bonus (0-10 pts)
    if (backgroundCheck) {
        if (backgroundCheck.overallStatus === 'premium') {
            breakdown.background = 10;
            reasons.push('Premium verified driver');
        } else if (backgroundCheck.overallStatus === 'standard') {
            breakdown.background = 7;
            reasons.push('Standard verified');
        } else if (backgroundCheck.overallStatus === 'basic') {
            breakdown.background = 4;
        }
    }

    const total = breakdown.route + breakdown.rating + breakdown.experience + breakdown.license + breakdown.background;

    return {
        score: Math.min(total, 100),
        reasons,
        breakdown,
    };
};
