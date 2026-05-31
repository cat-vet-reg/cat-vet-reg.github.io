import React, { useState, useEffect } from "react";
import Input from "../../../components/ui/Input";
import FormSection from "./FormSection";
import {  genderOptions, 
          spicyOptions,
          bcsScores,
          getBcsDescription,
          ageUnitOptions, 
          colorOptions,
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
import { Checkbox }             from "../../../components/ui/Checkbox";

const getDiffInMinutes = (start, end) => {
  if (!start || !end) return 0;
  return Math.round((end - start) / 60000);
};

const AnesthesiaSection = ({ formData, handleInputChange, errors }) => {
  // Контрол на режима (Класически или High-Volume)
  const [isHighVolume, setIsHighVolume] = useState(false);

  // Обединено състояние за всички времеви маркери
  const [stamps, setStamps] = useState({
    injectedAt: null,
    fellAsleepAt: null,
    surgeryStartedAt: null,
    propofolClicks: 0,
    
    // Маркери за High-Volume режима
    hvSurgeryStart: null,
    hvSewingStart: null,
    hvSurgeryEnd: null,
  });

  // Пазим времето за живия таймер във форматиран вид "ММ:СС"
  const [liveTimer, setLiveTimer] = useState("00:00");

  // Жив таймер по секунди (активен само в High-Volume режим)
  useEffect(() => {
    if (!stamps.hvSurgeryStart || stamps.hvSurgeryEnd || !isHighVolume) return;

    const interval = setInterval(() => {
      const diffMs = new Date() - stamps.hvSurgeryStart;
      const totalSeconds = Math.floor(diffMs / 1000);
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;

      const formattedMins = String(mins).padStart(2, '0');
      const formattedSecs = String(secs).padStart(2, '0');

      setLiveTimer(`${formattedMins}:${formattedSecs}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [stamps.hvSurgeryStart, stamps.hvSurgeryEnd, isHighVolume]);

  // Помощна функция за форматиране на часа за запис (HH:MM)
  const formatTimeStr = (date) => {
    if (!date) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <FormSection title="Анестезиологичен протокол (Интерактивен)">
      
      {/* СУИЧ ЗА РЕЖИМ (Перфектен за натискане на телефон) */}
      <div className="flex items-center justify-between mb-5 p-3 bg-slate-50 rounded-xl border border-slate-100">
        <span className="text-sm font-bold text-slate-700">🐈 ЖВ за Кастрация</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={isHighVolume} 
            onChange={(e) => setIsHighVolume(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-500"></div>
          <span className="ml-2 text-xs uppercase font-black text-amber-600 tracking-wider">
            {isHighVolume ? "⚡" : "Стандартен"}
          </span>
        </label>
      </div>

      {/* ========================================================= */}
      {/* РЕЖИМ 1: HIGH-VOLUME ИНТЕРФЕЙС                            */}
      {/* ========================================================= */}
      {isHighVolume ? (
        <div>
          {/* ММ:СС Жив таймер */}
          {stamps.hvSurgeryStart && !stamps.hvSurgeryEnd && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
              <div className="text-5xl font-black font-mono tracking-wider text-amber-600">
                {liveTimer}
              </div>
            </div>
          )}

          {/* Финална статистика при High-Volume */}
          {stamps.hvSurgeryEnd && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
              <span className="text-xs uppercase font-bold text-green-700 block mb-1">Общо времетраене:</span>
              <div className="text-4xl font-black font-mono text-green-700">
                {getDiffInMinutes(stamps.hvSurgeryStart, stamps.hvSurgeryEnd)} <span className="text-xl">мин.</span>
              </div>
            </div>
          )}

          {/* 3-те бързи бутона */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. НАЧАЛО НА КАСТРАЦИЯ */}
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                setStamps(p => ({ ...p, hvSurgeryStart: now }));
                handleInputChange("surgeryStartTime", formatTimeStr(now));
              }}
              className={`p-5 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                stamps.hvSurgeryStart 
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold' 
                  : 'border-slate-200 bg-white active:bg-slate-50'
              }`}
            >
              <span className="text-xs uppercase tracking-wider text-slate-500 block mb-1">1. Начало кастрация</span>
              <div className="text-2xl font-black font-mono">
                {stamps.hvSurgeryStart ? formatTimeStr(stamps.hvSurgeryStart) : "СТАРТ"}
              </div>
            </button>

            {/* 2. НАЧАЛО НА ШИЕНЕ */}
            <button
              type="button"
              disabled={!stamps.hvSurgeryStart}
              onClick={() => {
                const now = new Date();
                setStamps(p => ({ ...p, hvSewingStart: now }));
                handleInputChange("sewingStartTime", formatTimeStr(now));
                handleInputChange("cutDuration", getDiffInMinutes(stamps.hvSurgeryStart, now));
              }}
              className={`p-5 rounded-xl border-2 flex flex-col items-center justify-center transition-all disabled:opacity-40 ${
                stamps.hvSewingStart 
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' 
                  : 'border-slate-200 bg-white active:bg-slate-50'
              }`}
            >
              <span className="text-xs uppercase tracking-wider text-slate-500 block mb-1">2. Начало шиене</span>
              <div className="text-2xl font-black font-mono">
                {stamps.hvSewingStart ? formatTimeStr(stamps.hvSewingStart) : "ШИЕНЕ"}
              </div>
              {stamps.hvSewingStart && (
                <span className="text-xs font-normal text-blue-500">
                  (на {getDiffInMinutes(stamps.hvSurgeryStart, stamps.hvSewingStart)}-та мин)
                </span>
              )}
            </button>

            {/* 3. КРАЙ НА КАСТРАЦИЯ */}
            <button
              type="button"
              disabled={!stamps.hvSewingStart}
              onClick={() => {
                const now = new Date();
                setStamps(p => ({ ...p, hvSurgeryEnd: now }));
                handleInputChange("surgeryEndTime", formatTimeStr(now));
                handleInputChange("surgeryDuration", getDiffInMinutes(stamps.hvSurgeryStart, now));
              }}
              className={`p-5 rounded-xl border-2 flex flex-col items-center justify-center transition-all disabled:opacity-40 ${
                stamps.hvSurgeryEnd 
                  ? 'border-red-500 bg-red-50 text-red-700 font-bold' 
                  : 'border-slate-200 bg-white active:bg-slate-50'
              }`}
            >
              <span className="text-xs uppercase tracking-wider text-slate-500 block mb-1">3. Край кастрация</span>
              <div className="text-2xl font-black font-mono">
                {stamps.hvSurgeryEnd ? formatTimeStr(stamps.hvSurgeryEnd) : "КРАЙ"}
              </div>
            </button>
          </div>
        </div>
      ) : (
        
        // =========================================================
        // РЕЖИМ 2: СТАНДАРТЕН ИНТЕРФЕЙС (Оригиналните 6 бутона)
        // =========================================================
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {/* Бутон БОЦНАХ */}
          <button
            type="button"
            onClick={() => setStamps(p => ({...p, injectedAt: new Date()}))}
            className={`p-7 rounded-lg border-2 flex flex-col items-center ${stamps.injectedAt ? 'border-green-500 bg-green-50' : 'border-slate-200'}`}
          >
            <span className="text-xs uppercase font-bold text-slate-500">Боцнах</span>
            <div className="text-lg font-mono">{stamps.injectedAt ? stamps.injectedAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</div>
          </button>

          {/* Бутон ЗАСПА */}
          <button
            type="button"
            disabled={!stamps.injectedAt}
            onClick={() => {
              const now = new Date();
              const mins = getDiffInMinutes(stamps.injectedAt, now);
              handleInputChange("timeToSleep", mins);
              setStamps(p => ({...p, fellAsleepAt: now}));
            }}
            className="p-7 rounded-lg border-2 border-slate-200 active:bg-slate-100 disabled:opacity-50"
          >
            <span className="text-xs uppercase font-bold text-slate-500">Заспа</span>
            <div className="text-sm font-semibold">{formData.timeToSleep ? `${formData.timeToSleep} мин` : 'Натисни'}</div>
          </button>

          {/* Бутон НАЧАЛО ОПЕРАЦИЯ */}
          <button
            type="button"
            onClick={() => setStamps(p => ({...p, surgeryStartedAt: new Date()}))}
            className="p-7 rounded-lg border-2 border-blue-200 bg-blue-50 text-blue-700"
          >
            <span className="text-xs uppercase font-bold">Начало</span>
            <div className="text-lg font-mono">{stamps.surgeryStartedAt ? stamps.surgeryStartedAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</div>
          </button>

          {/* Бутон КРАЙ ОПЕРАЦИЯ */}
          <button
            type="button"
            disabled={!stamps.surgeryStartedAt}
            onClick={() => {
              const mins = getDiffInMinutes(stamps.surgeryStartedAt, new Date());
              handleInputChange("surgeryDuration", mins);
            }}
            className="p-7 rounded-lg border-2 border-red-100 bg-red-50 text-red-700 disabled:opacity-50"
          >
            <span className="text-xs uppercase font-bold">Край</span>
            <div className="text-sm font-semibold">{formData.surgeryDuration ? `${formData.surgeryDuration} мин` : 'Засечи'}</div>
          </button>

          {/* Бутон ПРОПОФОЛ */}
          <button
            type="button"
            onClick={() => {
              const newCount = stamps.propofolClicks + 1;
              const total = (newCount * 0.3).toFixed(1);
              setStamps(p => ({...p, propofolClicks: newCount}));
              handleInputChange("propofolUsed", true);
              handleInputChange("propofolTotalMl", total);
              if (newCount === 1 && stamps.fellAsleepAt) {
                handleInputChange("propofolFirstMin", getDiffInMinutes(stamps.fellAsleepAt, new Date()));
              }
            }}
            className="p-7 rounded-lg border-2 border-purple-200 bg-purple-50 text-purple-700"
          >
            <span className="text-xs uppercase font-bold">Пропофол ({stamps.propofolClicks})</span>
            <div className="text-sm font-semibold">{formData.propofolTotalMl || 0} мл</div>
          </button>

          {/* Бутон СЪБУДИ СЕ */}
          <button
            type="button"
            disabled={!stamps.injectedAt}
            onClick={() => {
              const mins = getDiffInMinutes(stamps.injectedAt, new Date());
              handleInputChange("recoveryTime", mins);
            }}
            className="p-7 rounded-lg border-2 border-orange-100 bg-orange-50 text-orange-700"
          >
            <span className="text-xs uppercase font-bold">Събуди се</span>
            <div className="text-sm font-semibold">{formData.recoveryTime ? `${formData.recoveryTime} мин` : 'Засечи'}</div>
          </button>
        </div>
      )}
    </FormSection>
  );
};

export default AnesthesiaSection;