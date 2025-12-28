import React, { useState, useEffect } from 'react';
import * as adminService from '../../../models/adminService';

const AdminWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [stats, setStats] = useState({});
  
  // Filtreleme
  const [statusFilter, setStatusFilter] = useState('pending');
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });
  
  // Detay modalı
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Onaylama/Reddetme modalı
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionData, setActionData] = useState({
    transactionId: null,
    action: 'approve', // 'approve' veya 'reject'
    reason: ''
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: pagination.current,
        limit: 20
      };
      if (statusFilter) {
        params.status = statusFilter;
      }
      const response = await adminService.getAllWithdrawalRequests(params);
      if (response.success) {
        setWithdrawals(response.data || []);
        setPagination({
          current: response.page || 1,
          pages: response.pages || 1,
          total: response.total || 0
        });
        // Stats'i formatla
        if (response.stats) {
          const formattedStats = {};
          response.stats.forEach(stat => {
            formattedStats[stat._id] = {
              total: stat.total,
              count: stat.count
            };
          });
          setStats(formattedStats);
        }
      } else {
        setError(response.message || 'Çekim talepleri yüklenemedi');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, pagination.current]);

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page }));
  };

  const handleViewDetails = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowDetailModal(true);
  };

  const handleActionClick = (withdrawal, action) => {
    setActionData({
      transactionId: withdrawal._id,
      action,
      reason: ''
    });
    setShowActionModal(true);
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!actionData.transactionId) return;

    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);

      let response;
      if (actionData.action === 'approve') {
        response = await adminService.approveWithdrawal(actionData.transactionId);
      } else {
        if (!actionData.reason.trim()) {
          setError('Red sebebi gereklidir');
          setActionLoading(false);
          return;
        }
        response = await adminService.rejectWithdrawal(actionData.transactionId, actionData.reason);
      }

      if (response.success) {
        setSuccess(response.message || 'İşlem başarılı');
        setShowActionModal(false);
        setActionData({ transactionId: null, action: 'approve', reason: '' });
        fetchWithdrawals(); // Listeyi yenile
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'İşlem başarısız');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Bir hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: <span className="badge bg-warning">Bekliyor</span>,
      completed: <span className="badge bg-success">Onaylandı</span>,
      cancelled: <span className="badge bg-danger">Reddedildi</span>,
      failed: <span className="badge bg-secondary">Başarısız</span>
    };
    return badges[status] || <span className="badge bg-secondary">{status}</span>;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatIBAN = (iban) => {
    if (!iban) return '-';
    // TRXX XXXX XXXX XXXX XXXX XXXX XX formatına çevir
    const cleaned = iban.replace(/\s/g, '');
    return cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
  };

  if (loading && withdrawals.length === 0) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Para Çekme Talepleri Yönetimi</h2>
      </div>

      {/* Mesajlar */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {success}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccess(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* İstatistikler */}
      {Object.keys(stats).length > 0 && (
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="text-muted small mb-1">Bekleyen</div>
                <div className="h5 mb-0 text-warning">
                  {stats.pending?.count || 0} talep
                </div>
                <div className="text-muted small">
                  {stats.pending?.total?.toLocaleString('tr-TR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }) || '0.00'} ₺
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="text-muted small mb-1">Onaylanan</div>
                <div className="h5 mb-0 text-success">
                  {stats.completed?.count || 0} talep
                </div>
                <div className="text-muted small">
                  {stats.completed?.total?.toLocaleString('tr-TR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }) || '0.00'} ₺
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="text-muted small mb-1">Reddedilen</div>
                <div className="h5 mb-0 text-danger">
                  {stats.cancelled?.count || 0} talep
                </div>
                <div className="text-muted small">
                  {stats.cancelled?.total?.toLocaleString('tr-TR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }) || '0.00'} ₺
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="text-muted small mb-1">Toplam</div>
                <div className="h5 mb-0">
                  {pagination.total} talep
                </div>
                <div className="text-muted small">
                  {(Object.values(stats).reduce((sum, stat) => sum + (stat.total || 0), 0)).toLocaleString('tr-TR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })} ₺
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtreler */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${statusFilter === 'pending' ? 'btn-warning' : 'btn-outline-warning'}`}
              onClick={() => handleStatusFilterChange('pending')}
            >
              Bekleyen
              {statusFilter === 'pending' && ` (${withdrawals.length})`}
            </button>
            <button
              type="button"
              className={`btn ${statusFilter === 'completed' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => handleStatusFilterChange('completed')}
            >
              Onaylanan
              {statusFilter === 'completed' && ` (${withdrawals.length})`}
            </button>
            <button
              type="button"
              className={`btn ${statusFilter === 'cancelled' ? 'btn-danger' : 'btn-outline-danger'}`}
              onClick={() => handleStatusFilterChange('cancelled')}
            >
              Reddedilen
              {statusFilter === 'cancelled' && ` (${withdrawals.length})`}
            </button>
            <button
              type="button"
              className={`btn ${!statusFilter ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleStatusFilterChange('')}
            >
              Tümü
              {!statusFilter && ` (${withdrawals.length})`}
            </button>
          </div>
        </div>
      </div>

      {/* Çekim Talepleri Listesi */}
      {withdrawals.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <p className="text-muted mb-0">
              {statusFilter ? `${statusFilter} durumunda çekim talebi bulunamadı` : 'Çekim talebi bulunamadı'}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="row g-3">
            {withdrawals.map((withdrawal) => (
              <div key={withdrawal._id} className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-md-6">
                        <div className="d-flex align-items-center mb-2">
                          <h5 className="mb-0 me-2">
                            {Math.abs(withdrawal.amount).toLocaleString('tr-TR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })} ₺
                          </h5>
                          {getStatusBadge(withdrawal.status)}
                        </div>
                        <div className="text-muted small">
                          <div><strong>Kullanıcı:</strong> {withdrawal.user?.name || 'Bilinmiyor'} ({withdrawal.user?.email || '-'})</div>
                          <div><strong>IBAN:</strong> {formatIBAN(withdrawal.withdrawalDetails?.iban)}</div>
                          <div><strong>Hesap Sahibi:</strong> {withdrawal.withdrawalDetails?.accountName || '-'}</div>
                          <div><strong>Tarih:</strong> {formatDate(withdrawal.createdAt)}</div>
                          {withdrawal.withdrawalDetails?.processedAt && (
                            <div><strong>İşlem Tarihi:</strong> {formatDate(withdrawal.withdrawalDetails.processedAt)}</div>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6 text-end">
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleViewDetails(withdrawal)}
                          >
                            Detaylar
                          </button>
                          {withdrawal.status === 'pending' && (
                            <>
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleActionClick(withdrawal, 'approve')}
                              >
                                Onayla
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleActionClick(withdrawal, 'reject')}
                              >
                                Reddet
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sayfalama */}
          {pagination.pages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <nav>
                <ul className="pagination">
                  <li className={`page-item ${pagination.current === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(pagination.current - 1)}
                      disabled={pagination.current === 1}
                    >
                      Önceki
                    </button>
                  </li>
                  {[...Array(pagination.pages)].map((_, index) => {
                    const page = index + 1;
                    if (
                      page === 1 ||
                      page === pagination.pages ||
                      (page >= pagination.current - 1 && page <= pagination.current + 1)
                    ) {
                      return (
                        <li key={page} className={`page-item ${pagination.current === page ? 'active' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        </li>
                      );
                    } else if (page === pagination.current - 2 || page === pagination.current + 2) {
                      return (
                        <li key={page} className="page-item disabled">
                          <span className="page-link">...</span>
                        </li>
                      );
                    }
                    return null;
                  })}
                  <li className={`page-item ${pagination.current === pagination.pages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(pagination.current + 1)}
                      disabled={pagination.current === pagination.pages}
                    >
                      Sonraki
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
      )}

      {/* Detay Modal */}
      {showDetailModal && selectedWithdrawal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Çekim Talebi Detayları</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedWithdrawal(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <h6>Kullanıcı Bilgileri</h6>
                    <p><strong>İsim:</strong> {selectedWithdrawal.user?.name || '-'}</p>
                    <p><strong>Email:</strong> {selectedWithdrawal.user?.email || '-'}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>İşlem Bilgileri</h6>
                    <p><strong>Tutar:</strong> {Math.abs(selectedWithdrawal.amount).toLocaleString('tr-TR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })} ₺</p>
                    <p><strong>Durum:</strong> {getStatusBadge(selectedWithdrawal.status)}</p>
                  </div>
                </div>
                <div className="mb-3">
                  <h6>Banka Bilgileri</h6>
                  <p><strong>IBAN:</strong> {formatIBAN(selectedWithdrawal.withdrawalDetails?.iban)}</p>
                  <p><strong>Hesap Sahibi:</strong> {selectedWithdrawal.withdrawalDetails?.accountName || '-'}</p>
                </div>
                <div className="mb-3">
                  <h6>Tarih Bilgileri</h6>
                  <p><strong>Talep Tarihi:</strong> {formatDate(selectedWithdrawal.createdAt)}</p>
                  {selectedWithdrawal.withdrawalDetails?.processedAt && (
                    <p><strong>İşlem Tarihi:</strong> {formatDate(selectedWithdrawal.withdrawalDetails.processedAt)}</p>
                  )}
                </div>
                {selectedWithdrawal.withdrawalDetails?.rejectionReason && (
                  <div className="mb-3">
                    <h6>Red Sebebi</h6>
                    <p className="border p-3 rounded bg-light">{selectedWithdrawal.withdrawalDetails.rejectionReason}</p>
                  </div>
                )}
                {selectedWithdrawal.description && (
                  <div className="mb-3">
                    <h6>Açıklama</h6>
                    <p className="border p-3 rounded bg-light">{selectedWithdrawal.description}</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                {selectedWithdrawal.status === 'pending' && (
                  <>
                    <button
                      className="btn btn-success"
                      onClick={() => {
                        setShowDetailModal(false);
                        handleActionClick(selectedWithdrawal, 'approve');
                      }}
                    >
                      Onayla
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        setShowDetailModal(false);
                        handleActionClick(selectedWithdrawal, 'reject');
                      }}
                    >
                      Reddet
                    </button>
                  </>
                )}
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedWithdrawal(null);
                  }}
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Onaylama/Reddetme Modal */}
      {showActionModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {actionData.action === 'approve' ? 'Çekim Talebini Onayla' : 'Çekim Talebini Reddet'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowActionModal(false);
                    setActionData({ transactionId: null, action: 'approve', reason: '' });
                  }}
                ></button>
              </div>
              <form onSubmit={handleActionSubmit}>
                <div className="modal-body">
                  {actionData.action === 'reject' && (
                    <div className="mb-3">
                      <label htmlFor="reason" className="form-label">
                        Red Sebebi <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        id="reason"
                        rows="3"
                        value={actionData.reason}
                        onChange={(e) =>
                          setActionData({ ...actionData, reason: e.target.value })
                        }
                        required
                        placeholder="Kullanıcıya gösterilecek red sebebini yazın..."
                      />
                    </div>
                  )}
                  <div className="alert alert-info mb-0">
                    {actionData.action === 'approve' ? (
                      <>Çekim talebi onaylandığında işlem tamamlanmış olacak ve kullanıcıya bildirim gönderilecek.</>
                    ) : (
                      <>Çekim talebi reddedildiğinde kullanıcının bakiyesi geri yüklenecek ve kullanıcıya bildirim gönderilecek.</>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowActionModal(false);
                      setActionData({ transactionId: null, action: 'approve', reason: '' });
                    }}
                    disabled={actionLoading}
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className={`btn ${actionData.action === 'approve' ? 'btn-success' : 'btn-danger'}`}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        İşleniyor...
                      </>
                    ) : (
                      actionData.action === 'approve' ? 'Onayla' : 'Reddet'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWithdrawals;

