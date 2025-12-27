import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './controllers/AuthContext';
import Login from './views/pages/Login';
import Register from './views/pages/Register';
import Home from './views/pages/Home';
import Header from './views/components/Header';
import UserLayout from './views/pages/user/UserLayout';
import AdminLayout from './views/pages/admin/AdminLayout';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  // Admin kullanıcıları user dashboard'a erişemesin
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user?.role !== 'admin') {
    return <Navigate to="/user/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/user/dashboard"
            element={
              <PrivateRoute>
                <UserLayout />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
