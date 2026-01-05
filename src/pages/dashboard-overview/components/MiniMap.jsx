import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const MiniMap = ({ registrationHotspots }) => {
  const navigate = useNavigate();

  const handleViewFullMap = () => {
    navigate('/interactive-cat-map');
  };

  return (
    <div className="bg-card rounded-lg shadow-warm overflow-hidden">
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg md:text-xl font-semibold text-foreground">Географско разпределение</h3>
          <button
            onClick={handleViewFullMap}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-smooth"
          >
            <span className="hidden sm:inline">Виж цялата карта</span>
            <Icon name="ExternalLink" size={16} />
          </button>
        </div>
      </div>
      <div className="relative h-64 md:h-80 lg:h-96 bg-muted">
        <iframe
          width="100%"
          height="100%"
          loading="lazy"
          title="Географско разпределение на регистрираните котки"
          referrerPolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps?q=42.141994, 24.748734&z=11&output=embed"
          className="w-full h-full"
        />
        
        <div className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 md:p-4 shadow-warm">
          <h4 className="text-sm font-semibold text-foreground mb-2">Хотспот на регистрираните котки</h4>
          <div className="space-y-2">
            {registrationHotspots?.map((hotspot, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: hotspot?.color }}
                  />
                  <span className="text-foreground">{hotspot?.area}</span>
                </div>
                <span className="font-medium text-foreground">{hotspot?.count} котки</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniMap;