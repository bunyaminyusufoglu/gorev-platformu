import axios from 'axios';
import API_BASE_URL from './api';
import {
  getAuthToken,
  getRefreshToken,
  setAuthToken,
  setRefreshToken,
  clearAuth
} from '../utils/auth';

// Axios instance oluştur
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise = null;

const refreshTokens = async (refreshToken) => {
  const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
    refreshToken
  });
  return response.data;
};

// Request interceptor - Token ekleme
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Hata yönetimi ve token yenileme
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 401 && originalRequest && !originalRequest._retry) {
      const storedRefreshToken = getRefreshToken();

      if (!storedRefreshToken) {
        clearAuth();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refreshTokens(storedRefreshToken)
            .then((res) => {
              if (!res.success) {
                throw new Error(res.message || 'Token yenileme başarısız');
              }

              const { token: newAccessToken, refreshToken: newRefreshToken } = res.data;

              setAuthToken(newAccessToken);
              setRefreshToken(newRefreshToken);
              axiosInstance.defaults.headers.Authorization = `Bearer ${newAccessToken}`;

              return newAccessToken;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        const newToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

