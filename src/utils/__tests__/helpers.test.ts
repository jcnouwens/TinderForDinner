import { formatRecipeName, calculateMatchPercentage, isValidEmail } from '../helpers';

describe('Helper Functions', () => {
    describe('formatRecipeName', () => {
        it('should format recipe name correctly', () => {
            expect(formatRecipeName('  Chicken Alfredo  ')).toBe('chicken-alfredo');
            expect(formatRecipeName('Spicy Thai Curry')).toBe('spicy-thai-curry');
            expect(formatRecipeName('PIZZA')).toBe('pizza');
        });

        it('should handle empty strings', () => {
            expect(formatRecipeName('')).toBe('');
            expect(formatRecipeName('   ')).toBe('');
        });
    });

    describe('calculateMatchPercentage', () => {
        it('should calculate percentage correctly', () => {
            expect(calculateMatchPercentage(4, 5)).toBe(80);
            expect(calculateMatchPercentage(1, 3)).toBe(33);
            expect(calculateMatchPercentage(10, 10)).toBe(100);
        });

        it('should return 0 for zero total', () => {
            expect(calculateMatchPercentage(5, 0)).toBe(0);
        });

        it('should return 0 for zero likes', () => {
            expect(calculateMatchPercentage(0, 10)).toBe(0);
        });
    });

    describe('isValidEmail', () => {
        it('should validate correct email addresses', () => {
            expect(isValidEmail('test@example.com')).toBe(true);
            expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
            expect(isValidEmail('valid+email@test.org')).toBe(true);
        });

        it('should reject invalid email addresses', () => {
            expect(isValidEmail('invalid-email')).toBe(false);
            expect(isValidEmail('@domain.com')).toBe(false);
            expect(isValidEmail('user@')).toBe(false);
            expect(isValidEmail('user@domain')).toBe(false);
            expect(isValidEmail('')).toBe(false);
        });
    });
});
