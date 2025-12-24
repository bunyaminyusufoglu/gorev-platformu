import React, { useState, useEffect } from 'react';
import * as adminService from '../../../models/adminService';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getDashboardStats();
      if (response.success) {
        setStats(response.data);
      } else {
        setError(response.message || 'İstatistikler yüklenemedi');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-4">Admin Dashboard</h2>

      {/* Kullanıcı İstatistikleri */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <div className="text-muted small mb-1">Toplam Kullanıcı</div>
                  <div className="h4 mb-0 fw-bold text-primary">{stats.users?.total || 0}</div>
                </div>
                <div className="text-primary fs-1 opacity-25">
                  <i className="bi bi-people"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <div className="text-muted small mb-1">Admin Sayısı</div>
                  <div className="h4 mb-0 fw-bold text-danger">{stats.users?.admins || 0}</div>
                </div>
                <div className="text-danger fs-1 opacity-25">
                  <i className="bi bi-shield-check"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <div className="text-muted small mb-1">Yasaklı Kullanıcı</div>
                  <div className="h4 mb-0 fw-bold text-warning">{stats.users?.banned || 0}</div>
                </div>
                <div className="text-warning fs-1 opacity-25">
                  <i className="bi bi-ban"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <div className="text-muted small mb-1">Bu Hafta Yeni</div>
                  <div className="h4 mb-0 fw-bold text-success">{stats.users?.newThisWeek || 0}</div>
                </div>
                <div className="text-success fs-1 opacity-25">
                  <i className="bi bi-person-plus"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Görev İstatistikleri */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <div className="text-muted small mb-1">Toplam Görev</div>
                  <div className="h4 mb-0 fw-bold">{stats.tasks?.total || 0}</div>
                </div>
                <div className="text-primary fs-1 opacity-25">
                  <i className="bi bi-list-task"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <div className="text-muted small mb-1">Aktif Görev</div>
                  <div className="h4 mb-0 fw-bold text-success">{stats.tasks?.active || 0}</div>
                </div>
                <div className="text-success fs-1 opacity-25">
                  <i className="bi bi-check-circle"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <div className="text-muted small mb-1">Pasif Görev</div>
                  <div className="h4 mb-0 fw-bold text-secondary">{stats.tasks?.inactive || 0}</div>
                </div>
                <div className="text-secondary fs-1 opacity-25">
                  <i className="bi bi-x-circle"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Görev Tamamlama İstatistikleri */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <div className="text-muted small mb-1">Bekleyen</div>
                  <div className="h4 mb-0 fw-bold text-warning">{stats.completions?.pending || 0}</div>
                </div>
                <div className="text-warning fs-1 opacity-25">
                  <i className="bi bi-clock"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <div className="text-muted small mb-1">Onaylanan</div>
                  <div className="h4 mb-0 fw-bold text-success">{stats.completions?.approved || 0}</div>
                </div>
                <div className="text-success fs-1 opacity-25">
                  <i className="bi bi-check2-circle"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <div className="text-muted small mb-1">Reddedilen</div>
                  <div className="h4 mb-0 fw-bold text-danger">{stats.completions?.rejected || 0}</div>
                </div>
                <div className="text-danger fs-1 opacity-25">
                  <i className="bi bi-x-octagon"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Finansal İstatistikler */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <div className="text-muted small mb-1">Dağıtılan Ödül</div>
                  <div className="h4 mb-0 fw-bold text-success">
                    {stats.financial?.totalRewardsDistributed?.toLocaleString('tr-TR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }) || '0.00'} ₺
                  </div>
                </div>
                <div className="text-success fs-1 opacity-25">
                  <i className="bi bi-cash-coin"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <div className="text-muted small mb-1">Toplam Çekim</div>
                  <div className="h4 mb-0 fw-bold text-info">
                    {stats.financial?.totalWithdrawals?.toLocaleString('tr-TR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }) || '0.00'} ₺
                  </div>
                </div>
                <div className="text-info fs-1 opacity-25">
                  <i className="bi bi-bank"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <div className="text-muted small mb-1">Bekleyen Çekim</div>
                  <div className="h4 mb-0 fw-bold text-warning">{stats.financial?.pendingWithdrawals || 0}</div>
                </div>
                <div className="text-warning fs-1 opacity-25">
                  <i className="bi bi-hourglass-split"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Aylık İstatistikler */}
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <div className="text-muted small mb-1">Son 30 Gün Kazanç</div>
                  <div className="h4 mb-0 fw-bold text-success">
                    {stats.monthly?.earnings?.toLocaleString('tr-TR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }) || '0.00'} ₺
                  </div>
                </div>
                <div className="text-success fs-1 opacity-25">
                  <i className="bi bi-calendar-month"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <div className="text-muted small mb-1">Son 30 Gün Tamamlanan</div>
                  <div className="h4 mb-0 fw-bold text-primary">{stats.monthly?.completedTasks || 0}</div>
                </div>
                <div className="text-primary fs-1 opacity-25">
                  <i className="bi bi-check-all"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

