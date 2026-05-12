import { Page } from '../../types';
import avesImg from '../../assets/aves.jpg';
import hamsterImg from '../../assets/hamster.jpg';

const categories = [
  {
    label: 'Perros',
    petType: 'dog',
    image: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=400',
    color: '#5DADE2',
  },
  {
    label: 'Gatos',
    petType: 'cat',
    image: 'https://images.pexels.com/photos/1741205/pexels-photo-1741205.jpeg?auto=compress&cs=tinysrgb&w=400',
    color: '#FFA726',
  },
  {
    label: 'Aves',
    petType: 'bird',
    image: avesImg,
    color: '#c4e883',
  },
  {
    label: 'Mascotas Pequeñas',
    petType: 'rodent',
    image: hamsterImg,
    color: '#5DADE2',
  },
];

interface CategoryBannerProps {
  onNavigate: (page: Page, filters?: Record<string, string>) => void;
}

export default function CategoryBanner({ onNavigate }: CategoryBannerProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 my-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Explora por <span style={{ color: '#5DADE2' }}>Tipo de Mascota</span>
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map(cat => (
          <button
            key={cat.petType}
            onClick={() => onNavigate('products', { petType: cat.petType })}
            className="group relative h-40 sm:h-48 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
          >
            <img
              src={cat.image}
              alt={cat.label}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div
              className="absolute inset-0 opacity-60"
              style={{ background: `linear-gradient(to top, ${cat.color}ee, transparent)` }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <p className="font-bold text-base sm:text-lg">{cat.label}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
