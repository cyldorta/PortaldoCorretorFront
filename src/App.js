import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

import AdminLayout from './components/layout/AdminLayout';
import CorretorLayout from './components/layout/CorretorLayout';

import Dashboard from './pages/admin/Dashboard';
import Corretores from './pages/admin/Corretores';
import Leads from './pages/admin/Leads';
import Imoveis from './pages/admin/Imoveis';

import CorretorDashboard from './pages/corretor/CorretorDashboard';
import CorretorImoveis from './pages/corretor/CorretorImoveis';
import CorretorLeads from './pages/corretor/CorretorLeads';
import CadastrarImovel from './pages/corretor/CadastrarImovel';

import Login from './pages/auth/Login';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* ROTAS DO ADMIN */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/corretores"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout>
                  <Corretores />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/imoveis"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout>
                  <Imoveis />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/leads"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout>
                  <Leads />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* ROTAS DO CORRETOR */}
          <Route
            path="/corretor/dashboard"
            element={
              <ProtectedRoute requiredRole="CORRETOR">
                <CorretorLayout>
                  <CorretorDashboard />
                </CorretorLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/corretor/imoveis"
            element={
              <ProtectedRoute requiredRole="CORRETOR">
                <CorretorLayout>
                  <CorretorImoveis />
                </CorretorLayout>
              </ProtectedRoute>
            }
          />

          {/* ✅ ROTA LEADS DO CORRETOR - ADICIONADA */}
          <Route
            path="/corretor/leads"
            element={
              <ProtectedRoute requiredRole="CORRETOR">
                <CorretorLayout>
                  <CorretorLeads />
                </CorretorLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/corretor/cadastrar-imovel"
            element={
              <ProtectedRoute requiredRole="CORRETOR">
                <CorretorLayout>
                  <CadastrarImovel />
                </CorretorLayout>
              </ProtectedRoute>
            }
          />

          {/* REDIRECIONAMENTOS */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/admin" element={<Navigate to="/login" replace />} />
          <Route path="/corretor" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;