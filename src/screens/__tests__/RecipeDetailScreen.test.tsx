import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Linking, Share } from 'react-native';
import { RecipeDetailScreen } from '../RecipeDetailScreen';
import { Recipe } from '../../types';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
    useRoute: () => ({
        params: {
            recipe: mockRecipe,
        },
    }),
}));

// Mock Linking
const mockOpenURL = jest.fn();
jest.mock('react-native/Libraries/Linking/Linking', () => ({
    openURL: mockOpenURL,
}));

// Also override the imported Linking
Object.defineProperty(Linking, 'openURL', {
    value: mockOpenURL,
    writable: true,
});

// Mock Share
const mockShare = jest.fn();
jest.mock('react-native/Libraries/Share/Share', () => ({
    share: mockShare,
}));

// Also override the imported Share
Object.defineProperty(Share, 'share', {
    value: mockShare,
    writable: true,
});

const mockRecipe: Recipe = {
    id: '1',
    title: 'Test Recipe',
    image: 'https://example.com/image.jpg',
    ingredients: ['1 cup flour', '2 eggs', '1 cup milk'],
    instructions: ['Mix ingredients', 'Cook for 30 minutes'],
    readyInMinutes: 30,
    servings: 4,
    sourceUrl: 'https://example.com/recipe',
    summary: 'A delicious test recipe for testing purposes.',
    diets: ['vegetarian'],
};

describe('RecipeDetailScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly with recipe data', () => {
        const { getByText } = render(<RecipeDetailScreen />);

        expect(getByText('Test Recipe')).toBeTruthy();
        expect(getByText('30 min')).toBeTruthy();
        expect(getByText('4 servings')).toBeTruthy();
        expect(getByText('Ingredients')).toBeTruthy();
        expect(getByText('Instructions')).toBeTruthy();
    });

    it('displays recipe image correctly', () => {
        const { getByTestId } = render(<RecipeDetailScreen />);

        const image = getByTestId('recipe-detail-image');
        expect(image).toBeTruthy();
        expect(image.props.source.uri).toBe('https://example.com/image.jpg');
    });

    it('displays ingredients list', () => {
        const { getByText } = render(<RecipeDetailScreen />);

        expect(getByText('1 cup flour')).toBeTruthy();
        expect(getByText('2 eggs')).toBeTruthy();
        expect(getByText('1 cup milk')).toBeTruthy();
    });

    it('displays instructions list', () => {
        const { getByText } = render(<RecipeDetailScreen />);

        expect(getByText('1. Mix ingredients')).toBeTruthy();
        expect(getByText('2. Cook for 30 minutes')).toBeTruthy();
    });

    it('displays recipe summary when available', () => {
        const { getByText } = render(<RecipeDetailScreen />);

        expect(getByText('A delicious test recipe for testing purposes.')).toBeTruthy();
    });

    it('displays dietary information', () => {
        const { getByText } = render(<RecipeDetailScreen />);

        expect(getByText('vegetarian')).toBeTruthy();
    });

    it('handles share recipe button press', async () => {
        mockShare.mockResolvedValue({ action: 'sharedAction' });

        const { getByText } = render(<RecipeDetailScreen />);

        const shareButton = getByText('Share Recipe');
        fireEvent.press(shareButton);

        await waitFor(() => {
            expect(mockShare).toHaveBeenCalledWith({
                message: 'Check out this recipe: Test Recipe - https://example.com/recipe',
                title: 'Test Recipe',
            });
        });
    });

    it('handles share recipe error', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        mockShare.mockRejectedValue(new Error('Share failed'));

        const { getByText } = render(<RecipeDetailScreen />);

        const shareButton = getByText('Share Recipe');
        fireEvent.press(shareButton);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Error sharing recipe:', expect.any(Error));
        });

        consoleSpy.mockRestore();
    });

    it('handles view original button press', () => {
        mockOpenURL.mockResolvedValue(true);

        const { getByText } = render(<RecipeDetailScreen />);

        const viewOriginalButton = getByText('View Original');
        fireEvent.press(viewOriginalButton);

        expect(mockOpenURL).toHaveBeenCalledWith('https://example.com/recipe');
    });

    it('handles view original URL error', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        mockOpenURL.mockRejectedValue(new Error('Could not open URL'));

        const { getByText } = render(<RecipeDetailScreen />);

        const viewOriginalButton = getByText('View Original');
        fireEvent.press(viewOriginalButton);

        expect(mockOpenURL).toHaveBeenCalledWith('https://example.com/recipe');

        consoleSpy.mockRestore();
    });

    it('displays cooking time and servings metadata', () => {
        const { getByText } = render(<RecipeDetailScreen />);

        // Check for the meta information
        expect(getByText('Ready in 30 minutes')).toBeTruthy();
        expect(getByText('Serves 4 people')).toBeTruthy();
    });

    it('renders scroll view for long content', () => {
        const { getByTestId } = render(<RecipeDetailScreen />);

        const scrollView = getByTestId('recipe-detail-scroll');
        expect(scrollView).toBeTruthy();
    });

    it('displays ingredients with bullet points', () => {
        const { getByTestId } = render(<RecipeDetailScreen />);

        // Check that ingredients are rendered with bullet styling
        const ingredientsList = getByTestId('ingredients-list');
        expect(ingredientsList).toBeTruthy();
    });

    it('displays instructions with numbering', () => {
        const { getByTestId } = render(<RecipeDetailScreen />);

        // Check that instructions are rendered with numbering
        const instructionsList = getByTestId('instructions-list');
        expect(instructionsList).toBeTruthy();
    });

    it('handles missing dietary information gracefully', () => {
        const recipeWithoutDiets = { ...mockRecipe, diets: [] };

        jest.doMock('@react-navigation/native', () => ({
            ...jest.requireActual('@react-navigation/native'),
            useRoute: () => ({
                params: {
                    recipe: recipeWithoutDiets,
                },
            }),
        }));

        const { queryByText } = render(<RecipeDetailScreen />);

        // Should not crash when no dietary information is available
        expect(queryByText('vegetarian')).toBeFalsy();
    });

    it('handles missing summary gracefully', () => {
        const recipeWithoutSummary = { ...mockRecipe, summary: '' };

        jest.doMock('@react-navigation/native', () => ({
            ...jest.requireActual('@react-navigation/native'),
            useRoute: () => ({
                params: {
                    recipe: recipeWithoutSummary,
                },
            }),
        }));

        const { queryByText } = render(<RecipeDetailScreen />);

        // Should still render other content even without summary
        expect(queryByText('Test Recipe')).toBeTruthy();
    });
});
