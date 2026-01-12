import React from 'react';
import Icon from '../../../components/AppIcon'; // Провери дали пътят до иконите е верен

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
const STORAGE_URL = "https://gxnhbymgifwnkipdraye.supabase.co/storage/v1/object/public/protocol_images";

    return (
    <div className="bg-card rounded-xl shadow-warm p-4 md:p-6 lg:p-8 mb-4 md:mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 md:gap-6">
        <div className="flex items-start gap-4 md:gap-6">
          <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-primary/10 rounded-xl flex items-center justify-center overflow-hidden relative">
            {cat?.id ? (
              <>
                <img
                  src={`${STORAGE_URL}/records/${cat.id}/avatar.png?t=${new Date(cat.updated_at || cat.created_at).getTime()}`}
                  alt={cat?.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Ако в Storage НЯМА снимка, скриваме счупеното изображение и показваме иконата
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                {/* Тази икона ще е скрита първоначално и ще се покаже само при грешка (onError) */}
                <div style={{ display: 'none' }} className="w-full h-full items-center justify-center">
                  <Icon name="Cat" size={40} color="var(--color-primary)" />
                </div>
              </>
            ) : (
              <Icon name="Cat" size={40} color="var(--color-primary)" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold text-foreground mb-2">
              {cat?.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm md:text-base text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Icon name="Hash" size={16} className="md:w-5 md:h-5" />
                <span className="font-mono data-text">{cat?.id}</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5">
                <Icon name="Calendar" size={16} className="md:w-5 md:h-5" />
                <span>{formatDate(cat?.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <span className={`
            inline-flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm md:text-base font-medium
            ${cat?.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}
          `}>
            <Icon name={cat?.status === 'active' ? 'CheckCircle2' : 'Clock'} size={16} className="md:w-5 md:h-5" />
            <span className="capitalize">{cat?.status}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;