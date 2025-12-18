import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../config/axios';

const UserDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    balance: 0,
    totalEarned: 0,
    last30Days: {
      earnings: 0,
      completedTasks: 0
    },
    pendingTasks: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/wallet/summary');
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        setError(response.data.message || 'Veriler yüklenirken bir hata oluştu');
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Veriler yüklenirken bir hata oluştu';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="row">
        <div className="col-12">
          <h1 className="h4 mb-4">Dashboard</h1>
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Yükleniyor...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="row">
        <div className="col-12">
          <h1 className="h4 mb-4">Dashboard</h1>
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      <div className="col-12">
        <h1 className="h4 mb-4">Dashboard</h1>

        {/* İstatistik Kartları */}
        <div className="row g-3 mb-4">
          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="text-muted small">Mevcut Bakiye</div>
                  <div className="badge bg-primary-subtle text-primary">₺</div>
                </div>
                <h3 className="mb-0 fw-bold">{stats.balance.toFixed(2)}₺</h3>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="text-muted small">Toplam Kazanç</div>
                  <div className="badge bg-success-subtle text-success">₺</div>
                </div>
                <h3 className="mb-0 fw-bold">{stats.totalEarned.toFixed(2)}₺</h3>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="text-muted small">Son 30 Gün</div>
                  <div className="badge bg-info-subtle text-info">30d</div>
                </div>
                <h3 className="mb-0 fw-bold">{stats.last30Days.earnings.toFixed(2)}₺</h3>
                <small className="text-muted">{stats.last30Days.completedTasks} görev tamamlandı</small>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="text-muted small">Bekleyen Görevler</div>
                  <div className="badge bg-warning-subtle text-warning">⏳</div>
                </div>
                <h3 className="mb-0 fw-bold">{stats.pendingTasks}</h3>
                <small className="text-muted">Onay bekliyor</small>
              </div>
            </div>
          </div>
        </div>

        {/* Hızlı İşlemler */}
        <div className="row g-3">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-3">Hızlı İşlemler</h5>
                <div className="d-grid gap-2">
                  <button className="btn btn-primary" type="button">
                    Görevlere Git
                  </button>
                  <button className="btn btn-outline-primary" type="button">
                    Cüzdanı Görüntüle
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-3">Özet</h5>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <small className="text-muted">Toplam tamamlanan görev:</small>
                    <div className="fw-semibold">{stats.last30Days.completedTasks}</div>
                  </li>
                  <li className="mb-2">
                    <small className="text-muted">Bekleyen onay:</small>
                    <div className="fw-semibold">{stats.pendingTasks} görev</div>
                  </li>
                  <li>
                    <small className="text-muted">Son 30 günde kazanç:</small>
                    <div className="fw-semibold">{stats.last30Days.earnings.toFixed(2)}₺</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;


