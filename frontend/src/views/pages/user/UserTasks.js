import React, { useState, useEffect, useMemo } from 'react';
import * as taskService from '../../../models/taskService';
import * as categoryService from '../../../models/categoryService';

const initialFilters = {
  search: '',
  category: '',
  minReward: '',
  maxReward: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  featuredOnly: false,
};

const UserTasks = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [myCompletions, setMyCompletions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paginationInfo, setPaginationInfo] = useState(null);
  const [stats, setStats] = useState({ total: 0, featuredCount: 0 });
  
  // Görev tamamlama modal state
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [completionForm, setCompletionForm] = useState({
    proof: '',
    proofImages: []
  });

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
    loadMyCompletions();
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

  const loadMyCompletions = async () => {
    try {
      const res = await taskService.getMyCompletions();
      if (res.success) {
        setMyCompletions(res.data || []);
      }
    } catch (err) {
      console.error('Tamamlamalar yüklenemedi', err);
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

  // Görevin tamamlanma durumunu kontrol et
  const getTaskCompletionStatus = (taskId) => {
    const completion = myCompletions.find(
      (c) => c.task?._id === taskId || c.task === taskId
    );
    if (!completion) return null;
    return completion.status; // 'pending', 'approved', 'rejected'
  };

  const openCompleteModal = (task) => {
    setSelectedTask(task);
    setCompletionForm({ proof: '', proofImages: [] });
    setShowCompleteModal(true);
  };

  const closeCompleteModal = () => {
    setShowCompleteModal(false);
    setSelectedTask(null);
    setCompletionForm({ proof: '', proofImages: [] });
  };

  const handleCompletionFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'proofImages') {
      setCompletionForm((prev) => ({
        ...prev,
        proofImages: Array.from(files || []),
      }));
    } else {
      setCompletionForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCompleteTask = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;

    setCompleting(true);
    setError(null);

    try {
      await taskService.completeTask(
        selectedTask._id,
        completionForm.proof,
        completionForm.proofImages
      );
      closeCompleteModal();
      loadMyCompletions();
      loadTasks(); // Görev listesini yenile (currentCompletions güncellenmiş olabilir)
    } catch (err) {
      const msg = err.response?.data?.message || 'Görev tamamlanamadı';
      setError(msg);
    } finally {
      setCompleting(false);
    }
  };

  const renderCompletionStatus = (task) => {
    const status = getTaskCompletionStatus(task._id);
    if (!status) return null;

    if (status === 'pending') {
      return (
        <span className="badge bg-warning text-dark">
          ⏳ Onay Bekliyor
        </span>
      );
    }
    if (status === 'approved') {
      return (
        <span className="badge bg-success">
          ✓ Tamamlandı
        </span>
      );
    }
    if (status === 'rejected') {
      return (
        <span className="badge bg-danger">
          ✗ Reddedildi
        </span>
      );
    }
    return null;
  };

  const renderFeaturedBadge = (task) => {
    if (!task.isCurrentlyFeatured && !task.isFeatured) return null;
    return (
      <span className="badge bg-warning text-dark ms-2">
        {task.featuredNote || '⭐ Öne Çıkan'}
      </span>
    );
  };

  const canCompleteTask = (task) => {
    // Görev aktif değilse
    if (!task.isActive) return false;
    
    // Maksimum tamamlanma sayısına ulaşılmışsa
    if (task.maxCompletions && task.currentCompletions >= task.maxCompletions) {
      return false;
    }

    // Zaten tamamlanmış veya bekleyen bir tamamlama varsa
    const status = getTaskCompletionStatus(task._id);
    if (status === 'pending' || status === 'approved') {
      return false;
    }

    return true;
  };

  return (
    <div className="row pt-4">
      <div className="col-12">

        {/* Filtreler */}
        <div className="card mb-4 border-0 shadow-sm">
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
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={resetFilters}
                >
                  Temizle
                </button>
                {!loading && (
                  <button
                    type="button"
                    className="btn btn-link"
                    onClick={loadTasks}
                  >
                    Yenile
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Görev Listesi */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Yükleniyor...</span>
            </div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5 text-muted">
              Görev bulunamadı
            </div>
          </div>
        ) : (
          <div className="row g-3">
            {tasks.map((task) => {
              const completionStatus = getTaskCompletionStatus(task._id);
              const canComplete = canCompleteTask(task);
              const isMaxReached =
                task.maxCompletions &&
                task.currentCompletions >= task.maxCompletions;

              return (
                <div key={task._id} className="col-md-6 col-lg-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body d-flex flex-column">
                      {/* Başlık ve Badge'ler */}
                      <div className="mb-2">
                        <h5 className="card-title mb-2">{task.title}</h5>
                        <div className="d-flex flex-wrap gap-1 mb-2">
                          {renderCompletionStatus(task)}
                          {renderFeaturedBadge(task)}
                          {task.category && (
                            <span className="badge bg-secondary">
                              {task.category.name}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Açıklama */}
                      <p className="card-text text-muted small flex-grow-1">
                        {task.description}
                      </p>

                      {/* Görev Bilgileri */}
                      <div className="mb-3">
                        {task.requirements && (
                          <div className="small text-muted mb-1">
                            <strong>Gereksinimler:</strong> {task.requirements}
                          </div>
                        )}
                        {task.link && (
                          <div className="small mb-1">
                            <a
                              href={task.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-decoration-none"
                            >
                              🔗 Görev Linki
                            </a>
                          </div>
                        )}
                        <div className="small text-muted">
                          Tamamlanma:{' '}
                          {task.currentCompletions || 0}/
                          {task.maxCompletions || '∞'}
                        </div>
                      </div>

                      {/* Ödül */}
                      <div className="mb-3">
                        <div className="d-flex align-items-center justify-content-between">
                          <span className="h5 mb-0 text-success">
                            {task.reward}₺
                          </span>
                        </div>
                      </div>

                      {/* Butonlar */}
                      <div className="mt-auto">
                        {canComplete ? (
                          <button
                            className="btn btn-primary w-100"
                            onClick={() => openCompleteModal(task)}
                          >
                            Görevi Tamamla
                          </button>
                        ) : isMaxReached ? (
                          <button
                            className="btn btn-secondary w-100"
                            disabled
                          >
                            Maksimum Tamamlanmaya Ulaşıldı
                          </button>
                        ) : completionStatus === 'pending' ? (
                          <button
                            className="btn btn-warning w-100"
                            disabled
                          >
                            Onay Bekliyor
                          </button>
                        ) : completionStatus === 'approved' ? (
                          <button
                            className="btn btn-success w-100"
                            disabled
                          >
                            Tamamlandı
                          </button>
                        ) : completionStatus === 'rejected' ? (
                          <button
                            className="btn btn-danger w-100"
                            disabled
                          >
                            Reddedildi
                          </button>
                        ) : (
                          <button
                            className="btn btn-secondary w-100"
                            disabled
                          >
                            Görev Aktif Değil
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Sayfalama Bilgisi */}
        {paginationInfo && (
          <div className="text-muted small mt-3 text-center">
            Sayfa {paginationInfo.current} / {paginationInfo.pages} • Toplam{' '}
            {stats.total} görev
          </div>
        )}

        {/* Görev Tamamlama Modal */}
        {showCompleteModal && selectedTask && (
          <div
            className="modal fade show"
            style={{ display: 'block', background: '#00000080' }}
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Görevi Tamamla: {selectedTask.title}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeCompleteModal}
                  />
                </div>
                <form onSubmit={handleCompleteTask}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <div className="alert alert-info">
                        <strong>Ödül:</strong> {selectedTask.reward}₺
                        <br />
                        <strong>Kategori:</strong>{' '}
                        {selectedTask.category?.name || '-'}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        Açıklama (Kanıt Metni)
                      </label>
                      <textarea
                        name="proof"
                        value={completionForm.proof}
                        onChange={handleCompletionFormChange}
                        className="form-control"
                        rows={4}
                        placeholder="Görevi nasıl tamamladığınızı açıklayın..."
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        Kanıt Resimleri (Maksimum 5 adet)
                      </label>
                      <input
                        type="file"
                        name="proofImages"
                        onChange={handleCompletionFormChange}
                        className="form-control"
                        accept="image/*"
                        multiple
                      />
                      <small className="text-muted">
                        Her resim maksimum 5MB olabilir
                      </small>
                      {completionForm.proofImages.length > 0 && (
                        <div className="mt-2">
                          <small className="text-success">
                            {completionForm.proofImages.length} resim seçildi
                          </small>
                        </div>
                      )}
                    </div>

                    {selectedTask.requirements && (
                      <div className="mb-3">
                        <div className="alert alert-warning">
                          <strong>Gereksinimler:</strong>{' '}
                          {selectedTask.requirements}
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="alert alert-danger" role="alert">
                        {error}
                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={closeCompleteModal}
                      disabled={completing}
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={completing}
                    >
                      {completing ? 'Gönderiliyor...' : 'Görevi Tamamla'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTasks;
