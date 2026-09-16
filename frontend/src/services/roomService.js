import api from "./api";

export const getRooms = () => api.get("/rooms");

export const getRoomById = (block, roomNo) => api.get(`/rooms/${block}/${roomNo}`);

export const createRoom = (data) => api.post("/rooms", data);

export const updateRoom = (block, roomNo, data) => api.put(`/rooms/${block}/${roomNo}`, data);

export const deleteRoom = (block, roomNo) => api.delete(`/rooms/${block}/${roomNo}`);

export const getRoomsByStatus = (status) => api.get(`/rooms/status/${status}`);

export const getRoomsStats = () => api.get("/rooms/stats");