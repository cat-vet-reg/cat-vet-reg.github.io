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
<<<<<<< HEAD
          <h3 className="text-lg md:text-xl font-semibold text-foreground">Географско разпределение</h3>
=======
          <h3 className="text-lg md:text-xl font-semibold text-foreground">Geographic Distribution</h3>
>>>>>>> 5bf2240c40b1ffe00401e90ffe8061c33962b09d
          <button
            onClick={handleViewFullMap}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-smooth"
          >
<<<<<<< HEAD
            <span className="hidden sm:inline">Виж цялата карта</span>
=======
            <span className="hidden sm:inline">View Full Map</span>
>>>>>>> 5bf2240c40b1ffe00401e90ffe8061c33962b09d
            <Icon name="ExternalLink" size={16} />
          </button>
        </div>
      </div>
      <div className="relative h-64 md:h-80 lg:h-96 bg-muted">
        <iframe
          width="100%"
          height="100%"
          loading="lazy"
<<<<<<< HEAD
          title="Географско разпределение на регистрираните котки"
          referrerPolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps?q=42.141994, 24.748734&z=11&output=embed"
=======
          title="Cat Registration Geographic Distribution"
          referrerPolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps?q=40.7128,-74.0060&z=11&output=embed"
>>>>>>> 5bf2240c40b1ffe00401e90ffe8061c33962b09d
          className="w-full h-full"
        />
        
        <div className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 md:p-4 shadow-warm">
<<<<<<< HEAD
          <h4 className="text-sm font-semibold text-foreground mb-2">Хотспот на регистрираните котки</h4>
=======
          <h4 className="text-sm font-semibold text-foreground mb-2">Registration Hotspots</h4>
>>>>>>> 5bf2240c40b1ffe00401e90ffe8061c33962b09d
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
<<<<<<< HEAD
                <span className="font-medium text-foreground">{hotspot?.count} котки</span>
=======
                <span className="font-medium text-foreground">{hotspot?.count} cats</span>
>>>>>>> 5bf2240c40b1ffe00401e90ffe8061c33962b09d
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniMap;