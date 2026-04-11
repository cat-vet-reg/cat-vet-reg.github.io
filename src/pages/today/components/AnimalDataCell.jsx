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

const AnimalDataCell = ({ animal, editing, setEditing, handleUpdateField }) => {
  const navigate = useNavigate();

  return (

    <div className="flex flex-col gap-2">
      
      {/* 1. Данни на Собственика */}
      <div className="flex items-center gap-2">
        <span className="font-bold text-sm">№{animal.id}</span>
        <h3 className="font-bold text-sm">
          - {animal.name}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Важно: предотвратява отварянето на други редактори в реда
            navigate('/cat-registration-form', { 
              state: { 
                catData: animal, // Тук използваме обекта 'animal', който идва от мапа на таблицата
                isEditing: true 
              } 
            });
          }}
          className="p-1 hover:bg-[#e64072]/10 rounded-full transition-colors inline-flex items-center justify-center"
          title="Редактиране на пациент"
        >
          <Icon name="ExternalLink" size={14} color="#e64072" />
        </button>
        
        {/* дарение */}
        <div className="relative">
          {editing.id === animal.id && editing.field === 'donation' ? (
            <div className="flex gap-1 animate-in fade-in zoom-in duration-200">
              <button
                // ДОБАВЕНО: 'data' като четвърти параметър
                onClick={() => handleUpdateField(animal.id, "donation", "N", 'data')}
                className={`text-[9px] font-black px-2 py-0.5 rounded border transition-all ${
                  animal.data?.donation === 'N' ? 'bg-green-500 text-white border-green-600' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                }`}
              >
                НЕ
              </button>
              <button
                // ДОБАВЕНО: 'data' като четвърти параметър
                onClick={() => handleUpdateField(animal.id, "donation", "Y", 'data')}
                className={`text-[9px] font-black px-2 py-0.5 rounded border transition-all ${
                  animal.data?.donation === 'Y' ? 'bg-red-500 text-white border-red-600' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                }`}
              >
                ДА
              </button>
            </div>
          ) : (
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setEditing({ id: animal.id, field: 'donation' });
              }}
              className="cursor-pointer group"
            >
              {animal.data?.donation === 'Y' ? (
                <span className="bg-green-100 text-green-700 text-[9px] font-black px-1 rounded border border-green-200 uppercase group-hover:ring-2 ring-green-300 transition-all">
                  Дарение
                </span>
              ) : (
                <span className="bg-slate-50 text-slate-400 text-[9px] font-black px-1 rounded border border-slate-200 uppercase opacity-40 group-hover:opacity-100 transition-all italic">
                  Няма дарение
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. ОСНОВНИ ДАННИ (Вид, Пол, Репродуктивен статус) */}
      <div className="flex flex-wrap gap-1 items-center text-xs">
        <span className="font-medium text-slate-500">
          {speciesOptions.find(opt => opt.value === animal.species)?.label || animal.species}
        </span>
        <span className="text-slate-400">•</span>
        <span className="font-medium text-slate-500">
          {genderOptions.find(opt => opt.value === (animal.data?.gender || animal.gender))?.label}
        </span>
        
        {/* РЕПРОДУКТИВЕН СТАТУС - Вече е тук, до пола */}
        {animal.medical_details?.reproductive_status && animal.medical_details.reproductive_status !== 'none_visible' && (
          <>
            <span className="text-slate-400">•</span>
            <span className="text-pink-600 font-bold bg-pink-50 px-1 rounded animate-pulse">
              {reproductiveOptions.female.find(opt => opt.value === animal.medical_details.reproductive_status)?.label || 
              reproductiveOptions.male.find(opt => opt.value === animal.medical_details.reproductive_status)?.label || 
              animal.medical_details.reproductive_status}
            </span>
          </>
        )}
      </div>

      {/* 3. ФИЗИЧЕСКИ ПОКАЗАТЕЛИ (Badges) */}
      <div className="flex flex-wrap gap-1 mt-1 text-xs">
        {/* ЦВЯТ */}
        <div className="flex items-center">
          {editing.id === animal.id && editing.field === 'color' ? (
            <div 
              className="flex items-center gap-1 animate-in fade-in duration-200 bg-amber-50 p-0.5 rounded border border-amber-200"
              onMouseLeave={() => setEditing({ id: null, field: null })}
            >
              <div 
                className="w-3 h-3 rounded-full border border-black/20"
                style={{ background: colorStyles[animal.data?.color] || '#ccc' }}
              />
              <select
                value={animal.data?.color}
                className="text-xs compact-select"
                autoFocus
                onChange={(e) => handleUpdateField(animal.id, "color", e.target.value, 'data')}
              >
                {colorOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button onClick={() => setEditing({ id: null, field: null })} className="text-green-600 ml-0.5">
                <Icon name="Check" size={14} />
              </button>
            </div>
          ) : (
            <div 
              onClick={() => setEditing({ id: animal.id, field: 'color' })}
              className="flex items-center gap-1 cursor-pointer hover:bg-slate-100 px-1 rounded transition-colors group"
            >
              <div 
                className="w-3.5 h-3.5 rounded-full border group-hover:scale-110 transition-transform"
                style={{ background: colorStyles[animal.data?.color] || '#ccc', border: '1px solid #000000'}} 
              />
              <span className="text-[11px] text-slate-500 font-medium">
                {colorOptions.find(opt => opt.value === animal.data?.color)?.label || animal.data?.color || 'без цвят'}
              </span>
            </div>
          )}
        </div>

        <span className="text-slate-400 text-xs">•</span>
        {/* ПОРОДА */}
{/* ПОРОДА */}
<div className="flex items-center">
  {editing.id === animal.id && editing.field === 'breed' ? (
    <div 
      className="flex items-center gap-1 animate-in fade-in duration-200 bg-emerald-50 p-0.5 rounded border border-emerald-200"
      // ПРЕМАХНАТО: onMouseLeave - той убиваше менюто
    >
      <select
        className="bg-white border rounded text-[10px] h-5 max-w-[150px] outline-none cursor-pointer"
        value={animal.data?.breed || ""} 
        autoFocus
        onClick={(e) => e.stopPropagation()} // Спира затварянето при клик върху самия селект
        onChange={(e) => {
          handleUpdateField(animal.id, "breed", e.target.value, 'data');
        }}
      >
        <option value="">Избери порода...</option>
        {breedOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <button 
        onClick={(e) => {
          e.stopPropagation();
          setEditing({ id: null, field: null });
        }} 
        className="text-emerald-600 hover:bg-emerald-100 rounded p-0.5"
      >
        <Icon name="Check" size={14} />
      </button>
    </div>
  ) : (
    <div 
      onClick={(e) => {
        e.stopPropagation(); // ВАЖНО: спираме клика тук
        setEditing({ id: animal.id, field: 'breed' });
      }}
      className="text-[11px] text-slate-500 font-medium cursor-pointer hover:bg-slate-100 px-1 rounded transition-colors border border-transparent hover:border-slate-200"
    >
      {breedOptions.find(opt => opt.value === animal.data?.breed)?.label || animal.data?.breed || 'Неизвестна'}
    </div>
  )}
</div>
        <span className="text-slate-400 text-xs">•</span>

        {/* ВЪЗРАСТ */}
        <div className="flex items-center">
          {editing.id === animal.id && editing.field === 'age' ? (
            <div className="flex items-center gap-1 animate-in fade-in duration-200 bg-blue-50 p-0.5 rounded border border-blue-200">
              <input
                type="number"
                className="w-10 border rounded px-1 text-[11px] font-bold h-5 outline-none"
                value={animal.data?.age_value || ""}
                autoFocus
                onChange={(e) => {
                  // ПРЕДАВАМЕ false НАКРАЯ, ЗА ДА НЕ СЕ ЗАТВОРИ ВЕДНАГА
                  handleUpdateField(animal.id, "age_value", e.target.value, 'data', false);
                }}
              />
              <select
                className="bg-white border rounded text-[10px] h-5 outline-none cursor-pointer"
                value={animal.data?.age_unit || "years"}
                onChange={(e) => {
                  // Тук може да е true, защото обикновено това е последната стъпка
                  handleUpdateField(animal.id, "age_unit", e.target.value, 'data', true);
                }}
              >
                {ageUnitOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              
              {/* Този бутон вече е важен, защото той реално затваря ако само сме сменили цифрата */}
              <button 
                onClick={() => setEditing({ id: null, field: null })} 
                className="text-green-600 p-0.5 hover:bg-green-100 rounded"
              >
                <Icon name="Check" size={14} />
              </button>
            </div>
          ) : (
            <div 
              onClick={() => setEditing({ id: animal.id, field: 'age' })}
              className="text-[11px] text-slate-500 font-medium cursor-pointer hover:bg-slate-100 px-1 rounded transition-colors"
            >
              {animal.data?.age_value || '??'} {ageUnitOptions.find(opt => opt.value === animal.data?.age_unit)?.label}
            </div>
          )}
        </div>
        <span className="text-slate-400 text-xs">•</span>
      </div>

      {/* 4. ОПИСАНИЕ (Цвят, Темперамент, Порода) */}
      <div className="flex flex-wrap gap-1 items-center text-[11px] text-slate-500 font-medium">
        {/* Темперамент */}
        <div className="flex items-center">
          {editing.id === animal.id && editing.field === 'temperament' ? (
            <div 
              className="flex items-center gap-1 animate-in fade-in duration-200 bg-orange-50 p-0.5 rounded border border-orange-200"
              onMouseLeave={() => setEditing({ id: null, field: null })}
            >
              <select
                className="bg-white border rounded text-[10px] h-5 outline-none cursor-pointer"
                value={animal.data?.temperament}
                autoFocus
                onChange={(e) => handleUpdateField(animal.id, "temperament", e.target.value, 'data')}
              >
                {spicyOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>
                    {opt.icon} {opt.desc}
                  </option>
                ))}
              </select>
              <button 
                onClick={() => setEditing({ id: null, field: null })}
                className="text-orange-600 hover:text-orange-700 ml-0.5"
              >
                <Icon name="Check" size={14} />
              </button>
            </div>
          ) : (
            <div 
              onClick={() => setEditing({ id: animal.id, field: 'temperament' })}
              className="flex items-center gap-1 cursor-pointer hover:bg-orange-50 px-1 rounded transition-colors border border-transparent hover:border-orange-100 group"
            >
              <span className="group-hover:scale-120 transition-transform">
                {spicyOptions.find(opt => opt.id === animal.data?.temperament)?.icon || '😐'} 
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {spicyOptions.find(opt => opt.id === animal.data?.temperament)?.desc || 'Няма данни'}
              </span>
            </div>
          )}
        </div>
        <span className="text-slate-400 text-xs">•</span>

        {/* BCS Score */}
        <div className="flex items-center min-w-[60px]">
          {editing.id === animal.id && editing.field === 'bcs_score' ? (
            <div className="flex items-center gap-1 animate-in fade-in duration-200 bg-amber-50 p-0.5 rounded border border-amber-200 z-10">
              <select
                className="bg-white border rounded text-[10px] h-5 outline-none cursor-pointer font-bold text-amber-700"
                value={animal.data?.bcs_score || ""}
                autoFocus
                onBlur={() => setEditing({ id: null, field: null })}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : null;
                  // ДОБАВЕНО: 'data' като четвърти параметър
                  handleUpdateField(animal.id, "bcs_score", val, 'data');
                }}
              >
                <option value="">?</option>
                {bcsScores.map(score => (
                  <option key={score} value={score}>
                    {score} - {getBcsDescription(score).text}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setEditing({ id: animal.id, field: 'bcs_score' });
              }}
              className="inline-flex items-center bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-[11px] font-bold border border-amber-100 cursor-pointer hover:bg-amber-200"
            >
              BCS: {animal.data?.bcs_score || '?'}
            </div>
          )}
        </div>
        <span className="text-slate-400 text-xs">•</span>
        
        <div className="text-[11px] text-slate-500 self-center font-medium">
          {animal.data?.weight || '??'} кг
        </div>
      </div>

      {/* 5. СОБСТВЕНИК И ЛОКАЦИЯ */}
      <div className="mt-2 pt-2 border-t border-slate-100 space-y-1 text-[11px]">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <Icon name="User" size={12} className="text-slate-400" />
          {animal.owner?.name || animal.owner_name} 
          <span className="font-normal text-slate-500">({animal.owner?.phone})</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <Icon name="MapPin" size={11} />
          {/*Населено място*/}
{/* ГРАД / СЕЛО */}
  <div className="relative min-w-[100px]">
    {editing.id === animal.id && editing.field === 'location_city' ? (
      <div className="absolute z-50 top-0 left-0 w-64 shadow-xl"> 
        <Select
          placeholder="Търси град..."
          searchable
          options={cityOptions}
          value={animal.location_city}
          onChange={(value) => {
            handleUpdateField(animal.id, "location_city", value, 'root');
            setEditing({ id: null, field: null });
          }}
        />
      </div>
    ) : (
      <span 
        onClick={() => setEditing({ id: animal.id, field: 'location_city' })}
        className="cursor-pointer hover:bg-slate-100 px-1 rounded transition-colors border-b border-dotted border-slate-300"
      >
        {cityOptions.find(opt => opt.value === animal.location_city)?.label || animal.location_city || 'Избери град'}
      </span>
    )}
  </div>
          <span className="text-slate-300">|</span>
          {/*Къде живее*/}
          <div className="flex items-center">
            {editing.id === animal.id && editing.field === 'living_condition' ? (
              <select
                className="bg-white border rounded text-[10px] h-5 outline-none cursor-pointer"
                value={animal.living_condition || ""}
                autoFocus
                onBlur={() => setEditing({ id: null, field: null })}
                onChange={(e) => handleUpdateField(animal.id, "living_condition", e.target.value, 'root')}
              >
                <option value="">Неуточнено...</option>
                {habitat.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <span 
                onClick={() => setEditing({ id: animal.id, field: 'living_condition' })}
                className="cursor-pointer hover:text-blue-600 transition-colors"
              >
                {habitat.find(opt => opt.value === (Array.isArray(animal.living_condition) ? animal.living_condition[0] : animal.living_condition))?.label || animal.living_condition || '---'}
              </span>
            )}
          </div>
        </div>
      </div>

    </div>
      
  );
};

export default AnimalDataCell;