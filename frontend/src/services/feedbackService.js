import API from './api';

export const authService = {
  login: async (email, password) => {
    const response = await API.post('/auth/login', { email, password });
    return response.data;
  },

  registerStudent: async (studentData) => {
    const response = await API.post('/auth/register', studentData);
    return response.data;
  },

  getMe: async () => {
    const response = await API.get('/auth/me');
    return response.data;
  },
};

export const feedbackService = {
  // Student: Create new feedback (FormData for image upload)
  createFeedback: async (formData) => {
    const response = await API.post('/feedback', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Student: Fetch logged in student's own feedback
  getMyFeedbacks: async () => {
    const response = await API.get('/feedback/my');
    return response.data;
  },

  // Admin: Fetch all feedbacks with filters & search
  getAllFeedbacks: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.rating) params.append('rating', filters.rating);
    if (filters.search) params.append('search', filters.search);

    const response = await API.get(`/feedback?${params.toString()}`);
    return response.data;
  },

  // Admin: Update feedback status and add resolution response notes
  updateFeedbackStatus: async (id, status, adminResponse) => {
    const response = await API.patch(`/feedback/${id}/status`, {
      status,
      adminResponse,
    });
    return response.data;
  },

  // Admin: Get feedback statistics
  getFeedbackStats: async () => {
    const response = await API.get('/feedback/stats');
    return response.data;
  },
};
