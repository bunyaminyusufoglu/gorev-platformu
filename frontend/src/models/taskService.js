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

// Görev tamamla (kullanıcı)
export const completeTask = async (taskId, proof, proofImages = []) => {
  const formData = new FormData();
  formData.append('taskId', taskId);
  if (proof) {
    formData.append('proof', proof);
  }
  
  // Resimleri ekle
  proofImages.forEach((file) => {
    formData.append('proofImages', file);
  });

  const response = await axiosInstance.post('/task-completions', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Kullanıcının tamamladığı görevleri getir
export const getMyCompletions = async () => {
  const response = await axiosInstance.get('/task-completions/my');
  return response.data;
};
