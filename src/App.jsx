import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { QuestionProvider } from './contexts/QuestionContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './pages/Login/Login';
import Layout from './components/UI/Layout';

import Dashboard from './pages/Dashboard/Dashboard';
import Study from './pages/Study/Study';

function App() {
  return (
    <AuthProvider>
      <QuestionProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/study" element={
              <ProtectedRoute>
                <Layout>
                  <Study />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </QuestionProvider>
    </AuthProvider>
  );
}

export default App;
