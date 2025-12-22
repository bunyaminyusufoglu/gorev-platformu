import axiosInstance from '../config/axios';

// Kullanıcının bildirimlerini getir
export const getMyNotifications = async (params = {}) => {
  const response = await axiosInstance.get('/notifications', { params });
  return response.data;
};

// Okunmamış bildirim sayısını getir
export const getUnreadCount = async () => {
  const response = await axiosInstance.get('/notifications/unread-count');
  return response.data;
};

// Bildirimi okundu olarak işaretle
export const markAsRead = async (notificationId) => {
  const response = await axiosInstance.put(`/notifications/${notificationId}/read`);
  return response.data;
};

// Tüm bildirimleri okundu olarak işaretle
export const markAllAsRead = async () => {
  const response = await axiosInstance.put('/notifications/mark-all-read');
  return response.data;
};

// Bildirimi sil
export const deleteNotification = async (notificationId) => {
  const response = await axiosInstance.delete(`/notifications/${notificationId}`);
  return response.data;
};

// Tüm bildirimleri sil
export const deleteAllNotifications = async () => {
  const response = await axiosInstance.delete('/notifications');
  return response.data;
};

