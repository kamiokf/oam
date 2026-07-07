export const formatCurrency = (amount: number): string =>
    `J$${amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

export const JAMAICA_AREA_CODES = ['876', '658'] as const;
export type JamaicaAreaCode = (typeof JAMAICA_AREA_CODES)[number];

// Normalizes to the DB phone format "+1 876 555 0100". Accepts a 7-digit
// local number (uses areaCode), a 10-digit number starting with a Jamaican
// area code, or an 11-digit number with the leading 1. Returns null if the
// input can't be a Jamaican number.
export const formatJamaicanPhone = (input: string, areaCode: string = '876'): string | null => {
    let digits = input.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1);
    if (digits.length === 10) {
        const embedded = digits.slice(0, 3);
        if (!(JAMAICA_AREA_CODES as readonly string[]).includes(embedded)) return null;
        areaCode = embedded;
        digits = digits.slice(3);
    }
    if (digits.length !== 7) return null;
    return `+1 ${areaCode} ${digits.slice(0, 3)} ${digits.slice(3)}`;
};

export const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

export const formatShortDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
};

export const formatRelativeDate = (dateStr: string): string => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(dateStr);
};

export const getDaysUntil = (dateStr: string): number => {
    const now = new Date();
    const date = new Date(dateStr);
    return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

export const getExpiryStatus = (dateStr: string): 'ok' | 'warning' | 'danger' => {
    const days = getDaysUntil(dateStr);
    if (days < 0) return 'danger';
    if (days < 30) return 'warning';
    return 'ok';
};

export const generateStarArray = (rating: number): ('full' | 'half' | 'empty')[] => {
    const stars: ('full' | 'half' | 'empty')[] = [];
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) stars.push('full');
        else if (rating >= i - 0.5) stars.push('half');
        else stars.push('empty');
    }
    return stars;
};
