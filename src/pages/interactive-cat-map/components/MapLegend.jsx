import React from 'react';
import Icon from '../../../components/AppIcon';

const MapLegend = ({ totalCats, filteredCats }) => {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-card rounded-lg shadow-warm-md p-4 max-w-xs">
      <div className="flex items-center gap-2 mb-3">
        <Icon name="Info" size={18} className="text-primary" />
        <h4 className="text-sm font-semibold text-foreground">Легенда</h4>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Всички регистрирани котки:</span>
          <span className="font-medium text-foreground">{totalCats}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Видими на картата:</span>
          <span className="font-medium text-foreground">{filteredCats}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">Локация на една котка</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-secondary-foreground">
            5
          </div>
          <span className="text-xs text-muted-foreground">Локация на няколко котки</span>
        </div>
      </div>
    </div>
  );
};

export default MapLegend;