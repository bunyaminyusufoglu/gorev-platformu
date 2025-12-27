import React, { useState } from 'react';
import { useAuth } from '../../../controllers/AuthContext';
import AdminDashboard from './AdminDashboard';
import AdminUsers from './AdminUsers';
import AdminTasks from './AdminTasks';
import AdminCompletions from './AdminCompletions';

const AdminLayout = ({ user: userProp, children }) => {
  const { user: ctxUser, logout } = useAuth();
  const user = userProp || ctxUser;
  const [activeTab, setActiveTab] = useState('dashboard');
  const displayName = user?.name || user?.email || 'Admin';
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
        case 'dashboard':
          return <AdminDashboard />;
        case 'users':
          return <AdminUsers />;
        case 'tasks':
          return <AdminTasks />;
        case 'completions':
          return <AdminCompletions />;
        default:
          return null;
      }
    }

    // Normal children verilmişse direkt göster
    return children;
  };

  return (
    <div className="bg-light min-vh-100">
      <div className="row g-3 m-0 p-0">
        {/* Sol sabit sidebar */}
        <aside className="col-12 col-md-4 col-lg-3 col-xl-2 p-0 m-0">
          <div className="card border-0 shadow-sm p-0 m-0 min-vh-100">
            <div className="card-body d-flex flex-column">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div
                  className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center me-2 shadow-sm"
                  style={{ width: 40, height: 40, fontWeight: 600 }}
                >
                  {initial}
                </div>
                <div className="flex-grow-1 me-2">
                  <div className="fw-semibold small">{displayName}</div>
                  <div className="text-muted" style={{ fontSize: 11 }}>
                    Admin paneli
                  </div>
                </div>
              </div>

              <hr className="my-2" />

              <div className="list-group list-group-flush flex-grow-1">
                <button
                  type="button"
                  className={`list-group-item list-group-item-action border-0 rounded-3 mb-1 ${
                    activeTab === 'dashboard' ? 'active' : ''
                  }`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  Dashboard
                </button>
                <button
                  type="button"
                  className={`list-group-item list-group-item-action border-0 rounded-3 mb-1 ${
                    activeTab === 'users' ? 'active' : ''
                  }`}
                  onClick={() => setActiveTab('users')}
                >
                  Kullanıcı Yönetimi
                </button>
                <button
                  type="button"
                  className={`list-group-item list-group-item-action border-0 rounded-3 mb-1 ${
                    activeTab === 'tasks' ? 'active' : ''
                  }`}
                  onClick={() => setActiveTab('tasks')}
                >
                  Görev Yönetimi
                </button>
                <button
                  type="button"
                  className={`list-group-item list-group-item-action border-0 rounded-3 mb-1 ${
                    activeTab === 'completions' ? 'active' : ''
                  }`}
                  onClick={() => setActiveTab('completions')}
                >
                  Görev Tamamlamaları
                </button>
              </div>
              <button 
                type="button" 
                className="btn btn-outline-danger btn-sm px-3 w-100 w-sm-auto" 
                onClick={handleLogout}
              >
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

export default AdminLayout;

