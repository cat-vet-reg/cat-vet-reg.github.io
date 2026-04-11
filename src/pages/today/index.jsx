import React, { useState, useEffect }    from 'react';
import { useRef }                           from 'react';
import { useNavigate } from 'react-router-dom';
import Header   from "../../components/ui/Header";
import Icon     from "../../components/AppIcon";
import Button   from '../../components/ui/Button'; 
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

import { breedOptions } from "../../constants/breed_options";
import { cityOptions  } from "../../constants/city_options";
import supabase         from "../../utils/supabase";
import AnimalDataCell from './components/AnimalDataCell';
import SurgeryTimers from './components/SurgeryTimers';

const Today = () => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const todayDate = new Date().toISOString().replace(/T.*/,'').split('-').reverse().join('.');
  const [scrollPos, setScrollPos] = useState(0);
  const tableRef = useRef(null);

  // Състояние за това коя клетка се редактира в момента
  const [editing, setEditing] = useState({ id: null, field: null });

  // loadData - Вади от td_records животните за деня
  const loadData = async () => {
    setLoading(true);

    // 1. Създаваме дата в местно време (YYYY-MM-DD)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    const localToday = `${year}-${month}-${day}`; // Пример: "2026-04-11"

    // 2. Филтрираме директно чрез сравнение на стрингове
    // Понеже PostgreSQL (Supabase) съхранява датите като текст/timestamp,
    // можем да кажем: "всичко от 00:00 днес" до "23:59 днес"
    
    const { data, error } = await supabase
      .from('td_records')
      .select(`*, owner:owner_id (name, phone)`)
      .gte('castrated_at', `${localToday}T00:00:00`)
      .lte('castrated_at', `${localToday}T23:59:59`)
      .order('castrated_at', { ascending: true });

    if (error) {
      console.error("Грешка при зареждане:", error);
    } else {
      setAnimals(data);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // handleUpdateField - Обновява обектите в таблицата при редакция

  const handleUpdateField = async (id, field, value, path = null) => { 
    const animal = animals.find(a => a.id === id);
    let updatePayload = {};

    if (path === 'data') {
      updatePayload = { data: { ...animal.data, [field]: value } };
    } else if (path === 'medical_details') {
      updatePayload = { medical_details: { ...animal.medical_details, [field]: value } };
    } else {
      // Ако path е null или 'status', записваме директно в колоната
      updatePayload = { [field]: value };
    }
    const { error } = await supabase
      .from('td_records')
      .update(updatePayload)
      .eq('id', id);

    if (!error) {
      setAnimals(prev => prev.map(a => a.id === id ? { ...a, ...updatePayload } : a));
      setEditing({ id: null, field: null });
    } else {
      console.error("Грешка при запис:", error);
    }
  };

  // calculateDose Смята дозировката на упойката
  const calculateDose = (animal) => {
    const weight = animal.data?.weight || 0;
    const species = animal.species?.toLowerCase();
    
    // Определяне на името на упойката
    const drugName = species === 'cat' || species === 'котка' ? 'Kitty magic' : 'TZXB';
    
    return {
      name: drugName,
      min: (weight * 0.01).toFixed(2),
      standard: (weight * 0.03).toFixed(2),
      max: (weight * 0.035).toFixed(2)
    };
  };


  const scroll = (direction) => {
    if (tableRef.current) {
      const scrollAmount = 200; // Колко пиксела да премества всяко кликване
      tableRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) return <div className="p-10 text-center">Зареждане на пациенти...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-slate-800">Операционен блок - Днес <span className='text-xs'>({todayDate})</span></h1>
        
        {/* СТРЕЛКИ ЗА НАВИГАЦИЯ - виждат се само на мобилни (md:hidden) */}
        <div className="flex md:hidden justify-between items-center mb-4 bg-white p-2 rounded-lg shadow-sm border">
          <button 
            onClick={() => scroll('left')}
            className="p-2 bg-slate-100 rounded-full active:bg-slate-200"
          >
            <Icon name="ChevronLeft" size={24} />
          </button>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Плъзнете таблицата →
          </span>
          <button 
            onClick={() => scroll('right')}
            className="p-2 bg-slate-100 rounded-full active:bg-slate-200"
          >
            <Icon name="ChevronRight" size={24} />
          </button>
        </div>

        {/*МОБИЛНА ВЕРСИЯ*/}
        {/* <div className="block md:hidden">
          <div className="mt-4 md:mt-8 bg-card rounded-lg shadow-sm border overflow-hidden">
            <table className="w-full border-collapse block md:table">
              <thead className="hidden md:table-header-group">
                <tr className="bg-gray-100 text-slate-600 text-sm">
                  <th className="border p-2 text-left">Данни животно и собственик</th>
                  <th className="border p-2 text-left">Услуги</th>
                  <th className="border p-2 text-left">Преглед</th>
                  <th className="border p-2 text-left">Пол</th>
                  <th className="border p-2 text-left">кг</th>
                  <th className="border p-2 text-left">Упойка (мл)</th>
                  <th className="border p-2 text-left">Операция - таймери</th>
                  <th className="border p-2 text-left">Статус</th>
                  <th className="border p-2 text-left">Персонал</th>
                </tr>
              </thead>

              <tbody className="block md:table-row-group">
                {animals.map((animal) => {
                  const currentStatus = statusOptions.find(opt => opt.id === animal.status);

                  return (
                    <tr 
                      key={animal.id} 
                      className="block md:table-row mb-4 md:mb-0 border-b md:border-b-0 hover:bg-slate-50 transition-colors bg-white md:bg-transparent"
                    >
                      <td className="block md:table-cell border-none md:border p-3 align-top bg-slate-50 md:bg-transparent">
                        <div className="md:hidden text-[10px] uppercase text-gray-400 font-bold mb-1">Пациент</div>
                        <AnimalDataCell 
                          animal={animal} 
                          editing={editing}
                          setEditing={setEditing}
                          handleUpdateField={handleUpdateField} 
                        />
                      </td>

                      
                      <td className="block md:table-cell border-none md:border p-3">
                        <div className="md:hidden text-[10px] uppercase text-gray-400 font-bold mb-1">Услуги</div>
                        <div className="flex flex-wrap gap-1">
                          {animal.services?.map((s, i) => (
                            <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">{s}</span>
                          )) || <span className="text-gray-400 text-xs">Стандарт</span>}
                        </div>
                      </td>

                      <td className="block md:table-cell border-none md:border p-3 align-top">
                        <div className="md:hidden text-[10px] uppercase text-gray-400 font-bold mb-1">Бележки от преглед</div>
                        {editing.id === animal.id && editing.field === 'notes' ? (
                          <textarea
                            className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                            defaultValue={animal.data?.notes || ""}
                            autoFocus
                            onBlur={(e) => handleUpdateField(animal.id, "notes", e.target.value, 'data')}
                          />
                        ) : (
                          <div 
                            onClick={() => setEditing({ id: animal.id, field: 'notes' })}
                            className="cursor-pointer p-2 rounded bg-yellow-50/50 md:bg-transparent border border-dashed border-yellow-200 md:border-none"
                          >
                            <small className={`block text-sm ${!animal.data?.notes ? 'text-gray-400 italic' : 'text-slate-600'}`}>
                              {animal.data?.notes || "Добави бележки..."}
                            </small>
                          </div>
                        )}
                      </td>

                      <td className="block md:table-cell border-none md:border p-3">
                        <div className="grid grid-cols-3 gap-2 md:block">
                          
                          <div>
                            <div className="md:hidden text-[10px] uppercase text-gray-400 font-bold mb-1">Пол</div>
                            <div 
                              onClick={() => setEditing({ id: animal.id, field: 'gender' })}
                              className={`text-sm font-medium ${animal.gender === 'female' ? 'text-pink-600' : 'text-blue-600'}`}
                            >
                              {animal.gender === 'female' ? '♀ Женски' : '♂ Мъжки'}
                            </div>
                          </div>

                          
                          <div>
                            <div className="md:hidden text-[10px] uppercase text-gray-400 font-bold mb-1">Тегло</div>
                            <div 
                              onClick={() => setEditing({ id: animal.id, field: 'weight' })}
                              className="text-sm font-mono font-bold"
                            >
                              {animal.data?.weight ? `${animal.data.weight} кг` : '---'}
                            </div>
                          </div>

                          
                          <div>
                            <div className="md:hidden text-[10px] uppercase text-gray-400 font-bold mb-1">Статус</div>
                            <span 
                              onClick={() => setEditing({ id: animal.id, field: 'status' })}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${currentStatus?.color || 'bg-slate-100'}`}
                            >
                              {currentStatus?.label || animal.status}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="block md:table-cell border-none md:border p-3 bg-blue-50/30 md:bg-transparent">
                        <div className="md:hidden text-[10px] uppercase text-gray-400 font-bold mb-1">Упойка (Индукция)</div>
                        <div className="flex items-center gap-4 md:flex-col md:gap-1">
                          
                          <span className="text-blue-700 font-bold">{animal.medical_details?.induction_dose || "0.00"} ml</span>
                          <span className="text-[10px] text-gray-500 italic">({animal.data?.weight} кг)</span>
                        </div>
                      </td>

                      
                      <td className="block md:table-cell border-none md:border p-3">
                        <div className="md:hidden text-[10px] uppercase text-gray-400 font-bold mb-2">Време на операция</div>
                        <SurgeryTimers 
                          animal={animal} 
                          editing={editing} 
                          setEditing={setEditing} 
                          handleUpdateField={handleUpdateField}
                        />
                      </td>

                      
                      <td className="block md:table-cell border-none md:border p-3 bg-slate-50 md:bg-transparent">
                        <div className="md:hidden text-[10px] uppercase text-gray-400 font-bold mb-2">Екип</div>
                        <div className="grid grid-cols-2 md:flex md:flex-col gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">Хирург:</span>
                            <span className="font-bold text-blue-700">
                              {staffOptions.find(opt => opt.value === animal.staff_surgeon)?.label || "---"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">Приел:</span>
                            <span>{staffOptions.find(opt => opt.value === animal.medical_details?.staff_received)?.label || "---"}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div> */}

        {/*ДЕСКТОП ВЕРСИЯ*/}
        <div className="mt-8 bg-card rounded-lg shadow-warm border overflow-hidden">
          <div 
            ref={tableRef}
            className="overflow-x-auto snap-x snap-mandatory"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left snap-start">Данни животно и собственик</th>
                  <th className="border p-2 text-left snap-start">Услуги</th>
                  <th className="border p-2 text-left snap-start">Преглед</th>
                  <th className="border p-2 text-left snap-start">Пол</th>
                  <th className="border p-2 text-left snap-start">кг</th>
                  <th className="border p-2 text-left snap-start">Упойка (мл)</th>
                  <th className="border p-2 text-left snap-start">Операция - таймери</th>
                  <th className="border p-2 text-left snap-start">Статус</th>
                  <th className="border p-2 text-left snap-start">Хирург</th>
                </tr>
              </thead>
              <tbody>
                {animals.map((animal) => {
                  // 1. ТУК ДЕФИНИРАМЕ ПРОМЕНЛИВАТА ЗА ВСЯКО ЖИВОТНО
                  const currentStatus = statusOptions.find(opt => opt.id === animal.status);

                  // 2. ИЗПОЛЗВАМЕ RETURN, ЗА ДА ВЪРНЕМ ТАБЛИЦАТА
                  return (
                  <tr key={animal.id} className="hover:bg-slate-50 transition-colors">
                    {/*ДАННИ ЖВ, СОБСТВ.*/}
                    <td className="snap-start border p-3 min-w-[320px] align-top">
                      <AnimalDataCell key={animal.id} 
                                      animal={animal} 
                                      editing={editing}
                                      setEditing={setEditing}
                                      handleUpdateField={handleUpdateField} />
                    </td>

                    {/* УСЛУГИ */}
                    <td className="snap-start border p-2">
                      {animal.services?.map((s, i) => (
                        <span key={i} className="block text-xs bg-gray-100 mb-1 p-1 rounded">{s}</span>
                      )) || <span className="text-gray-400 text-xs">Стандарт</span>}
                        <Icon name="ExternalLink" size={14} color="#e64072" />
                    </td>

                    {/* ПРЕГЛЕД */}
                    <td className="snap-start border p-2 max-w-[200px] min-w-[150px] align-top">
                      {editing.id === animal.id && editing.field === 'notes' ? (
                        <textarea
                          className="w-full border rounded p-1 text-xs outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px] resize-none font-sans"
                          defaultValue={animal.data?.notes || ""}
                          autoFocus
                          placeholder="Въведи бележки..."
                          onBlur={(e) => {
                            const val = e.target.value;
                            if (val !== animal.data?.notes) {
                              handleUpdateField(animal.id, "notes", val, 'data');
                            } else {
                              setEditing({ id: null, field: null });
                            }
                          }}
                          onKeyDown={(e) => {
                            // При textarea Enter прави нов ред, затова ползваме Ctrl+Enter за запис
                            // или просто разчитаме на onBlur (клик извън полето)
                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                              handleUpdateField(animal.id, "notes", e.target.value, 'data');
                            }
                            if (e.key === 'Escape') setEditing({ id: null, field: null });
                          }}
                        />
                      ) : (
                        <div 
                          onClick={() => setEditing({ id: animal.id, field: 'notes' })}
                          className="cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors group relative"
                          title="Кликни за редактиране на бележките"
                        >
                          <small className={`block leading-tight ${!animal.data?.notes ? 'text-gray-400 italic' : 'text-slate-600'}`}>
                            {animal.data?.notes || "Няма бележки"}
                          </small>
                          
                          {/* Малка иконка молив, която се появява при посочване (hover) */}
                          <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Icon name="Pencil" size={10} className="text-slate-300" />
                          </div>
                        </div>
                      )}
                    </td>

                    {/* ПОЛ */}
                    <td className="snap-start border p-2 text-center min-w-[100px]">
                      {editing.id === animal.id && editing.field === 'gender' ? (
                        <select
                          className="bg-white border rounded text-xs p-1 outline-none focus:ring-2 focus:ring-blue-500 w-full"
                          value={animal.gender || ""}
                          autoFocus
                          onBlur={() => setEditing({ id: null, field: null })}
                          onChange={(e) => {
                            handleUpdateField(animal.id, "gender", e.target.value, 'root');
                          }}
                        >
                          <option value="female">Женски</option>
                          <option value="male">Мъжки</option>
                        </select>
                      ) : (
                        <div 
                          onClick={() => setEditing({ id: animal.id, field: 'gender' })}
                          className={`cursor-pointer px-2 py-1 rounded transition-colors font-medium ${
                            animal.gender === 'female' 
                              ? 'text-pink-600 hover:bg-pink-50' 
                              : 'text-blue-600 hover:bg-blue-50'
                          }`}
                          title="Кликни за промяна на пола"
                        >
                          {animal.gender === 'female' ? 'Женски' : 'Мъжки'}
                        </div>
                      )}
                    </td>

                    {/* ТЕГЛО */}
                    <td className="snap-start border p-2 font-mono">
                      {editing.id === animal.id && editing.field === 'weight' ? (
                        <input
                          type="number"
                          step="0.1"
                          className="w-20 border rounded px-1 py-0.5 outline-none focus:ring-2 focus:ring-blue-500"
                          defaultValue={animal.data?.weight || ""}
                          autoFocus
                          // Добавяме записване при излизане от полето (напр. клик в друга клетка)
                          onBlur={(e) => {
                            const val = e.target.value ? Number(e.target.value) : null;
                            // Записваме само ако стойността е променена спрямо старата
                            if (val !== animal.data?.weight) {
                              handleUpdateField(animal.id, "weight", val, 'data');
                            } else {
                              setEditing({ id: null, field: null });
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const val = e.target.value ? Number(e.target.value) : null;
                              handleUpdateField(animal.id, "weight", val, 'data');
                            }
                            if (e.key === 'Escape') setEditing({ id: null, field: null });
                          }}
                        />
                      ) : (
                        <div 
                          onClick={() => setEditing({ id: animal.id, field: 'weight' })}
                          className="cursor-pointer hover:bg-slate-100 p-1 rounded transition-colors min-h-[30px] flex items-center justify-center"
                        >
                          {animal.data?.weight ? `${animal.data.weight} кг` : '---'}
                        </div>
                      )}
                    </td>

                    {/* УПОЙКА */}
                    <td className="snap-start border p-2 min-w-[140px]">
                      {(() => {
                        const dose = calculateDose(animal);
                        const savedDose = animal.medical_details?.induction_dose;
                        const hasAdd = animal.medical_details?.has_induction_add;
                        const addAmount = animal.medical_details?.induction_add_amount;

                        return (
                          <div className="flex flex-col gap-1">
                            <span className='text-gray-400 text-[10px] uppercase font-bold'>{dose.name}</span>
                            
                            <div className="flex items-center gap-1">
                              {editing.id === animal.id && editing.field === 'induction_dose' ? (
                                <input
                                  type="number"
                                  step="0.01"
                                  className="w-20 border rounded px-1 py-0.5 text-blue-600 font-bold outline-none focus:ring-2 focus:ring-blue-500"
                                  defaultValue={savedDose || dose.standard}
                                  autoFocus
                                  onBlur={(e) => {
                                    const val = e.target.value ? Number(e.target.value) : null;
                                    handleUpdateField(animal.id, "induction_dose", val, 'medical_details');
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const val = e.target.value ? Number(e.target.value) : null;
                                      handleUpdateField(animal.id, "induction_dose", val, 'medical_details');
                                    }
                                    if (e.key === 'Escape') setEditing({ id: null, field: null });
                                  }}
                                />
                              ) : (
                                <span 
                                  onClick={() => setEditing({ id: animal.id, field: 'induction_dose' })}
                                  className="text-blue-600 font-extrabold text-sm cursor-pointer hover:bg-blue-50 px-1 rounded border-b border-dotted border-blue-200"
                                >
                                  {savedDose || dose.standard} <span className="text-[10px] font-normal">ml</span>
                                </span>
                              )}
                            </div>

                            {/* --- Секция за Добавена упойка --- */}
                            <div className="mt-2 pt-2 border-t border-dashed border-slate-200">
                              <label className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                  type="checkbox"
                                  checked={hasAdd || false}
                                  className="w-3 h-3 rounded border-gray-300 text-[#e64072] focus:ring-[#e64072]"
                                  onChange={(e) => {
                                    handleUpdateField(animal.id, "has_induction_add", e.target.checked, 'medical_details');
                                  }}
                                />
                                <span className="text-[10px] text-slate-500 group-hover:text-slate-700">Добавка?</span>
                              </label>

                              {hasAdd && (
                                <div className="flex items-center gap-1 mt-1 animate-in fade-in slide-in-from-left-1">
                                  <span className="text-[10px] text-red-400">+</span>
                                  {editing.id === animal.id && editing.field === 'induction_add_amount' ? (
                                    <input
                                      type="number" step="0.01"
                                      className="w-16 border rounded px-1 py-0.5 text-red-600 font-bold text-[10px] outline-none border-red-200"
                                      defaultValue={addAmount || ""}
                                      autoFocus
                                      onBlur={(e) => handleUpdateField(animal.id, "induction_add_amount", Number(e.target.value), 'medical_details')}
                                    />
                                  ) : (
                                    <span 
                                      onClick={() => setEditing({ id: animal.id, field: 'induction_add_amount' })}
                                      className="text-red-500 font-bold text-xs cursor-pointer hover:bg-red-50 px-1 rounded"
                                    >
                                      {addAmount || "0.00"} <span className="text-[9px] font-normal text-slate-400">ml</span>
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Подсказки според ТЕГЛОТО */}
                            {animal.data?.weight > 0 ? (
                              <div className="flex flex-col text-[9px] text-slate-400 leading-tight border-t pt-1 mt-1">
                                <div className="flex justify-between">
                                  <span>мин (0.01):</span>
                                  <span className="font-mono">{dose.min}</span>
                                </div>
                                <div className="flex justify-between font-semibold text-slate-500 bg-slate-50 px-0.5">
                                  <span>станд (0.03):</span>
                                  <span className="font-mono">{dose.standard}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>макс (0.035):</span>
                                  <span className="font-mono">{dose.max}</span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-[9px] text-orange-400 italic">Въведи кг за дозировка</span>
                            )}
                          </div>
                        );
                      })()}
                    </td>

                    {/* ОПЕРАЦИЯ - ТАЙМЕРИ */}
                    <SurgeryTimers 
                      animal={animal} 
                      editing={editing} 
                      setEditing={setEditing} 
                      handleUpdateField={handleUpdateField}
                    />
                    
                    {/*СТАТУС*/}
                    <td className="snap-start border p-2 text-center">
                      {editing.id === animal.id && editing.field === 'status' ? (
                        <select
                          className="text-[10px] font-bold uppercase border rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                          value={animal.status} // Използвай value вместо defaultValue за по-добра синхронизация
                          autoFocus
                          onBlur={() => setEditing({ id: null, field: null })}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            // Подаваме 'root' или 'direct', за да прескочи проверката за path === 'data'
                            handleUpdateField(animal.id, "status", newValue, "root"); 
                            setEditing({ id: null, field: null });
                          }}
                        >
                          {statusOptions.map(opt => (
                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <span 
                          onClick={() => setEditing({ id: animal.id, field: 'status' })}
                          className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase cursor-pointer transition-all ${currentStatus?.color || 'bg-slate-100 text-slate-700'}`}
                        >
                          {currentStatus?.label || animal.status}
                        </span>
                      )}
                    </td>

                    {/*ПЕРСОНАЛ*/}
                    <td className="snap-start border p-2 text-[11px] leading-tight">
                      <div className="flex flex-col gap-1.5">
                        
                        {/* ПРИЕЛ */}
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">Приел:</span>
                          {editing.id === animal.id && editing.field === 'staff_received' ? (
                            <select
                              className="border rounded text-[10px]"
                              defaultValue={animal.medical_details?.staff_received || ""}
                              autoFocus
                              onBlur={() => setEditing({ id: null, field: null })}
                              onChange={(e) => handleUpdateField(animal.id, "staff_received", e.target.value, 'medical_details')}
                            >
                              <option value="">---</option>
                              {staffOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                          ) : (
                            <span 
                              onClick={() => setEditing({ id: animal.id, field: 'staff_received' })}
                              className="cursor-pointer hover:underline decoration-dotted"
                            >
                              {staffOptions.find(opt => opt.value === animal.medical_details?.staff_received)?.label || "---"}
                            </span>
                          )}
                        </div>

                        {/* ХИРУРГ (🩺) */}
                        <div className="flex items-center gap-1 font-bold">
                          <span>🩺</span>
                          {editing.id === animal.id && editing.field === 'staff_surgeon' ? (
                            <select
                              className="border rounded text-[10px] text-blue-600"
                              defaultValue={animal.staff_surgeon || ""}
                              autoFocus
                              onBlur={() => setEditing({ id: null, field: null })}
                              onChange={(e) => {
                                const newValue = e.target.value;
                                // Подаваме 'root' или 'direct', за да прескочи проверката за path === 'data'
                                handleUpdateField(animal.id, "staff_surgeon", newValue, "root"); 
                                setEditing({ id: null, field: null });
                              }}
                            >
                              <option value="">---</option>
                              {staffOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                          ) : (
                            <span 
                              onClick={() => setEditing({ id: animal.id, field: 'staff_surgeon' })}
                              className="cursor-pointer text-blue-700 hover:bg-blue-50 px-1 rounded"
                            >
                              {staffOptions.find(opt => opt.value === animal.staff_surgeon)?.label || "Избери хирург"}
                            </span>
                          )}
                        </div>

                        {/* ВЪРНАЛ */}
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">Върнал:</span>
                          {editing.id === animal.id && editing.field === 'staff_released' ? (
                            <select
                              className="border rounded text-[10px]"
                              defaultValue={animal.medical_details?.staff_released || ""}
                              autoFocus
                              onBlur={() => setEditing({ id: null, field: null })}
                              onChange={(e) => handleUpdateField(animal.id, "staff_released", e.target.value, 'medical_details')}
                            >
                              <option value="">---</option>
                              {staffOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                          ) : (
                            <span 
                              onClick={() => setEditing({ id: animal.id, field: 'staff_released' })}
                              className="cursor-pointer hover:underline decoration-dotted"
                            >
                              {staffOptions.find(opt => opt.value === animal.medical_details?.staff_released)?.label || "---"}
                            </span>
                          )}
                        </div>

                      </div>
                    </td>
                  </tr>
                );})}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Today;