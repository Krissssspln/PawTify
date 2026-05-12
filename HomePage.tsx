import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Brand, Pet, Product } from '../types';
import { Page } from '../types';
import MainCarousel from '../components/home/MainCarousel';
import CategoryBanner from '../components/home/CategoryBanner';
import BrandsCarousel from '../components/home/BrandsCarousel';
import RecommendedProducts from '../components/home/RecommendedProducts';
import ProductCard from '../components/products/ProductCard';

interface HomePageProps {
  onNavigate: (page: Page, filters?: Record<string, string>) => void;
  pets: Pet[];
  onAuthRequired: () => void;
}

export default function HomePage({ onNavigate, pets, onAuthRequired }: HomePageProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [b, p] = await Promise.all([
  supabase.from('brands').select('*'),
  supabase.from('products').select('*, brand:brands(*), category:categories(*)').eq('is_featured', true).order('rating', { ascending: false }).limit(8),
]);

console.log('HOME BRANDS', b);
console.log('HOME FEATURED', p);

setBrands(b.data || []);
setFeaturedProducts(p.data || []);

    };
    fetchData();
  }, []);

  return (
    <div style={{ background: '#F5F7FA' }}>
      <MainCarousel />
      <CategoryBanner onNavigate={onNavigate} />

      <section className="max-w-7xl mx-auto px-4 my-10">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Productos <span style={{ color: '#5DADE2' }}>Destacados</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {featuredProducts.map(p => (
            <ProductCard key={p.id} product={p} onAuthRequired={onAuthRequired} />
          ))}
        </div>
      </section>

      <BrandsCarousel brands={brands} onNavigate={onNavigate} />
      <RecommendedProducts pets={pets} />

      <section
        className="mx-4 my-10 rounded-3xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #5DADE2 0%, #c4e883 100%)' }}
      >
        <img
          src="https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750"
          alt="Sobre Nosotros"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
        />
        <div className="relative p-10 md:p-16 text-white max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
            Tu tienda de confianza para el cuidado de mascotas en Costa Rica
          </h2>
          <p className="text-white/90 mb-6 leading-relaxed">
            En PetShopCR encontrarás todo lo que tu mascota necesita: alimentos de calidad, accesorios, productos de higiene y salud.
            Con más de 10 años de experiencia atendiendo a las familias ticas.
          </p>
          <button
            onClick={() => onNavigate('about')}
            className="px-8 py-3 bg-white rounded-full font-bold text-sm shadow-lg hover:scale-105 transition-transform"
            style={{ color: '#5DADE2' }}
          >
            Conócenos
          </button>
        </div>
      </section>
    </div>
  );
}
