import { useState } from 'react';
import { Star, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

interface ProductCardProps {
  product: Product;
  onAuthRequired: () => void;
}

export default function ProductCard({ product, onAuthRequired }: ProductCardProps) {
  const { addItem, setIsOpen } = useCart();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = async () => {
    if (!user) { onAuthRequired(); return; }
    await addItem(product, quantity);
    setAdded(true);
    setIsOpen(true);
    setTimeout(() => { setAdded(false); setQuantity(1); }, 1500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5 border border-gray-100 overflow-hidden group flex flex-col">
      {/* Image */}
      <div className="relative h-44 sm:h-52 overflow-hidden bg-gray-50">
        <img
          src={product.image_url || 'https://images.pexels.com/photos/1254140/pexels-photo-1254140.jpeg?auto=compress&cs=tinysrgb&w=400'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {product.is_featured && (
          <span className="absolute top-2 left-2 text-xs font-bold px-2.5 py-1 rounded-full text-white shadow" style={{ background: '#FFA726' }}>
            Destacado
          </span>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute top-2 right-2 text-xs font-bold px-2.5 py-1 rounded-full text-white shadow bg-red-500">
            Últimas {product.stock}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400 font-medium">{product.brand?.name || ''}</span>
          <div className="flex items-center gap-1">
            <Star size={12} fill="#FFA726" style={{ color: '#FFA726' }} />
            <span className="text-xs text-gray-500">{product.rating.toFixed(1)}</span>
          </div>
        </div>

        <h3 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-2 leading-snug flex-1">{product.name}</h3>

        {product.presentation && (
          <span className="text-xs text-gray-400 mb-2">{product.presentation}</span>
        )}

        <div className="mt-auto">
          <p className="font-bold text-lg mb-2" style={{ color: '#5DADE2' }}>
            ₡{product.price.toLocaleString('es-CR')}
          </p>

          {/* Quantity selector */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-2.5 py-1 hover:bg-gray-50 transition-colors"
              >
                <Minus size={14} className="text-gray-600" />
              </button>
              <span className="px-2 py-1 text-sm font-semibold min-w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                className="px-2.5 py-1 hover:bg-gray-50 transition-colors"
              >
                <Plus size={14} className="text-gray-600" />
              </button>
            </div>
            <span className="text-xs text-gray-400">{product.stock} disp.</span>
          </div>

          <button
            onClick={handleAdd}
            disabled={product.stock === 0 || added}
            className="w-full py-2 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: added ? '#4CAF50' : product.stock === 0 ? '#9E9E9E' : '#5DADE2' }}
          >
            <ShoppingCart size={15} />
            {product.stock === 0 ? 'Sin stock' : added ? '¡Agregado!' : 'Agregar al carrito'}
          </button>
        </div>
      </div>
    </div>
  );
}
