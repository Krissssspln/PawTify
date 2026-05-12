import { useEffect, useRef } from 'react';
import { Brand } from '../../types';
import { Page } from '../../types';

interface BrandsCarouselProps {
  brands: Brand[];
  onNavigate: (page: Page, filters?: Record<string, string>) => void;
}

const brandColors = [
  '#5DADE2', '#FFA726', '#c4e883', '#5DADE2', '#FFA726',
  '#c4e883', '#5DADE2', '#FFA726', '#c4e883', '#5DADE2',
  '#FFA726', '#c4e883',
];

export default function BrandsCarousel({ brands, onNavigate }: BrandsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let pos = 0;
    const speed = 0.5;
    let rafId: number;
    const animate = () => {
      pos += speed;
      if (pos >= track.scrollWidth / 2) pos = 0;
      track.style.transform = `translateX(-${pos}px)`;
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [brands]);

  const displayBrands = [...brands, ...brands];

  return (
    <section className="py-10 overflow-hidden" style={{ background: '#F5F7FA' }}>
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Marcas <span style={{ color: '#FFA726' }}>Top</span>
        </h2>
      </div>
      <div className="relative overflow-hidden">
        <div ref={trackRef} className="flex gap-4 w-max">
          {displayBrands.map((brand, i) => (
            <button
              key={`${brand.id}-${i}`}
              onClick={() => onNavigate('products', { brandId: brand.id })}
              className="flex flex-col items-center justify-center w-32 h-24 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer shrink-0 border border-gray-100 hover:border-[#5DADE2]"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-2 text-white font-bold text-lg"
                style={{ background: brandColors[i % brandColors.length] }}
              >
                {brand.name[0]}
              </div>
              <span className="text-xs font-semibold text-gray-700 text-center px-2 leading-tight">{brand.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
