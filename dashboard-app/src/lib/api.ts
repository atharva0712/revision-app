import { sampleTopics, sampleFlashcards, sampleQuestions } from './sampleData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

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
  back:string;
  mcqs?: IMcq[];
}

interface IMcq {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: string;
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

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['x-auth-token'] = this.token;
    }
    return headers;
  }

  private async request<T>(method: string, url: string, data?: object): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method,
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Something went wrong');
    }

    return response.json();
  }

  public async getTopics(): Promise<{ success: boolean; topics: ITopic[] }> {
    return this.request('GET', '/topics');
  }

  public async getTopic(topicId: string): Promise<{ success: boolean; topic: ITopicWithContent }> {
    return this.request('GET', `/topics/${topicId}`);
  }

  public async createTopic(data: { name: string; description: string; sourceURL?: string; sourceTitle?: string; sourceType?: string; extractedAt?: Date; confidence?: number; category?: string; keywords?: string[] }): Promise<{ success: boolean; message: string; topic: ITopic }> {
    return this.request('POST', '/topics', data);
  }

  public async retryTopicGeneration(topicId: string): Promise<{ success: boolean; message: string; topic: ITopic }> {
    return this.request('POST', `/topics/${topicId}/retry`);
  }

  public async updateProgress(topicId: string, data: { flashcardsCompleted?: boolean; assessmentCompleted?: boolean }): Promise<{ success: boolean; message: string }> {
    return this.request('POST', `/progress/${topicId}`, data);
  }

  public async updateFlashcardProgress(topicId: string, flashcardId: string, rating: number): Promise<any> {
    return this.request('POST', `/progress/${topicId}/flashcard/${flashcardId}`, { rating });
  }

  public async getDueFlashcards(topicId: string): Promise<{ success: boolean; dueFlashcards: IFlashcard[]; newFlashcards: IFlashcard[]; totalDue: number }> {
    return this.request('GET', `/progress/${topicId}/flashcards/due`);
  }

  public async getDashboardStats(): Promise<{ success: boolean; dueTodayCount: number; dueByTopic: { [topicId: string]: number } }> {
    return this.request('GET', '/progress/dashboard');
  }

  public async generateDeepDiagnostic(topicId: string): Promise<{ success: boolean; questions: IQuestion[] }> {
    return this.request('POST', `/topics/${topicId}/deep-diagnostic`);
  }

  public async getAllUserProgress(): Promise<{ success: boolean; progress: { [topicId: string]: number } }> {
    return this.request('GET', '/progress');
  }

  // Auth related
  public async register(userData: any): Promise<any> {
    return this.request('POST', '/auth/register', userData);
  }

  public async login(userData: any): Promise<any> {
    return this.request('POST', '/auth/login', userData);
  }

  public async getUser(): Promise<any> {
    return this.request('GET', '/auth/user');
  }
}

export type { ITopic, IFlashcard, IQuestion, ITopicWithContent, IProgress };