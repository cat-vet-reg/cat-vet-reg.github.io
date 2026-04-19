import { useState }       from 'react';
import supabase           from '../../utils/supabase';
import { format }         from 'date-fns'; 
import { bg }             from 'date-fns/locale';
import { TREATMENT_INFO } from './treatmentTexts';
import { POST_OP_GUIDE }  from './postOpInstructions';
import CheckMyAnimals      from './CheckMyAnimals'; 
import CheckMyAppointments from './CheckMyAppointments';
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
          statusDescriptions,
          complicationOptions,
          staffOptions,
          earStatusOptions,
          parasiteOptions,
          discoverySourceOptions,
          reproductiveOptions 
          } from "../../constants/formOptions";

export default function PublicStatusCheck() {
  const [mode, setMode] = useState('initial'); // 'initial', 'animal', 'appointment'
  // Състояния за търсене на животно (ID)
  const [searchId, setSearchId] = useState('');
  const [animalData, setAnimalData] = useState(null);
  // Състояния за търсене на час (Телефон)
  const [phone, setPhone] = useState('');
  const [appointments, setAppointments] = useState(null);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [waitingList, setWaitingList] = useState(null);

  // ЛОГИКА 1: Търсене на животно по ID
  const handleAnimalSearch = async () => {
    if (!searchId) return;
    setLoading(true);
    setError(null);
    setAnimalData(null);

    const { data, error } = await supabase
      .from('td_records')
      .select('name, status, medical_details, data, castrated_at, services, staff_surgeon, gender')
      .eq('id', searchId)
      .single();

    if (error || !data) {
      setError('Не е намерено животно с този номер.');
    } else {
      setAnimalData(data);
    }
    setLoading(false);
  };

  // ЛОГИКА 2: Търсене на часове по телефон
  const handleAppointmentSearch = async () => {
    if (!phone) return;
    setLoading(true);
    setError(null);
    setAppointments(null);
    setWaitingList(null); // Нулираме предишно търсене

    const phoneClean = phone.trim();

    // ПАРАЛЕЛНА ЗАЯВКА 1: Записани часове (td_records)
    const appointmentPromise = supabase
      .from('td_records')
      .select(`
        id, castrated_at, status, species, gender, name,
        td_owners!inner(phone, name)
      `)
      .eq('td_owners.phone', phoneClean)
      .gte('castrated_at', new Date().toISOString().split('T')[0])
      .order('castrated_at', { ascending: true });

    // ПАРАЛЕЛНА ЗАЯВКА 2: Списък на чакащи (td_waiting_list)
    const waitingPromise = supabase
      .from('td_waiting_list')
      .select('*')
      .eq('phone', phoneClean)
      .eq('status', 'waiting'); // Само тези, които още чакат

    const [resAppoint, resWaiting] = await Promise.all([appointmentPromise, waitingPromise]);

    // Обработка на грешки
    if (resAppoint.error && resWaiting.error) {
      setError('Грешка при проверка на данните.');
    } else if (
      (!resAppoint.data || resAppoint.data.length === 0) && 
      (!resWaiting.data || resWaiting.data.length === 0)
    ) {
      setError('Няма намерени записи за този телефонен номер.');
    } else {
      setAppointments(resAppoint.data || []);
      setWaitingList(resWaiting.data || []);
    }

    setLoading(false);
  };

  const resetSearch = (newMode) => {
    setMode(newMode);
    setError(null);
    setAnimalData(null);
    setAppointments(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      {/* ЗАГЛАВИЕ */}
      <div className="max-w-md mx-auto mb-10 text-center">
        <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight uppercase">Портал за клиенти</h1>
        <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full"></div>
      </div>

      {/* ИЗБОР НА РЕЖИМ */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => resetSearch('appointment')}
            className={`p-6 rounded-2xl border-2 transition-all text-left ${
              mode === 'appointment' ? 'border-blue-600 bg-blue-50' : 'border-white bg-white shadow-sm'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg mb-3 flex items-center justify-center ${mode === 'appointment' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}>
              📅
            </div>
            <p className="text-lg font-bold text-slate-900">Моят записан час</p>
            <p className="text-slate-500 text-xs">Провери дата и инструкции за прием</p>
          </button>

          <button
            onClick={() => resetSearch('animal')}
            className={`p-6 rounded-2xl border-2 transition-all text-left ${
              mode === 'animal' ? 'border-blue-600 bg-blue-50' : 'border-white bg-white shadow-sm'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg mb-3 flex items-center justify-center ${mode === 'animal' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}>
              🐾
            </div>
            <p className="text-lg font-bold text-slate-900">Моето животно</p>
            <p className="text-slate-500 text-xs">Статус и грижи след операция</p>
          </button>
        </div>
      </div>

      {/* ФОРМИ ЗА ТЪРСЕНЕ */}
      <div className="max-w-md mx-auto mb-12">
        {mode === 'animal' && (
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-300">
            <h2 className="text-sm font-bold mb-4 text-slate-400 uppercase tracking-widest text-center">Номер на животното от талона</h2>
            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder="Напр. 4502..." 
                className="border p-3 flex-1 rounded-xl outline-none focus:ring-2 ring-blue-400"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnimalSearch()}
              />
              <button onClick={handleAnimalSearch} disabled={loading} className="bg-blue-600 text-white px-6 rounded-xl font-bold">
                {loading ? '...' : 'Търси'}
              </button>
            </div>
          </div>
        )}

        {mode === 'appointment' && (
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-300">
            <h2 className="text-sm font-bold mb-4 text-slate-400 uppercase tracking-widest text-center">Телефонен номер</h2>
            <div className="flex gap-2">
              <input 
                type="tel" 
                placeholder="08XXXXXXXX" 
                className="border p-3 flex-1 rounded-xl outline-none focus:ring-2 ring-blue-400"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAppointmentSearch()}
              />
              <button onClick={handleAppointmentSearch} disabled={loading} className="bg-blue-600 text-white px-6 rounded-xl font-bold">
                {loading ? '...' : 'Виж часовете'}
              </button>
            </div>
          </div>
        )}

        {error && <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm text-center font-medium">{error}</div>}
      </div>

      {/* ВИЗУАЛИЗАЦИЯ НА РЕЗУЛТАТИТЕ */}
      {animalData && <CheckMyAnimals animalData={animalData} />}
      <CheckMyAppointments 
        appointments={appointments} 
        waitingList={waitingList} 
      />
    </div>
  );
}