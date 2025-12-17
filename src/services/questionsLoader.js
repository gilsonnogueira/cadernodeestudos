/**
 * Questions Loader Service
 * Loads questions asynchronously via fetch to avoid blocking the main thread
 */

const BASE_PATH = import.meta.env.BASE_URL || '/';

export async function loadQuestions() {
    try {
        const response = await fetch(`${BASE_PATH}data/questions.json`);
        if (!response.ok) {
            throw new Error(`Failed to load questions: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error('Error loading questions:', error);
        throw error;
    }
}
