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
import Select from "../../../components/ui/Select";
import { breedOptions } from "../../../constants/breed_options";


const AnimalBasicSection = ({ formData, handleInputChange, errors }) => {
  return (
    <FormSection title="Основна информация">
      <div className="bg-[#e64072]/20 rounded-[20px] p-3">
        <Input
          label="Име на животното"
          type="text"
          placeholder="Как лицето за контакт нарича животното"
          value={formData?.recordName}
          onChange={(e) =>
            handleInputChange("recordName", e?.target?.value)
          }
          error={errors?.recordName}
        />

        <label className="block text-sm font-medium text-slate-700 mb-2">Пол</label>
        <div className="flex justify-between items-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => handleInputChange("gender", "female")}
            className={`flex-1 py-3 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${
              formData?.gender === 'female' 
              ? "bg-secondary text-white ring-2 ring-offset-2 ring-secondary scale-105 z-10" 
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            <span className="text-base">♀️</span> Женски
          </button>
          
          <button
            type="button"
            onClick={() => handleInputChange("gender", "male")}
            className={`flex-1 py-3 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${
              formData?.gender === 'male' 
              ? "bg-primary text-white ring-2 ring-offset-2 ring-primary scale-105 z-10" 
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            <span className="text-base">♂️</span> Мъжки
          </button>
        </div>

        {errors?.gender && (
          <p className="text-xs text-red-500 mt-[-1rem] mb-4">{errors.gender}</p>
        )}

        <label className="block text-sm font-medium text-slate-700 mb-2">Вид животно</label>
        <div className="flex justify-between items-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => handleInputChange("species", "cat")}
            className={`flex-1 py-3 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${
              formData?.species === 'cat' 
              ? "bg-primary text-white ring-2 ring-offset-2 ring-primary scale-105 z-10" 
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            <span className="text-base">🐱</span> Котка
          </button>
          <button
            type="button"
            onClick={() => handleInputChange("species", "dog")}
            className={`flex-1 py-3 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${
              formData?.species === 'dog' 
              ? "bg-primary text-white ring-2 ring-offset-2 ring-primary scale-105 z-10" 
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            <span className="text-base">🐶</span> Куче
          </button>
        </div>

        {formData?.species === 'dog' && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
            <label className="block text-sm font-bold text-blue-800 mb-3">
              Ушна марка (за кучета)
            </label>
            
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => handleInputChange("hasEarTag", "Y")}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  formData.hasEarTag === "Y" 
                  ? "bg-blue-600 text-white" 
                  : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                Поставена
              </button>
              <button
                type="button"
                onClick={() => {
                  handleInputChange("hasEarTag", "N");
                  handleInputChange("earTagNumber", ""); // Изчистваме номера, ако няма марка
                }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  formData.hasEarTag === "N" 
                  ? "bg-blue-600 text-white" 
                  : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                Не е поставена
              </button>
            </div>

            {formData.hasEarTag === "Y" && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">
                  Номер на ушна марка
                </label>
                <input
                  type="text"
                  value={formData.earTagNumber}
                  onChange={(e) => handleInputChange("earTagNumber", e.target.value)}
                  placeholder="Въведете номер..."
                  className="w-full p-2 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
            )}
          </div>
        )}

      </div>
      
      <Input
        label="Тегло (в килограми)"
        type="number"
        placeholder="Въведете теглото"
        min="0.1"
        max="50"
        step="0.1"
        value={formData?.weight}
        onChange={(e) =>
          handleInputChange("weight", e?.target?.value)
        }
        error={errors?.weight}
      />
      
      <label>Телесно състояние (BCS 1-9)</label>
      <div className="space-y-4">
        <div className="flex justify-between items-center gap-1">
          {bcsScores.map((score) => (
            <button
              key={score}
              type="button"
              onClick={() => handleInputChange("bcsScore", score.toString())}
              className={`flex-1 py-3 text-sm font-bold rounded-md transition-all ${
                formData.bcsScore === score.toString()
                  ? "bg-primary text-white ring-2 ring-offset-2 ring-primary scale-110"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {score}
            </button>
          ))}
        </div>
        
        {/* Описанието вече се генерира от функцията в formOptions */}
        {formData.bcsScore && (
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
            <p className={`font-medium ${getBcsDescription(formData.bcsScore).class}`}>
              {getBcsDescription(formData.bcsScore).text}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 bg-[#e64072]/20 rounded-[20px] p-3">
        <Input 
          label="Възраст"
          type="number"
          placeholder="Напр. 4"
          required
          min="1"
          max={formData.ageUnit === "months" ? 24 : 30}
          step="1"
          value={formData.ageValue}
          onChange={(e) =>
            handleInputChange("ageValue", e.target.value)
          }
          error={errors?.ageValue}
        />

        <Select
          label="Единица"
          options={ageUnitOptions}
          value={formData.ageUnit}
          onChange={(value) => handleInputChange("ageUnit", value)}
        />
      </div>

      <Select
        label="Порода на котката"
        placeholder="Изберете порода"
        searchable
        options={breedOptions}
        value={formData.breed}
        onChange={(value) => handleInputChange("breed", value)}
        error={errors?.breed}
      />

      <Select
        label="Цвят на козината"
        placeholder="Изберете цвят"
        options={colorOptions}
        value={formData?.color}
        onChange={(value) => handleInputChange("color", value)}
        error={errors?.color}
      />

      <Input
        label="Бележки"
        type="text"
        placeholder="Открити заболявания, недъзи и др..."
        value={formData?.recordNotes}
        onChange={(e) =>
          handleInputChange("recordNotes", e?.target?.value)
        }
        error={errors?.recordNotes}
      />

      {formData?.color === "custom" && (
        <Input
          label="Custom Color"
          type="text"
          placeholder="Describe the cat's color"
          required
          value={formData?.customColor}
          onChange={(e) =>
            handleInputChange("customColor", e?.target?.value)
          }
          error={errors?.customColor}
          description="Provide a detailed description of the cat's color"
        />
      )}
    </FormSection>
  );
};

export default AnimalBasicSection;