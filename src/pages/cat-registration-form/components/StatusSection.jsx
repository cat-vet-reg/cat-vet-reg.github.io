import React        from 'react';
import Input        from "../../../components/ui/Input";
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
import { Checkbox }     from "../../../components/ui/Checkbox";
import Select           from "../../../components/ui/Select";
import { breedOptions } from "../../../constants/breed_options";


const StatusSection = ({ formData, handleInputChange, errors }) => {
  const handleParasiteChange = (parasiteId) => {
    let currentParasites = Array.isArray(formData.parasites) ? [...formData.parasites] : [];
    
    // Ако изберем "Няма видими", изчистваме всичко останало
    if (parasiteId === 'none') {
      currentParasites = ['none'];
    } else {
      // Ако изберем нещо друго, махаме "Няма видими" от списъка
      currentParasites = currentParasites.filter(p => p !== 'none');
      
      if (currentParasites.includes(parasiteId)) {
        currentParasites = currentParasites.filter(p => p !== parasiteId);
      } else {
        currentParasites.push(parasiteId);
      }
    }
    
    handleInputChange("parasites", currentParasites);
  };

  return (
    <FormSection title="Сегашен статус и отчетност">
      {/* Общо състояние */}
      <Select
        label="Общо състояние"
        options={generalConditionOptions}
        value={formData.generalCondition}
        onChange={(value) => handleInputChange("generalCondition", value)}
      />

      {/* СТАТУС В РЕАЛНО ВРЕМЕ */}
      <div className="mb-6">
        <label className="text-sm font-medium mb-3 block text-foreground">Статус на животното</label>
        <div className="flex flex-wrap gap-2">
            {statusOptions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleInputChange("status", s.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                formData.status === s.id ? `${s.color} border-current ring-2 ring-offset-1 ring-current` : 'bg-white border-slate-200 text-slate-400'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ПЕРСОНАЛ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Select
          className="bg-[#e64072]/20 rounded-[20px] p-3"
          label="Приел"
          options={staffOptions}
          value={formData.staffReceived}
          onChange={(val) => handleInputChange("staffReceived", val)}
        />
        <Select
          label="Оперирал"
          options={staffOptions}
          value={formData.staffSurgeon}
          onChange={(val) => handleInputChange("staffSurgeon", val)}
        />
        <Select
          label="Издал"
          options={staffOptions}
          value={formData.staffReleased}
          onChange={(val) => handleInputChange("staffReleased", val)}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Маркировка на ухото</label>
        <div className="grid grid-cols-2 gap-2 border p-3 rounded-md bg-slate-50/50">
          {earStatusOptions.map((opt) => (
            <Checkbox 
              key={opt.id}
              label={opt.label} 
              checked={formData.earStatus === opt.id} 
              onChange={() => handleInputChange("earStatus", opt.id)} 
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium block">Паразити</label>
        <div className="grid grid-cols-2 gap-2 border p-3 rounded-md bg-slate-50/50">
          {parasiteOptions.map((opt) => (
            <Checkbox 
              key={opt.id}
              label={opt.label} 
              checked={Array.isArray(formData.parasites) && formData.parasites.includes(opt.id)} 
              onChange={() => handleParasiteChange(opt.id)} 
            />
          ))}
        </div>
      </div>

      {/* ПОЛОВ СТАТУС - Динамичен спрямо пола */}
        {(formData.gender === 'female' || formData.gender === 'male') && (
          <div className="animate-in slide-in-from-right-2 duration-300">
            <Select
              label="Репродуктивен статус"
              // Тук вземаме списъка според избрания пол: female или male
              options={reproductiveOptions[formData.gender]} 
              value={formData.reproductiveStatus}
              onChange={(val) => handleInputChange("reproductiveStatus", val)}
              placeholder="Изберете статус..."
            />
          </div>
        )}
    </FormSection>
  );
};

export default StatusSection;