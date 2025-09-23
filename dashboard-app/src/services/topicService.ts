import { useAuth } from '../contexts/AuthContext';

const API_URL = 'http://localhost:3000/api';

// This is a helper function, not a hook
const getAuthHeaders = (token: string | null) => {
  if (!token) return {};
  return { 'x-auth-token': token };
};

// We can't use the useAuth hook directly in the service, 
// so we'll need to pass the token to each function.

export const topicService = {
  async getTopics(token: string) {
    const res = await fetch(`${API_URL}/topics`, {
      headers: getAuthHeaders(token),
    });
    return res.json();
  },

  async getTopicById(token: string, id: string) {
    const res = await fetch(`${API_URL}/topics/${id}`, {
      headers: getAuthHeaders(token),
    });
    return res.json();
  },

  async getProgress(token: string) {
    const res = await fetch(`${API_URL}/progress`, {
      headers: getAuthHeaders(token),
    });
    return res.json();
  },

  async updateProgress(token: string, topicId: string, progressData: { assessmentScore?: number; flashcardsCompleted?: boolean }) {
    const res = await fetch(`${API_URL}/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(token),
      },
      body: JSON.stringify({ topicId, ...progressData }),
    });
    return res.json();
  },
};
