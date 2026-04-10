import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import { 
  statusOptions as detailedStatusOptions, // Преименуваме го локално, за да не се бърка с главния статус
  generalConditionOptions, 
  genderOptions as baseGenderOptions,
  discoverySourceOptions as sourceOptions,
  timeOptions
} from '../../../constants/formOptions';

const MapFilterPanel = ({ onFilterChange, isOpen, onClose }) => {
  const genderOptions = [{ value: '', label: 'Всички полове' }, ...baseGenderOptions];

  const mainStatusOptions = [
    { value: 'all'          , label: 'Всички животни' },
    { value: 'done'         , label: 'Кастрирани (Архив)' },
    { value: 'appointments' , label: 'Със записан час (Оранжево)' },
    { value: 'waiting'      , label: 'Чакащи за час (Червено)' }
  ];

  const detailedStatusForSelect = [
    { value: '', label: 'Всички състояния' },
    ...detailedStatusOptions.map(opt => ({ value: opt.id, label: opt.label }))
  ];

  const [filters, setFilters] = useState({
    search: '',
    status: 'all',          // Главен статус
    detailedStatus: '',     // От твоите statusOptions (recorded, surgery...)
    gender: '',
    condition: '',          // От generalConditionOptions
    timeRange: 'all',
    source: ''              // От discoverySourceOptions
  });

  const handleFilterChange = (field, value) => {
    const updatedFilters = { ...filters, [field]: value };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      status: 'all',
      detailedStatus: '',
      gender: '',
      condition: '',     
      timeRange: 'all',  
      source: ''
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[1100] lg:hidden"
          onClick={onClose}
        />
      )}
      {/* Самият панел */}
      <div className={`
        /* Мобилни стилове: изскача отдясно */
        fixed top-0 right-0 h-full z-[1150] shadow-warm-lg
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}

        /* Десктоп стилове: стои статично до картата */
        lg:relative lg:translate-x-0 lg:h-[600px] lg:z-0 lg:shadow-none lg:block
        w-80 bg-card border border-border rounded-lg
        `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Филтри</h3>
            {/* Бутонът за затваряне е само за мобилни */}
            <button
              onClick={onClose}
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-smooth"
              aria-label="Затвори филтрите"
            >
              <Icon name="X" size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* ГЛАВЕН ТИП (Кастрирани/Чакащи) */}
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
              <Select
                label="Покажи на картата"
                options={mainStatusOptions}
                value={filters.status}
                onChange={(val) => handleFilterChange('status', val)}
              />
            </div>

            {/* ВРЕМЕВИ ФИЛТЪР */}
            <Select
              label="Период на запис"
              options={timeOptions}
              value={filters.timeRange}
              onChange={(val) => handleFilterChange('timeRange', val)}
            />

            {/* ДЕТАЙЛЕН СТАТУС (от твоите опции) */}
            <Select
              label="Текущ етап"
              options={detailedStatusForSelect}
              value={filters.detailedStatus}
              onChange={(val) => handleFilterChange('detailedStatus', val)}
            />

            {/* ЗДРАВНО СЪСТОЯНИЕ */}
            <Select
              label="Здравен статус"
              options={[{ value: '', label: 'Всички' }, ...generalConditionOptions]}
              value={filters.condition}
              onChange={(val) => handleFilterChange('condition', val)}
            />

            {/* ПОЛ */}
            <Select
              label="Пол"
              options={genderOptions}
              value={filters.gender}
              onChange={(val) => handleFilterChange('gender', val)}
            />

            {/* ИЗТОЧНИК
            <Select
              label="Източник / Откъде е котката"
              options={[{ value: '', label: 'Всички източници' }, ...sourceOptions]}
              value={filters.source}
              onChange={(val) => handleFilterChange('source', val)}
            /> */}
          </div>

          <div className="p-4 border-t border-border mt-auto">
            <Button
              variant="outline"
              fullWidth
              onClick={handleReset}
              iconName="RotateCcw"
            >
              Изчисти филтрите
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MapFilterPanel;