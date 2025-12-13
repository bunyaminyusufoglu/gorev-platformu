import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './controllers/AuthContext';
import Login from './views/pages/Login';
import Register from './views/pages/Register';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <div className="container mt-5">
              <h1>Görev Platformu</h1>
              <p>Ana sayfa</p>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
