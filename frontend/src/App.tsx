import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import ScanPage from '@/pages/ScanPage';
import ProductPage from '@/pages/ProductPage';
import WatchlistPage from '@/pages/WatchlistPage';
import StrategyPage from '@/pages/StrategyPage';
import AdminPage from '@/pages/AdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Navigate to="/scan" replace />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/strategy/:eventId" element={<StrategyPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
        <BottomNav />
      </ErrorBoundary>
    </BrowserRouter>
  );
}
