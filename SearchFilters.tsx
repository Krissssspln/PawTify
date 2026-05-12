import { X, SlidersHorizontal, Search } from 'lucide-react';
import { Brand, Category, SearchFilters } from '../../types';
import { useState } from 'react';

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  brands: Brand[];
  categories: Category[];
}

const petTypes = [
  { value: '', label: 'Todas' },
  { value: 'dog', label: 'Perros' },
  { value: 'cat', label: 'Gatos' },
  { value: 'bird', label: 'Aves' },
  { value: 'fish', label: 'Peces' },
  { value: 'rodent', label: 'Roedores' },
  { value: 'turtle', label: 'Tortugas' },
  { value: 'reptile', label: 'Reptiles' },
];

const subcategories = [
  { value: '', label: 'Todas' },
  { value: 'croquetas', label: 'Croquetas' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'huesos', label: 'Huesos' },
  { value: 'galletas', label: 'Galletas' },
  { value: 'húmedo', label: 'Húmedo' },
  { value: 'shampoo', label: 'Shampoo' },
  { value: 'correas', label: 'Correas' },
  { value: 'juguetes', label: 'Juguetes' },
  { value: 'accesorios', label: 'Accesorios' },
  { value: 'antiparasitario', label: 'Antiparasitario' },
  { value: 'suplementos', label: 'Suplementos' },
  { value: 'higiene', label: 'Higiene' },
];

const sortOptions = [
  { value: 'rating', label: 'Popularidad' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'name', label: 'Nombre A-Z' },
];

export default function SearchFiltersPanel({ filters, onFiltersChange, brands, categories }: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const update = (key: keyof SearchFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clear = () => {
    onFiltersChange({ query: '', petType: '', categoryId: '', brandId: '', subcategory: '', presentation: '', sortBy: 'rating' });
  };

  const hasActiveFilters = filters.petType || filters.categoryId || filters.brandId || filters.subcategory || filters.presentation;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
      {/* Search row */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={filters.query}
            onChange={e => update('query', e.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DADE2] transition-colors"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border ${showFilters ? 'text-white border-[#5DADE2]' : 'text-gray-700 border-gray-200 hover:border-[#5DADE2]'}`}
          style={showFilters ? { background: '#5DADE2' } : {}}
        >
          <SlidersHorizontal size={16} /> Filtros
          {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-[#FFA726]" />}
        </button>
        {hasActiveFilters && (
          <button onClick={clear}
            className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-colors">
            <X size={16} /> Limpiar
          </button>
        )}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">Ordenar:</span>
        <div className="flex gap-2 flex-wrap">
          {sortOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => update('sortBy', opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${filters.sortBy === opt.value ? 'text-white border-[#5DADE2]' : 'text-gray-600 border-gray-200 hover:border-[#5DADE2]'}`}
              style={filters.sortBy === opt.value ? { background: '#5DADE2' } : {}}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Pet type */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Mascota</label>
            <select
              value={filters.petType}
              onChange={e => update('petType', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DADE2]"
            >
              {petTypes.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Categoría</label>
            <select
              value={filters.categoryId}
              onChange={e => update('categoryId', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DADE2]"
            >
              <option value="">Todas</option>
              {categories.filter(c => !c.parent_id).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Subcategory */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Subcategoría</label>
            <select
              value={filters.subcategory}
              onChange={e => update('subcategory', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DADE2]"
            >
              {subcategories.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {/* Brand */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Marca</label>
            <select
              value={filters.brandId}
              onChange={e => update('brandId', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DADE2]"
            >
              <option value="">Todas</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          {/* Presentation */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Presentación</label>
            <input
              type="text"
              value={filters.presentation}
              onChange={e => update('presentation', e.target.value)}
              placeholder="Ej: 15kg, 500ml..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DADE2]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
