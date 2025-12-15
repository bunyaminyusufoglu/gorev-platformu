import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './controllers/AuthContext';
import Login from './views/pages/Login';
import Register from './views/pages/Register';
import Tasks from './views/pages/Tasks';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Tasks />} />
          <Route path="/tasks" element={<Tasks />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
