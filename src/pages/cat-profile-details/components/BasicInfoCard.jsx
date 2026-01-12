import React from 'react';
import Icon from '../../../components/AppIcon';

const BasicInfoCard = ({ cat }) => {

    const genderOptions = [
      { value: "male"       , label: "Мъжки" },
      { value: "female"     , label: "Женски" },
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

  const ageUnitOptions = [
    { value: "months"       , label: "Месеца" },
    { value: "years"        , label: "Години" },
  ];

  const infoItems = [
    {
      icon: 'User',
      label: 'Пол',
      value: genderOptions.find(opt => opt.value === cat?.gender)?.label || cat?.gender || 'Неизвестен',
      color: cat?.gender === 'male' ? 'text-primary' : 'text-secondary'
    },
    {
      icon: 'Palette',
      label: 'Цвят',
      value: colorOptions.find(opt => opt.value === cat?.color)?.label || cat?.color || 'Неизвестен',
      color: cat?.gender === 'male' ? 'text-primary' : 'text-secondary'
    },
    {
      icon: 'Weight',
      label: 'Тегло',
      value: `${cat?.weight} кг`,
      color: 'text-warning'
    },
    {
      icon: 'Sprout',
      label: 'Възраст',
      value: `${cat?.age_value} ${ageUnitOptions.find(opt => opt.value === cat?.age_unit)?.label || cat?.age_unit || 'Неизвестен'}`,
      color: 'text-warning'
    },
    {
      icon: 'MapPin',
      label: 'Локация',
      value: cat?.foundLocation,
      color: 'text-success'
    },
    {
      icon: 'House',
      label: 'Къде живее:',
      value: cat?.living_condition,
      color: 'text-success'
    },
    {
      icon: 'Calendar',
      label: 'Дата на кастрация',
      value: cat?.neuterDate,
      color: 'text-warning'
    },
    {
      icon: 'AlertTriangle',
      label: 'Усложнения',
      value: cat?.complications,
      color: 'text-warning'
    }
  ];

  return (
    <div className="bg-card rounded-xl shadow-warm p-4 md:p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg">
          <Icon name="Info" size={20} color="var(--color-primary)" className="md:w-6 md:h-6" />
        </div>
        <h2 className="text-xl md:text-2xl lg:text-3xl font-heading font-semibold text-foreground">
          Основна информация
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {infoItems?.map((item, index) => (
          <div 
            key={index}
            className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-smooth"
          >
            <div className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg bg-background flex items-center justify-center ${item?.color}`}>
              <Icon name={item?.icon} size={20} className="md:w-6 md:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground mb-1">
                {item?.label}
              </p>
              <p className="text-sm md:text-base lg:text-lg font-medium text-foreground break-words">
                {item?.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BasicInfoCard;