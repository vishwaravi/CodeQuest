import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service methods
export const apiService = {
  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  // Test endpoint
  testApi: async () => {
    const response = await api.get('/api/test');
    return response.data;
  },

  // Auth endpoints
  register: async (username, email, password) => {
    const response = await api.post('/api/auth/register', {
      username,
      email,
      password,
    });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/api/auth/profile', data);
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/api/auth/password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Question endpoints
  getQuestions: async (params = {}) => {
    const response = await api.get('/api/questions', { params });
    return response.data;
  },

  getQuestion: async (id) => {
    const response = await api.get(`/api/questions/${id}`);
    return response.data;
  },

  getRandomQuestion: async (difficulty) => {
    const response = await api.get(`/api/questions/random/${difficulty}`);
    return response.data;
  },

  createQuestion: async (questionData) => {
    const response = await api.post('/api/questions', questionData);
    return response.data;
  },

  updateQuestion: async (id, questionData) => {
    const response = await api.put(`/api/questions/${id}`, questionData);
    return response.data;
  },

  deleteQuestion: async (id) => {
    const response = await api.delete(`/api/questions/${id}`);
    return response.data;
  },

  getQuestionStats: async () => {
    const response = await api.get('/api/questions/stats');
    return response.data;
  },

  // Battle endpoints
  getBattleHistory: async (limit = 20) => {
    const response = await api.get('/api/battles/history', { params: { limit } });
    return response.data;
  },

  getBattleDetails: async (battleId) => {
    const response = await api.get(`/api/battles/${battleId}`);
    return response.data;
  },

  getBattleStats: async () => {
    const response = await api.get('/api/battles/stats');
    return response.data;
  },

  getActiveBattle: async () => {
    const response = await api.get('/api/battles/active');
    return response.data;
  },

  getQueueStatus: async () => {
    const response = await api.get('/api/battles/queue/status');
    return response.data;
  },

  getUserQueuePosition: async () => {
    const response = await api.get('/api/battles/queue/position');
    return response.data;
  },

  getLeaderboard: async (limit = 50) => {
    const response = await api.get('/api/battles/leaderboard/top', { params: { limit } });
    return response.data;
  },

  // Code execution endpoints
  executeCode: async (battleId, code, language) => {
    const response = await api.post(`/api/battles/${battleId}/execute`, {
      code,
      language,
    });
    return response.data;
  },

  submitSolution: async (battleId, code, language) => {
    const response = await api.post(`/api/battles/${battleId}/submit`, {
      code,
      language,
    });
    return response.data;
  },
};

export default api;
