```tsx
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Pet } from '../../types';
import { Send } from 'lucide-react';

interface PetChatbotProps {
  pets: Pet[];
}

export default function PetChatbot({ pets }: PetChatbotProps) {
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedPet = pets?.[0] || null;

  const handleAsk = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setReply('');

    try {
      const { data, error } = await supabase.functions.invoke('pet-chatbot', {
        body: {
          message,
          pet: selectedPet,
        },
      });

      if (error) {
        setReply('Error al conectar con el asistente.');
      } else {
        setReply(data.reply);
      }
    } catch {
      setReply('Ocurrió un error inesperado.');
    }

    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Asistente para Mascotas 🐶
      </h2>

      {!selectedPet ? (
        <p className="text-gray-500">
          Primero debes registrar una mascota para usar el asistente.
        </p>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            Consultando para: <strong>{selectedPet.name}</strong>
          </p>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Pregunta algo sobre tu mascota..."
            rows={4}
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#5DADE2]"
          />

          <button
            onClick={handleAsk}
            disabled={loading}
            className="mt-3 px-5 py-2 rounded-xl text-white font-semibold flex items-center gap-2"
            style={{ background: '#5DADE2' }}
          >
            <Send size={16} />
            {loading ? 'Consultando...' : 'Preguntar'}
          </button>

          {reply && (
            <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {reply}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```
