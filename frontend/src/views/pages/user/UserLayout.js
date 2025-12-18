import React, { useState } from 'react';
import { useAuth } from '../../../controllers/AuthContext';
import UserTasks from './UserTasks';
import UserDashboard from './UserDashboard';

const UserLayout = ({ user: userProp, children }) => {
  const { user: ctxUser, logout } = useAuth();
  const user = userProp || ctxUser;
  const [activeTab, setActiveTab] = useState('overview');
  const displayName = user?.name || user?.email || 'Kullanıcı';
  const initial = displayName.trim().charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
  };

  const renderChildren = () => {
    // Eğer dışarıdan render-prop geldiyse onu kullan
    if (typeof children === 'function') {
      return children({ activeTab, setActiveTab });
    }

    // Hiç children verilmediyse, layout kendi içinde sekmeye göre içerik göstersin
    if (!children) {
      switch (activeTab) {
        case 'overview':
          return <UserDashboard />;
        case 'tasks':
          return <UserTasks />;
        case 'wallet':
          return <UserDashboard />;
        case 'settings':
          return <UserDashboard />;
        default:
          return null;
      }
    }

    // Normal children verilmişse direkt göster
    return children;
  };

  return (
    <div className="bg-light min-vh-100">
      <div className="row g-3">
          {/* Sol sabit sidebar */}
          <aside className="col-12 col-md-4 col-lg-3 col-xl-2">
            <div className="card border-0 shadow-sm min-vh-100">
              <div className="card-body d-flex flex-column">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2 shadow-sm"
                    style={{ width: 40, height: 40, fontWeight: 600 }}
                  >
                    {initial}
                  </div>
                  <div className="flex-grow-1 me-2">
                    <div className="fw-semibold small">{displayName}</div>
                    <div className="text-muted" style={{ fontSize: 11 }}>
                      Kullanıcı paneli
                    </div>
                  </div>
                </div>

                <hr className="my-2" />

                <div className="list-group list-group-flush flex-grow-1">
                  <button
                    type="button"
                    className={`list-group-item list-group-item-action border-0 rounded-3 mb-1 ${
                      activeTab === 'overview' ? 'active' : ''
                    }`}
                    onClick={() => setActiveTab('overview')}
                  >
                    Dashboard
                  </button>
                  <button
                    type="button"
                    className={`list-group-item list-group-item-action border-0 rounded-3 mb-1 ${
                      activeTab === 'tasks' ? 'active' : ''
                    }`}
                    onClick={() => setActiveTab('tasks')}
                  >
                    Görevler
                  </button>
                  <button
                    type="button"
                    className={`list-group-item list-group-item-action border-0 rounded-3 mb-1 ${
                      activeTab === 'wallet' ? 'active' : ''
                    }`}
                    onClick={() => setActiveTab('wallet')}
                  >
                    Cüzdan
                  </button>
                  <button
                    type="button"
                    className={`list-group-item list-group-item-action border-0 rounded-3 ${
                      activeTab === 'settings' ? 'active' : ''
                    }`}
                    onClick={() => setActiveTab('settings')}
                  >
                    Ayarlar
                  </button>
                </div>
                <button type="button" className="btn btn-outline-danger btn-sm px-3 w-100 w-sm-auto" onClick={handleLogout}>
                  Çıkış Yap
                </button>
              </div>
            </div>
          </aside>

          {/* Sağ içerik alanı */}
          <div className="col-12 col-md-8 col-lg-9 col-xl-10">{renderChildren()}</div>
        </div>
    </div>
  );
};

export default UserLayout;