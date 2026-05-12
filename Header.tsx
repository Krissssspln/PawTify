import { useState } from 'react';
import { ShoppingCart, User, Search, Menu, X, LogOut, Settings, Package } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { Page } from '../../types';
import logoImg from '../../assets/logo.png';

interface HeaderProps {
  onNavigate: (page: Page) => void;
  onOpenAuth: () => void;
  onSearch: (query: string) => void;
  currentPage: Page;
}

export default function Header({ onNavigate, onOpenAuth, onSearch, currentPage }: HeaderProps) {
  const { user, profile, signOut } = useAuth();
  const { totalItems, setIsOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    onNavigate('products');
  };

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    onNavigate('home');
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer shrink-0"
            onClick={() => onNavigate('home')}
          >
            <img 
              src={logoImg} 
              alt="Logo" 
              style={{ width: '250px', height: 'auto' }} 
              className="object-contain" 
            />
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex items-center">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar productos, marcas, categorías..."
                className="w-full pl-4 pr-12 py-2.5 rounded-full border-2 text-sm focus:outline-none transition-colors"
                style={{ borderColor: '#5DADE2' }}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-white"
                style={{ background: '#5DADE2' }}
              >
                <Search size={16} />
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ShoppingCart size={22} style={{ color: '#5DADE2' }} />
              {totalItems > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold"
                  style={{ background: '#FFA726' }}
                >
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>

            {/* User */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: '#5DADE2' }}>
                    {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700 max-w-24 truncate">
                    {profile?.full_name?.split(' ')[0] || 'Usuario'}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-semibold text-gray-800 text-sm">{profile?.full_name}</p>
                      <p className="text-xs text-gray-500">{profile?.email}</p>
                    </div>
                    <button onClick={() => { onNavigate('profile'); setShowUserMenu(false); }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <User size={16} style={{ color: '#5DADE2' }} /> Mi Perfil
                    </button>
                    <button onClick={() => { onNavigate('orders'); setShowUserMenu(false); }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Package size={16} style={{ color: '#5DADE2' }} /> Mis Pedidos
                    </button>
                    {profile?.role === 'admin' && (
                      <button onClick={() => { onNavigate('admin'); setShowUserMenu(false); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <Settings size={16} style={{ color: '#FFA726' }} /> Administración
                      </button>
                    )}
                    <button onClick={handleSignOut}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      <LogOut size={16} /> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #5DADE2, #4A9EC7)' }}
              >
                <User size={16} /> Ingresar
              </button>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={handleSearch} className="flex md:hidden mt-2">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full pl-4 pr-12 py-2 rounded-full border-2 text-sm focus:outline-none"
              style={{ borderColor: '#5DADE2' }}
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-white" style={{ background: '#5DADE2' }}>
              <Search size={14} />
            </button>
          </div>
        </form>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3">
          {[
            { label: 'Inicio', page: 'home' as Page },
            { label: 'Productos', page: 'products' as Page },
            { label: 'Blog', page: 'blog' as Page },
            { label: 'Sobre Nosotros', page: 'about' as Page },
          ].map(item => (
            <button
              key={item.page}
              onClick={() => { onNavigate(item.page); setMobileMenuOpen(false); }}
              className={`text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${currentPage === item.page ? 'text-white' : 'text-gray-700 hover:bg-gray-50'}`}
              style={currentPage === item.page ? { background: '#5DADE2' } : {}}
            >
              {item.label}
            </button>
          ))}
          {!user ? (
            <button onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
              className="px-4 py-2 rounded-full text-white text-sm font-semibold"
              style={{ background: '#5DADE2' }}>
              Ingresar / Registrarse
            </button>
          ) : (
            <button onClick={handleSignOut} className="text-left px-3 py-2 text-sm text-red-500 font-medium">
              Cerrar sesión
            </button>
          )}
        </div>
      )}
    </header>
  );
}