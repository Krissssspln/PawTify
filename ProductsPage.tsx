import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Product, Brand, Category, SearchFilters } from '../types';
import ProductCard from '../components/products/ProductCard';
import SearchFiltersPanel from '../components/products/SearchFilters';
import { Package } from 'lucide-react';

interface ProductsPageProps {
  initialFilters?: Record<string, string>;
  searchQuery?: string;
  onAuthRequired: () => void;
}

const defaultFilters: SearchFilters = {
  query: '', petType: '', categoryId: '', brandId: '',
  subcategory: '', presentation: '', sortBy: 'rating',
};

export default function ProductsPage({ initialFilters, searchQuery, onAuthRequired }: ProductsPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    ...defaultFilters,
    petType: initialFilters?.petType || '',
    brandId: initialFilters?.brandId || '',
    query: searchQuery || '',
  });

  useEffect(() => {
    const loadMeta = async () => {
      const [b, c] = await Promise.all([
        supabase.from('brands').select('*'),
        supabase.from('categories').select('*'),
      ]);
      setBrands(b.data || []);
      setCategories(c.data || []);
    };
    loadMeta();
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('products')
      .select('*, brand:brands(*), category:categories(*)');

    if (filters.query) query = query.ilike('name', `%${filters.query}%`);
    if (filters.petType) query = query.contains('pet_type', [filters.petType]);
    if (filters.categoryId) query = query.eq('category_id', filters.categoryId);
    if (filters.brandId) query = query.eq('brand_id', filters.brandId);
    if (filters.subcategory) query = query.ilike('subcategory', `%${filters.subcategory}%`);
    if (filters.presentation) query = query.ilike('presentation', `%${filters.presentation}%`);

    if (filters.sortBy === 'rating') query = query.order('rating', { ascending: false });
    else if (filters.sortBy === 'price_asc') query = query.order('price', { ascending: true });
    else if (filters.sortBy === 'price_desc') query = query.order('price', { ascending: false });
    else if (filters.sortBy === 'name') query = query.order('name', { ascending: true });

    const { data, error } = await query;
console.log('PRODUCTS QUERY', { data, error, filters });
setProducts(data || []);
setLoading(false);

  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    if (searchQuery !== undefined) setFilters(prev => ({ ...prev, query: searchQuery }));
  }, [searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" style={{ minHeight: '80vh' }}>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Todos los <span style={{ color: '#5DADE2' }}>Productos</span>
      </h1>

      <SearchFiltersPanel
        filters={filters}
        onFiltersChange={setFilters}
        brands={brands}
        categories={categories}
      />

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-72 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package size={56} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No se encontraron productos</p>
          <p className="text-sm mt-2">Intenta con otros filtros o términos de búsqueda</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{products.length} productos encontrados</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map(p => (
              <ProductCard key={p.id} product={p} onAuthRequired={onAuthRequired} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
