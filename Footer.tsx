import { Instagram, Facebook } from 'lucide-react';
import { Page } from '../../types';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5DADE2, #FFA726)' }}>
                <span className="text-white font-bold text-xl">🐾</span>
              </div>
              <span className="font-extrabold text-2xl text-white">
                PetShop<span style={{ color: '#FFA726' }}>CR</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Tu tienda en línea de confianza para el cuidado y bienestar de tus mascotas en Costa Rica.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-800 hover:bg-[#5DADE2] transition-colors">
                <Instagram size={18} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-800 hover:bg-[#5DADE2] transition-colors">
                <Facebook size={18} />
              </a>
            </div>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="font-semibold text-white mb-4">Empresa</h4>
            <ul className="space-y-2.5 text-sm">
              <li><button onClick={() => onNavigate('about')} className="hover:text-[#5DADE2] transition-colors">Sobre Nosotros</button></li>
              <li><button onClick={() => onNavigate('about')} className="hover:text-[#5DADE2] transition-colors">Quiénes Somos</button></li>
              <li><button onClick={() => onNavigate('blog')} className="hover:text-[#5DADE2] transition-colors">Blog</button></li>
              <li><button className="hover:text-[#5DADE2] transition-colors">Trabaja con Nosotros</button></li>
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h4 className="font-semibold text-white mb-4">Ayuda</h4>
            <ul className="space-y-2.5 text-sm">
              <li><button className="hover:text-[#5DADE2] transition-colors">Centro de Ayuda</button></li>
              <li><button className="hover:text-[#5DADE2] transition-colors">Contacto</button></li>
              <li><button className="hover:text-[#5DADE2] transition-colors">Preguntas Frecuentes</button></li>
              <li><button onClick={() => onNavigate('orders')} className="hover:text-[#5DADE2] transition-colors">Mis Pedidos</button></li>
            </ul>
          </div>

          {/* Políticas */}
          <div>
            <h4 className="font-semibold text-white mb-4">Políticas</h4>
            <ul className="space-y-2.5 text-sm">
              <li><button className="hover:text-[#5DADE2] transition-colors">Términos y Condiciones</button></li>
              <li><button className="hover:text-[#5DADE2] transition-colors">Políticas de Envío</button></li>
              <li><button className="hover:text-[#5DADE2] transition-colors">Políticas de Devolución</button></li>
              <li><button className="hover:text-[#5DADE2] transition-colors">Privacidad</button></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          <p>© 2024 PetShopCR. Todos los derechos reservados. Hecho con ❤️ en Costa Rica.</p>
        </div>
      </div>
    </footer>
  );
}
