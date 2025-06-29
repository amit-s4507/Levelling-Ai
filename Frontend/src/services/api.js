import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/users/refresh-token`, {
            refreshToken,
          }, { withCredentials: true });

          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const videoAPI = {
  getAllVideos: () => api.get('/videos'),
  getVideoById: (videoId) => api.get(`/videos/${videoId}`),
  uploadVideo: (formData) => api.post('/videos', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  updateVideo: (videoId, data) => api.patch(`/videos/${videoId}`, data),
  deleteVideo: (videoId) => api.delete(`/videos/${videoId}`),
  togglePublishStatus: (videoId) => api.patch(`/videos/toggle/publish/${videoId}`),
  updateView: (videoId) => api.patch(`/videos/view/${videoId}`),
};

export const aiAPI = {
  generateTranscript: (videoId) => api.post(`/ai/transcript/${videoId}`),
  generateSummary: (videoId) => api.post(`/ai/summary/${videoId}`),
  generateQuiz: (videoId) => api.post(`/ai/quiz/${videoId}`),
  generateChapters: (videoId) => api.post(`/ai/chapters/${videoId}`),
  processAllFeatures: (videoId) => api.post(`/ai/process-all/${videoId}`),
};

export const commentAPI = {
  getVideoComments: (videoId) => api.get(`/comments/${videoId}`),
  addComment: (videoId, content) => api.post(`/comments/${videoId}`, { content }),
  updateComment: (commentId, content) => api.patch(`/comments/c/${commentId}`, { content }),
  deleteComment: (commentId) => api.delete(`/comments/c/${commentId}`),
};

export const likeAPI = {
  toggleLike: (params) => api.patch('/likes', null, { params }),
  getLikedVideos: () => api.get('/likes/videos'),
};

export const dashboardAPI = {
  getChannelStats: () => api.get('/dashboard/stats'),
  getChannelVideos: () => api.get('/dashboard/videos'),
};
