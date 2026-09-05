import api from "./api";

export const getAllocations = () => api.get("/allocations");

export const getAllocationById = (id) => api.get(`/allocations/${id}`);

export const createAllocation = (data) => api.post("/allocations", data);

export const updateAllocation = (id, data) => api.put(`/allocations/${id}`, data);

export const deleteAllocation = (id) => api.delete(`/allocations/${id}`);