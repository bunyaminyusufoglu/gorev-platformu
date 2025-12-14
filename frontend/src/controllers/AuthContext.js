import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../models/authService';
import {
  setAuthToken,
  setRefreshToken,
  setUser,
  getUser,
  clearAuth
} from '../utils/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sayfa yüklendiğinde kullanıcı bilgilerini kontrol et
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = getUser();

      if (token && savedUser) {
        setUserState(savedUser);
        setAuthToken(token);
        // Token geçerli mi kontrol et
        try {
          const response = await authService.getMe();
          if (response.success) {
            setUserState(response.data.user);
            setUser(response.data.user);
          } else {
            clearAuth();
          }
        } catch (err) {
          clearAuth();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Kayıt ol
  const register = async (userData) => {
    try {
      setError(null);
      const response = await authService.register(userData);
      if (response.success) {
        const { user, token, refreshToken } = response.data;
        setAuthToken(token);
        setRefreshToken(refreshToken);
        setUser(user);
        setUserState(user);
        return { success: true, data: response.data };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Kayıt sırasında bir hata oluştu';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Giriş yap
  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authService.login(credentials);
      if (response.success) {
        const { user, token, refreshToken } = response.data;
        setAuthToken(token);
        setRefreshToken(refreshToken);
        setUser(user);
        setUserState(user);
        return { success: true, data: response.data };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Giriş sırasında bir hata oluştu';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Çıkış yap
  const logout = () => {
    clearAuth();
    setUserState(null);
    setError(null);
  };

  // Profil güncelle
  const updateProfile = async (name) => {
    try {
      setError(null);
      const response = await authService.updateProfile(name);
      if (response.success) {
        setUserState(response.data.user);
        setUser(response.data.user);
        return { success: true, data: response.data };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Profil güncellenirken bir hata oluştu';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

