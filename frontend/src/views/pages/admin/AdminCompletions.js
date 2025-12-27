import React, { useState, useEffect, useCallback } from 'react';
import * as adminService from '../../../models/adminService';
import API_BASE_URL from '../../../config/api';

const AdminCompletions = () => {
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Filtreleme
  const [statusFilter, setStatusFilter] = useState('pending');
  
  // Detay modalı
  const [selectedCompletion, setSelectedCompletion] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Onaylama/Reddetme modalı
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    completionId: null,
    action: 'approved', // 'approved' veya 'rejected'
    adminNote: ''
  });
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchCompletions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (statusFilter) {
        params.status = statusFilter;
      }
      const response = await adminService.getAllCompletions(params);
      if (response.success) {
        setCompletions(response.data || []);
      } else {
        setError(response.message || 'Tamamlamalar yüklenemedi');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchCompletions();
  }, [fetchCompletions]);

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
  };

  const handleViewDetails = (completion) => {
    setSelectedCompletion(completion);
    setShowDetailModal(true);
  };

  const handleReviewClick = (completion, action) => {
    setReviewData({
      completionId: completion._id,
      action,
      adminNote: ''
    });
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewData.completionId) return;

    try {
      setReviewLoading(true);
      setError(null);
      setSuccess(null);

      const response = await adminService.reviewCompletion(
        reviewData.completionId,
        reviewData.action,
        reviewData.adminNote
      );

      if (response.success) {
        setSuccess(response.message || 'İşlem başarılı');
        setShowReviewModal(false);
        setReviewData({ completionId: null, action: 'approved', adminNote: '' });
        fetchCompletions(); // Listeyi yenile
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'İşlem başarısız');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Bir hata oluştu');
    } finally {
      setReviewLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: <span className="badge bg-warning">Bekliyor</span>,
      approved: <span className="badge bg-success">Onaylandı</span>,
      rejected: <span className="badge bg-danger">Reddedildi</span>
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

  if (loading) {
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
        <h2 className="mb-0">Görev Tamamlama Yönetimi</h2>
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
              {statusFilter === 'pending' && ` (${completions.length})`}
            </button>
            <button
              type="button"
              className={`btn ${statusFilter === 'approved' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => handleStatusFilterChange('approved')}
            >
              Onaylanan
              {statusFilter === 'approved' && ` (${completions.length})`}
            </button>
            <button
              type="button"
              className={`btn ${statusFilter === 'rejected' ? 'btn-danger' : 'btn-outline-danger'}`}
              onClick={() => handleStatusFilterChange('rejected')}
            >
              Reddedilen
              {statusFilter === 'rejected' && ` (${completions.length})`}
            </button>
            <button
              type="button"
              className={`btn ${!statusFilter ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleStatusFilterChange('')}
            >
              Tümü
              {!statusFilter && ` (${completions.length})`}
            </button>
          </div>
        </div>
      </div>

      {/* Tamamlamalar Listesi */}
      {completions.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <p className="text-muted mb-0">
              {statusFilter ? `${statusFilter} durumunda tamamlama bulunamadı` : 'Tamamlama bulunamadı'}
            </p>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {completions.map((completion) => (
            <div key={completion._id} className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center mb-2">
                        <h5 className="mb-0 me-2">{completion.task?.title || 'Görev bilgisi yok'}</h5>
                        {getStatusBadge(completion.status)}
                      </div>
                      <div className="text-muted small">
                        <div><strong>Kullanıcı:</strong> {completion.user?.name || 'Bilinmiyor'} ({completion.user?.email || '-'})</div>
                        <div><strong>Ödül:</strong> {completion.task?.reward || 0} ₺</div>
                        <div><strong>Tarih:</strong> {formatDate(completion.createdAt)}</div>
                        {completion.reviewedAt && (
                          <div><strong>İnceleme Tarihi:</strong> {formatDate(completion.reviewedAt)}</div>
                        )}
                        {completion.reviewedBy && (
                          <div><strong>İnceleyen:</strong> {completion.reviewedBy?.name || '-'}</div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6 text-end">
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleViewDetails(completion)}
                        >
                          Detaylar
                        </button>
                        {completion.status === 'pending' && (
                          <>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleReviewClick(completion, 'approved')}
                            >
                              Onayla
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleReviewClick(completion, 'rejected')}
                            >
                              Reddet
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {completion.proof && (
                    <div className="mt-2">
                      <small className="text-muted"><strong>Kanıt:</strong> {completion.proof.substring(0, 100)}{completion.proof.length > 100 ? '...' : ''}</small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detay Modal */}
      {showDetailModal && selectedCompletion && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Tamamlama Detayları</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedCompletion(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <h6>Görev Bilgileri</h6>
                    <p><strong>Başlık:</strong> {selectedCompletion.task?.title || '-'}</p>
                    <p><strong>Ödül:</strong> {selectedCompletion.task?.reward || 0} ₺</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Kullanıcı Bilgileri</h6>
                    <p><strong>İsim:</strong> {selectedCompletion.user?.name || '-'}</p>
                    <p><strong>Email:</strong> {selectedCompletion.user?.email || '-'}</p>
                  </div>
                </div>
                <div className="mb-3">
                  <h6>Durum</h6>
                  {getStatusBadge(selectedCompletion.status)}
                </div>
                {selectedCompletion.proof && (
                  <div className="mb-3">
                    <h6>Kanıt Açıklaması</h6>
                    <p className="border p-3 rounded bg-light">{selectedCompletion.proof}</p>
                  </div>
                )}
                {selectedCompletion.proofImages && selectedCompletion.proofImages.length > 0 && (
                  <div className="mb-3">
                    <h6>Kanıt Resimleri</h6>
                    <div className="row g-2">
                      {selectedCompletion.proofImages.map((image, index) => (
                        <div key={index} className="col-md-4">
                          <img
                            src={`${API_BASE_URL.replace('/api', '')}${image}`}
                            alt={`Kanıt ${index + 1}`}
                            className="img-fluid rounded border"
                            style={{ maxHeight: '200px', objectFit: 'cover', width: '100%' }}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x200?text=Resim+Yüklenemedi';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mb-3">
                  <h6>Tarih Bilgileri</h6>
                  <p><strong>Tamamlanma Tarihi:</strong> {formatDate(selectedCompletion.completedAt || selectedCompletion.createdAt)}</p>
                  {selectedCompletion.reviewedAt && (
                    <p><strong>İnceleme Tarihi:</strong> {formatDate(selectedCompletion.reviewedAt)}</p>
                  )}
                  {selectedCompletion.reviewedBy && (
                    <p><strong>İnceleyen:</strong> {selectedCompletion.reviewedBy?.name || '-'}</p>
                  )}
                </div>
                {selectedCompletion.adminNote && (
                  <div className="mb-3">
                    <h6>Admin Notu</h6>
                    <p className="border p-3 rounded bg-light">{selectedCompletion.adminNote}</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                {selectedCompletion.status === 'pending' && (
                  <>
                    <button
                      className="btn btn-success"
                      onClick={() => {
                        setShowDetailModal(false);
                        handleReviewClick(selectedCompletion, 'approved');
                      }}
                    >
                      Onayla
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        setShowDetailModal(false);
                        handleReviewClick(selectedCompletion, 'rejected');
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
                    setSelectedCompletion(null);
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
      {showReviewModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {reviewData.action === 'approved' ? 'Görevi Onayla' : 'Görevi Reddet'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowReviewModal(false);
                    setReviewData({ completionId: null, action: 'approved', adminNote: '' });
                  }}
                ></button>
              </div>
              <form onSubmit={handleReviewSubmit}>
                <div className="modal-body">
                  {reviewData.action === 'rejected' && (
                    <div className="mb-3">
                      <label htmlFor="adminNote" className="form-label">
                        Red Sebebi <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        id="adminNote"
                        rows="3"
                        value={reviewData.adminNote}
                        onChange={(e) =>
                          setReviewData({ ...reviewData, adminNote: e.target.value })
                        }
                        required
                        placeholder="Kullanıcıya gösterilecek red sebebini yazın..."
                      />
                    </div>
                  )}
                  {reviewData.action === 'approved' && (
                    <div className="mb-3">
                      <label htmlFor="adminNote" className="form-label">Not (Opsiyonel)</label>
                      <textarea
                        className="form-control"
                        id="adminNote"
                        rows="3"
                        value={reviewData.adminNote}
                        onChange={(e) =>
                          setReviewData({ ...reviewData, adminNote: e.target.value })
                        }
                        placeholder="Opsiyonel not ekleyebilirsiniz..."
                      />
                    </div>
                  )}
                  <div className="alert alert-info mb-0">
                    {reviewData.action === 'approved' ? (
                      <>Görev onaylandığında kullanıcıya ödül eklenecek ve görev tamamlanma sayısı artacak.</>
                    ) : (
                      <>Görev reddedildiğinde kullanıcıya bildirim gönderilecek ve ödül verilmeyecek.</>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowReviewModal(false);
                      setReviewData({ completionId: null, action: 'approved', adminNote: '' });
                    }}
                    disabled={reviewLoading}
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className={`btn ${reviewData.action === 'approved' ? 'btn-success' : 'btn-danger'}`}
                    disabled={reviewLoading}
                  >
                    {reviewLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        İşleniyor...
                      </>
                    ) : (
                      reviewData.action === 'approved' ? 'Onayla' : 'Reddet'
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

export default AdminCompletions;

