import React, { useState, useEffect, useCallback } from 'react';
import * as adminService from '../../../models/adminService';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Filtreleme ve arama
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    isBanned: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 20
  });
  
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    bannedUsers: 0,
    activeUsers: 0
  });

  // Düzenleme modalı
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    balance: '',
    totalEarned: ''
  });
  const [editLoading, setEditLoading] = useState(false);

  // Silme onayı
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getAllUsers(filters);
      if (response.success) {
        setUsers(response.data || []);
        setPagination(response.pagination || { current: 1, pages: 1, total: 0 });
        setStats(response.stats || {});
      } else {
        setError(response.message || 'Kullanıcılar yüklenemedi');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Filtre değiştiğinde sayfayı sıfırla
    }));
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      balance: user.balance || 0,
      totalEarned: user.totalEarned || 0
    });
    setError(null);
    setSuccess(null);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setEditLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData = {};
      if (editForm.name !== editingUser.name) updateData.name = editForm.name;
      if (editForm.email !== editingUser.email) updateData.email = editForm.email;
      if (parseFloat(editForm.balance) !== editingUser.balance) {
        updateData.balance = parseFloat(editForm.balance);
      }
      if (parseFloat(editForm.totalEarned) !== editingUser.totalEarned) {
        updateData.totalEarned = parseFloat(editForm.totalEarned);
      }

      if (Object.keys(updateData).length === 0) {
        setError('Herhangi bir değişiklik yapılmadı');
        setEditLoading(false);
        return;
      }

      const response = await adminService.updateUser(editingUser._id, updateData);
      if (response.success) {
        setSuccess('Kullanıcı başarıyla güncellendi');
        setEditingUser(null);
        fetchUsers();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'Güncelleme başarısız');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Güncelleme sırasında bir hata oluştu');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;

    setDeleteLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await adminService.deleteUser(deletingUser._id);
      if (response.success) {
        setSuccess('Kullanıcı başarıyla silindi');
        setDeletingUser(null);
        fetchUsers();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'Silme başarısız');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Silme sırasında bir hata oluştu');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBan = async (user) => {
    if (!window.confirm(`${user.name} kullanıcısını yasaklamak istediğinize emin misiniz?`)) {
      return;
    }

    const reason = window.prompt('Yasaklama sebebi (isteğe bağlı):') || 'Belirtilmedi';

    try {
      setError(null);
      const response = await adminService.banUser(user._id, reason);
      if (response.success) {
        setSuccess('Kullanıcı başarıyla yasaklandı');
        fetchUsers();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'Yasaklama başarısız');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Yasaklama sırasında bir hata oluştu');
    }
  };

  const handleUnban = async (user) => {
    if (!window.confirm(`${user.name} kullanıcısının yasağını kaldırmak istediğinize emin misiniz?`)) {
      return;
    }

    try {
      setError(null);
      const response = await adminService.unbanUser(user._id);
      if (response.success) {
        setSuccess('Kullanıcı yasağı başarıyla kaldırıldı');
        fetchUsers();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'Yasak kaldırma başarısız');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Yasak kaldırma sırasında bir hata oluştu');
    }
  };

  const handleRoleChange = async (user, newRole) => {
    if (!window.confirm(`${user.name} kullanıcısının rolünü ${newRole === 'admin' ? 'Admin' : 'Kullanıcı'} olarak değiştirmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      setError(null);
      const response = await adminService.changeUserRole(user._id, newRole);
      if (response.success) {
        setSuccess('Kullanıcı rolü başarıyla değiştirildi');
        fetchUsers();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'Rol değiştirme başarısız');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Rol değiştirme sırasında bir hata oluştu');
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return parseFloat(amount || 0).toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' ₺';
  };

  if (loading && users.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Kullanıcı Yönetimi</h2>
      </div>

      {/* İstatistikler */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted small mb-1">Toplam Kullanıcı</div>
              <div className="h5 mb-0 fw-bold text-primary">{stats.totalUsers || 0}</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted small mb-1">Admin Sayısı</div>
              <div className="h5 mb-0 fw-bold text-danger">{stats.totalAdmins || 0}</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted small mb-1">Yasaklı Kullanıcı</div>
              <div className="h5 mb-0 fw-bold text-warning">{stats.bannedUsers || 0}</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted small mb-1">Aktif Kullanıcı</div>
              <div className="h5 mb-0 fw-bold text-success">{stats.activeUsers || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mesajlar */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}
      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess(null)}></button>
        </div>
      )}

      {/* Filtreler */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label className="form-label small">Ara (İsim/Email)</label>
              <input
                type="text"
                className="form-control"
                placeholder="Kullanıcı ara..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div className="col-12 col-md-2">
              <label className="form-label small">Rol</label>
              <select
                className="form-select"
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
              >
                <option value="">Tümü</option>
                <option value="user">Kullanıcı</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="col-12 col-md-2">
              <label className="form-label small">Yasak Durumu</label>
              <select
                className="form-select"
                value={filters.isBanned}
                onChange={(e) => handleFilterChange('isBanned', e.target.value)}
              >
                <option value="">Tümü</option>
                <option value="false">Aktif</option>
                <option value="true">Yasaklı</option>
              </select>
            </div>
            <div className="col-12 col-md-2">
              <label className="form-label small">Sıralama</label>
              <select
                className="form-select"
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  handleFilterChange('sortBy', sortBy);
                  handleFilterChange('sortOrder', sortOrder);
                }}
              >
                <option value="createdAt-desc">Yeni → Eski</option>
                <option value="createdAt-asc">Eski → Yeni</option>
                <option value="name-asc">İsim (A-Z)</option>
                <option value="name-desc">İsim (Z-A)</option>
                <option value="balance-desc">Bakiye (Yüksek)</option>
                <option value="balance-asc">Bakiye (Düşük)</option>
              </select>
            </div>
            <div className="col-12 col-md-2">
              <label className="form-label small">Sayfa Başına</label>
              <select
                className="form-select"
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Kullanıcı Tablosu */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>İsim</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Bakiye</th>
                  <th>Toplam Kazanç</th>
                  <th>Durum</th>
                  <th>Kayıt Tarihi</th>
                  <th className="text-end">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      Kullanıcı bulunamadı
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="fw-semibold">{user.name}</div>
                        {user.isBanned && (
                          <small className="text-danger">
                            <i className="bi bi-ban"></i> Yasaklı
                          </small>
                        )}
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                          {user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                        </span>
                      </td>
                      <td className="fw-semibold text-success">{formatCurrency(user.balance)}</td>
                      <td>{formatCurrency(user.totalEarned)}</td>
                      <td>
                        {user.isBanned ? (
                          <span className="badge bg-warning text-dark">
                            <i className="bi bi-ban"></i> Yasaklı
                          </span>
                        ) : (
                          <span className="badge bg-success">
                            <i className="bi bi-check-circle"></i> Aktif
                          </span>
                        )}
                      </td>
                      <td>
                        <small className="text-muted">{formatDate(user.createdAt)}</small>
                      </td>
                      <td>
                        <div className="d-flex gap-2 justify-content-end">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(user)}
                            title="Düzenle"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          {user.isBanned ? (
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => handleUnban(user)}
                              title="Yasağı Kaldır"
                            >
                              <i className="bi bi-check-circle"></i>
                            </button>
                          ) : (
                            <button
                              className="btn btn-sm btn-outline-warning"
                              onClick={() => handleBan(user)}
                              title="Yasakla"
                            >
                              <i className="bi bi-ban"></i>
                            </button>
                          )}
                          {user.role === 'user' ? (
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => handleRoleChange(user, 'admin')}
                              title="Admin Yap"
                            >
                              <i className="bi bi-shield-check"></i>
                            </button>
                          ) : (
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleRoleChange(user, 'user')}
                              title="Kullanıcı Yap"
                            >
                              <i className="bi bi-person"></i>
                            </button>
                          )}
                          {user.role !== 'admin' && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => setDeletingUser(user)}
                              title="Sil"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sayfalama */}
      {pagination.pages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="text-muted small">
            Toplam {pagination.total} kullanıcı, Sayfa {pagination.current} / {pagination.pages}
          </div>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${pagination.current === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handleFilterChange('page', pagination.current - 1)}
                  disabled={pagination.current === 1}
                >
                  Önceki
                </button>
              </li>
              {[...Array(pagination.pages)].map((_, i) => {
                const page = i + 1;
                if (
                  page === 1 ||
                  page === pagination.pages ||
                  (page >= pagination.current - 1 && page <= pagination.current + 1)
                ) {
                  return (
                    <li key={page} className={`page-item ${pagination.current === page ? 'active' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handleFilterChange('page', page)}
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
                  onClick={() => handleFilterChange('page', pagination.current + 1)}
                  disabled={pagination.current === pagination.pages}
                >
                  Sonraki
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Düzenleme Modalı */}
      {editingUser && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Kullanıcı Düzenle</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setEditingUser(null);
                    setError(null);
                    setSuccess(null);
                  }}
                ></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="alert alert-success" role="alert">
                      {success}
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label">İsim</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={editForm.name}
                      onChange={handleEditFormChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={editForm.email}
                      onChange={handleEditFormChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Bakiye (₺)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="balance"
                      value={editForm.balance}
                      onChange={handleEditFormChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Toplam Kazanç (₺)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="totalEarned"
                      value={editForm.totalEarned}
                      onChange={handleEditFormChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditingUser(null);
                      setError(null);
                      setSuccess(null);
                    }}
                    disabled={editLoading}
                  >
                    İptal
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={editLoading}>
                    {editLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Kaydediliyor...
                      </>
                    ) : (
                      'Kaydet'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Silme Onay Modalı */}
      {deletingUser && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Kullanıcıyı Sil</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDeletingUser(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>{deletingUser.name}</strong> kullanıcısını silmek istediğinize emin misiniz?
                </p>
                <p className="text-danger small mb-0">
                  <i className="bi bi-exclamation-triangle"></i> Bu işlem geri alınamaz. Kullanıcının tüm verileri silinecektir.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDeletingUser(null)}
                  disabled={deleteLoading}
                >
                  İptal
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Siliniyor...
                    </>
                  ) : (
                    'Sil'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

