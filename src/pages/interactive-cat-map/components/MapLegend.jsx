import React from 'react';
import Icon from '../../../components/AppIcon';

const MapLegend = ({ totalCats, filteredCats }) => {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-card rounded-lg shadow-warm-md p-4 max-w-xs">
      <div className="flex items-center gap-2 mb-3">
        <Icon name="Info" size={18} className="text-primary" />
<<<<<<< HEAD
        <h4 className="text-sm font-semibold text-foreground">Легенда</h4>
=======
        <h4 className="text-sm font-semibold text-foreground">Map Legend</h4>
>>>>>>> 5bf2240c40b1ffe00401e90ffe8061c33962b09d
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
<<<<<<< HEAD
          <span className="text-muted-foreground">Всички регистрирани котки:</span>
          <span className="font-medium text-foreground">{totalCats}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Видими на картата:</span>
=======
          <span className="text-muted-foreground">Total Registered Cats:</span>
          <span className="font-medium text-foreground">{totalCats}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Visible on Map:</span>
>>>>>>> 5bf2240c40b1ffe00401e90ffe8061c33962b09d
          <span className="font-medium text-foreground">{filteredCats}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-primary" />
<<<<<<< HEAD
          <span className="text-xs text-muted-foreground">Локация на една котка</span>
=======
          <span className="text-xs text-muted-foreground">Individual Cat Location</span>
>>>>>>> 5bf2240c40b1ffe00401e90ffe8061c33962b09d
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-secondary-foreground">
            5
          </div>
<<<<<<< HEAD
          <span className="text-xs text-muted-foreground">Локация на няколко котки</span>
=======
          <span className="text-xs text-muted-foreground">Clustered Locations</span>
>>>>>>> 5bf2240c40b1ffe00401e90ffe8061c33962b09d
        </div>
      </div>
    </div>
  );
};

export default MapLegend;