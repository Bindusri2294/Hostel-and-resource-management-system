import api from "./api";

export const getFeedbacks = () => api.get("/feedback");

export const getFeedbackById = (id) => api.get(`/feedback/${id}`);

export const createFeedback = (data) => api.post("/feedback", data);

export const updateFeedback = (id, data) => api.put(`/feedback/${id}`, data);

export const deleteFeedback = (id) => api.delete(`/feedback/${id}`);

export const escalateFeedback = (id, data) => api.post(`/feedback/${id}/escalate`, data);
export const getEscalatedFeedback = (token) => api.get(`/feedback/escalation/${token}`);
export const actionEscalatedFeedback = (token, data) => api.post(`/feedback/escalation/${token}/action`, data);

export const feedbackService = {
  getFeedbacks,
  getFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  escalate: escalateFeedback,
  getEscalated: getEscalatedFeedback,
  actionEscalated: actionEscalatedFeedback,
};

export default feedbackService;