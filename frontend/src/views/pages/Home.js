import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="bg-light">
      {/* Hero Section */}
      <section className="py-5 py-lg-6" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(129,140,248,0.15) 100%)' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4 text-primary">
                Görev Yap, Para Kazan! 💰
              </h1>
              <p className="lead text-muted mb-4">
                Basit görevleri tamamlayarak para kazanın. Kolay, hızlı ve güvenilir bir şekilde ek gelir elde edin.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3">
                <Link to="/register" className="btn btn-primary btn-lg px-4">
                  Hemen Başla
                </Link>
                <Link to="/login" className="btn btn-outline-primary btn-lg px-4">
                  Giriş Yap
                </Link>
              </div>
            </div>
            <div className="col-lg-6 mt-4 mt-lg-0 text-center">
              <div className="bg-white rounded-4 shadow-lg p-4 p-lg-5">
                <div className="display-1 mb-3">✓</div>
                <h3 className="text-primary mb-3">Görevleri Tamamla</h3>
                <p className="text-muted mb-4">Kolay görevler, hızlı ödeme</p>
                <div className="d-flex justify-content-center gap-3">
                  <div className="text-center">
                    <div className="h4 text-success mb-1">+50₺</div>
                    <small className="text-muted">Günlük</small>
                  </div>
                  <div className="text-center">
                    <div className="h4 text-success mb-1">+300₺</div>
                    <small className="text-muted">Haftalık</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nasıl Çalışır */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="h3 fw-bold mb-3">Nasıl Çalışır?</h2>
            <p className="text-muted">3 basit adımda para kazanmaya başlayın</p>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100 text-center p-4">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 80, height: 80 }}>
                  <span className="display-4">1️⃣</span>
                </div>
                <h4 className="h5 mb-3">Kayıt Ol</h4>
                <p className="text-muted mb-0">
                  Ücretsiz hesap oluşturun ve platforma katılın. Sadece birkaç dakika sürer.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100 text-center p-4">
                <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 80, height: 80 }}>
                  <span className="display-4">2️⃣</span>
                </div>
                <h4 className="h5 mb-3">Görevleri Tamamla</h4>
                <p className="text-muted mb-0">
                  Size uygun görevleri seçin, tamamlayın ve kanıt gönderin. Görevler kolay ve hızlıdır.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100 text-center p-4">
                <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 80, height: 80 }}>
                  <span className="display-4">3️⃣</span>
                </div>
                <h4 className="h5 mb-3">Para Kazan</h4>
                <p className="text-muted mb-0">
                  Görevleriniz onaylandıktan sonra bakiyenize para yatırılır. İstediğiniz zaman çekebilirsiniz.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Özellikler */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="h3 fw-bold mb-3">Neden Bizi Seçmelisiniz?</h2>
            <p className="text-muted">Platformumuzun avantajları</p>
          </div>
          <div className="row g-4">
            <div className="col-md-6 col-lg-4">
              <div className="d-flex gap-3">
                <div className="flex-shrink-0">
                  <div className="bg-primary bg-opacity-10 rounded-3 p-3">
                    <span className="fs-2">⚡</span>
                  </div>
                </div>
                <div>
                  <h5 className="fw-semibold mb-2">Hızlı Ödeme</h5>
                  <p className="text-muted small mb-0">
                    Görevleriniz onaylandıktan hemen sonra bakiyenize para yatırılır.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="d-flex gap-3">
                <div className="flex-shrink-0">
                  <div className="bg-success bg-opacity-10 rounded-3 p-3">
                    <span className="fs-2">🔒</span>
                  </div>
                </div>
                <div>
                  <h5 className="fw-semibold mb-2">Güvenli Platform</h5>
                  <p className="text-muted small mb-0">
                    Tüm işlemleriniz güvenli ve şifrelenmiş bir şekilde korunur.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="d-flex gap-3">
                <div className="flex-shrink-0">
                  <div className="bg-info bg-opacity-10 rounded-3 p-3">
                    <span className="fs-2">📱</span>
                  </div>
                </div>
                <div>
                  <h5 className="fw-semibold mb-2">Kolay Kullanım</h5>
                  <p className="text-muted small mb-0">
                    Basit ve anlaşılır arayüz ile kolayca görevleri tamamlayabilirsiniz.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="d-flex gap-3">
                <div className="flex-shrink-0">
                  <div className="bg-warning bg-opacity-10 rounded-3 p-3">
                    <span className="fs-2">💳</span>
                  </div>
                </div>
                <div>
                  <h5 className="fw-semibold mb-2">Kolay Para Çekme</h5>
                  <p className="text-muted small mb-0">
                    IBAN ile kolayca para çekebilir, bakiyenizi istediğiniz zaman kullanabilirsiniz.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="d-flex gap-3">
                <div className="flex-shrink-0">
                  <div className="bg-danger bg-opacity-10 rounded-3 p-3">
                    <span className="fs-2">🎯</span>
                  </div>
                </div>
                <div>
                  <h5 className="fw-semibold mb-2">Çeşitli Görevler</h5>
                  <p className="text-muted small mb-0">
                    Farklı kategorilerde birçok görev seçeneği ile sıkılmadan çalışın.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="d-flex gap-3">
                <div className="flex-shrink-0">
                  <div className="bg-secondary bg-opacity-10 rounded-3 p-3">
                    <span className="fs-2">📊</span>
                  </div>
                </div>
                <div>
                  <h5 className="fw-semibold mb-2">İstatistikler</h5>
                  <p className="text-muted small mb-0">
                    Kazançlarınızı ve tamamladığınız görevleri takip edin.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Görev Örnekleri */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="h3 fw-bold mb-3">Görev Örnekleri</h2>
            <p className="text-muted">Tamamlayabileceğiniz görev türleri</p>
          </div>
          <div className="row g-4">
            <div className="col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="badge bg-primary">Sosyal Medya</span>
                    <span className="h5 mb-0 text-success">25₺</span>
                  </div>
                  <h5 className="card-title">Instagram Beğeni</h5>
                  <p className="card-text text-muted small">
                    Belirtilen gönderiyi beğenin ve ekran görüntüsü paylaşın.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="badge bg-success">Uygulama</span>
                    <span className="h5 mb-0 text-success">50₺</span>
                  </div>
                  <h5 className="card-title">Uygulama İndirme</h5>
                  <p className="card-text text-muted small">
                    Belirtilen uygulamayı indirin, kurun ve kanıt gönderin.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="badge bg-info">Anket</span>
                    <span className="h5 mb-0 text-success">15₺</span>
                  </div>
                  <h5 className="card-title">Anket Doldurma</h5>
                  <p className="card-text text-muted small">
                    Kısa bir anketi doldurun ve tamamlama ekran görüntüsü paylaşın.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-primary text-white">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h2 className="h3 fw-bold mb-3">Hemen Başlayın!</h2>
              <p className="lead mb-0">
                Ücretsiz kayıt olun ve ilk görevinizi tamamlayarak para kazanmaya başlayın.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">
              <Link to="/register" className="btn btn-light btn-lg px-4">
                Ücretsiz Kayıt Ol
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 bg-dark text-white">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <h5 className="mb-3">Görev Platformu</h5>
              <p className="text-muted small mb-0">
                Görev yap, para kazan. Basit, hızlı ve güvenilir.
              </p>
            </div>
            <div className="col-md-6 text-md-end mt-3 mt-md-0">
              <div className="d-flex flex-column flex-md-row gap-3 justify-content-md-end">
                <Link to="/login" className="text-white text-decoration-none small">
                  Giriş Yap
                </Link>
                <Link to="/register" className="text-white text-decoration-none small">
                  Kayıt Ol
                </Link>
              </div>
            </div>
          </div>
          <hr className="my-3 bg-white bg-opacity-25" />
          <div className="text-center text-muted small">
            © {new Date().getFullYear()} Görev Platformu. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
