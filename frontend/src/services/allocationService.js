import api from "./api";

export const getAllocations = () => api.get("/allocations");

export const getAllocationById = (id) => api.get(`/allocations/${id}`);

// NOTE: body must be { studentId (Rollno), roomNo, block } — not roomId
export const createAllocation = (data) => api.post("/allocations", data);

export const updateAllocation = (id, data) => api.put(`/allocations/${id}`, data);

export const deleteAllocation = (id) => api.delete(`/allocations/${id}`);