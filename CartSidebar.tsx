import { X, Trash2, Plus, Minus, ShoppingBag, CheckCircle } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useState } from 'react';

interface CartSidebarProps {
  onAuthRequired: () => void;
}

export default function CartSidebar({ onAuthRequired }: CartSidebarProps) {
  const {
    items,
    isOpen,
    setIsOpen,
    removeItem,
    updateQuantity,
    toggleSelected,
    selectedTotal
  } = useCart();

  const { user } = useAuth();
  const [purchasing, setPurchasing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePurchase = async () => {
    if (!user) {
      onAuthRequired();
      return;
    }

    const selected = items.filter(i => i.selected);

    if (selected.length === 0) return;

    setPurchasing(true);

    // VALIDAR STOCK ANTES DE CREAR EL PEDIDO
    const productIds = selected.map(i => i.product_id);

    const { data: products, error: stockError } = await supabase
      .from('products')
      .select('id, name, stock')
      .in('id', productIds);

    if (stockError) {
      alert('No se pudo validar el stock.');
      setPurchasing(false);
      return;
    }

    const insufficient = selected.find(item => {
      const product = products?.find(p => p.id === item.product_id);
      return !product || product.stock < item.quantity;
    });

    if (insufficient) {
      const product = products?.find(
        p => p.id === insufficient.product_id
      );

      alert(`No hay suficiente stock para ${product?.name}.`);
      setPurchasing(false);
      return;
    }

    // CREAR PEDIDO
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'pending',
        total: selectedTotal,
      })
      .select('id')
      .single();

    if (!error && order) {
      // INSERTAR PRODUCTOS DEL PEDIDO
      const orderItems = selected.map(i => ({
        order_id: order.id,
        product_id: i.product_id,
        quantity: i.quantity,
        price: i.product?.price || 0,
      }));

      await supabase
        .from('order_items')
        .insert(orderItems);

      // DESCONTAR STOCK
      for (const item of selected) {
        const product = products?.find(
          p => p.id === item.product_id
        );

        if (!product) continue;

        await supabase
          .from('products')
          .update({
            stock: product.stock - item.quantity
          })
          .eq('id', item.product_id);
      }

      // ELIMINAR DEL CARRITO
      for (const i of selected) {
        await removeItem(i.id);
      }

      // MENSAJE DE ÉXITO
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setIsOpen(false);
      }, 3000);
    }

    setPurchasing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      <div className="relative bg-white w-full max-w-md flex flex-col shadow-2xl">
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b border-gray-100"
          style={{ background: '#5DADE2' }}
        >
          <div className="flex items-center gap-2 text-white">
            <ShoppingBag size={20} />
            <h2 className="font-bold text-lg">Mi Carrito</h2>

            {items.length > 0 && (
              <span className="bg-white/30 text-white text-xs px-2 py-0.5 rounded-full">
                {items.length} items
              </span>
            )}
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Success message */}
        {success && (
          <div className="mx-4 mt-4 flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-4">
            <CheckCircle
              size={24}
              className="text-green-500 shrink-0"
            />

            <div>
              <p className="font-semibold text-green-700">
                ¡Compra realizada con éxito!
              </p>

              <p className="text-sm text-green-600">
                Tu pedido está siendo procesado. Estado: Pendiente.
              </p>
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400 py-20">
              <ShoppingBag
                size={56}
                style={{ color: '#5DADE240' }}
              />

              <p className="text-gray-500 font-medium">
                Tu carrito está vacío
              </p>

              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 rounded-full text-white text-sm font-medium"
                style={{ background: '#5DADE2' }}
              >
                Seguir comprando
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {items.map(item => (
                <div
                  key={item.id}
                  className={`flex gap-3 p-3 rounded-2xl border transition-colors ${
                    item.selected
                      ? 'border-[#5DADE2] bg-blue-50/30'
                      : 'border-gray-100 bg-white'
                  }`}
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={e =>
                      toggleSelected(item.id, e.target.checked)
                    }
                    className="mt-1 w-4 h-4 rounded accent-[#5DADE2] shrink-0"
                  />

                  {/* Image */}
                  <img
                    src={item.product?.image_url}
                    alt={item.product?.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
                      {item.product?.name}
                    </p>

                    <p
                      className="text-base font-bold mt-1"
                      style={{ color: '#5DADE2' }}
                    >
                      ₡{(item.product?.price || 0).toLocaleString('es-CR')}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-gray-200 rounded-full overflow-hidden bg-white">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="px-2 py-1 hover:bg-gray-50"
                        >
                          <Minus
                            size={12}
                            className="text-gray-600"
                          />
                        </button>

                        <span className="px-2 text-xs font-bold">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="px-2 py-1 hover:bg-gray-50"
                        >
                          <Plus
                            size={12}
                            className="text-gray-600"
                          />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 rounded-full hover:bg-red-50 text-red-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-gray-400">
                      Subtotal
                    </p>

                    <p className="text-sm font-bold text-gray-800">
                      ₡{(
                        (item.product?.price || 0) * item.quantity
                      ).toLocaleString('es-CR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">
                Total seleccionado
              </span>

              <span
                className="text-2xl font-extrabold"
                style={{ color: '#5DADE2' }}
              >
                ₡{selectedTotal.toLocaleString('es-CR')}
              </span>
            </div>

            <button
              onClick={handlePurchase}
              disabled={
                purchasing ||
                items.filter(i => i.selected).length === 0
              }
              className="w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
              style={{
                background:
                  'linear-gradient(135deg, #5DADE2, #FFA726)'
              }}
            >
              {purchasing
                ? 'Procesando...'
                : `Comprar (${items.filter(i => i.selected).length} items)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}