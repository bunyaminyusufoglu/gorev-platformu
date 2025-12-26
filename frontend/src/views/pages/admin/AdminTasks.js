import React, { useState, useEffect, useCallback } from 'react';
import * as taskService from '../../../models/taskService';
import * as categoryService from '../../../models/categoryService';

const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Filtreleme ve arama
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    isActive: '',
    minReward: '',
    maxReward: '',
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
    totalTasks: 0,
    activeTasks: 0,
    totalRewards: 0,
    avgReward: 0
  });

  // Ekleme/Düzenleme modalı
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    reward: '',
    requirements: '',
    link: '',
    isActive: true,
    maxCompletions: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  // Silme onayı
  const [deletingTask, setDeletingTask] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await taskService.getAllTasks(filters);
      if (response.success) {
        setTasks(response.data || []);
        setPagination(response.pagination || { current: 1, pages: 1, total: 0 });
        setStats(response.stats || {});
      } else {
        setError(response.message || 'Görevler yüklenemedi');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryService.getAllCategories();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (err) {
      console.error('Kategoriler yüklenemedi:', err);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Filtre değiştiğinde sayfayı sıfırla
    }));
  };

  const handleNewTask = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      reward: '',
      requirements: '',
      link: '',
      isActive: true,
      maxCompletions: ''
    });
    setError(null);
    setSuccess(null);
    setShowModal(true);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      category: task.category?._id || task.category || '',
      reward: task.reward || '',
      requirements: task.requirements || '',
      link: task.link || '',
      isActive: task.isActive !== undefined ? task.isActive : true,
      maxCompletions: task.maxCompletions || ''
    });
    setError(null);
    setSuccess(null);
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        reward: parseFloat(formData.reward) || 0,
        requirements: formData.requirements.trim() || undefined,
        link: formData.link.trim() || undefined,
        isActive: formData.isActive,
        maxCompletions: formData.maxCompletions ? parseInt(formData.maxCompletions) : null
      };

      if (!payload.title || !payload.description || !payload.category) {
        setError('Başlık, açıklama ve kategori gereklidir');
        setFormLoading(false);
        return;
      }

      if (payload.reward < 0) {
        setError('Ödül negatif olamaz');
        setFormLoading(false);
        return;
      }

      let response;
      if (editingTask) {
        response = await taskService.updateTask(editingTask._id, payload);
      } else {
        response = await taskService.createTask(payload);
      }

      if (response.success) {
        setSuccess(editingTask ? 'Görev başarıyla güncellendi' : 'Görev başarıyla oluşturuldu');
        setShowModal(false);
        fetchTasks();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'İşlem başarısız');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'İşlem sırasında bir hata oluştu');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTask) return;

    setDeleteLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await taskService.deleteTask(deletingTask._id);
      if (response.success) {
        setSuccess('Görev başarıyla silindi');
        setDeletingTask(null);
        fetchTasks();
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

  const handleToggleActive = async (task) => {
    try {
      setError(null);
      const response = await taskService.updateTask(task._id, { isActive: !task.isActive });
      if (response.success) {
        setSuccess(`Görev ${!task.isActive ? 'aktif' : 'pasif'} edildi`);
        fetchTasks();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'Durum güncellenemedi');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Durum güncelleme sırasında bir hata oluştu');
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

  if (loading && tasks.length === 0) {
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
        <h2 className="mb-0">Görev Yönetimi</h2>
        <button className="btn btn-primary" onClick={handleNewTask}>
          <i className="bi bi-plus-circle me-2"></i>
          Yeni Görev
        </button>
      </div>

      {/* İstatistikler */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted small mb-1">Toplam Görev</div>
              <div className="h5 mb-0 fw-bold text-primary">{stats.totalTasks || 0}</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted small mb-1">Aktif Görev</div>
              <div className="h5 mb-0 fw-bold text-success">{stats.activeTasks || 0}</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted small mb-1">Toplam Ödül</div>
              <div className="h5 mb-0 fw-bold text-info">{formatCurrency(stats.totalRewards || 0)}</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted small mb-1">Ortalama Ödül</div>
              <div className="h5 mb-0 fw-bold text-warning">{formatCurrency(stats.avgReward || 0)}</div>
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
            <div className="col-12 col-md-3">
              <label className="form-label small">Ara (Başlık/Açıklama)</label>
              <input
                type="text"
                className="form-control"
                placeholder="Görev ara..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div className="col-12 col-md-2">
              <label className="form-label small">Kategori</label>
              <select
                className="form-select"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">Tümü</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-2">
              <label className="form-label small">Durum</label>
              <select
                className="form-select"
                value={filters.isActive}
                onChange={(e) => handleFilterChange('isActive', e.target.value)}
              >
                <option value="">Tümü</option>
                <option value="true">Aktif</option>
                <option value="false">Pasif</option>
              </select>
            </div>
            <div className="col-12 col-md-2">
              <label className="form-label small">Min Ödül</label>
              <input
                type="number"
                className="form-control"
                placeholder="Min"
                value={filters.minReward}
                onChange={(e) => handleFilterChange('minReward', e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
            <div className="col-12 col-md-2">
              <label className="form-label small">Max Ödül</label>
              <input
                type="number"
                className="form-control"
                placeholder="Max"
                value={filters.maxReward}
                onChange={(e) => handleFilterChange('maxReward', e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
            <div className="col-12 col-md-1">
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
                <option value="title-asc">Başlık (A-Z)</option>
                <option value="title-desc">Başlık (Z-A)</option>
                <option value="reward-desc">Ödül (Yüksek)</option>
                <option value="reward-asc">Ödül (Düşük)</option>
                <option value="currentCompletions-desc">Tamamlanma (Yüksek)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Görev Tablosu */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Başlık</th>
                  <th>Kategori</th>
                  <th>Ödül</th>
                  <th>Tamamlanma</th>
                  <th>Durum</th>
                  <th>Oluşturulma</th>
                  <th className="text-end">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      Görev bulunamadı
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task._id}>
                      <td>
                        <div className="fw-semibold">{task.title}</div>
                        <small className="text-muted d-block" style={{ fontSize: '0.85rem' }}>
                          {task.description?.substring(0, 60)}
                          {task.description?.length > 60 ? '...' : ''}
                        </small>
                      </td>
                      <td>
                        {task.category ? (
                          <span className="badge bg-secondary">
                            {task.category.icon && <span className="me-1">{task.category.icon}</span>}
                            {task.category.name}
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="fw-semibold text-success">{formatCurrency(task.reward)}</td>
                      <td>
                        <span className="badge bg-info">
                          {task.currentCompletions || 0}
                          {task.maxCompletions ? ` / ${task.maxCompletions}` : ' / ∞'}
                        </span>
                      </td>
                      <td>
                        {task.isActive ? (
                          <span className="badge bg-success">
                            <i className="bi bi-check-circle"></i> Aktif
                          </span>
                        ) : (
                          <span className="badge bg-secondary">
                            <i className="bi bi-x-circle"></i> Pasif
                          </span>
                        )}
                      </td>
                      <td>
                        <small className="text-muted">{formatDate(task.createdAt)}</small>
                      </td>
                      <td>
                        <div className="d-flex gap-2 justify-content-end">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(task)}
                            title="Düzenle"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className={`btn btn-sm ${task.isActive ? 'btn-outline-secondary' : 'btn-outline-success'}`}
                            onClick={() => handleToggleActive(task)}
                            title={task.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                          >
                            <i className={`bi ${task.isActive ? 'bi-pause' : 'bi-play'}`}></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setDeletingTask(task)}
                            title="Sil"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
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
            Toplam {pagination.total} görev, Sayfa {pagination.current} / {pagination.pages}
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

      {/* Ekleme/Düzenleme Modalı */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingTask ? 'Görev Düzenle' : 'Yeni Görev Ekle'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTask(null);
                    setError(null);
                    setSuccess(null);
                  }}
                ></button>
              </div>
              <form onSubmit={handleFormSubmit}>
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
                  <div className="row">
                    <div className="col-12 mb-3">
                      <label className="form-label">Başlık <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        value={formData.title}
                        onChange={handleFormChange}
                        required
                        placeholder="Görev başlığı"
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Açıklama <span className="text-danger">*</span></label>
                      <textarea
                        className="form-control"
                        name="description"
                        value={formData.description}
                        onChange={handleFormChange}
                        required
                        rows="4"
                        placeholder="Görev açıklaması"
                      />
                    </div>
                    <div className="col-12 col-md-6 mb-3">
                      <label className="form-label">Kategori <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        name="category"
                        value={formData.category}
                        onChange={handleFormChange}
                        required
                      >
                        <option value="">Kategori Seçin</option>
                        {categories.map(cat => (
                          <option key={cat._id} value={cat._id}>
                            {cat.icon && <span>{cat.icon} </span>}
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-6 mb-3">
                      <label className="form-label">Ödül (₺) <span className="text-danger">*</span></label>
                      <input
                        type="number"
                        className="form-control"
                        name="reward"
                        value={formData.reward}
                        onChange={handleFormChange}
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Gereksinimler</label>
                      <textarea
                        className="form-control"
                        name="requirements"
                        value={formData.requirements}
                        onChange={handleFormChange}
                        rows="3"
                        placeholder="Görev gereksinimleri (isteğe bağlı)"
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Link</label>
                      <input
                        type="url"
                        className="form-control"
                        name="link"
                        value={formData.link}
                        onChange={handleFormChange}
                        placeholder="https://example.com (isteğe bağlı)"
                      />
                    </div>
                    <div className="col-12 col-md-6 mb-3">
                      <label className="form-label">Maksimum Tamamlanma</label>
                      <input
                        type="number"
                        className="form-control"
                        name="maxCompletions"
                        value={formData.maxCompletions}
                        onChange={handleFormChange}
                        min="1"
                        placeholder="Boş bırakılırsa sınırsız"
                      />
                      <small className="text-muted">Boş bırakılırsa sınırsız tamamlanma</small>
                    </div>
                    <div className="col-12 col-md-6 mb-3">
                      <div className="form-check mt-4">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleFormChange}
                          id="isActive"
                        />
                        <label className="form-check-label" htmlFor="isActive">
                          Aktif Görev
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowModal(false);
                      setEditingTask(null);
                      setError(null);
                      setSuccess(null);
                    }}
                    disabled={formLoading}
                  >
                    İptal
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={formLoading}>
                    {formLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Kaydediliyor...
                      </>
                    ) : (
                      editingTask ? 'Güncelle' : 'Oluştur'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Silme Onay Modalı */}
      {deletingTask && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Görevi Sil</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDeletingTask(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>{deletingTask.title}</strong> görevini silmek istediğinize emin misiniz?
                </p>
                <p className="text-danger small mb-0">
                  <i className="bi bi-exclamation-triangle"></i> Bu işlem geri alınamaz. Görev ve ilgili veriler silinecektir.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDeletingTask(null)}
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

export default AdminTasks;

