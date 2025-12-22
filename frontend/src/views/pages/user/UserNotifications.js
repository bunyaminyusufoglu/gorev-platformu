import React, { useState, useEffect, useCallback } from 'react';
import * as notificationService from '../../../models/notificationService';

const UserNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [paginationInfo, setPaginationInfo] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'unread'
  const [page, setPage] = useState(1);

  const loadUnreadCount = useCallback(async () => {
    try {
      const res = await notificationService.getUnreadCount();
      if (res.success) {
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.error('Okunmamış bildirim sayısı yüklenemedi', err);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await notificationService.getMyNotifications({
        page,
        limit: 20,
        unreadOnly: filter === 'unread' ? 'true' : undefined
      });
      if (res.success) {
        setNotifications(res.data || []);
        setPaginationInfo(res.pagination || null);
        setUnreadCount(res.pagination?.unreadCount || 0);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Bildirimler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, [loadNotifications, loadUnreadCount]);


  const handleMarkAsRead = async (notificationId) => {
    try {
      const res = await notificationService.markAsRead(notificationId);
      if (res.success) {
        loadNotifications();
        loadUnreadCount();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Bildirim güncellenemedi');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await notificationService.markAllAsRead();
      if (res.success) {
        loadNotifications();
        loadUnreadCount();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Bildirimler güncellenemedi');
    }
  };

  const handleDelete = async (notificationId) => {
    if (!window.confirm('Bu bildirimi silmek istediğinize emin misiniz?')) {
      return;
    }
    try {
      const res = await notificationService.deleteNotification(notificationId);
      if (res.success) {
        loadNotifications();
        loadUnreadCount();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Bildirim silinemedi');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Tüm bildirimleri silmek istediğinize emin misiniz?')) {
      return;
    }
    try {
      const res = await notificationService.deleteAllNotifications();
      if (res.success) {
        loadNotifications();
        loadUnreadCount();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Bildirimler silinemedi');
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      task_approved: '✅',
      task_rejected: '❌',
      new_task: '🆕',
      earning: '💰',
      withdrawal: '💸',
      system: '🔔',
      info: 'ℹ️'
    };
    return icons[type] || '📢';
  };

  const getNotificationBadge = (type) => {
    const badges = {
      task_approved: 'bg-success',
      task_rejected: 'bg-danger',
      new_task: 'bg-info',
      earning: 'bg-success',
      withdrawal: 'bg-warning',
      system: 'bg-secondary',
      info: 'bg-primary'
    };
    return badges[type] || 'bg-secondary';
  };

  const getNotificationTypeLabel = (type) => {
    const labels = {
      task_approved: 'Görev Onaylandı',
      task_rejected: 'Görev Reddedildi',
      new_task: 'Yeni Görev',
      earning: 'Kazanç',
      withdrawal: 'Para Çekme',
      system: 'Sistem',
      info: 'Bilgi'
    };
    return labels[type] || type;
  };

  return (
    <div className="row pt-4">
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center mb-4">
          {unreadCount > 0 && (
            <span className="badge bg-danger">
              {unreadCount} Okunmamış
            </span>
          )}
        </div>

        {/* Filtreler ve Aksiyonlar */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">Tümü</option>
                  <option value="unread">Okunmamış</option>
                </select>
              </div>
              <div className="col-md-8 text-end">
                {unreadCount > 0 && (
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={handleMarkAllAsRead}
                  >
                    Tümünü Okundu İşaretle
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={handleDeleteAll}
                  >
                    Tümünü Sil
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hata Mesajı */}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Bildirim Listesi */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Yükleniyor...</span>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5 text-muted">
              {filter === 'unread' ? 'Okunmamış bildirim bulunamadı' : 'Bildirim bulunamadı'}
            </div>
          </div>
        ) : (
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`border-bottom p-3 ${
                    !notification.isRead ? 'bg-light bg-opacity-50' : ''
                  }`}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span style={{ fontSize: '1.2rem' }}>
                          {getNotificationIcon(notification.type)}
                        </span>
                        <span className={`badge ${getNotificationBadge(notification.type)}`}>
                          {getNotificationTypeLabel(notification.type)}
                        </span>
                        {!notification.isRead && (
                          <span className="badge bg-danger">Yeni</span>
                        )}
                        <span className="text-muted small ms-auto">
                          {new Date(notification.createdAt).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <h6 className="mb-1">{notification.title}</h6>
                      <p className="mb-2 text-muted">{notification.message}</p>
                      {notification.relatedTask && (
                        <div className="small text-muted">
                          Görev: {notification.relatedTask.title} ({notification.relatedTask.reward}₺)
                        </div>
                      )}
                    </div>
                    <div className="ms-3 d-flex gap-2">
                      {!notification.isRead && (
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleMarkAsRead(notification._id)}
                          title="Okundu İşaretle"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(notification._id)}
                        title="Sil"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sayfalama */}
        {paginationInfo && paginationInfo.pages > 1 && (
          <nav aria-label="Sayfa navigasyonu" className="mt-4">
            <ul className="pagination justify-content-center">
              <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Önceki
                </button>
              </li>
              {[...Array(paginationInfo.pages)].map((_, index) => {
                const pageNum = index + 1;
                if (
                  pageNum === 1 ||
                  pageNum === paginationInfo.pages ||
                  (pageNum >= page - 1 && pageNum <= page + 1)
                ) {
                  return (
                    <li
                      key={pageNum}
                      className={`page-item ${page === pageNum ? 'active' : ''}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    </li>
                  );
                } else if (pageNum === page - 2 || pageNum === page + 2) {
                  return (
                    <li key={pageNum} className="page-item disabled">
                      <span className="page-link">...</span>
                    </li>
                  );
                }
                return null;
              })}
              <li
                className={`page-item ${
                  page === paginationInfo.pages ? 'disabled' : ''
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => setPage(page + 1)}
                  disabled={page === paginationInfo.pages}
                >
                  Sonraki
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
};

export default UserNotifications;

