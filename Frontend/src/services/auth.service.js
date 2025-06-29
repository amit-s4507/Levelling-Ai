import api from "./api";

export const authAPI = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/users/login', credentials);
      const { data } = response.data;
      if (data.accessToken && data.refreshToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(errorMessage);
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const formData = new FormData();
      
      // Add text fields
      formData.append('fullName', userData.fullName);
      formData.append('email', userData.email);
      formData.append('username', userData.username);
      formData.append('password', userData.password);
      
      // Add files if provided
      if (userData.avatar) {
        formData.append('avatar', userData.avatar);
      }
      if (userData.coverImage) {
        formData.append('coverImage', userData.coverImage);
      }

      const response = await api.post('/users/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { data } = response.data;
      if (data.accessToken && data.refreshToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      throw new Error(errorMessage);
    }
  },

  // Logout user
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/users/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/users/current-user');
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get user data';
      throw new Error(errorMessage);
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.patch('/users/update-account', profileData);
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile';
      throw new Error(errorMessage);
    }
  },

  // Update avatar
  updateAvatar: async (avatarFile) => {
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const response = await api.patch('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update avatar';
      throw new Error(errorMessage);
    }
  },

  // Update cover image
  updateCoverImage: async (coverImageFile) => {
    try {
      const formData = new FormData();
      formData.append('coverImage', coverImageFile);

      const response = await api.patch('/users/cover-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update cover image';
      throw new Error(errorMessage);
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.post('/users/change-password', passwordData);
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to change password';
      throw new Error(errorMessage);
    }
  },
}; 