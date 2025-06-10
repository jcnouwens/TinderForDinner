import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MatchScreen from '../MatchScreen';
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

describe('MatchScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly with recipe data', () => {
        const { getByText, getByTestId } = render(<MatchScreen />);

        expect(getByText("It's a Match! 🎉")).toBeTruthy();
        expect(getByText('You both want to make:')).toBeTruthy();
        expect(getByText('Test Recipe')).toBeTruthy();
        expect(getByText('30 min')).toBeTruthy();
        expect(getByText('4 servings')).toBeTruthy();
    });

    it('displays recipe image correctly', () => {
        const { getByTestId } = render(<MatchScreen />);
        const image = getByTestId('recipe-image');

        expect(image).toBeTruthy();
        expect(image.props.source.uri).toBe('https://example.com/image.jpg');
    });

    it('navigates to RecipeDetail when Start Cooking is pressed', () => {
        const { getByText } = render(<MatchScreen />);
        const startCookingButton = getByText('Start Cooking');

        fireEvent.press(startCookingButton);

        expect(mockNavigate).toHaveBeenCalledWith('RecipeDetail', { recipe: mockRecipe });
    });

    it('goes back when Keep Swiping is pressed', () => {
        const { getByText } = render(<MatchScreen />);
        const keepSwipingButton = getByText('Keep Swiping');

        fireEvent.press(keepSwipingButton);

        expect(mockGoBack).toHaveBeenCalled();
    });

    it('opens modal when recipe image is pressed', async () => {
        const { getByTestId, getByText } = render(<MatchScreen />);
        const recipeImage = getByTestId('recipe-image-touchable');

        fireEvent.press(recipeImage);

        await waitFor(() => {
            expect(getByText('Description')).toBeTruthy();
            expect(getByText('Ingredients')).toBeTruthy();
            expect(getByText('A delicious test recipe for testing purposes.')).toBeTruthy();
        });
    });

    it('opens modal when Test Modal button is pressed', async () => {
        const { getByText } = render(<MatchScreen />);
        const testModalButton = getByText('Test Modal');

        fireEvent.press(testModalButton);

        await waitFor(() => {
            expect(getByText('Description')).toBeTruthy();
            expect(getByText('Ingredients')).toBeTruthy();
        });
    });

    it('displays ingredients correctly in modal', async () => {
        const { getByTestId, getByText } = render(<MatchScreen />);
        const recipeImage = getByTestId('recipe-image-touchable');

        fireEvent.press(recipeImage);

        await waitFor(() => {
            expect(getByText('1 cup flour')).toBeTruthy();
            expect(getByText('2 eggs')).toBeTruthy();
            expect(getByText('1 cup milk')).toBeTruthy();
        });
    });

    it('closes modal when close button is pressed', async () => {
        const { getByTestId, getByText, queryByText } = render(<MatchScreen />);
        const recipeImage = getByTestId('recipe-image-touchable');

        // Open modal
        fireEvent.press(recipeImage);

        await waitFor(() => {
            expect(getByText('Description')).toBeTruthy();
        });

        // Close modal
        const closeButton = getByTestId('close-modal-button');
        fireEvent.press(closeButton);

        await waitFor(() => {
            expect(queryByText('Description')).toBeFalsy();
        });
    });

    it('handles recipe without summary gracefully', async () => {
        const recipeWithoutSummary = { ...mockRecipe, summary: '' };

        jest.doMock('@react-navigation/native', () => ({
            ...jest.requireActual('@react-navigation/native'),
            useRoute: () => ({
                params: {
                    recipe: recipeWithoutSummary,
                },
            }),
        }));

        const { getByTestId, queryByText } = render(<MatchScreen />);
        const recipeImage = getByTestId('recipe-image-touchable');

        fireEvent.press(recipeImage);

        await waitFor(() => {
            expect(queryByText('Description')).toBeFalsy();
            expect(getByText('Ingredients')).toBeTruthy();
        });
    });

    it('handles recipe without ingredients gracefully', async () => {
        const recipeWithoutIngredients = { ...mockRecipe, ingredients: [] };

        jest.doMock('@react-navigation/native', () => ({
            ...jest.requireActual('@react-navigation/native'),
            useRoute: () => ({
                params: {
                    recipe: recipeWithoutIngredients,
                },
            }),
        }));

        const { getByTestId, getByText } = render(<MatchScreen />);
        const recipeImage = getByTestId('recipe-image-touchable');

        fireEvent.press(recipeImage);

        await waitFor(() => {
            expect(getByText('No ingredients listed.')).toBeTruthy();
        });
    });
});
