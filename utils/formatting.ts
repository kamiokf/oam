export const formatCurrency = (amount: number): string =>
    `J$${amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

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
