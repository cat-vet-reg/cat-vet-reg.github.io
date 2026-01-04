import React from 'react';
import Icon from '../../../components/AppIcon';

const LocationMapCard = ({ cat }) => {
  return (
    <div className="bg-card rounded-xl shadow-warm p-4 md:p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg">
          <Icon name="Map" size={20} color="var(--color-primary)" className="md:w-6 md:h-6" />
        </div>
        <h2 className="text-xl md:text-2xl lg:text-3xl font-heading font-semibold text-foreground">
          Found Location
        </h2>
      </div>
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-start gap-3 p-3 md:p-4 rounded-lg bg-muted/30">
          <Icon name="MapPin" size={20} className="flex-shrink-0 text-warning mt-0.5 md:w-6 md:h-6" />
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Address</p>
            <p className="text-sm md:text-base lg:text-lg font-medium text-foreground break-words">
              {cat?.foundLocation}
            </p>
          </div>
        </div>

        <div className="w-full h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden shadow-warm">
          <iframe
            width="100%"
            height="100%"
            loading="lazy"
            title={`Map showing location where ${cat?.name || 'cat'} was found`}
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${cat?.coordinates?.lat},${cat?.coordinates?.lng}&z=14&output=embed`}
            className="border-0"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="p-3 md:p-4 rounded-lg bg-muted/30">
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Latitude</p>
            <p className="text-sm md:text-base font-mono data-text text-foreground whitespace-nowrap">
              {cat?.coordinates?.lat}
            </p>
          </div>
          <div className="p-3 md:p-4 rounded-lg bg-muted/30">
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Longitude</p>
            <p className="text-sm md:text-base font-mono data-text text-foreground whitespace-nowrap">
              {cat?.coordinates?.lng}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationMapCard;