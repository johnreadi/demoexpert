import React, { ReactNode, useEffect, useMemo, useState } from 'react';
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
  constructor(props: { children: ReactNode }) {
    super(props);
    (this as any).state = { hasError: false };
  }
  static getDerivedStateFromError(_error: Error) {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary', error, info);
  }
  render(): React.ReactNode {
    const s = (this as any).state as { hasError: boolean };
    const p = (this as any).props as { children: ReactNode };
    return s.hasError ? <ErrorFallback /> : p.children;
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

const InstallPrompt: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const coarse = window.matchMedia?.('(pointer: coarse)')?.matches;
    const ua = String(navigator.userAgent || '');
    const mobileUa = /Android|iPhone|iPad|iPod/i.test(ua);
    return Boolean(coarse || mobileUa);
  }, []);

  const isInstalled = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const standalone = window.matchMedia?.('(display-mode: standalone)')?.matches;
    const iosStandalone = Boolean((navigator as any).standalone);
    return Boolean(standalone || iosStandalone);
  }, []);

  const isIos = useMemo(() => {
    const ua = String(navigator.userAgent || '');
    return /iPhone|iPad|iPod/i.test(ua);
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      try { e.preventDefault?.(); } catch {}
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler as any);
    return () => window.removeEventListener('beforeinstallprompt', handler as any);
  }, []);

  if (!isMobile || isInstalled || dismissed) return null;

  const onInstall = async () => {
    if (deferredPrompt?.prompt) {
      try {
        await deferredPrompt.prompt();
        try { await deferredPrompt.userChoice; } catch {}
      } finally {
        setDeferredPrompt(null);
        setDismissed(true);
      }
      return;
    }
    setShowHelp(true);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-expert-blue text-white px-4 py-3 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="text-sm">
            Ajoutez l’application sur votre écran d’accueil pour un accès rapide.
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onInstall} className="bg-white text-expert-blue font-semibold px-3 py-1.5 rounded">
              Installer
            </button>
            <button onClick={() => setDismissed(true)} className="text-white/90 underline text-sm">
              Plus tard
            </button>
          </div>
        </div>
      </div>

      {showHelp && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-bold text-lg">Installer l’application</div>
              <button onClick={() => setShowHelp(false)} className="text-gray-600">✕</button>
            </div>
            <div className="text-sm text-gray-700 space-y-2">
              {isIos ? (
                <>
                  <div>1) Appuyez sur le bouton Partager (⤴︎) dans Safari.</div>
                  <div>2) Choisissez “Sur l’écran d’accueil”.</div>
                </>
              ) : (
                <>
                  <div>1) Ouvrez le menu du navigateur (⋮).</div>
                  <div>2) Choisissez “Installer l’application” ou “Ajouter à l’écran d’accueil”.</div>
                </>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setShowHelp(false)} className="bg-expert-blue text-white px-4 py-2 rounded">
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SettingsProvider>
          <ToastProvider>
            <Router>
            <SeoManager />
            <InstallPrompt />
            <div
              className="flex flex-col min-h-screen"
              onContextMenu={(e) => e.preventDefault()}
            >
              <Header />
              <main className="flex-grow">
                <Routes>
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
