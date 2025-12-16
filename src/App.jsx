import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './pages/Login/Login';

// Placeholder for Dashboard (we will build this next)
const Dashboard = () => (
  <div style={{ padding: '2rem' }}>
    <h1>Dashboard</h1>
    <p>Bem-vindo ao sistema de questões!</p>
    <a href="/study" style={{ display: 'block', marginTop: '1rem' }}>Ir para Questões</a>
  </div>
);

// Placeholder for Study Mode
const Study = () => (
  <div style={{ padding: '2rem' }}>
    <h1>Modo Estudo</h1>
    <p>Aqui aparecerão as questões.</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/study" element={
            <ProtectedRoute>
              <Study />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
