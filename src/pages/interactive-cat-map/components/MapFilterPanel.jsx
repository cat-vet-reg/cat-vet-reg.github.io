import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const MapFilterPanel = ({ onFilterChange, isOpen, onClose }) => {
  const [filters, setFilters] = useState({
    search: '',
    gender: '',
    color: '',
    weightMin: '',
    weightMax: ''
  });

  const genderOptions = [
    { value: '', label: 'Всички полове' },
    { value: 'male', label: 'Мъжки' },
    { value: 'female', label: 'Женски' }
  ];

  const colorOptions = [
    // Patterns
    { value: 'tabby'        , label: 'Таби (тигрова)' },

    // Bi-color & multi-color
    { value: 'tabby_white'  , label: 'Таби-бяла (бяла с тигрово)' },
    { value: 'calico'       , label: 'Калико (трицветна)' },
    { value: 'tortoiseshell', label: 'Костенуркова' },
    { value: 'tuxedo'       , label: 'Черно-бяла' },
    { value: 'orange_white' , label: 'Рижо-бяла' },

    // Solid colors
    { value: 'orange'       , label: 'Рижа' },
    { value: 'black'        , label: 'Черна' },
    { value: 'white'        , label: 'Бяла' },
    { value: 'gray'         , label: 'Сива (Синя)' },
    { value: 'brown'        , label: 'Кафява' },
    { value: 'cinnamon'     , label: 'Светлокафява' },
    { value: 'fawn'         , label: 'Бежова' },
  ];

  const handleFilterChange = (field, value) => {
    const updatedFilters = { ...filters, [field]: value };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      gender: '',
      color: '',
      weightMin: '',
      weightMax: ''
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
      <div className={`
        fixed lg:absolute top-0 right-0 h-full w-80 bg-card shadow-warm-lg z-[1150]
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        lg:relative lg:w-80 lg:shadow-warm
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Филтри</h3>
            <button
              onClick={onClose}
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-smooth"
              aria-label="Затвори филтрите"
            >
              <Icon name="X" size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <Input
              type="search"
              label="Търси"
              placeholder="Локация или име на собственик..."
              value={filters?.search}
              onChange={(e) => handleFilterChange('search', e?.target?.value)}
            />

            <Select
              label="Пол"
              options={genderOptions}
              value={filters?.gender}
              onChange={(value) => handleFilterChange('gender', value)}
            />

            <Select
              label="Цвят"
              options={colorOptions}
              value={filters?.color}
              onChange={(value) => handleFilterChange('color', value)}
              searchable
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Телесно тегло (кг)</label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  placeholder="Мин"
                  value={filters?.weightMin}
                  onChange={(e) => handleFilterChange('weightMin', e?.target?.value)}
                  min="0"
                />
                <Input
                  type="number"
                  placeholder="Макс"
                  value={filters?.weightMax}
                  onChange={(e) => handleFilterChange('weightMax', e?.target?.value)}
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-border">
            <Button
              variant="outline"
              fullWidth
              onClick={handleReset}
              iconName="RotateCcw"
              iconPosition="left"
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