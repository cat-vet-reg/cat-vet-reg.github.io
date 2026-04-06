import React from 'react';
import Icon from '../../../components/AppIcon';
import {  genderOptions, 
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
import { cityOptions } from '../../../constants/city_options';

const ProfileHeader = ({ cat }) => {
  // 1. Дефинираме функцията за формат на датата ВЪТРЕ в компонента
  const formatDate = (dateString) => {
    if (!dateString) return "Няма данни";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Невалидна дата";

    return date.toLocaleDateString('bg-BG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 1. Първо, превърни статуса от базата данни в малки букви, за да няма грешки от "Surgery" vs "surgery"
  const rawStatus = cat?.status?.toLowerCase() || '';

  // 2. Търсим съвпадение в нашия списък с опции
  const currentStatus = statusOptions.find(opt => opt.id === rawStatus) || {
    label: cat?.status || 'Няма статус', // Ако не го намерим, показваме каквото пише в БД
    color: 'bg-destructive/10 text-destructive border-destructive/20', // Оцветяваме го в червено, за да сигнализира грешка
    icon: 'AlertCircle'
  };
  
  const STORAGE_URL = "https://gexgpozvrhurkhrlvaah.supabase.co/storage/v1/object/public/protocol_images";

  // Намираме обекта на града по неговото value (напр. Mokren_SLV)
  const cityObj = cityOptions.find(opt => opt.value === cat?.location_city);

  // Ако намерим града, взимаме label-а, иначе показваме оригиналния ключ или '—'
  const displayCity = cityObj ? cityObj.label : (cat?.location_city || '—');

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-4">
      <div className="flex items-start gap-4">
        {/* Снимка */}
        <div className="flex-shrink-0 w-16 h-16 bg-primary/10 rounded-lg overflow-hidden relative border border-primary/20">
           <img
              src={`${STORAGE_URL}/records/${cat.id}/avatar.png?t=${new Date(cat.updated_at || cat.created_at).getTime()}`}
              alt={cat?.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
            <div style={{ display: 'none' }} className="w-full h-full items-center justify-center">
              <Icon name="Cat" size={24} color="var(--color-primary)" />
            </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-xl font-heading font-bold text-foreground truncate leading-tight">
                {cat?.name}
              </h1>
              {/* НОМЕР (ID) веднага под името */}
              <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded w-fit mt-0.5">
                <Icon name="Hash" size={10} />
                {cat?.id}
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${currentStatus.color} shrink-0`}>
              {currentStatus.label}
            </span>
          </div>

          {/* Параметри + Дата на регистрация */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground border-t border-border/50 pt-2">
            <div className="flex items-center gap-1">
              <Icon name={cat?.gender === 'male' ? 'Mars' : 'Venus'} size={12} className={cat?.gender === 'male' ? 'text-blue-500' : 'text-pink-500'} />
              <span className="capitalize">{cat?.gender === 'male' ? 'Мъжки' : 'Женски'}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Icon name="Palette" size={12} />
              <span className="truncate max-w-[70px]">{colorOptions.find(opt => opt.value === cat?.data.color)?.label || cat?.color || '—'}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1" title={cityObj?.description}> 
              <Icon name="MapPin" size={12} className="text-success" />
              <span className="truncate max-w-[100px] font-medium">
                {displayCity}
              </span>
            </div>
          </div>
          
          {/* ДАТА НА РЕГИСТРАЦИЯ */}
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground/70 italic">
             <Icon name="Calendar" size={10} />
             Регистриран на: {formatDate(cat?.created_at)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;