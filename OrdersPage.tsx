import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Order, OrderItem } from '../types';
import { Package, Truck, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const loadItems = async (orderId: string) => {
    if (expandedOrder === orderId) { setExpandedOrder(null); return; }
    const { data } = await supabase
      .from('order_items')
      .select('*, product:products(*)')
      .eq('order_id', orderId);
    setOrderItems(prev => ({ ...prev, [orderId]: data || [] }));
    setExpandedOrder(orderId);
  };

  const statusConfig = {
    pending: { label: 'Pendiente', color: '#FFA726', bg: '#FFF3E0', Icon: Clock },
    shipped: { label: 'Enviado', color: '#5DADE2', bg: '#E3F2FD', Icon: Truck },
    delivered: { label: 'Entregado', color: '#4CAF50', bg: '#E8F5E9', Icon: CheckCircle },
  };

  if (!user) return (
    <div className="text-center py-20 text-gray-400">Debes iniciar sesión para ver tus pedidos</div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Mis <span style={{ color: '#5DADE2' }}>Pedidos</span>
      </h1>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package size={56} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No tienes pedidos aún</p>
          <p className="text-sm mt-2">Tus pedidos aparecerán aquí una vez que realices una compra</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const config = statusConfig[order.status];
            const isExpanded = expandedOrder === order.id;
            return (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  onClick={() => loadItems(order.id)}
                  className="w-full p-5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors"
                >
                  {/* Status icon */}
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: config.bg }}>
                    <config.Icon size={22} style={{ color: config.color }} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-xs text-gray-400">#{order.id.slice(0, 8).toUpperCase()}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: config.bg, color: config.color }}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-bold text-lg" style={{ color: '#5DADE2' }}>₡{order.total.toLocaleString('es-CR')}</p>
                    {isExpanded ? <ChevronUp size={16} className="text-gray-400 ml-auto mt-1" /> : <ChevronDown size={16} className="text-gray-400 ml-auto mt-1" />}
                  </div>
                </button>

                {/* Order items */}
                {isExpanded && orderItems[order.id] && (
                  <div className="border-t border-gray-100 p-4 space-y-3">
                    {orderItems[order.id].map(item => (
                      <div key={item.id} className="flex items-center gap-3">
                        <img
                          src={item.product?.image_url}
                          alt={item.product?.name}
                          className="w-14 h-14 rounded-xl object-cover shrink-0"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800">{item.product?.name}</p>
                          <p className="text-xs text-gray-500">Cantidad: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-sm" style={{ color: '#5DADE2' }}>
                          ₡{(item.price * item.quantity).toLocaleString('es-CR')}
                        </p>
                      </div>
                    ))}

                    {/* Progress bar */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        {(['pending', 'shipped', 'delivered'] as const).map((s, i) => (
                          <div key={s} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              ['pending', 'shipped', 'delivered'].indexOf(order.status) >= i ? 'text-white' : 'bg-gray-100 text-gray-400'
                            }`} style={['pending', 'shipped', 'delivered'].indexOf(order.status) >= i ? { background: config.color } : {}}>
                              {i === 0 && <Clock size={14} />}
                              {i === 1 && <Truck size={14} />}
                              {i === 2 && <CheckCircle size={14} />}
                            </div>
                            {i < 2 && <div className="w-16 sm:w-24 h-1 mx-1 rounded-full" style={{
                              background: ['pending', 'shipped', 'delivered'].indexOf(order.status) > i ? config.color : '#E5E7EB'
                            }} />}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 px-2">
                        <span>Pendiente</span>
                        <span>Enviado</span>
                        <span>Entregado</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
