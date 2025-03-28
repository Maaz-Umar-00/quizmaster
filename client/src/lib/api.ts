import { FetchQuestionsResponse } from '@shared/types';
import { apiRequest } from './queryClient';

// Function to fetch quiz questions from our backend API
export async function fetchQuizQuestions(topic: string, count: number = 5): Promise<FetchQuestionsResponse> {
  console.log('Fetching quiz questions for topic:', topic);
  console.log('Question count:', count);
  try {
    console.log('Making API request to /api/quiz/questions');
    const response = await apiRequest('POST', '/api/quiz/questions', { topic, count });
    console.log('Received response:', response.status);
    const data = await response.json();
    console.log('Parsed response data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    throw error;
  }
}
