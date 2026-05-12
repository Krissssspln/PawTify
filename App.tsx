import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { supabase } from './lib/supabase';
import { Page, Pet } from './types';

import Header from './components/layout/Header';
import NavBar from './components/layout/NavBar';
import Footer from './components/layout/Footer';
import CartSidebar from './components/cart/CartSidebar';
import AuthModal from './components/auth/AuthModal';

import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import AboutPage from './pages/AboutPage';
import BlogFeed from './components/blog/BlogFeed';
import AdminPanel from './components/admin/AdminPanel';
import PetProfileForm from './components/profile/PetProfileForm';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [showAuth, setShowAuth] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [productFilters, setProductFilters] = useState<Record<string, string>>({});
  const [pets, setPets] = useState<Pet[]>([]);
  const [navKey, setNavKey] = useState(0);

  const fetchPets = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('pets').select('*').eq('user_id', user.id);
    setPets(data || []);
  }, [user]);

  useEffect(() => { fetchPets(); }, [fetchPets]);

  const navigate = useCallback((page: Page, filters?: Record<string, string>) => {
    if ((page === 'profile' || page === 'orders' || page === 'pet-profile' || page === 'admin') && !user) {
      setShowAuth(true);
      return;
    }
    if (page === 'admin' && profile?.role !== 'admin') return;
    setCurrentPage(page);
    if (filters) setProductFilters(filters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [user, profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F7FA' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl animate-bounce"
            style={{ background: 'linear-gradient(135deg, #5DADE2, #FFA726)' }}>
            🐾
          </div>
          <p style={{ color: '#5DADE2' }} className="font-semibold">Cargando PetShopCR...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigate} pets={pets} onAuthRequired={() => setShowAuth(true)} />;
      case 'products':
        return <ProductsPage initialFilters={productFilters} searchQuery={searchQuery} onAuthRequired={() => setShowAuth(true)} />;
      case 'blog':
        return (
          <div style={{ background: '#F5F7FA', minHeight: '80vh' }}>
            <div className="max-w-7xl mx-auto px-4 pt-8">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Blog de la <span style={{ color: '#5DADE2' }}>Comunidad</span>
              </h1>
              <p className="text-gray-500 text-sm mb-4">Comparte momentos con tu mascota y conecta con otros dueños</p>
            </div>
            <BlogFeed />
          </div>
        );
      case 'profile':
        return <ProfilePage />;
      case 'orders':
        return <OrdersPage />;
      case 'about':
        return <AboutPage />;
      case 'admin':
        return <AdminPanel />;
      case 'pet-profile':
        return (
          <div className="max-w-4xl mx-auto px-4 py-8" style={{ minHeight: '80vh' }}>
            <PetProfileForm pets={pets} onRefresh={fetchPets} />
          </div>
        );
      default:
        return <HomePage onNavigate={navigate} pets={pets} onAuthRequired={() => setShowAuth(true)} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F5F7FA' }}>
      <Header
        onNavigate={navigate}
        onOpenAuth={() => setShowAuth(true)}
        onSearch={(q) => { setSearchQuery(q); navigate('products'); }}
        currentPage={currentPage}
      />
      <NavBar key={navKey} onNavigate={(page, filters) => { navigate(page, filters); setNavKey(k => k + 1); }} />

      <main className="flex-1">
        {renderPage()}
      </main>

      <Footer onNavigate={navigate} />
      <CartSidebar onAuthRequired={() => setShowAuth(true)} />

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => { fetchPets(); }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
