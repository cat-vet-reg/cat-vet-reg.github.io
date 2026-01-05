import React from 'react';
import Icon from '../../../components/AppIcon';

const BasicInfoCard = ({ cat }) => {
  const infoItems = [
    {
      icon: 'User',
<<<<<<< HEAD
      label: 'Пол',
=======
      label: 'Gender',
>>>>>>> 5bf2240c40b1ffe00401e90ffe8061c33962b09d
      value: cat?.gender,
      color: cat?.gender === 'Male' ? 'text-primary' : 'text-secondary'
    },
    {
      icon: 'Palette',
<<<<<<< HEAD
      label: 'Цвят',
=======
      label: 'Color',
>>>>>>> 5bf2240c40b1ffe00401e90ffe8061c33962b09d
      value: cat?.color,
      color: 'text-accent'
    },
    {
      icon: 'Weight',
<<<<<<< HEAD
      label: 'Тегло',
      value: `${cat?.weight} кг`,
=======
      label: 'Weight',
      value: `${cat?.weight} kg`,
>>>>>>> 5bf2240c40b1ffe00401e90ffe8061c33962b09d
      color: 'text-success'
    },
    {
      icon: 'MapPin',
<<<<<<< HEAD
      label: 'Локация',
=======
      label: 'Found Location',
>>>>>>> 5bf2240c40b1ffe00401e90ffe8061c33962b09d
      value: cat?.foundLocation,
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
<<<<<<< HEAD
          Основна информация
=======
          Basic Information
>>>>>>> 5bf2240c40b1ffe00401e90ffe8061c33962b09d
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