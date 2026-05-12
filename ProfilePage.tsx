import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Pet } from '../types';
import PetProfileForm from '../components/profile/PetProfileForm';
import { User, Calendar, Shield } from 'lucide-react';
import PetChatbot from '../src/pages/PetChatbot';

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);

  const fetchPets = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('pets').select('*').eq('user_id', user.id).order('created_at');
    setPets(data || []);
  }, [user]);

  useEffect(() => { fetchPets(); }, [fetchPets]);

  if (!user || !profile) return (
    <div className="text-center py-20 text-gray-400">Debes iniciar sesión para ver tu perfil</div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, #5DADE2, #FFA726)' }}>
            {profile.full_name[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">{profile.full_name}</h1>
            <p className="text-gray-500 text-sm mb-3">@{profile.username}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <User size={16} style={{ color: '#5DADE2' }} />
                {profile.email}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={16} style={{ color: '#5DADE2' }} />
                Miembro desde {new Date(profile.created_at).toLocaleDateString('es-CR', { year: 'numeric', month: 'long' })}
              </div>
              <div className="flex items-center gap-1.5">
                <Shield size={16} style={{ color: profile.role === 'admin' ? '#FFA726' : '#5DADE2' }} />
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${profile.role === 'admin' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                  {profile.role === 'admin' ? 'Administrador' : 'Usuario'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pets */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <PetProfileForm pets={pets} onRefresh={fetchPets} />
      </div>
    </div>
  );
}
