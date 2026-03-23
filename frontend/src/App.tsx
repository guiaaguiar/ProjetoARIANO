import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import AcademicosPage from './pages/AcademicosPage';
import EditaisPage from './pages/EditaisPage';
import MatchesPage from './pages/MatchesPage';
import GrafoPage from './pages/GrafoPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/academicos" element={<AcademicosPage />} />
          <Route path="/editais" element={<EditaisPage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/grafo" element={<GrafoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
