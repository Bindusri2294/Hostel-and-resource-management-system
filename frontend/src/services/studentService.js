import api from "./api";

export const getStudents = () => api.get("/students");

export const getStudentById = (rollno) => api.get(`/students/${rollno}`);

export const createStudent = (data) => api.post("/students", data);

export const updateStudent = (rollno, data) => api.put(`/students/${rollno}`, data);

export const deleteStudent = (rollno) => api.delete(`/students/${rollno}`);