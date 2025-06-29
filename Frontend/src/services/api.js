import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Error handler
const handleError = (error) => {
  // Don't show toast for 401 errors as they will be handled by the interceptor
  if (error.response?.status !== 401) {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    toast.error(message);
  }
  return Promise.reject(error.response?.data || error);
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  handleError
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is due to an expired token and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(
          `${api.defaults.baseURL}/users/refresh-token`,
          { refreshToken }
        );

        const { accessToken } = response.data.data;
        if (!accessToken) {
          throw new Error('No access token received');
        }

        localStorage.setItem('accessToken', accessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, clear everything and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          toast.error('Session expired. Please login again.');
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    return handleError(error);
  }
);

export const videoAPI = {
  getAllVideos: async () => {
    const response = await api.get('/videos');
    return response.data;
  },
  getVideoById: async (videoId) => {
    const response = await api.get(`/videos/${videoId}`);
    return response.data;
  },
  uploadVideo: async (formData, onProgress) => {
    const response = await api.post('/videos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        if (onProgress) onProgress(percentCompleted);
      },
    });
    return response.data;
  },
  updateVideo: async (videoId, data) => {
    const response = await api.patch(`/videos/${videoId}`, data);
    return response.data;
  },
  deleteVideo: async (videoId) => {
    const response = await api.delete(`/videos/${videoId}`);
    return response.data;
  },
  togglePublishStatus: async (videoId) => {
    const response = await api.patch(`/videos/toggle/publish/${videoId}`);
    return response.data;
  },
  updateView: async (videoId) => {
    const response = await api.patch(`/videos/view/${videoId}`);
    return response.data;
  },
};

export const aiAPI = {
  generateTranscript: async (videoId) => {
    const response = await api.post(`/ai/transcript/${videoId}`);
    return response.data;
  },
  generateSummary: async (videoId) => {
    const response = await api.post(`/ai/summary/${videoId}`);
    return response.data;
  },
  generateQuiz: async (videoId) => {
    const response = await api.post(`/ai/quiz/${videoId}`);
    return response.data;
  },
  generateChapters: async (videoId) => {
    const response = await api.post(`/ai/chapters/${videoId}`);
    return response.data;
  },
  processAllFeatures: async (videoId) => {
    const response = await api.post(`/ai/process-all/${videoId}`);
    return response.data;
  },
};

export const commentAPI = {
  getVideoComments: async (videoId) => {
    const response = await api.get(`/comments/${videoId}`);
    return response.data;
  },
  addComment: async (videoId, content) => {
    const response = await api.post(`/comments/${videoId}`, { content });
    return response.data;
  },
  updateComment: async (commentId, content) => {
    const response = await api.patch(`/comments/c/${commentId}`, { content });
    return response.data;
  },
  deleteComment: async (commentId) => {
    const response = await api.delete(`/comments/c/${commentId}`);
    return response.data;
  },
};

export const likeAPI = {
  toggleLike: async (params) => {
    const response = await api.patch('/likes', null, { params });
    return response.data;
  },
  getLikedVideos: async () => {
    const response = await api.get('/likes/videos');
    return response.data;
  },
};

export const dashboardAPI = {
  getChannelStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
  getChannelVideos: async () => {
    const response = await api.get('/dashboard/videos');
    return response.data;
  },
};

export default api;
