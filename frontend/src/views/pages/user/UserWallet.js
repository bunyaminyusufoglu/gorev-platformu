import React, { useState, useEffect } from 'react';
import * as walletService from '../../../models/walletService';

const UserWallet = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [balance, setBalance] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [paginationInfo, setPaginationInfo] = useState(null);
  
  // Filtreler
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    page: 1,
    limit: 20
  });

  // Para çekme modal state
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    iban: '',
    accountName: ''
  });

  useEffect(() => {
    loadWalletData();
  }, [filters.type, filters.status, filters.page]);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Bakiye bilgisi ve işlem geçmişini paralel yükle
      const [balanceRes, transactionsRes] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions({
          type: filters.type || undefined,
          status: filters.status || undefined,
          page: filters.page,
          limit: filters.limit
        })
      ]);

      if (balanceRes.success) {
        setBalance(balanceRes.data.balance || 0);
        setTotalEarned(balanceRes.data.totalEarned || 0);
      }

      if (transactionsRes.success) {
        setTransactions(transactionsRes.data || []);
        setPaginationInfo({
          current: transactionsRes.page || 1,
          pages: transactionsRes.pages || 1,
          total: transactionsRes.total || 0
        });
      }
    } catch (err) {
      console.error('Wallet data load error:', err);
      const errorMessage = err.response?.data?.message || 'Veriler yüklenirken bir hata oluştu';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1 // Filtre değiştiğinde sayfayı sıfırla
    }));
  };

  const openWithdrawModal = () => {
    setWithdrawForm({
      amount: '',
      iban: '',
      accountName: ''
    });
    setShowWithdrawModal(true);
  };

  const closeWithdrawModal = () => {
    setShowWithdrawModal(false);
    setWithdrawForm({
      amount: '',
      iban: '',
      accountName: ''
    });
  };

  const handleWithdrawFormChange = (e) => {
    const { name, value } = e.target;
    setWithdrawForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleIBANChange = (e) => {
    let value = e.target.value.replace(/\s/g, '').toUpperCase();
    // TR harflerinden sonraki kısmı formatla (4'er karakter)
    if (value.startsWith('TR')) {
      const ibanPart = value.substring(2);
      const formatted = ibanPart.match(/.{1,4}/g)?.join(' ') || ibanPart;
      value = 'TR' + formatted;
    }
    setWithdrawForm((prev) => ({
      ...prev,
      iban: value
    }));
  };

  const handleRequestWithdrawal = async (e) => {
    e.preventDefault();
    if (!withdrawForm.amount || !withdrawForm.iban || !withdrawForm.accountName) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    const amount = parseFloat(withdrawForm.amount);
    if (amount <= 0) {
      setError('Çekilecek miktar 0\'dan büyük olmalıdır');
      return;
    }

    if (amount > balance) {
      setError('Yetersiz bakiye');
      return;
    }

    setWithdrawing(true);
    setError(null);

    try {
      await walletService.requestWithdrawal(
        amount,
        withdrawForm.iban.replace(/\s/g, ''),
        withdrawForm.accountName
      );
      closeWithdrawModal();
      loadWalletData(); // Bakiyeyi ve işlemleri yenile
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Para çekme talebi oluşturulamadı';
      setError(errorMessage);
    } finally {
      setWithdrawing(false);
    }
  };

  const getTransactionTypeLabel = (type) => {
    const labels = {
      earning: 'Kazanç',
      withdrawal: 'Para Çekme',
      bonus: 'Bonus',
      refund: 'İade'
    };
    return labels[type] || type;
  };

  const getTransactionTypeBadge = (type) => {
    const badges = {
      earning: 'bg-success',
      withdrawal: 'bg-danger',
      bonus: 'bg-info',
      refund: 'bg-warning'
    };
    return badges[type] || 'bg-secondary';
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'bg-success',
      pending: 'bg-warning text-dark',
      failed: 'bg-danger',
      cancelled: 'bg-secondary'
    };
    return badges[status] || 'bg-secondary';
  };

  const getStatusLabel = (status) => {
    const labels = {
      completed: 'Tamamlandı',
      pending: 'Bekliyor',
      failed: 'Başarısız',
      cancelled: 'İptal Edildi'
    };
    return labels[status] || status;
  };

  const formatAmount = (amount, type) => {
    const sign = type === 'earning' || type === 'bonus' || type === 'refund' ? '+' : '';
    return `${sign}${amount.toFixed(2)}₺`;
  };

  const changePage = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage
    }));
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="row pt-4">
        <div className="col-12">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Yükleniyor...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="row pt-4">
      <div className="col-12">

        {/* Bakiye Kartları */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="text-muted small">Mevcut Bakiye</div>
                  <div className="badge bg-primary-subtle text-primary">₺</div>
                </div>
                <h3 className="mb-0 fw-bold">{balance.toFixed(2)}₺</h3>
                <button
                  className="btn btn-primary btn-sm mt-3"
                  onClick={openWithdrawModal}
                  disabled={balance <= 0}
                >
                  Para Çek
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="text-muted small">Toplam Kazanç</div>
                  <div className="badge bg-success-subtle text-success">₺</div>
                </div>
                <h3 className="mb-0 fw-bold">{totalEarned.toFixed(2)}₺</h3>
                <small className="text-muted">Tüm zamanlar boyunca kazanılan toplam tutar</small>
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

        {/* Filtreler */}
        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">İşlem Tipi</label>
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="form-select"
                >
                  <option value="">Hepsi</option>
                  <option value="earning">Kazanç</option>
                  <option value="withdrawal">Para Çekme</option>
                  <option value="bonus">Bonus</option>
                  <option value="refund">İade</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Durum</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="form-select"
                >
                  <option value="">Hepsi</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="pending">Bekliyor</option>
                  <option value="failed">Başarısız</option>
                  <option value="cancelled">İptal Edildi</option>
                </select>
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={() => {
                    setFilters({
                      type: '',
                      status: '',
                      page: 1,
                      limit: 20
                    });
                  }}
                >
                  Filtreleri Temizle
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* İşlem Geçmişi */}
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-3">İşlem Geçmişi</h5>
            {transactions.length === 0 ? (
              <div className="text-center py-4 text-muted">
                İşlem geçmişi bulunamadı
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Tarih</th>
                        <th>Tip</th>
                        <th>Açıklama</th>
                        <th>Tutar</th>
                        <th>Durum</th>
                        <th>Bakiye</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction._id}>
                          <td>
                            {new Date(transaction.createdAt).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td>
                            <span className={`badge ${getTransactionTypeBadge(transaction.type)}`}>
                              {getTransactionTypeLabel(transaction.type)}
                            </span>
                            {transaction.task && (
                              <div className="small text-muted mt-1">
                                Görev: {transaction.task.title}
                              </div>
                            )}
                          </td>
                          <td>{transaction.description || '-'}</td>
                          <td>
                            <span
                              className={
                                transaction.type === 'earning' ||
                                transaction.type === 'bonus' ||
                                transaction.type === 'refund'
                                  ? 'text-success fw-bold'
                                  : 'text-danger fw-bold'
                              }
                            >
                              {formatAmount(Math.abs(transaction.amount), transaction.type)}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadge(transaction.status)}`}>
                              {getStatusLabel(transaction.status)}
                            </span>
                            {transaction.withdrawalDetails && (
                              <div className="small text-muted mt-1">
                                IBAN: {transaction.withdrawalDetails.iban}
                              </div>
                            )}
                          </td>
                          <td className="text-muted small">
                            {transaction.balanceAfter !== undefined
                              ? `${transaction.balanceAfter.toFixed(2)}₺`
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Sayfalama */}
                {paginationInfo && paginationInfo.pages > 1 && (
                  <nav aria-label="Sayfa navigasyonu">
                    <ul className="pagination justify-content-center mt-3">
                      <li className={`page-item ${paginationInfo.current === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => changePage(paginationInfo.current - 1)}
                          disabled={paginationInfo.current === 1}
                        >
                          Önceki
                        </button>
                      </li>
                      {[...Array(paginationInfo.pages)].map((_, index) => {
                        const page = index + 1;
                        // Sadece mevcut sayfa ve yakınındaki sayfaları göster
                        if (
                          page === 1 ||
                          page === paginationInfo.pages ||
                          (page >= paginationInfo.current - 1 &&
                            page <= paginationInfo.current + 1)
                        ) {
                          return (
                            <li
                              key={page}
                              className={`page-item ${paginationInfo.current === page ? 'active' : ''}`}
                            >
                              <button
                                className="page-link"
                                onClick={() => changePage(page)}
                              >
                                {page}
                              </button>
                            </li>
                          );
                        } else if (
                          page === paginationInfo.current - 2 ||
                          page === paginationInfo.current + 2
                        ) {
                          return (
                            <li key={page} className="page-item disabled">
                              <span className="page-link">...</span>
                            </li>
                          );
                        }
                        return null;
                      })}
                      <li
                        className={`page-item ${
                          paginationInfo.current === paginationInfo.pages ? 'disabled' : ''
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => changePage(paginationInfo.current + 1)}
                          disabled={paginationInfo.current === paginationInfo.pages}
                        >
                          Sonraki
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}
                {paginationInfo && (
                  <div className="text-muted small text-center mt-2">
                    Sayfa {paginationInfo.current} / {paginationInfo.pages} • Toplam{' '}
                    {paginationInfo.total} işlem
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Para Çekme Modal */}
        {showWithdrawModal && (
          <div
            className="modal fade show"
            style={{ display: 'block', background: '#00000080' }}
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Para Çekme Talebi</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeWithdrawModal}
                    disabled={withdrawing}
                  />
                </div>
                <form onSubmit={handleRequestWithdrawal}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <div className="alert alert-info">
                        <strong>Mevcut Bakiye:</strong> {balance.toFixed(2)}₺
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        Çekilecek Tutar (₺) <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={withdrawForm.amount}
                        onChange={handleWithdrawFormChange}
                        className="form-control"
                        min="0.01"
                        step="0.01"
                        max={balance}
                        required
                        disabled={withdrawing}
                      />
                      <small className="text-muted">
                        Minimum çekilebilir tutar: 0.01₺
                      </small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        IBAN <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="iban"
                        value={withdrawForm.iban}
                        onChange={handleIBANChange}
                        className="form-control"
                        placeholder="TR00 0000 0000 0000 0000 0000 00"
                        maxLength={34}
                        required
                        disabled={withdrawing}
                      />
                      <small className="text-muted">
                        Format: TR ile başlayan 26 karakter
                      </small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        Hesap Sahibi Adı <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="accountName"
                        value={withdrawForm.accountName}
                        onChange={handleWithdrawFormChange}
                        className="form-control"
                        placeholder="Ad Soyad"
                        required
                        disabled={withdrawing}
                      />
                    </div>

                    <div className="alert alert-warning">
                      <small>
                        <strong>Uyarı:</strong> Para çekme talebi onaylandığında bakiye
                        otomatik olarak düşecektir. Talebin onaylanması 1-3 iş günü
                        sürebilir.
                      </small>
                    </div>

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
                      onClick={closeWithdrawModal}
                      disabled={withdrawing}
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={withdrawing}
                    >
                      {withdrawing ? 'Gönderiliyor...' : 'Talep Oluştur'}
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

export default UserWallet;
