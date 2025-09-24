import { sampleTopics, sampleFlashcards, sampleQuestions } from './sampleData';

const API_BASE_URL = 'http://localhost:3000/api';

interface ITopic {
  _id: string;
  name: string;
  description: string;
  sourceTitle: string;
  sourceURL?: string;
  flashcards: string[];
  assessment: string[];
}

interface IFlashcard {
  _id: string;
  front: string;
  back: string;
}

interface IQuestion {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

interface ITopicWithContent {
  _id: string;
  name: string;
  description: string;
  sourceTitle: string;
  sourceURL?: string;
  flashcards: IFlashcard[];
  assessment: IQuestion[];
}

interface IProgress {
  _id: string;
  user: string;
  topic: string;
  lastAttempted?: Date;
  assessmentScore?: number;
  flashcardsCompletedAt?: Date;
}

export class ApiClient {
  private token: string | null;

  constructor(token: string | null) {
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['x-auth-token'] = this.token;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      // Fallback to sample data if backend is not available
      console.warn('Backend not available, using sample data');
      return this.getSampleData(endpoint, options.method || 'GET');
    }
  }

  private getSampleData(endpoint: string, method: string) {
    // Simulate API responses with sample data
    if (endpoint === '/topics' && method === 'GET') {
      return { success: true, topics: sampleTopics };
    }

    if (endpoint.startsWith('/topics/') && method === 'GET') {
      const topicId = endpoint.split('/')[2];
      const topic = sampleTopics.find(t => t._id === topicId);
      
      if (topic) {
        const topicWithContent: ITopicWithContent = {
          ...topic,
          flashcards: sampleFlashcards[topicId] || [],
          assessment: sampleQuestions[topicId] || []
        };
        return { success: true, topic: topicWithContent };
      }
      return { success: false, error: 'Topic not found' };
    }

    if (endpoint === '/progress' && method === 'POST') {
      // Simulate progress update
      return { 
        success: true, 
        progress: {
          _id: 'progress1',
          user: 'user1',
          topic: 'topic1',
          lastAttempted: new Date(),
          assessmentScore: 85,
          flashcardsCompletedAt: new Date()
        }
      };
    }

    return { success: false, error: 'Endpoint not found' };
  }

  async getTopics(): Promise<{ success: boolean; topics: ITopic[] }> {
    return this.request('/topics');
  }

  async getTopic(id: string): Promise<{ success: boolean; topic: ITopicWithContent }> {
    return this.request(`/topics/${id}`);
  }

  async updateProgress(topicId: string, progress: { assessmentScore?: number; flashcardsCompleted?: boolean }): Promise<{ success: boolean; progress: IProgress }> {
    return this.request('/progress', {
      method: 'POST',
      body: JSON.stringify({ topicId, ...progress }),
    });
  }
}

export type { ITopic, IFlashcard, IQuestion, ITopicWithContent, IProgress };