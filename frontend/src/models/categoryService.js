import axiosInstance from '../config/axios';

export const getCategories = async () => {
  const response = await axiosInstance.get('/categories');
  return response.data;
};

// Tüm kategorileri getir (admin için - aktif/pasif tümü)
export const getAllCategories = async () => {
  const response = await axiosInstance.get('/categories/admin/all');
  return response.data;
};