import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Product, Pet } from '../../types';
import { useCart } from '../../contexts/CartContext';

interface RecommendedProductsProps {
  pets: Pet[];
}

function scoreProduct(product: Product, pets: Pet[]): number {
  if (pets.length === 0) return product.rating * 10;
  let score = 0;
  for (const pet of pets) {
    const petTypeMap: Record<string, string> = { dog: 'dog', cat: 'cat', bird: 'bird', rodent: 'rodent', turtle: 'turtle', fish: 'fish', reptile: 'reptile' };
    const petType = petTypeMap[pet.type];
    if (product.pet_type.includes(petType)) score += 20;
    if (pet.age !== undefined && pet.age !== null) {
      const inAgeRange =
        (product.min_age === null || product.min_age === undefined || pet.age >= product.min_age) &&
        (product.max_age === null || product.max_age === undefined || pet.age <= product.max_age);
      if (inAgeRange) score += 10;
    }
    if (pet.weight !== undefined && pet.weight !== null) {
      const inWeightRange =
        (product.min_weight === null || product.min_weight === undefined || pet.weight >= product.min_weight) &&
        (product.max_weight === null || product.max_weight === undefined || pet.weight <= product.max_weight);
      if (inWeightRange) score += 10;
    }
    if (pet.activity_level && product.activity_levels.includes(pet.activity_level)) score += 8;
  }
  score += product.rating * 5;
  score += Math.min(product.review_count / 10, 10);
  return score;
}

export default function RecommendedProducts({ pets }: RecommendedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, setIsOpen } = useCart();
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase.from('products').select('*, category:categories(*), brand:brands(*)').limit(50);
      if (data) {
        const scored = data.map(p => ({ ...p, score: scoreProduct(p, pets) }));
        scored.sort((a, b) => b.score - a.score);
        setProducts(scored.slice(0, 8));
      }
      setLoading(false);
    };
    fetch();
  }, [pets]);

  const handleAdd = async (product: Product) => {
    await addItem(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
    setIsOpen(true);
  };

  if (loading) return (
    <section className="max-w-7xl mx-auto px-4 my-10">
      <div className="h-8 bg-gray-200 rounded w-64 mb-6 animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse" />)}
      </div>
    </section>
  );

  return (
    <section className="max-w-7xl mx-auto px-4 my-10">
      <div className="flex items-center gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Productos <span style={{ color: '#FFA726' }}>Recomendados</span> para tu Mascota
          </h2>
          {pets.length > 0 && (
            <p className="text-sm text-gray-500">
              Basado en el perfil de: {pets.map(p => p.name).join(', ')}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 border border-gray-100 overflow-hidden group">
            <div className="relative h-36 sm:h-44 overflow-hidden">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              {product.is_featured && (
                <span className="absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: '#FFA726' }}>
                  Destacado
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="text-xs text-gray-500 mb-1 capitalize">{product.brand?.name}</p>
              <h3 className="text-sm font-semibold text-gray-800 leading-tight mb-2 line-clamp-2">{product.name}</h3>
              <div className="flex items-center gap-1 mb-2">
                <Star size={12} fill="#FFA726" style={{ color: '#FFA726' }} />
                <span className="text-xs text-gray-600">{product.rating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({product.review_count})</span>
              </div>
              <p className="font-bold text-base mb-3" style={{ color: '#5DADE2' }}>
                ₡{product.price.toLocaleString('es-CR')}
              </p>
              <button
                onClick={() => handleAdd(product)}
                className="w-full py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: addedId === product.id ? '#4CAF50' : '#5DADE2' }}
              >
                {addedId === product.id ? '¡Agregado!' : 'Agregar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
