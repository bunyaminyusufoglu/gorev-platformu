import axiosInstance from '../config/axios';

// Kayıt ol
export const register = async (userData) => {
  const response = await axiosInstance.post('/auth/register', userData);
  return response.data;
};

// Giriş yap
export const login = async (credentials) => {
  const response = await axiosInstance.post('/auth/login', credentials);
  return response.data;
};

// Kullanıcı bilgilerini getir
export const getMe = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};

// Profil güncelle
export const updateProfile = async (name) => {
  const response = await axiosInstance.put('/auth/profile', { name });
  return response.data;
};

// Şifre değiştir
export const changePassword = async (passwordData) => {
  const response = await axiosInstance.put('/auth/change-password', passwordData);
  return response.data;
};

