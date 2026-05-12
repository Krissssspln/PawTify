import { Instagram, Facebook, Heart, Shield, Truck, Star } from 'lucide-react';

export default function AboutPage() {
  const values = [
    { icon: Heart, title: 'Amor por las Mascotas', desc: 'Cada producto que ofrecemos ha sido seleccionado pensando en el bienestar y felicidad de tus animales.' },
    { icon: Shield, title: 'Calidad Garantizada', desc: 'Solo trabajamos con marcas reconocidas y productos certificados para la salud de tu mascota.' },
    { icon: Truck, title: 'Envío Rápido', desc: 'Entregamos en todo Costa Rica en 24-72 horas con seguimiento en tiempo real de tu pedido.' },
    { icon: Star, title: 'Atención Personalizada', desc: 'Nuestro equipo de expertos te asesora para encontrar el producto ideal para tu mascota.' },
  ];

  return (
    <div>
      {/* Hero banner */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img
          src="https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750"
          alt="Sobre Nosotros"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #5DADE2cc, #FFA726aa)' }}>
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">Sobre Nosotros</h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl drop-shadow">
              La tienda en línea de mascotas más querida de Costa Rica
            </p>
          </div>
        </div>
      </div>

      {/* Story section */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Nuestra <span style={{ color: '#5DADE2' }}>Historia</span>
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              PetShopCR nació en 2014 con una simple misión: hacer que el cuidado de las mascotas sea más fácil,
              accesible y placentero para todas las familias costarricenses. Lo que comenzó como una pequeña tienda
              en San José, se ha convertido en la plataforma en línea de referencia para dueños de mascotas en todo el país.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Contamos con más de 500 productos cuidadosamente seleccionados, trabajamos con las mejores marcas del mundo
              y tenemos un equipo apasionado de más de 30 personas que aman a los animales tanto como tú.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Hoy atendemos a más de 50,000 mascotas registradas y sus familias, y seguimos creciendo gracias a la
              confianza que nuestros clientes depositan en nosotros cada día.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img src="https://images.pexels.com/photos/1882016/pexels-photo-1882016.jpeg?auto=compress&cs=tinysrgb&w=400"
              alt="Perro feliz" className="rounded-2xl h-40 w-full object-cover" />
            <img src="https://images.pexels.com/photos/1741205/pexels-photo-1741205.jpeg?auto=compress&cs=tinysrgb&w=400"
              alt="Gato feliz" className="rounded-2xl h-40 w-full object-cover mt-8" />
            <img src="https://images.pexels.com/photos/4587994/pexels-photo-4587994.jpeg?auto=compress&cs=tinysrgb&w=400"
              alt="Mascota" className="rounded-2xl h-40 w-full object-cover -mt-4" />
            <img src="https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?auto=compress&cs=tinysrgb&w=400"
              alt="Mascota" className="rounded-2xl h-40 w-full object-cover mt-4" />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16" style={{ background: '#F5F7FA' }}>
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
            Nuestros <span style={{ color: '#FFA726' }}>Valores</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(v => (
              <div key={v.title} className="bg-white rounded-2xl p-6 shadow-sm text-center hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'linear-gradient(135deg, #5DADE220, #FFA72620)' }}>
                  <v.icon size={28} style={{ color: '#5DADE2' }} />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16" style={{ background: 'linear-gradient(135deg, #5DADE2, #4A9EC7)' }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {[
              { number: '10+', label: 'Años de experiencia' },
              { number: '50K+', label: 'Mascotas atendidas' },
              { number: '500+', label: 'Productos disponibles' },
              { number: '12', label: 'Marcas top' },
            ].map(stat => (
              <div key={stat.label}>
                <p className="text-4xl font-extrabold mb-2">{stat.number}</p>
                <p className="text-white/80 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social media */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Síguenos en Redes Sociales</h2>
        <p className="text-gray-500 mb-8">Únete a nuestra comunidad y comparte momentos con tus mascotas</p>
        <div className="flex justify-center gap-4">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-8 py-3 rounded-2xl text-white font-semibold shadow-lg hover:scale-105 transition-transform"
            style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
            <Instagram size={22} /> Instagram
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-8 py-3 rounded-2xl text-white font-semibold shadow-lg hover:scale-105 transition-transform"
            style={{ background: '#1877F2' }}>
            <Facebook size={22} /> Facebook
          </a>
        </div>
      </section>
    </div>
  );
}
