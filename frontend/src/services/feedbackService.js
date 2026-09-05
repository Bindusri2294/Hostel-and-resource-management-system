import api from "./api";

export const getFeedbacks = () => api.get("/feedback");

export const getFeedbackById = (id) => api.get(`/feedback/${id}`);

export const createFeedback = (data) => api.post("/feedback", data);

export const updateFeedback = (id, data) => api.put(`/feedback/${id}`, data);

export const deleteFeedback = (id) => api.delete(`/feedback/${id}`);