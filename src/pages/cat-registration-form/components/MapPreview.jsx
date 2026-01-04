import React from 'react';
import Icon from '../../../components/AppIcon';

const MapPreview = ({ address, coordinates, isValidating }) => {
  const hasValidCoordinates = coordinates && coordinates?.lat && coordinates?.lng;

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden h-64 md:h-80 lg:h-96">
      {isValidating ? (
        <div className="flex flex-col items-center justify-center h-full gap-3 px-4">
          <div className="animate-spin">
            <Icon name="Loader2" size={32} className="text-primary" />
          </div>
          <p className="text-sm md:text-base text-muted-foreground text-center">
            Validating address and finding location...
          </p>
        </div>
      ) : hasValidCoordinates ? (
        <div className="relative w-full h-full">
          <iframe
            width="100%"
            height="100%"
            loading="lazy"
            title={`Map showing location: ${address}`}
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${coordinates?.lat},${coordinates?.lng}&z=14&output=embed`}
            className="border-0"
          />
          <div className="absolute top-3 left-3 right-3 bg-background/95 backdrop-blur-sm rounded-md px-3 py-2 shadow-warm">
            <div className="flex items-start gap-2">
              <Icon name="MapPin" size={18} className="text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs md:text-sm text-foreground line-clamp-2">
                {address}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-3 px-4 text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full">
            <Icon name="MapPin" size={32} className="text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm md:text-base font-medium text-foreground">
              Къде е намерено животното
            </p>
            <p className="text-xs md:text-sm text-muted-foreground max-w-xs">
              Въведения адрес в комбинация с града, ще покажат точната улица, върху картата.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPreview;