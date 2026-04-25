import React from 'react';
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


const TemperamentSection = ({ formData, handleInputChange, errors }) => {
  return (
    <FormSection title="Темперамент (Spicy Scale)">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {spicyOptions.map((opt) => {
          // Проверка дали този квадрат е избран в момента
          const isSelected = formData.temperament === opt.id;

          return (
            <button
              key={opt.id}
              type="button" // ЗАДЪЛЖИТЕЛНО: предотвратява презареждане на страницата
              onClick={() => handleInputChange("temperament", opt.id)}
              className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 h-32 cursor-pointer ${
                isSelected
                  ? `${opt.color} ${opt.bg} shadow-md scale-105 ring-2 ring-offset-1 ring-opacity-50`
                  : "border-slate-200 bg-white hover:border-slate-300 shadow-sm opacity-70 hover:opacity-100"
              }`}
            >
              <span className="text-3xl mb-2">{opt.icon}</span>
              <span className={`text-xs font-black ${isSelected ? "text-foreground" : "text-slate-500"}`}>
                {opt.label}
              </span>
              <span className="text-[10px] text-slate-400 uppercase mt-1 text-center">
                {opt.desc}
              </span>
              
              {/* Визуален индикатор за избор */}
              {isSelected && (
                <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full text-white flex items-center justify-center text-[10px] shadow-sm ${opt.active.replace('bg-', 'bg-')}`}>
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>
    </FormSection>
  );
};

export default TemperamentSection;