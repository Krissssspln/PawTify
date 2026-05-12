import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Page } from '../../types';

interface NavBarProps {
  onNavigate: (page: Page, filters?: Record<string, string>) => void;
}

const subMenuItems = ['Accesorios', 'Alimento', 'Higiene', 'Salud'];

const navItems = [
  { label: 'Perros', petType: 'dog', hasSubmenu: true },
  { label: 'Gatos', petType: 'cat', hasSubmenu: true },
  { label: 'Otras Mascotas', petType: 'other', hasSubmenu: false, children: ['Aves', 'Peces', 'Reptiles', 'Roedores', 'Tortugas'] },
  { label: 'Marcas Top', petType: '', hasSubmenu: false, page: 'products' as Page },
  { label: 'Ofertas', petType: '', hasSubmenu: false, page: 'products' as Page },
  { label: 'Nuestros Servicios', petType: '', hasSubmenu: false, page: 'about' as Page },
  { label: 'Ayuda', petType: '', hasSubmenu: false, page: 'about' as Page },
  { label: 'Blog', petType: '', hasSubmenu: false, page: 'blog' as Page },
  { label: 'Mis Mascotas', petType: '', hasSubmenu: false, page: 'pet-profile' as Page },
];

export default function NavBar({ onNavigate }: NavBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <nav className="hidden md:block border-b border-gray-100 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <ul className="flex items-center gap-0 overflow-x-auto">
          {navItems.map((item) => (
            <li
              key={item.label}
              className="relative group"
              onMouseEnter={() => setActiveMenu(item.label)}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <button
                className="flex items-center gap-1 px-3 py-3.5 text-sm font-medium text-gray-700 hover:text-[#5DADE2] whitespace-nowrap transition-colors border-b-2 border-transparent hover:border-[#5DADE2]"
                onClick={() => {
                  if (item.page) onNavigate(item.page, item.petType ? { petType: item.petType } : {});
                  else if (item.petType && item.petType !== 'other') onNavigate('products', { petType: item.petType });
                }}
              >
                {item.label}
                {(item.hasSubmenu || item.children) && <ChevronDown size={14} />}
              </button>

              {/* Submenu for dogs/cats */}
              {item.hasSubmenu && activeMenu === item.label && (
                <div className="absolute left-0 top-full bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 min-w-44">
                  {subMenuItems.map(sub => (
                    <button
                      key={sub}
                      onClick={() => {
                        onNavigate('products', { petType: item.petType, subcategory: sub.toLowerCase() });
                        setActiveMenu(null);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-[#F5F7FA] hover:text-[#5DADE2] transition-colors"
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}

              {/* Submenu for other pets */}
              {item.children && activeMenu === item.label && (
                <div className="absolute left-0 top-full bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 min-w-44">
                  {item.children.map(child => (
                    <button
                      key={child}
                      onClick={() => {
                        onNavigate('products', { petType: child.toLowerCase().slice(0, -1) });
                        setActiveMenu(null);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-[#F5F7FA] hover:text-[#5DADE2] transition-colors"
                    >
                      {child}
                    </button>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
