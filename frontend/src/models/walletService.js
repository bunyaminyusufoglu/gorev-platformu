import axiosInstance from '../config/axios';

// Bakiye bilgisi getir
export const getBalance = async () => {
  const response = await axiosInstance.get('/wallet/balance');
  return response.data;
};

// İşlem geçmişini getir
export const getTransactions = async (params = {}) => {
  const response = await axiosInstance.get('/wallet/transactions', { params });
  return response.data;
};

// Cüzdan özeti getir
export const getWalletSummary = async () => {
  const response = await axiosInstance.get('/wallet/summary');
  return response.data;
};

// Para çekme talebi oluştur
export const requestWithdrawal = async (amount, iban, accountName) => {
  const response = await axiosInstance.post('/wallet/withdraw', {
    amount,
    iban,
    accountName
  });
  return response.data;
};

// Para çekme taleplerini getir
export const getWithdrawalRequests = async (params = {}) => {
  const response = await axiosInstance.get('/wallet/withdrawals', { params });
  return response.data;
};
