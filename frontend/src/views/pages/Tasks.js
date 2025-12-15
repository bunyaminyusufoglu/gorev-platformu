import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../controllers/AuthContext';
import * as taskService from '../../models/taskService';
import * as categoryService from '../../models/categoryService';

const initialFilters = {
  search: '',
  category: '',
  minReward: '',
  maxReward: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  featuredOnly: false,
};

const emptyForm = {
  title: '',
  description: '',
  category: '',
  reward: '',
  requirements: '',
  link: '',
  isActive: true,
  maxCompletions: '',
};

const Tasks = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [filters, setFilters] = useState(initialFilters);
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingTask, setEditingTask] = useState(null);
  const [paginationInfo, setPaginationInfo] = useState(null);
  const [stats, setStats] = useState({ total: 0, featuredCount: 0 });

  const sortOptions = useMemo(
    () => [
      { value: 'createdAt', label: 'Oluşturma' },
      { value: 'reward', label: 'Ödül' },
      { value: 'title', label: 'Başlık' },
      { value: 'currentCompletions', label: 'Tamamlanma' },
    ],
    []
  );

  useEffect(() => {
    loadCategories();
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCategories = async () => {
    try {
      const res = await categoryService.getCategories();
      if (res.success) {
        setCategories(res.data || []);
      }
    } catch (err) {
      console.error('Kategori alınamadı', err);
    }
  };

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await taskService.getTasks({
        ...filters,
        featuredOnly: filters.featuredOnly ? 'true' : undefined,
      });
      setTasks(res.data || []);
      setPaginationInfo(res.pagination || null);
      setStats({
        total: res.total || 0,
        featuredCount: res.featuredCount || 0,
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Görevler yüklenemedi';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    loadTasks();
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setTimeout(loadTasks, 0);
  };

  const openCreate = () => {
    setEditingTask(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      category: task.category?._id || '',
      reward: task.reward ?? '',
      requirements: task.requirements || '',
      link: task.link || '',
      isActive: task.isActive,
      maxCompletions: task.maxCompletions ?? '',
    });
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const saveTask = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    setSaving(true);
    setError(null);

    const payload = {
      title: formData.title?.trim(),
      description: formData.description?.trim(),
      category: formData.category,
      reward: formData.reward ? Number(formData.reward) : 0,
      requirements: formData.requirements?.trim(),
      link: formData.link?.trim(),
      isActive: !!formData.isActive,
      maxCompletions:
        formData.maxCompletions === '' ? null : Number(formData.maxCompletions),
    };

    try {
      if (editingTask?._id) {
        await taskService.updateTask(editingTask._id, payload);
      } else {
        await taskService.createTask(payload);
      }
      setShowForm(false);
      setFormData(emptyForm);
      setEditingTask(null);
      loadTasks();
    } catch (err) {
      const msg = err.response?.data?.message || 'Görev kaydedilemedi';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (task) => {
    if (!isAdmin) return;
    try {
      await taskService.updateTask(task._id, { isActive: !task.isActive });
      loadTasks();
    } catch (err) {
      const msg = err.response?.data?.message || 'Durum güncellenemedi';
      setError(msg);
    }
  };

  const renderStatusBadge = (task) => {
    if (task.isActive) {
      return <span className="badge bg-success">Aktif</span>;
    }
    return <span className="badge bg-secondary">Pasif</span>;
  };

  const renderFeaturedBadge = (task) => {
    if (!task.isCurrentlyFeatured && !task.isFeatured) return null;
    return (
      <span className="badge bg-warning text-dark ms-2">
        {task.featuredNote || 'Öne Çıkan'}
      </span>
    );
  };

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h2 className="mb-1">Görevler</h2>
          <div className="text-muted">
            Toplam: {stats.total} • Öne çıkan: {stats.featuredCount}
          </div>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openCreate}>
            + Yeni Görev
          </button>
        )}
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleFilterSubmit}>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Arama</label>
                <input
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="form-control"
                  placeholder="Başlık veya açıklama"
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Kategori</label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="form-select"
                >
                  <option value="">Hepsi</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Min Ödül</label>
                <input
                  type="number"
                  name="minReward"
                  value={filters.minReward}
                  onChange={handleFilterChange}
                  className="form-control"
                  min="0"
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Maks Ödül</label>
                <input
                  type="number"
                  name="maxReward"
                  value={filters.maxReward}
                  onChange={handleFilterChange}
                  className="form-control"
                  min="0"
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Sıralama</label>
                <div className="input-group">
                  <select
                    name="sortBy"
                    value={filters.sortBy}
                    onChange={handleFilterChange}
                    className="form-select"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <select
                    name="sortOrder"
                    value={filters.sortOrder}
                    onChange={handleFilterChange}
                    className="form-select"
                    style={{ maxWidth: 120 }}
                  >
                    <option value="asc">Artan</option>
                    <option value="desc">Azalan</option>
                  </select>
                </div>
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="featuredOnly"
                    name="featuredOnly"
                    checked={filters.featuredOnly}
                    onChange={handleFilterChange}
                  />
                  <label className="form-check-label" htmlFor="featuredOnly">
                    Sadece öne çıkan
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-3 d-flex gap-2">
              <button type="submit" className="btn btn-primary">
                Filtrele
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={resetFilters}>
                Temizle
              </button>
              {!loading && (
                <button type="button" className="btn btn-link" onClick={loadTasks}>
                  Yenile
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">Yükleniyor...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-4 text-muted">Görev bulunamadı</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Başlık</th>
                    <th>Kategori</th>
                    <th>Ödül</th>
                    <th>Durum</th>
                    <th>Oluşturma</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task._id}>
                      <td>
                        <div className="fw-semibold">{task.title}</div>
                        <div className="text-muted small">{task.description}</div>
                        <div className="mt-1">
                          {renderStatusBadge(task)}
                          {renderFeaturedBadge(task)}
                        </div>
                      </td>
                      <td>{task.category?.name || '-'}</td>
                      <td>{task.reward}₺</td>
                      <td>
                        {task.currentCompletions || 0}/{task.maxCompletions || '∞'}
                      </td>
                      <td>{new Date(task.createdAt).toLocaleDateString()}</td>
                      <td className="text-end">
                        {isAdmin && (
                          <div className="btn-group">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openEdit(task)}
                            >
                              Düzenle
                            </button>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => toggleActive(task)}
                            >
                              {task.isActive ? 'Pasifleştir' : 'Aktifleştir'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {paginationInfo && (
            <div className="text-muted small mt-2">
              Sayfa {paginationInfo.current} / {paginationInfo.pages} • Limit {paginationInfo.limit}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="modal fade show" style={{ display: 'block', background: '#00000080' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingTask ? 'Görev Güncelle' : 'Yeni Görev'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowForm(false)} />
              </div>
              <form onSubmit={saveTask}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Başlık</label>
                      <input
                        name="title"
                        value={formData.title}
                        onChange={handleFormChange}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Kategori</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleFormChange}
                        className="form-select"
                        required
                      >
                        <option value="">Seçiniz</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-12">
                      <label className="form-label">Açıklama</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleFormChange}
                        className="form-control"
                        rows={3}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Ödül (₺)</label>
                      <input
                        type="number"
                        name="reward"
                        value={formData.reward}
                        onChange={handleFormChange}
                        className="form-control"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Maks Tamamlama</label>
                      <input
                        type="number"
                        name="maxCompletions"
                        value={formData.maxCompletions}
                        onChange={handleFormChange}
                        className="form-control"
                        min="0"
                        placeholder="Sınırsız için boş bırakın"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Bağlantı</label>
                      <input
                        name="link"
                        value={formData.link}
                        onChange={handleFormChange}
                        className="form-control"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label">Gereksinimler</label>
                      <textarea
                        name="requirements"
                        value={formData.requirements}
                        onChange={handleFormChange}
                        className="form-control"
                        rows={2}
                        placeholder="Kısa gereksinimler"
                      />
                    </div>
                    <div className="col-md-3 d-flex align-items-center">
                      <div className="form-check mt-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="isActive"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleFormChange}
                        />
                        <label className="form-check-label" htmlFor="isActive">
                          Aktif
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowForm(false)}
                  >
                    Kapat
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
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

export default Tasks;
