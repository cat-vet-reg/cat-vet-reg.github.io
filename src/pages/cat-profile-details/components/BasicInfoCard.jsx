import React          from 'react';
import Icon           from '../../../components/AppIcon';
import {convertDate}  from '../../../utils/date'
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

const BasicInfoCard = ({ cat }) => {

  const castratedAt = cat?.castrated_at ? convertDate(cat.castrated_at) : null;
  const rawHasComp = cat?.has_complications || cat?.hasComplications || cat?.data?.has_complications;
  const hasComp = rawHasComp?.toString().toUpperCase() === 'Y';
  const selectedKeys = cat?.selectedComplications || cat?.data?.selectedComplications || [];

  const rawEarStatus = cat?.earStatus || cat?.ear_status || cat?.data?.earStatus;
  const isMarked = rawStatus => {
    const s = rawStatus?.toString().toLowerCase();
    return s === 'y' || s === 'marked' || s === 'yes';
  };
  const hasEarMarked = isMarked(rawEarStatus);

  const renderLivingCondition = () => {
    const conditions = cat?.living_condition;
    
    if (!conditions || (Array.isArray(conditions) && conditions.length === 0)) {
      return "Не е посочено";
    }

    if (Array.isArray(conditions)) {
      return (
        <div className="flex flex-wrap gap-2 mt-1">
          {conditions.map((key) => (
            <span 
              key={key} 
              className={`px-2 py-0.5 rounded-full text-xs font-medium border ${habitat[key]?.color || 'bg-gray-100'}`}
            >
              {habitat[key]?.label || key}
            </span>
          ))}
        </div>
      );
    }
    return conditions;
  };

  const renderComplications = () => {
    if (!hasComp || selectedKeys.length === 0) {
      return hasComp ? "Има (не е уточнено)" : "Не";
    }

    const allOptions = [
      ...(complicationOptions?.female || []),
      ...(complicationOptions?.male || []),
      ...(complicationOptions?.general || [])
    ];

    return (
      <div className="flex flex-wrap gap-2 mt-1">
        {selectedKeys.map((key) => {
          const option = allOptions.find(opt => opt.id === key);
          return (
            <span 
              key={key} 
              className="px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold border bg-red-50 text-red-600 border-red-200 shadow-sm"
            >
              {option?.label || key}
            </span>
          );
        })}
      </div>
    );
  };
const infoItems = [
    {
      icon: 'Weight',
      label: 'Тегло',
      value: cat?.weight ? `${cat?.weight} кг` : '—',
      color: 'text-warning'
    },
    {
      icon: 'Sprout',
      label: 'Възраст (кастр.)',
      value: `${cat?.data?.age_value} ${ageUnitOptions.find(opt => opt.value === cat?.data?.age_unit)?.label || ''}`,
      color: 'text-warning'
    },
    {
      icon: 'Calendar',
      label: 'Дата кастрация',
      value: castratedAt,
      color: 'text-warning'
    },
    {
      icon: 'House', // КЪДЕ ЖИВЕЕ
      label: 'Местообитание',
      value: renderLivingCondition(),
      color: 'text-success'
    },
    {
      icon: 'Scissors',
      label: 'Маркирано ухо',
      value: hasEarMarked ? 'Да' : 'Не',
      color: hasEarMarked ? 'text-success' : 'text-muted-foreground'
    },
    {
      icon: 'AlertTriangle',
      label: 'Усложнения',
      value: renderComplications(),
      color: hasComp ? 'text-destructive' : 'text-success'
    },
    {
      icon: 'FileText',
      label: 'Бележки',
      value: <div className="max-w-[150px] truncate text-right ml-auto">{cat?.notes || '—'}</div>,
      color: 'text-primary'
    }
  ];

 return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-4">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
        <Icon name="Info" size={16} className="text-primary" />
        <h2 className="text-xs font-heading font-bold text-foreground uppercase tracking-wider">
          Данни на пациента
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-y-2">
        {infoItems.map((item, index) => (
          <div 
            key={index}
            className="flex justify-between items-start py-1.5 border-b border-dotted border-muted last:border-0"
          >
            <div className="flex items-center gap-2 shrink-0">
              <Icon name={item.icon} size={13} className={`${item.color} opacity-80`} />
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                {item.label}
              </span>
            </div>
            <div className="text-xs font-bold text-foreground text-right pl-4">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BasicInfoCard;