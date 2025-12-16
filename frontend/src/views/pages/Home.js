import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../controllers/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="bg-light min-vh-100">
      <section className="container py-5 py-lg-6">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <div className="mb-3 d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill bg-white shadow-sm">
              <span className="badge bg-primary">Yeni</span>
              <span className="text-muted small">Görevlerle ödül kazanmaya başla</span>
            </div>
            <h1 className="display-5 fw-bold mt-3 mb-3">
              Görevleri tamamla,
              <br />
              ödülleri topla.
            </h1>
            <p className="lead text-secondary mb-4">
              Kategorilere göre filtreleyebileceğin, öne çıkan görevleri
              yakalayabileceğin ve yönetici olarak kolayca görev ekleyip
              düzenleyebileceğin modern bir görev platformu.
            </p>
            <div className="d-flex flex-wrap gap-3">
              {isAuthenticated ? (
                <Link className="btn btn-primary btn-lg shadow-sm" to="/tasks">
                  Görevlere git
                </Link>
              ) : (
                <>
                  <Link className="btn btn-primary btn-lg shadow-sm" to="/register">
                    Hemen Başla
                  </Link>
                  <Link className="btn btn-outline-secondary btn-lg" to="/login">
                    Zaten üyeyim
                  </Link>
                </>
              )}
            </div>
            {isAuthenticated && (
              <p className="text-muted mt-3">
                Hoş geldin, <span className="fw-semibold">{user?.name || user?.email}</span>!
              </p>
            )}
          </div>
          <div className="col-lg-6">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Öne Çıkan Görevler</h5>
                  <span className="badge bg-warning text-dark">Canlı</span>
                </div>
                <div className="list-group list-group-flush">
                  <div className="list-group-item px-0 d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-semibold">Anket Tamamlama</div>
                      <div className="text-muted small">Pazarlama · 10 dk</div>
                    </div>
                    <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3">
                      25₺
                    </span>
                  </div>
                  <div className="list-group-item px-0 d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-semibold">Mobil Uygulama Testi</div>
                      <div className="text-muted small">Ürün · 15 dk</div>
                    </div>
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3">
                      40₺
                    </span>
                  </div>
                  <div className="list-group-item px-0 d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-semibold">Referans Getir</div>
                      <div className="text-muted small">Topluluk · 5 dk</div>
                    </div>
                    <span className="badge bg-info-subtle text-info border border-info-subtle rounded-pill px-3">
                      15₺
                    </span>
                  </div>
                </div>
                <div className="alert alert-primary mt-4 mb-0" role="alert">
                  Canlı verileri görmek için görevler sayfasına göz at!
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container pb-6">
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <div className="badge bg-primary-subtle text-primary mb-3">Filtreleme</div>
                <h5 className="card-title">Akıllı arama ve filtreler</h5>
                <p className="card-text text-secondary">
                  Görevleri kategori, ödül, durum veya öne çıkanlara göre hızla filtrele, aradığını hemen bul.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <div className="badge bg-success-subtle text-success mb-3">Ödül</div>
                <h5 className="card-title">Şeffaf ödül bilgisi</h5>
                <p className="card-text text-secondary">
                  Her görevde ödül tutarı, tamamlanma sınırı ve aktiflik durumu net bir şekilde belirtilir.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <div className="badge bg-warning-subtle text-warning mb-3">Yönetim</div>
                <h5 className="card-title">Yönetici araçları</h5>
                <p className="card-text text-secondary">
                  Adminler görev ekleyip düzenleyebilir, öne çıkarabilir ve durumları tek tıkla yönetebilir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

