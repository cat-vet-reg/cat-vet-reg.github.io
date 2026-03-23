import React, { useState } from 'react';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import {  speciesOptions,
          genderOptions, 
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
        
        {/* 1. ГЛАВНА СЕКЦИЯ: Търсачка и Бутони */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <Input
              type="search"
              label="Бързо търсене"
              placeholder="Търси по животно, собственик или телефонен номер..."
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
              iconPosition="left"
              className="flex-shrink-0"
            >
              {isAdvancedVisible ? "Скрий филтрите" : "Детайлни филтри"}
            </Button>
            
            <Button
              variant="ghost"
              onClick={onClearFilters}
              iconName="X"
              iconPosition="left"
              className="text-xs py-1"
            >
              Изчисти
            </Button>
          </div>
        </div>

        {/* 2. ДЕТАЙЛНИ ФИЛТРИ (Сгъваема секция) */}
        {isAdvancedVisible && (
          <div className="pt-6 border-t border-border/70 animate-in fade-in slide-in-from-top-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <Select
                label="Пол на животното"
                placeholder="Избери пол"
                options={genderOptions}
                value={filters?.gender}
                onChange={(value) => onFilterChange('gender', value)}
                clearable
              />
              <Select
                label="Вид животно"
                placeholder="Избери вид"
                options={speciesOptions}
                value={filters?.species}
                onChange={(value) => onFilterChange('species', value)}
                searchable
                clearable
              />
              <Select
                label="Цвят на козината"
                placeholder="Избери цвят"
                options={colorOptions}
                value={filters?.color}
                onChange={(value) => onFilterChange('color', value)}
                searchable
                clearable
              />
            </div>
          </div>
        )}

        {/* 3. ОПЦИИ ЗА АРХИВА (Винаги видима) */}
        <div className="flex items-center justify-between border-t border-border/70 pt-4">
          <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-slate-700">
            <input 
              type="checkbox" 
              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary transition-all cursor-pointer"
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