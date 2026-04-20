import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import AcademicosPage from './pages/AcademicosPage';
import EditaisPage from './pages/EditaisPage';
import MatchesPage from './pages/MatchesPage';
import GrafoPage from './pages/GrafoPage';
import { LoginPage } from './pages/LoginPage';
import { CadastroPage } from './pages/CadastroPage';
import UserDashboard from './pages/UserDashboard';
import UserLayout from './components/layout/UserLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import UserMatchesPage from './pages/UserMatchesPage';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';

function UserPlaceholder({ title }: { title: string }) {
  return <div className="text-white p-4"><h1>{title}</h1><p className="text-gray-400 mt-2 font-mono text-sm opacity-60 italic">{'>'} Agente Orchestrator preparando visualização...</p></div>;
}

export default function App() {
  const checkAuth = useAuthStore(state => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Toaster theme="dark" position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />
        <Route path="/user/cadastro" element={<Navigate to="/cadastro" replace />} />
        
        {/* Admin Portal */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="academicos" element={<AcademicosPage />} />
            <Route path="editais" element={<EditaisPage />} />
            <Route path="matches" element={<MatchesPage />} />
            <Route path="grafo" element={<GrafoPage />} />
            <Route path="comunidades" element={<div className="p-8 text-white">Comunidades (Detecção de Clusters NetworkX) - Fase 2</div>} />
          </Route>
        </Route>

        {/* User Portal */}
        <Route element={<ProtectedRoute allowedRoles={['student', 'researcher', 'professor']} />}>
          <Route path="/user" element={<UserLayout />}>
            <Route index element={<UserDashboard />} />
            <Route path="matches" element={<UserMatchesPage />} />
            <Route path="ecossistema" element={<UserPlaceholder title="Meu Ecossistema" />} />
            <Route path="comunidades" element={<UserPlaceholder title="Comunidades de Pensamento" />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/cadastro" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
