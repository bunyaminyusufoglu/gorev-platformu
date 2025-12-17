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

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navBg = {
    background:
      'linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(129,140,248,0.12) 100%)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 10px 30px rgba(15,23,42,0.08)',
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
    `nav-link px-3 py-2 rounded-pill fw-medium ${
      isActive(path)
        ? 'bg-white shadow-sm text-primary'
        : 'text-dark bg-white bg-opacity-0'
    }`;

  return (
    <>
      
    {!isAuthenticated && 
      <nav className="navbar navbar-expand-lg navbar-light py-2 py-lg-3 shadow-sm sticky-top" style={navBg}>
      <div className="container">
        <Link
          className="navbar-brand d-flex align-items-center gap-2 fw-bold text-primary mb-0 pe-3 border-end border-light"
          to="/"
        >
          <span
            className="bg-primary text-white rounded-3 d-inline-flex align-items-center justify-content-center shadow-sm"
            style={{ width: 32, height: 32, fontSize: '1rem' }}
          >
            ✓
          </span>
          <span className="d-none d-sm-inline">Görev Platformu</span>
          <span className="d-inline d-sm-none">Görevler</span>
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

        <div className="collapse navbar-collapse mt-2 mt-lg-0" id="mainNavbar">
          <ul className="navbar-nav ms-lg-3 me-auto mb-3 mb-lg-0">
            {!isAuthenticated && (
              <>
                
            <li className="nav-item me-lg-1 mb-2 mb-lg-0">
              <Link className={navLinkClass('/')} to="/">
                Ana Sayfa
              </Link>
            </li>
              </>
            )}
          </ul>

          <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center justify-content-end gap-2 gap-sm-3 mb-2 mb-lg-0">
            {isAuthenticated ? (
              <>
                <button className="btn btn-outline-danger btn-sm px-3 w-100 w-sm-auto" onClick={handleLogout}>
                  Çıkış Yap
                </button>
              </>
            ) : (
              <>
                <Link
                  className={`btn btn-outline-primary btn-sm px-3 w-100 w-sm-auto text-nowrap ${
                    isActive('/login') ? 'fw-semibold' : ''
                  }`}
                  to="/login"
                >
                  Giriş Yap
                </Link>
                <Link className="btn btn-primary btn-sm px-3 w-100 w-sm-auto text-nowrap" to="/register">
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
    }
    </>
  );
};

export default Header;

