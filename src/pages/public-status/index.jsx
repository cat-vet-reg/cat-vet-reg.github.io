import { useState } from 'react';
import supabase from '../../utils/supabase';
// Ако използваш дати, можеш да ги форматираш по-красиво
import { format } from 'date-fns'; 
import { bg } from 'date-fns/locale';
import { TREATMENT_INFO } from './treatmentTexts';
import {  speciesOptions,
          genderOptions,
          spicyOptions,
          bcsScores,
          getBcsDescription,
          ageUnitOptions, 
          colorOptions,
          colorStyles,
          habitat,
          origin,
          generalConditionOptions, 
          statusOptions, 
          complicationOptions,
          staffOptions,
          earStatusOptions,
          parasiteOptions,
          discoverySourceOptions,
          reproductiveOptions 
          } from "../../constants/formOptions";

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
      .select('name, status, medical_details, data, castrated_at, services, staff_surgeon')
      .eq('id', searchId) // Търсим само по ID
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
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      {/* СЕКЦИЯ ТЪРСЕНЕ - остава отгоре */}
      <div className="max-w-md mx-auto mb-8 p-6 bg-white shadow-lg rounded-xl border border-slate-100">
        <h2 className="text-xl font-bold mb-4 text-slate-800 text-center">Въведете номера от Вашия талон за прием</h2>
        <div className="flex gap-2">
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 font-bold"
          >
            {loading ? '...' : 'Търси'}
          </button>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center font-medium">
            {error}
          </div>
        )}
      </div>

      {/* РЕЗУЛТАТИ - Новият дизайн с две колони */}
      {animalData && (
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 animate-in fade-in duration-500">
          
          {/* ЛЯВА КОЛОНА: КАРТА СЪС СТАТУС */}
          <div className="md:w-1/3 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 self-start">
            <div className="text-center mb-6 border-b pb-4">
              <span className="text-slate-400 text-[10px] uppercase tracking-[0.2em]">Пациент</span>
              <h1 className="text-2xl font-black text-slate-800 mt-1">{animalData.name}</h1>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 text-xs">Текущ статус:</span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-sm ${currentStatus?.color || 'bg-slate-100'}`}>
                  {currentStatus?.label || animalData.status}
                </span>
              </div>

              {animalData.castrated_at && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-emerald-700 text-[10px] uppercase font-bold block mb-1">Дата на процедура:</span>
                  <span className="text-emerald-900 font-bold text-sm">
                    {new Date(animalData.castrated_at).toLocaleDateString('bg-BG', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </span>
                </div>
              )}

              {animalData.staff_surgeon && (
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <span className="text-blue-700 text-[10px] uppercase font-bold block mb-1">Лекуващ лекар:</span>
                  <span className="text-blue-900 font-bold text-sm">
                    {staffOptions.find(opt => opt.value === animalData.staff_surgeon)?.label || "---"}
                  </span>
                </div>
              )}

              {/* СПИСЪК ПРОЦЕДУРИ */}
              <div className="pt-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Извършени днес:</h3>
                <div className="flex flex-wrap gap-2">
                  {animalData.services?.map(s => (
                    <span key={s} className="bg-slate-100 text-slate-700 text-[10px] px-2 py-1 rounded-md font-bold">
                      {s}
                    </span>
                  )) || <span className="text-slate-400 italic text-xs">Стандартен преглед</span>}
                </div>
              </div>
            </div>
            
            <p className="text-[10px] text-center text-slate-400 mt-8 italic">
               * Информацията се обновява в реално време.
            </p>
          </div>

          {/* ДЯСНА КОЛОНА: ИНФОРМАЦИЯ И ГРИЖИ */}
          <div className="md:w-2/3 space-y-6">
            <h2 className="text-xl font-bold text-slate-800 border-l-4 border-blue-600 pl-4 mb-6">
              Детайли за днешните процедури:
            </h2>

            {animalData.services?.map(serviceKey => {
              const info = TREATMENT_INFO[serviceKey];
              if (!info) return null;

              return (
                <div key={serviceKey} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{info.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm mb-4">
                    {info.description}
                  </p>
                  {info.care && (
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
                      <span className="text-xl">💡</span>
                      <div className="text-xs text-amber-900 leading-normal italic">
                        <strong className="block not-italic mb-1 text-amber-800">Важно за възстановяването:</strong>
                        {info.care}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* ОБЩИ ИНСТРУКЦИИ - Винаги тук */}
            <div className="bg-slate-800 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  🏠 Грижа у дома след изписване
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm opacity-90">
                  <div className="flex gap-2">
                    <span className="text-blue-400">✔</span>
                    <p>Осигурете топло и тихо място за почивка без стълби.</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-blue-400">✔</span>
                    <p>Предложете вода и малко храна чак вечерта.</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-blue-400">✔</span>
                    <p>Следете оперативната рана да бъде чиста и суха.</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-blue-400">✔</span>
                    <p>При въпроси, не се колебайте да ни потърсите.</p>
                  </div>
                </div>
               </div>
               {/* Декоративен елемент */}
               <div className="absolute -right-10 -bottom-10 opacity-10 scale-150 rotate-12">
                 <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}