import axiosInstance from '../config/axios';

// Görevleri getir (public, filtreli)
export const getTasks = async (params = {}) => {
  const response = await axiosInstance.get('/tasks', { params });
  return response.data;
};

// Görev oluştur (admin)
export const createTask = async (payload) => {
  const response = await axiosInstance.post('/tasks', payload);
  return response.data;
};

// Görev güncelle (admin)
export const updateTask = async (taskId, payload) => {
  const response = await axiosInstance.put(`/tasks/${taskId}`, payload);
  return response.data;
};
