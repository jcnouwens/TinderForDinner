// Example utility functions for testing
export const formatRecipeName = (name: string): string => {
    return name.trim().toLowerCase().replace(/\s+/g, '-');
};

export const calculateMatchPercentage = (likes: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((likes / total) * 100);
};

export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
