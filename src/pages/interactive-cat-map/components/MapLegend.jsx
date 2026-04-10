import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const MapLegend = ({ totalCats, filteredCats, catsData, activeFilters }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Изчисляваме бройките динамично на базата на източника/статуса
  const countDone = catsData?.filter(c => c.sourceTable === 'records' && c.status !== 'recorded').length || 0;
  const countAppointments = catsData?.filter(c => c.sourceTable === 'records' && c.status === 'recorded').length || 0;
  const countWaiting = catsData?.filter(c => c.sourceTable === 'waiting').length || 0;

  // Текст за активния филтър за време
  const getTimeLabel = (range) => {
    const labels = {
      '7': 'Последните 7 дни',
      '30': 'Последния месец',
      '90': 'Последните 3 месеца',
      'all': 'Всички записи'
    };
    return labels[range] || labels['all'];
  };

return (
    <div className="absolute bottom-4 left-4 z-[1000] transition-all duration-300">
      {!isExpanded ? (
        /* Свито състояние - малък бутон */
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-card text-primary p-3 rounded-full shadow-warm-lg border border-border hover:bg-muted transition-smooth flex items-center justify-center"
          title="Виж легендата"
        >
          <Icon name="Info" size={24} />
        </button>
      ) : (
        /* Отворено състояние */
        <div className="bg-card rounded-xl shadow-warm-xl p-4 w-72 border border-border relative animate-in fade-in zoom-in duration-200">
          {/* Бутон за затваряне */}
          <button 
            onClick={() => setIsExpanded(false)}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground p-1"
          >
            <Icon name="ChevronDown" size={20} />
          </button>

          <div className="flex items-center gap-2 mb-3 border-b pb-2">
            <Icon name="Info" size={18} className="text-primary" />
            <h4 className="text-sm font-bold text-foreground">Легенда и Статистика</h4>
          </div>

          <div className="space-y-3">
            {/* Секция: Цветове */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                <span className="text-xs text-foreground font-medium">Кастрирани котки: <span className="text-muted-foreground">({countDone})</span></span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                <span className="text-xs text-foreground font-medium">Записан час: <span className="text-muted-foreground">({countAppointments})</span></span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#DC2626]" />
                <span className="text-xs text-foreground font-medium">Чакащи за час: <span className="text-muted-foreground">({countWaiting})</span></span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#10B981] border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">5</div>
                <span className="text-xs text-muted-foreground italic">Група от няколко котки</span>
              </div>
            </div>

            {/* Секция: Активни филтри */}
            <div className="bg-muted/30 p-2 rounded-lg space-y-1">
               <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                 <Icon name="Filter" size={12} />
                 <span>Период: <strong>{getTimeLabel(activeFilters?.timeRange)}</strong></span>
               </div>
               <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                 <span>Общо видими:</span>
                 <span className="font-bold text-primary">{filteredCats} от {totalCats}</span>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapLegend;