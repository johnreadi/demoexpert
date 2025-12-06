import React, { ReactNode, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PartsCatalogPage from './pages/PartsCatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import VehicleBuybackPage from './pages/VehicleBuybackPage';
import ScrapRemovalPage from './pages/ScrapRemovalPage';
import VHUPage from './pages/VHUPage';
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
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { ToastProvider } from './context/ToastContext';
import LiftRentalPage from './pages/LiftRentalPage';
import BackToTopButton from './components/BackToTopButton';
import RepairsPage from './pages/RepairsPage';
import MaintenancePage from './pages/MaintenancePage';
import TiresPage from './pages/TiresPage';
import AccountPage from './pages/AccountPage';
import FAQPage from './pages/FAQPage';

import TestMinimalApiImport from './TestMinimalApiImport';
import TestApiFunctions from './TestApiFunctions';
import TestApiImportComponent from './test-api-import';
import TestApiOnly from './TestApiOnly';
import TestSpecificApiImport from './TestSpecificApiImport';

// Simple error fallback component
const ErrorFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Oops, something went wrong!</h2>
      <p className="text-gray-700 mb-4">
        We're sorry, but an unexpected error occurred. Please try refreshing the page.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="bg-expert-blue text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
      >
        Refresh Page
      </button>
    </div>
  </div>
);

// Wrapper component with error handling
class ErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    console.error('ErrorBoundary', error);
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary', error, info);
  }
  render(): React.ReactNode {
    return this.state.hasError ? <ErrorFallback /> : this.props.children;
  }
}

// SEO manager: applique title / meta description / keywords à partir des settings
const SeoManager: React.FC = () => {
  const { settings } = useSettings();

  useEffect(() => {
    if (!settings) return;

    const seo = settings.advancedSettings?.seo;
    const baseTitle = seo?.metaTitle || settings.businessInfo?.name || 'Démolition Expert';
    document.title = baseTitle;

    const ensureMeta = (name: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        tag.name = name;
        document.head.appendChild(tag);
      }
      return tag;
    };

    const descTag = ensureMeta('description');
    descTag.content = seo?.metaDescription || '';

    const keywordsTag = ensureMeta('keywords');
    keywordsTag.content = seo?.keywords || '';
  }, [settings]);

  return null;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SettingsProvider>
          <ToastProvider>
            <Router>
            <SeoManager />
            <div
              className="flex flex-col min-h-screen"
              onContextMenu={(e) => e.preventDefault()}
            >
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
                  <Route path="/offres" element={<ErrorBoundary><AuctionsPage /></ErrorBoundary>} />
                  <Route path="/offres/:id" element={<ErrorBoundary><AuctionDetailPage /></ErrorBoundary>} />
                  <Route path="/rachat-vehicule" element={<VehicleBuybackPage />} />
                  <Route path="/enlevement-epave" element={<ScrapRemovalPage />} />
                  <Route path="/vhu" element={<VHUPage />} />
                  <Route path="/pare-brise" element={<WindshieldPage />} />
                  <Route path="/location-pont" element={<LiftRentalPage />} />
                  <Route path="/reparation" element={<RepairsPage />} />
                  <Route path="/entretien" element={<MaintenancePage />} />
                  <Route path="/pneus" element={<TiresPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/faq" element={<FAQPage />} />
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
          </ToastProvider>
        </SettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;