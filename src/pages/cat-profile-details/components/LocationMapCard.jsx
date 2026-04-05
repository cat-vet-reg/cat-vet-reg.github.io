import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { cityOptions } from '../../../constants/city_options'; // Импортираме опциите за градовете

const LocationMapCard = ({ cat }) => {
  const [showFullMap, setShowFullMap] = useState(false);

  // 1. Намираме обекта на града, за да вземем красивото име (label)
  const cityObj = cityOptions.find(opt => opt.value === cat?.location_city);
  const displayCity = cityObj ? cityObj.label : (cat?.location_city || "Няма посочен адрес");

  // 2. Генерираме линка за вграждане (оправена променлива и премахната излишна единица)
  const mapUrl = `https://www.google.com/maps?q=${cat?.map_coordinates?.lat},${cat?.map_coordinates?.lng}&z=15&output=embed`;

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-4">
      {/* Мини Хедър */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon name="MapPin" size={16} className="text-warning" />
          <h2 className="text-xs font-heading font-bold text-foreground uppercase tracking-wider">
            Локация на животното
          </h2>
        </div>
        
        {/* Бутон за отваряне на голямата карта - активен само ако има координати */}
        {cat?.map_coordinates?.lat && (
          <button 
            onClick={() => setShowFullMap(true)}
            className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 transition-all"
          >
            <Icon name="Maximize" size={12} /> Виж картата
          </button>
        )}
      </div>

      {/* Компактен Адрес */}
      <div className="bg-muted/20 p-2.5 rounded-lg border border-border/50">
        <p className="text-xs font-semibold text-foreground leading-snug">
          {displayCity}
        </p>
        {cityObj?.description && (
          <p className="text-[10px] text-muted-foreground italic mb-1">
            {cityObj.description}
          </p>
        )}
        
        <div className="flex gap-3 mt-1.5 text-[9px] font-mono text-muted-foreground/70 uppercase border-t border-border/30 pt-1">
          <span>Lat: {cat?.map_coordinates?.lat?.toFixed(4) || '—'}</span>
          <span>Lng: {cat?.map_coordinates?.lng?.toFixed(4) || '—'}</span>
        </div>
      </div>

      {/* POP-UP МОДАЛ */}
      {showFullMap && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-border">
            <div className="p-4 border-b border-border flex justify-between items-center bg-background">
              <div>
                <h3 className="font-bold flex items-center gap-2 text-foreground">
                  <Icon name="Map" size={20} className="text-primary" />
                  Локация на {cat?.name || 'животното'}
                </h3>
                <p className="text-xs text-muted-foreground">{displayCity}</p>
              </div>
              <button 
                onClick={() => setShowFullMap(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
              >
                <Icon name="X" size={24} />
              </button>
            </div>
            
            <div className="h-[500px] w-full bg-muted/10">
              <iframe
                width="100%"
                height="100%"
                src={mapUrl}
                className="border-0"
                allowFullScreen
                loading="lazy"
                title="Google Maps Location"
              />
            </div>
            
            <div className="p-4 bg-muted/10 flex justify-between items-center text-[10px] text-muted-foreground font-mono">
              <span>Ширина: {cat?.map_coordinates?.lat}</span>
              <span>Дължина: {cat?.map_coordinates?.lng}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationMapCard;