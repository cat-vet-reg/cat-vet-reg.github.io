import React, { useState } from 'react';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
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
import { Checkbox }             from "../../../components/ui/Checkbox";


const FilterPanel = ({ 
  filters, 
  onFilterChange, 
  onClearFilters,
}) => {
  // Локално състояние за отваряне/затваряне на детайлните филтри
  const [isAdvancedVisible, setIsAdvancedVisible] = useState(false);

  return (
    <div className="bg-card rounded-2xl p-4 md:p-6 shadow-warm mb-4 md:mb-6 border border-border/50">
      <div className="flex flex-col gap-6">
        
        {/* 1. ГЛАВНА СЕКЦИЯ */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <Input
              type="search"
              label="Бързо търсене"
              placeholder="Търси по име, адрес или телефон..."
              value={filters?.search}
              onChange={(e) => onFilterChange('search', e?.target?.value)}
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsAdvancedVisible(!isAdvancedVisible)}
              iconName={isAdvancedVisible ? "ChevronUp" : "SlidersHorizontal"}
              className="flex-shrink-0"
            >
              {isAdvancedVisible ? "Скрий филтрите" : "Детайлни филтри"}
            </Button>
            <Button variant="ghost" onClick={onClearFilters} iconName="X" className="text-xs py-1">
              Изчисти
            </Button>
          </div>
        </div>

        {/* 2. ДЕТАЙЛНИ ФИЛТРИ */}
        {isAdvancedVisible && (
          <div className="pt-6 border-t border-border/70 animate-in fade-in slide-in-from-top-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              
              {/* ВИД (Куче/Котка) */}
              <Select
                label="Вид животно"
                options={speciesOptions}
                value={filters?.species}
                onChange={(val) => onFilterChange('species', val)}
                clearable
              />

              {/* ПОЛ */}
              <Select
                label="Пол"
                options={genderOptions}
                value={filters?.gender}
                onChange={(val) => onFilterChange('gender', val)}
                clearable
              />

              {/* СТАТУС */}
              <Select
                label="Статус"
                options={statusOptions.map(s => ({ value: s.id, label: s.label }))}
                value={filters?.status}
                onChange={(val) => onFilterChange('status', val)}
                clearable
              />

              {/* ЦВЯТ */}
              <Select
                label="Цвят на козината"
                options={colorOptions}
                value={filters?.color}
                onChange={(val) => onFilterChange('color', val)}
                clearable
                searchable
              />

              {/* ХИРУРГ */}
              <Select
                label="Хирург"
                options={staffOptions}
                value={filters?.staffSurgeon}
                onChange={(val) => onFilterChange('staffSurgeon', val)}
                clearable
                searchable
              />

              {/* МЕСТОЖИВЕЕНЕ */}
              <Input
                label="Местоживеене (Квартал/Улица)"
                placeholder="Напр. Тракия..."
                value={filters?.location}
                onChange={(e) => onFilterChange('location', e.target.value)}
              />

            </div>
          </div>
        )}

        {/* 3. АРХИВ */}
        <div className="flex items-center justify-between border-t border-border/70 pt-4">
          <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-slate-700">
            <input 
              type="checkbox" 
              className="w-5 h-5 rounded border-gray-300 text-primary cursor-pointer"
              checked={filters?.showRecorded || false}
              onChange={(e) => onFilterChange('showRecorded', e.target.checked)}
            />
            Покажи записани и пропуснати часове (архив)
          </label>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;