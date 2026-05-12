import { useState, useEffect, useCallback } from 'react';
import { Package, ShoppingBag, Users, Plus, CreditCard as Edit3, Trash2, X, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Product, Order, Brand, Category, Profile } from '../../types';

const subcategoryOptions = [
  'Alimento',
  'Alimento Medicado',
  'Alimento húmedo',
  'Juguetes',
  'Accesorios',
  'Higiene',
  'Salud',
  'Snacks',
];

const presentationOptions = [
  '1 unidad',
  '85g',
  '100g',
  '170g',
  '180g',
  '226g',
  '250ml',
  '355ml',
  '400ml',
  '470ml',
  '500g',
  '2kg',
  '2.5kg',
  '3kg',
  '4kg',
  '5kg',
  '6kg',
  'M',
  'L',
  '5m',
  '4 dosis',
  '3 dosis',
  '60 tabletas',
  '90 chews',
];

type AdminTab = 'products' | 'orders' | 'users';

export default function AdminPanel() {
  const [tab, setTab] = useState<AdminTab>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newBrandName, setNewBrandName] = useState('');
  const [creatingBrand, setCreatingBrand] = useState(false);

  const defaultForm = {
    name: '',
    description: '',
    price: '',
    image_url: '',
    pet_type: [] as string[],
    stock: '',
    rating: '0',
    is_featured: false,
    presentation: '',
    subcategory: '',
    brand_id: '',
    category_id: '',
    activity_levels: [] as string[],
  };

  const [form, setForm] = useState(defaultForm);

  const fetchAll = useCallback(async () => {
  setLoading(true);

  const [p, o, b, c, u] = await Promise.all([
    supabase
      .from('products')
      .select('*, brand:brands(*), category:categories(*)')
      .order('created_at', { ascending: false }),

    supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false }),

    supabase
      .from('brands')
      .select('*'),

    supabase
      .from('categories')
      .select('*'),

    supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false }),
  ]);

  setProducts(p.data || []);
  setOrders(o.data || []);
  setBrands(b.data || []);
  setCategories(c.data || []);
  setUsers(u.data || []);

  setLoading(false);
}, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  const handleSaveProduct = async () => {
    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price) || 0,
      image_url: form.image_url,
      pet_type: form.pet_type,
      stock: parseInt(form.stock) || 0,
      rating: parseFloat(form.rating) || 0,
      is_featured: form.is_featured,
      presentation: form.presentation,
      subcategory: form.subcategory,
      brand_id: form.brand_id || null,
      category_id: form.category_id || null,
      activity_levels: form.activity_levels,
    };

    if (editingProduct) {
      await supabase.from('products').update(payload).eq('id', editingProduct.id);
    } else {
      await supabase.from('products').insert(payload);
    }

    setShowProductForm(false);
    setEditingProduct(null);
    setForm(defaultForm);
    fetchAll();
  };

  const handleCreateBrand = async () => {
    if (!newBrandName.trim()) return;

    setCreatingBrand(true);

    const payload = {
      name: newBrandName.trim(),
      slug: slugify(newBrandName),
      logo_url: '',
    };

    const { error } = await supabase.from('brands').insert(payload);

    if (error) {
      console.error('Error creando marca:', error);
    } else {
      setNewBrandName('');
      fetchAll();
    }

    setCreatingBrand(false);
  };

  const handleEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      description: p.description,
      price: p.price.toString(),
      image_url: p.image_url,
      pet_type: p.pet_type,
      stock: p.stock.toString(),
      rating: p.rating.toString(),
      is_featured: p.is_featured,
      presentation: p.presentation,
      subcategory: p.subcategory,
      brand_id: p.brand_id || '',
      category_id: p.category_id || '',
      activity_levels: p.activity_levels,
    });
    setShowProductForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return;
    await supabase.from('products').delete().eq('id', id);
    fetchAll();
  };

  const handleOrderStatus = async (id: string, status: 'pending' | 'shipped' | 'delivered') => {
    await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, status } : o)));
  };

  const handleSendReset = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    alert('No se pudo enviar el correo de recuperación.');
    return;
  }

  alert('Correo de recuperación enviado correctamente.');
};

  const statusColors: Record<string, string> = {
    pending: '#FFA726',
    shipped: '#5DADE2',
    delivered: '#4CAF50',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    shipped: 'Enviado',
    delivered: 'Entregado',
  };

  const tabs = [
    { id: 'products' as AdminTab, label: 'Productos', icon: Package, count: products.length },
    { id: 'orders' as AdminTab, label: 'Pedidos', icon: ShoppingBag, count: orders.length },
    { id: 'users' as AdminTab, label: 'Usuarios', icon: Users, count: users.length},
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Panel de Administración</h1>

      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              tab === t.id ? 'text-white shadow-sm' : 'text-gray-600 bg-white border border-gray-200 hover:border-[#5DADE2]'
            }`}
            style={tab === t.id ? { background: '#5DADE2' } : {}}
          >
            <t.icon size={16} /> {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-white/30' : 'bg-gray-100'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Cargando...</div>
      ) : (
        <>
          {tab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">{products.length} productos</p>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setForm(defaultForm);
                    setShowProductForm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
                  style={{ background: '#5DADE2' }}
                >
                  <Plus size={16} /> Nuevo Producto
                </button>
              </div>

              {showProductForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                    <button onClick={() => setShowProductForm(false)}>
                      <X size={18} className="text-gray-400" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { key: 'name', label: 'Nombre', type: 'text' },
                      { key: 'price', label: 'Precio (₡)', type: 'number' },
                      { key: 'stock', label: 'Stock', type: 'number' },
                      { key: 'image_url', label: 'URL Imagen', type: 'text' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}</label>
                        <input
                          type={f.type}
                          value={(form as Record<string, unknown>)[f.key] as string}
                          onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DADE2]"
                        />
                      </div>
                    ))}

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Marca</label>
                      <select
                        value={form.brand_id}
                        onChange={e => setForm(p => ({ ...p, brand_id: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DADE2]"
                      >
                        <option value="">Sin marca</option>
                        {brands.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nueva marca</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newBrandName}
                          onChange={e => setNewBrandName(e.target.value)}
                          placeholder="Ej. Hill's"
                          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DADE2]"
                        />
                        <button
                          type="button"
                          onClick={handleCreateBrand}
                          disabled={creatingBrand || !newBrandName.trim()}
                          className="px-3 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
                          style={{ background: '#FFA726' }}
                        >
                          {creatingBrand ? '...' : 'Agregar'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Categoría</label>
                      <select
                        value={form.category_id}
                        onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DADE2]"
                      >
                        <option value="">Sin categoría</option>
                        {categories.filter(c => !c.parent_id).map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subcategoría</label>
                      <select
                        value={form.subcategory}
                        onChange={e => setForm(p => ({ ...p, subcategory: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DADE2]"
                      >
                        <option value="">Selecciona una subcategoría</option>
                        {subcategoryOptions.map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Presentación</label>
                      <select
                        value={form.presentation}
                        onChange={e => setForm(p => ({ ...p, presentation: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DADE2]"
                      >
                        <option value="">Selecciona una presentación</option>
                        {presentationOptions.map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={form.is_featured}
                        onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))}
                        className="accent-[#FFA726]"
                      />
                      <label htmlFor="featured" className="text-sm text-gray-700 font-medium">
                        Producto Destacado
                      </label>
                    </div>

                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Descripción</label>
                      <textarea
                        value={form.description}
                        rows={2}
                        onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DADE2] resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setShowProductForm(false)}
                      className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveProduct}
                      className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold"
                      style={{ background: '#5DADE2' }}
                    >
                      {editingProduct ? 'Actualizar' : 'Crear'} Producto
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: '#F5F7FA' }}>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Producto</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Marca</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Precio</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">Stock</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                            <span className="font-medium text-gray-800 line-clamp-1">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{p.brand?.name || '-'}</td>
                        <td className="px-4 py-3 text-right font-semibold" style={{ color: '#5DADE2' }}>
                          ₡{p.price.toLocaleString('es-CR')}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600 hidden sm:table-cell">{p.stock}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleEdit(p)} className="p-1.5 rounded-lg hover:bg-blue-50 text-[#5DADE2] transition-colors">
                              <Edit3 size={15} />
                            </button>
                            <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'orders' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: '#F5F7FA' }}>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">ID Pedido</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Estado</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Total</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Fecha</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Cambiar Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{o.id.slice(0, 8)}...</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold text-white" style={{ background: statusColors[o.status] }}>
                          {statusLabels[o.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold" style={{ color: '#5DADE2' }}>
                        ₡{o.total.toLocaleString('es-CR')}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">
                        {new Date(o.created_at).toLocaleDateString('es-CR')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {(['pending', 'shipped', 'delivered'] as const).map(s => (
                            <button
                              key={s}
                              onClick={() => handleOrderStatus(o.id, s)}
                              className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                                o.status === s ? 'text-white' : 'text-gray-500 hover:bg-gray-100'
                              }`}
                              style={o.status === s ? { background: statusColors[s] } : {}}
                            >
                              {o.status === s && <Check size={10} className="inline mr-1" />}
                              {statusLabels[s]}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'users' && (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <table className="w-full text-sm">
      <thead>
        <tr style={{ background: '#F5F7FA' }}>
          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Usuario</th>
          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Correo</th>
          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Rol</th>
          <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Acciones</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-gray-50">
        {users.map(user => (
          <tr key={user.id} className="hover:bg-gray-50/50">
            <td className="px-4 py-3">
              <p className="font-semibold text-gray-800">{user.full_name}</p>
              <p className="text-xs text-gray-400">@{user.username}</p>
            </td>

            <td className="px-4 py-3 text-gray-600">
              {user.email}
            </td>

            <td className="px-4 py-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                user.role === 'admin'
                  ? 'bg-orange-100 text-orange-600'
                  : 'bg-blue-100 text-blue-600'
              }`}>
                {user.role === 'admin' ? 'Administrador' : 'Usuario'}
              </span>
            </td>

            <td className="px-4 py-3">
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => handleSendReset(user.email)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                  style={{ background: '#5DADE2' }}
                >
                  Reset contraseña
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

        </>
      )}
    </div>
  );
}
