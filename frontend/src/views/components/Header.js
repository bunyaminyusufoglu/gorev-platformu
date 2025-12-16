import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../controllers/AuthContext';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;
  const navBg = {
    background:
      'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(59,130,246,0.12) 100%)',
    backdropFilter: 'blur(8px)',
  };

  const UserBadge = () => {
    const label = user?.name || user?.email || '';
    const initial = label.trim().charAt(0).toUpperCase();
    return (
      <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: 40, height: 40 }}>
        {initial || 'U'}
      </div>
    );
  };

  const navLinkClass = (path) =>
    `nav-link px-3 py-2 rounded-pill ${
      isActive(path) || (path === '/tasks' && isActive('/')) ? 'bg-white shadow-sm fw-semibold text-primary' : 'text-dark'
    }`;

  return (
    <nav className="navbar navbar-expand-lg py-3 shadow-sm sticky-top" style={navBg}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold text-primary" to="/">
          <span className="bg-primary text-white rounded-3 d-inline-flex align-items-center justify-content-center shadow-sm" style={{ width: 36, height: 36, fontSize: '1.1rem' }}>
            ✓
          </span>
          <span>Görev Platformu</span>
        </Link>

        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item me-2">
              <Link className={navLinkClass('/')} to="/">
                Ana Sayfa
              </Link>
            </li>
            <li className="nav-item me-2">
              <Link className={navLinkClass('/tasks')} to="/tasks">
                Görevler
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            {isAuthenticated ? (
              <>
                <UserBadge />
                <div className="text-end">
                  <div className="fw-semibold">{user?.name || user?.email}</div>
                  <div className="d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                    <span className="badge bg-light text-secondary border">
                      {user?.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}
                    </span>
                  </div>
                </div>
                <button className="btn btn-outline-danger btn-sm px-3" onClick={handleLogout}>
                  Çıkış Yap
                </button>
              </>
            ) : (
              <>
                <Link className={`btn btn-light border-0 shadow-sm ${isActive('/login') ? 'fw-semibold' : ''}`} to="/login">
                  Giriş Yap
                </Link>
                <Link className="btn btn-primary shadow-sm" to="/register">
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;

