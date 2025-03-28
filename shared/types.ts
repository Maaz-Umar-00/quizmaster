// Type definitions for the quiz application

// Question structure from LLaMA 3 API
export interface Question {
  text: string;
  options: string[];
  correctAnswer: number; // Index of the correct answer
}

// Shape of the API request to fetch questions
export interface FetchQuestionsRequest {
  topic: string;
  count?: number; // Number of questions to fetch, defaults to 5
}

// Shape of the API response
export interface FetchQuestionsResponse {
  questions: Question[];
  topic: string;
}

// Topic definition
export interface Topic {
  id: string;
  name: string;
  emoji: string;
}

// Available topics
export const TOPICS: Topic[] = [
  { id: 'science', name: 'Science', emoji: '🔬' },
  { id: 'history', name: 'History', emoji: '🏛️' },
  { id: 'sports', name: 'Sports', emoji: '⚽' },
  { id: 'technology', name: 'Technology', emoji: '💻' },
  { id: 'movies', name: 'Movies', emoji: '🎬' },
  { id: 'geography', name: 'Geography', emoji: '🌍' }
];
