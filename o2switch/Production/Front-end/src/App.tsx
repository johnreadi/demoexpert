import React from 'react';
import { HashRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PartsCatalogPage from './pages/PartsCatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import VehicleBuybackPage from './pages/VehicleBuybackPage';
import ScrapRemovalPage from './pages/ScrapRemovalPage';
import ContactPage from './pages/ContactPage';
import LegalPage from './pages/LegalPage';
import ChatWidget from './components/ChatWidget';
import { ScrollToTop } from './components/ScrollToTop';
import AuctionsPage from './pages/AuctionsPage';
import AuctionDetailPage from './pages/AuctionDetailPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import WindshieldPage from './pages/WindshieldPage';
import RegisterPage from './pages/RegisterPage';
import { SettingsProvider } from './context/SettingsContext';
import LiftRentalPage from './pages/LiftRentalPage';
import BackToTopButton from './components/BackToTopButton';
import RepairsPage from './pages/RepairsPage';
import MaintenancePage from './pages/MaintenancePage';
import TiresPage from './pages/TiresPage';
import AccountPage from './pages/AccountPage';
import { ToastProvider } from './context/ToastContext';

const AppLayout = () => {
    const location = useLocation();
    const isFullScreenRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/connexion') || location.pathname.startsWith('/inscription');

    if (isFullScreenRoute) {
        return <Outlet />; // Render the component without the main layout
    }

    return (
        <div className="flex flex-col min-h-screen bg-expert-light-gray text-expert-gray font-sans">
            <Header />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
            <ChatWidget />
            <BackToTopButton />
        </div>
    );
}

export default function App(): React.ReactNode {
  return (
    <HashRouter>
      <AuthProvider>
        <SettingsProvider>
          <ToastProvider>
            <ScrollToTop />
            <Routes>
              <Route element={<AppLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/pieces" element={<PartsCatalogPage />} />
                  <Route path="/pieces/:id" element={<ProductDetailPage />} />
                  <Route path="/offres" element={<AuctionsPage />} />
                  <Route path="/offres/:id" element={<AuctionDetailPage />} />
                  <Route path="/rachat-vehicule" element={<VehicleBuybackPage />} />
                  <Route path="/enlevement-epave" element={<ScrapRemovalPage />} />
                  <Route path="/pare-brise" element={<WindshieldPage />} />
                  <Route path="/location-pont" element={<LiftRentalPage />} />
                  <Route path="/reparation" element={<RepairsPage />} />
                  <Route path="/entretien" element={<MaintenancePage />} />
                  <Route path="/pneus" element={<TiresPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/mentions-legales" element={<LegalPage type="mentions" />} />
                  <Route path="/cgv" element={<LegalPage type="cgv" />} />
                  <Route path="/confidentialite" element={<LegalPage type="confidentialite" />} />
                  
                  <Route path="/connexion" element={<LoginPage />} />
                  <Route path="/inscription" element={<RegisterPage />} />
                  <Route 
                    path="/compte" 
                    element={
                      <ProtectedRoute>
                        <AccountPage />
                      </ProtectedRoute>
                    } 
                  />
              </Route>
               <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute>
                      <AdminPage />
                    </ProtectedRoute>
                  } 
                />
            </Routes>
          </ToastProvider>
        </SettingsProvider>
      </AuthProvider>
    </HashRouter>
  );
}
