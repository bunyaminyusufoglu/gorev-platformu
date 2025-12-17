import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './controllers/AuthContext';
import Login from './views/pages/Login';
import Register from './views/pages/Register';
import Tasks from './views/pages/Tasks';
import Header from './views/components/Header';
import Home from './views/pages/Home';
import UserLayout from './views/pages/user/UserLayout';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route
            path="/user/dashboard"
            element={
              <PrivateRoute>
                <UserLayout />
              </PrivateRoute>
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
