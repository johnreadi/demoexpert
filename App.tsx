import React from 'react';
import { HashRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
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
import TestMinimalApiImport from './TestMinimalApiImport';
import TestApiFunctions from './TestApiFunctions';
import TestApiImportComponent from './test-api-import';
import TestApiOnly from './TestApiOnly';
import TestSpecificApiImport from './TestSpecificApiImport';

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <Routes>
                {/* Test routes for debugging */}
                <Route path="/test-api" element={<TestMinimalApiImport />} />
                <Route path="/test-api-functions" element={<TestApiFunctions />} />
                <Route path="/test-api-import" element={<TestApiImportComponent />} />
                <Route path="/test-api-only" element={<TestApiOnly />} />
                <Route path="/test-specific-api-import" element={<TestSpecificApiImport />} />
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
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute>
                      <AdminPage />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
            <Footer />
            <ChatWidget />
            <BackToTopButton />
          </div>
          <ScrollToTop />
        </Router>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;