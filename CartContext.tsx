import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { CartItem, Product } from '../types';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  toggleSelected: (cartItemId: string, selected: boolean) => Promise<void>;
  clearCart: () => Promise<void>;
  selectedTotal: number;
  totalItems: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const ensureCart = async (): Promise<string | null> => {
    if (!user) return null;
    if (cartId) return cartId;
    const { data: existing } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (existing) {
      setCartId(existing.id);
      return existing.id;
    }
    const { data: created } = await supabase
      .from('carts')
      .insert({ user_id: user.id })
      .select('id')
      .single();
    if (created) {
      setCartId(created.id);
      return created.id;
    }
    return null;
  };

  const fetchItems = async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (!cart) { setLoading(false); return; }
    setCartId(cart.id);
    const { data } = await supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('cart_id', cart.id);
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, [user]);

  const addItem = async (product: Product, quantity = 1) => {
    if (!user) return;
    const cid = await ensureCart();
    if (!cid) return;
    const existing = items.find(i => i.product_id === product.id);
    if (existing) {
      await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);
    } else {
      await supabase.from('cart_items').insert({
        cart_id: cid,
        product_id: product.id,
        quantity,
        selected: true,
      });
    }
    await fetchItems();
  };

  const removeItem = async (cartItemId: string) => {
    await supabase.from('cart_items').delete().eq('id', cartItemId);
    setItems(prev => prev.filter(i => i.id !== cartItemId));
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity < 1) return;
    await supabase.from('cart_items').update({ quantity }).eq('id', cartItemId);
    setItems(prev => prev.map(i => i.id === cartItemId ? { ...i, quantity } : i));
  };

  const toggleSelected = async (cartItemId: string, selected: boolean) => {
    await supabase.from('cart_items').update({ selected }).eq('id', cartItemId);
    setItems(prev => prev.map(i => i.id === cartItemId ? { ...i, selected } : i));
  };

  const clearCart = async () => {
    if (!cartId) return;
    await supabase.from('cart_items').delete().eq('cart_id', cartId);
    setItems([]);
  };

  const selectedTotal = items
    .filter(i => i.selected)
    .reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, loading, addItem, removeItem, updateQuantity, toggleSelected,
      clearCart, selectedTotal, totalItems, isOpen, setIsOpen
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
