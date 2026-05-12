import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import gatounoImg from '../../assets/loveuno.jpg';
import perrounoImg from '../../assets/pelusauno.png';
import picopImg from '../../assets/picop.jpg';
import veterinarioImg from '../../assets/veterinario.jpg';

const slides = [
  {
    id: 1,
     title: 'Nutrición premium para tu perro',
    subtitle: 'Los mejores alimentos de marcas reconocidas mundialmente',
    cta: 'Ver Productos',
    image: perrounoImg,
    bg: 'linear-gradient(135deg, #5DADE2 0%, #2E86C1 100%)',
    // AQUÍ CAMBIAS LA POSICIÓN: puede ser 'top', 'bottom', 'left', 'right', 'center'
    // o incluso porcentajes como '50% 20%', 0 y 100 es como lo tenia
    position: 'top', 
  },
  {
    id: 2,
    title: 'Nutrición premium para tu gato',
    subtitle: 'Los mejores alimentos de marcas reconocidas mundialmente',
    cta: 'Ver Productos',
    image: gatounoImg,
    bg: 'linear-gradient(135deg, #FFA726 40%, #FB8C00 80%)',
    // AQUÍ CAMBIAS LA POSICIÓN: puede ser 'top', 'bottom', 'left', 'right', 'center'
    // o incluso porcentajes como '50% 20%', 0 y 100 es como lo tenia
    position: 'top', 
  },
  {
    id: 3,
    title: 'Nutrición premium para tu ave',
    subtitle: 'Los mejores alimentos de marcas reconocidas mundialmente',
    cta: 'Ver Productos',
    image: picopImg,
    bg: 'linear-gradient(135deg, #c4e883 0%, #8BC34A 100%)',
    // AQUÍ CAMBIAS LA POSICIÓN: puede ser 'top', 'bottom', 'left', 'right', 'center'
    // o incluso porcentajes como '50% 20%', 0 y 100 es como lo tenia
    position: 'top', 
  },
  {
    id: 4,
    title: 'Cuida la salud de tu mascota',
    subtitle: 'Vitaminas, suplementos y productos de salud',
    cta: 'Ver Salud',
    image: veterinarioImg,
    bg: 'linear-gradient(135deg, #5DADE2 0%, #c4e883 100%)',
    position: 'center',
  },
  {
    id: 5,
    title: 'Accesorios y Juguetes',
    subtitle: 'Mantén a tu mascota feliz y entretenida',
    cta: 'Ver Accesorios',
    image: 'https://images.pexels.com/photos/1543793/pexels-photo-1543793.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    bg: 'linear-gradient(135deg, #FFA726 0%, #5DADE2 100%)',
    position: 'center',
  },
];

export default function MainCarousel() {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const next = useCallback(() => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(c => (c + 1) % slides.length);
      setTransitioning(false);
    }, 300);
  }, [transitioning]);

  const prev = useCallback(() => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(c => (c - 1 + slides.length) % slides.length);
      setTransitioning(false);
    }, 300);
  }, [transitioning]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <div className="relative h-64 sm:h-80 md:h-96 lg:h-[450px] overflow-hidden rounded-2xl mx-4 mt-4 shadow-xl">
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${transitioning ? 'opacity-0' : 'opacity-100'}`}
        style={{ background: slide.bg }}
      >
        <img
          src={slide.image}
          alt={slide.title}
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
          // Usamos la posición definida en el objeto, si no existe por defecto es center
          style={{ objectPosition: slide.position || 'center' }}
          loading="lazy"
        />
        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-3 leading-tight drop-shadow-lg">
            {slide.title}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-white/90 mb-6 drop-shadow">
            {slide.subtitle}
          </p>
          <button className="self-start px-6 py-2.5 bg-white rounded-full font-semibold text-sm transition-transform hover:scale-105 shadow-lg"
            style={{ color: '#5DADE2' }}>
            {slide.cta}
          </button>
        </div>
      </div>

      {/* Controls */}
      <button onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
        <ChevronLeft size={20} style={{ color: '#5DADE2' }} />
      </button>
      <button onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
        <ChevronRight size={20} style={{ color: '#5DADE2' }} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all ${i === current ? 'w-8 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
}