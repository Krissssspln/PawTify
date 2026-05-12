import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Pet } from '../../types';
import { PawPrint, Plus, Trash2 } from 'lucide-react';

interface PetProfileFormProps {
  pets: Pet[];
  onRefresh: () => void;
}

const petTypes = [
  { value: 'dog', label: 'Perro', emoji: '🐕' },
  { value: 'cat', label: 'Gato', emoji: '🐈' },
  { value: 'bird', label: 'Ave', emoji: '🦜' },
  { value: 'rodent', label: 'Roedor', emoji: '🐹' },
  { value: 'turtle', label: 'Tortuga', emoji: '🐢' },
  { value: 'fish', label: 'Pez', emoji: '🐠' },
  { value: 'reptile', label: 'Reptil', emoji: '🦎' },
];

const defaultForm = {
  name: '', type: 'dog', age: '', weight: '', size: 'medium',
  activity_level: 'medium', special_conditions: '', allergies: '',
};

export default function PetProfileForm({ pets, onRefresh }: PetProfileFormProps) {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    if (!user || !form.name) { setError('Por favor ingrese el nombre de la mascota'); return; }
    setSaving(true);
    const { error } = await supabase.from('pets').insert({
      user_id: user.id,
      name: form.name,
      type: form.type,
      age: form.age ? parseFloat(form.age) : null,
      weight: form.weight ? parseFloat(form.weight) : null,
      size: form.size,
      activity_level: form.activity_level,
      special_conditions: form.special_conditions,
      allergies: form.allergies,
    });
    if (error) setError(error.message);
    else {
      setForm(defaultForm);
      setShowForm(false);
      onRefresh();
    }
    setSaving(false);
  };

  const handleDelete = async (petId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta mascota?')) return;
    await supabase.from('pets').delete().eq('id', petId);
    onRefresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <PawPrint size={22} style={{ color: '#5DADE2' }} /> Mis Mascotas
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
          style={{ background: '#5DADE2' }}
        >
          <Plus size={16} /> Agregar Mascota
        </button>
      </div>

      {/* List */}
      {pets.length === 0 && !showForm && (
        <div className="text-center py-12 text-gray-400">
          <PawPrint size={48} className="mx-auto mb-4 opacity-30" />
          <p>No tienes mascotas registradas</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {pets.map(pet => {
          const typeInfo = petTypes.find(t => t.value === pet.type);
          return (
            <div key={pet.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: '#F5F7FA' }}>
                    {typeInfo?.emoji}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{pet.name}</h3>
                    <p className="text-sm text-gray-500">{typeInfo?.label}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(pet.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                {pet.age && <span><strong>Edad:</strong> {pet.age} años</span>}
                {pet.weight && <span><strong>Peso:</strong> {pet.weight} kg</span>}
                {pet.size && <span><strong>Tamaño:</strong> {pet.size === 'small' ? 'Pequeño' : pet.size === 'medium' ? 'Mediano' : 'Grande'}</span>}
                {pet.activity_level && <span><strong>Actividad:</strong> {pet.activity_level === 'low' ? 'Baja' : pet.activity_level === 'medium' ? 'Media' : 'Alta'}</span>}
                {pet.allergies && <span className="col-span-2"><strong>Alergias:</strong> {pet.allergies}</span>}
                {pet.special_conditions && <span className="col-span-2"><strong>Condiciones:</strong> {pet.special_conditions}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-gray-800 mb-4">Nueva Mascota</h3>
          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-xl mb-4">{error}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nombre *</label>
              <input type="text" value={form.name} onChange={e => update('name', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DADE2]" placeholder="Nombre de tu mascota" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tipo *</label>
              <select value={form.type} onChange={e => update('type', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DADE2]">
                {petTypes.map(t => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Edad (años)</label>
              <input type="number" value={form.age} onChange={e => update('age', e.target.value)} min="0" step="0.5"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DADE2]" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Peso (kg)</label>
              <input type="number" value={form.weight} onChange={e => update('weight', e.target.value)} min="0" step="0.1"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DADE2]" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tamaño</label>
              <select value={form.size} onChange={e => update('size', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DADE2]">
                <option value="small">Pequeño</option>
                <option value="medium">Mediano</option>
                <option value="large">Grande</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nivel de Actividad</label>
              <select value={form.activity_level} onChange={e => update('activity_level', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DADE2]">
                <option value="low">Bajo</option>
                <option value="medium">Medio</option>
                <option value="high">Alto</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Condiciones Especiales</label>
              <input type="text" value={form.special_conditions} onChange={e => update('special_conditions', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DADE2]"
                placeholder="Diabetes, artritis, etc." />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Alergias</label>
              <input type="text" value={form.allergies} onChange={e => update('allergies', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DADE2]"
                placeholder="Pollo, trigo, etc." />
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button onClick={() => setShowForm(false)}
              className="flex-1 py-2.5 rounded-xl text-gray-700 text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-70"
              style={{ background: '#5DADE2' }}>
              {saving ? 'Guardando...' : 'Guardar Mascota'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
