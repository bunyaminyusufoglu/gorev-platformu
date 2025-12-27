import axiosInstance from '../config/axios';

// Dashboard istatistikleri
export const getDashboardStats = async () => {
  try {
    const response = await axiosInstance.get('/admin/dashboard');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Tüm kullanıcıları listele
export const getAllUsers = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/admin/users', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Tek kullanıcı detayları
export const getUserById = async (id) => {
  try {
    const response = await axiosInstance.get(`/admin/users/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Kullanıcıyı yasakla
export const banUser = async (id, reason) => {
  try {
    const response = await axiosInstance.put(`/admin/users/${id}/ban`, { reason });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Kullanıcı yasağını kaldır
export const unbanUser = async (id) => {
  try {
    const response = await axiosInstance.put(`/admin/users/${id}/unban`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Kullanıcı rolünü değiştir
export const changeUserRole = async (id, role) => {
  try {
    const response = await axiosInstance.put(`/admin/users/${id}/role`, { role });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Kullanıcı sil
export const deleteUser = async (id) => {
  try {
    const response = await axiosInstance.delete(`/admin/users/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Kullanıcı bilgilerini güncelle
export const updateUser = async (id, userData) => {
  try {
    const response = await axiosInstance.put(`/admin/users/${id}`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Tüm görev tamamlamalarını listele
export const getAllCompletions = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/task-completions/admin/all', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Görev tamamlamayı onayla/reddet
export const reviewCompletion = async (id, status, adminNote = '') => {
  try {
    const response = await axiosInstance.put(`/task-completions/admin/review/${id}`, {
      status,
      adminNote
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

