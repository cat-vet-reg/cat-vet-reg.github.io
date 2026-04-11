import React, { useState, useEffect }    from 'react';
import { useNavigate } from 'react-router-dom';
import Icon     from "../../../components/AppIcon";
import Button   from '../../../components/ui/Button';
import Select   from '../../../components/ui/Select';
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
          } from "../../../constants/formOptions";

import { breedOptions } from "../../../constants/breed_options";
import { cityOptions  } from "../../../constants/city_options";

const SurgeryTimers = ({ animal, editing, setEditing, handleUpdateField }) => {

  const [stamps, setStamps] = useState({}); // Структура: { [animalId]: { injectedAt, fellAsleepAt, ... } }

  const getDiffInMinutes = (start, end) => {
    if (!start || !end) return 0;
    return Math.round((new Date(end) - new Date(start)) / 60000);
  };

  return (
  <td className="border p-2 min-w-[300px] bg-slate-50/50">
    {(() => {
      const s = stamps[animal.id] || {};
      const m = animal.medical_details || {};

      return (
        <div className="grid grid-cols-2 gap-2">
          {/* БОЦНАХ / ЗАСПА */}
          <div className="flex flex-col gap-1">
            <button
              onClick={() => {
                const now = new Date();
                setStamps(prev => ({ ...prev, [animal.id]: { ...s, injectedAt: now } }));
              }}
              className={`p-3 rounded-lg border-2 text-[10px] font-bold uppercase transition-all ${
                s.injectedAt ? 'border-green-500 bg-green-100 text-green-700' : 'border-slate-300 bg-white'
              }`}
            >
              💉 Боцнах
              <div className="text-xs font-mono">{s.injectedAt ? s.injectedAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</div>
            </button>

            {/* Бутон ЗАСПА */}
            <button
              type="button"
              disabled={!s.injectedAt}
              onClick={() => {
                if (typeof handleUpdateField !== 'function') {
                  console.error("handleUpdateField не е подадена на SurgeryTimers!");
                  return;
                }
                const now = new Date();
                const mins = getDiffInMinutes(s.injectedAt, now);
                handleUpdateField(animal.id, "time_to_sleep", mins, 'medical_details');
                setStamps(prev => ({ ...prev, [animal.id]: { ...s, fellAsleepAt: now } }));
              }}
              className="p-3 rounded-lg border-2 border-slate-300 bg-white active:bg-slate-200 disabled:opacity-30 text-[10px] font-bold uppercase"
            >
              😴 Заспа
              <div className="text-xs">{m.time_to_sleep ? `${m.time_to_sleep} мин` : 'Засечи'}</div>
            </button>
          </div>

          {/* ОПЕРАЦИЯ НАЧАЛО / КРАЙ */}
          <div className="flex flex-col gap-1">
            <button
              onClick={() => {
                const now = new Date();
                setStamps(prev => ({ ...prev, [animal.id]: { ...s, surgeryStartedAt: now } }));
              }}
              className={`p-3 rounded-lg border-2 text-[10px] font-bold uppercase ${
                s.surgeryStartedAt ? 'border-blue-500 bg-blue-100 text-blue-700' : 'border-slate-300 bg-white'
              }`}
            >
              🔪 Начало
              <div className="text-xs font-mono">{s.surgeryStartedAt ? s.surgeryStartedAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</div>
            </button>

            <button
              disabled={!s.surgeryStartedAt}
              onClick={() => {
                const mins = getDiffInMinutes(s.surgeryStartedAt, new Date());
                handleUpdateField(animal.id, "surgery_duration", mins, 'medical_details');
              }}
              className="p-3 rounded-lg border-2 border-red-200 bg-white active:bg-red-100 disabled:opacity-30 text-[10px] font-bold uppercase text-red-600"
            >
              🏁 Край
              <div className="text-xs">{m.surgery_duration ? `${m.surgery_duration} мин` : 'Засечи'}</div>
            </button>
          </div>

{/* ПРОПОФОЛ */}
<button
  type="button"
  onClick={() => {
    const currentClicks = s.propofolClicks || 0;
    const newCount = currentClicks + 1;
    const total = (newCount * 0.3).toFixed(1);
    
    // 1. Първо обновяваме локалния стейт (това става мигновено)
    setStamps(prev => ({ ...prev, [animal.id]: { ...s, propofolClicks: newCount } }));
    
    // 2. Пращаме към базата
    handleUpdateField(animal.id, "propofol_used", true, 'medical_details');
    handleUpdateField(animal.id, "propofol_total_ml", total, 'medical_details');
    
    if (newCount === 1 && s.fellAsleepAt) {
      const firstMin = getDiffInMinutes(s.fellAsleepAt, new Date());
      handleUpdateField(animal.id, "propofol_first_min", firstMin, 'medical_details');
    }
  }}
  className="col-span-1 p-3 rounded-lg border-2 border-purple-300 bg-purple-50 text-purple-700 font-bold uppercase text-[10px] flex flex-col items-center justify-center active:bg-purple-100"
>
  <span>✨ Пропофол ({s.propofolClicks || 0})</span>
  <span className="text-sm font-mono">
    {/* Тук е магията: ако имаме локални кликове, смятаме от тях, иначе гледаме базата */}
    {s.propofolClicks > 0 ? (s.propofolClicks * 0.3).toFixed(1) : (m.propofol_total_ml || 0)} мл
  </span>
</button>

          {/* НОВО: СЪБУДИ СЕ */}
          <button
            disabled={!s.injectedAt}
            onClick={() => {
              const mins = getDiffInMinutes(s.injectedAt, new Date());
              handleUpdateField(animal.id, "recovery_time", mins, 'medical_details');
            }}
            className="col-span-1 p-3 rounded-lg border-2 border-orange-300 bg-orange-50 text-orange-700 font-bold uppercase text-[10px] flex flex-col items-center justify-center disabled:opacity-30"
          >
            <span>🌅 Събуди се</span>
            <div className="text-xs">{m.recovery_time ? `${m.recovery_time} мин` : 'Засечи'}</div>
          </button>
{/* КОНТРОЛЕН ПАНЕЛ (Log) */}
        <div className="col-span-2 mt-2 pt-2 border-t border-slate-200">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-slate-500 font-medium">
            <div className="flex justify-between border-b border-slate-50">
              <span>😴 Заспиване:</span>
              <span className={m.time_to_sleep ? "text-slate-800" : "text-slate-300"}>
                {m.time_to_sleep ? `${m.time_to_sleep} мин` : '---'}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-50">
              <span>🔪 Опер. времетраене:</span>
              <span className={m.surgery_duration ? "text-slate-800" : "text-slate-300"}>
                {m.surgery_duration ? `${m.surgery_duration} мин` : '---'}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-50">
              <span>✨ Първи Пропофол:</span>
              <span className={m.propofol_first_min ? "text-purple-600" : "text-slate-300"}>
                {m.propofol_first_min ? `${m.propofol_first_min} мин` : '---'}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-50">
              <span>💉 Общо Пропофол:</span>
              <span className={m.propofol_total_ml ? "text-purple-600 font-bold" : "text-slate-300"}>
                {m.propofol_total_ml ? `${m.propofol_total_ml} мл` : '---'}
              </span>
            </div>
            <div className="col-span-2 flex justify-between bg-orange-50/50 px-1 rounded">
              <span>🌅 Възстановяване (общо):</span>
              <span className={m.recovery_time ? "text-orange-700 font-bold" : "text-slate-300"}>
                {m.recovery_time ? `${m.recovery_time} мин` : '---'}
              </span>
            </div>
          </div>
        </div>
        </div>
      );
    })()}
  </td>
  );

};

export default SurgeryTimers;

