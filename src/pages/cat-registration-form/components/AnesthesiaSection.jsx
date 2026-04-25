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
  // 2. ПРЕМЕСТИ useState ТУК (вътре в тялото на компонента)
  const [stamps, setStamps] = useState({
    injectedAt: null,
    fellAsleepAt: null,
    surgeryStartedAt: null,
    propofolClicks: 0
  });

  return (
    <FormSection title="Анестезиологичен протокол (Интерактивен)">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        
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
    </FormSection>
  );
};

export default AnesthesiaSection;