import { FetchQuestionsResponse } from '@shared/types';
import { apiRequest } from './queryClient';

// Function to fetch quiz questions from our backend API
export async function fetchQuizQuestions(topic: string, count: number = 5): Promise<FetchQuestionsResponse> {
  try {
    const response = await apiRequest('POST', '/api/quiz/questions', { topic, count });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    throw error;
  }
}
