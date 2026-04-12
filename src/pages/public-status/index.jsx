import { useState } from 'react';
import supabase from '../../utils/supabase';
import { statusOptions } from "../../constants/formOptions";
// Ако използваш дати, можеш да ги форматираш по-красиво
import { format } from 'date-fns'; 
import { bg } from 'date-fns/locale';

export default function PublicStatusCheck() {
  const [searchId, setSearchId] = useState('');
  const [animalData, setAnimalData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchId) return;
    
    setLoading(true);
    setError(null);
    setAnimalData(null);

    const { data, error } = await supabase
      .from('td_records')
      .select('name, status, medical_details, data, castrated_at') // Вземаме и датата
      .eq('id', searchId)
      .ilike('name', searchName)
      .single();

    if (error || !data) {
      setError('Не е намерено животно с този номер.');
    } else {
      setAnimalData(data);
    }
    setLoading(false);
  };

  // Намираме етикета и цвета на статуса само ако имаме данни
  const currentStatus = animalData 
    ? statusOptions.find(opt => opt.id === animalData.status) 
    : null;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl border border-slate-100">
      <h2 className="text-xl font-bold mb-4 text-slate-800 text-center">Проверка на статус</h2>
      
      <div className="flex gap-2 mb-4">
        <input 
          type="number" 
          placeholder="Въведете № на пациент..." 
          className="border p-2 flex-1 rounded-lg outline-none focus:ring-2 ring-blue-400 transition-all"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button 
          onClick={handleSearch} 
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? '...' : 'Търси'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center animate-in fade-in zoom-in duration-200">
          {error}
        </div>
      )}

      {animalData && (
        <div className="mt-6 border-t pt-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">Пациент:</span>
              <span className="text-lg font-bold text-slate-800">{animalData.name}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">Текущ статус:</span>
              <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase shadow-sm ${currentStatus?.color || 'bg-slate-100 text-slate-700'}`}>
                {currentStatus?.label || animalData.status}
              </span>
            </div>

            {animalData.castrated_at && (
              <div className="flex justify-between items-center bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                <span className="text-emerald-700 text-sm font-medium">Дата на кастрация:</span>
                <span className="text-emerald-800 font-bold">
                  {new Date(animalData.castrated_at).toLocaleDateString('bg-BG', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            )}

            <div className="text-xs text-center text-slate-400 mt-4 italic">
              * Информацията се обновява в реално време от нашия екип.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}