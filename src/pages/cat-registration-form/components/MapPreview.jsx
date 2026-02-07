import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import If from '../../../components/If';

const MapPreview = ({ address, coordinates, isValidating }) => {
  const hasValidCoordinates =
    coordinates && coordinates.lat && coordinates.lng;

  const [mapUrl, setMapUrl]         = useState(null);
  const [loadingMap, setLoadingMap] = useState(false);

  useEffect(() => {

    console.log("INITTTTTTTTTTTT");
    console.log(coordinates);

    if (!hasValidCoordinates || isValidating) {
      setMapUrl(null);
      return;
    }

    console.log("Step 1");
    console.log(coordinates);

    setLoadingMap(true);

    console.log("Step 2");

    fetch(
      `https://mihail-petrov.me/api/?lat=${coordinates.lat}&lng=${coordinates.lng}`
    )
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to load map');
        }
        return res.json();
      })
      .then(data => {
        setMapUrl(data.mapUrl);
        console.log("|DDDDD");
        console.log(data.mapUrl)

        console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
        console.log(isValidating)
        console.log(loadingMap)
        console.log(mapUrl)
        console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")


      })
      .catch(() => {
        setMapUrl(null);
      })
      .finally(() => {
        setLoadingMap(false);
      });

  }, [coordinates, isValidating, hasValidCoordinates]);

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden h-64 md:h-80 lg:h-96">
      
      <If condition={isValidating || loadingMap}>
        <div className="flex flex-col items-center justify-center h-full gap-3 px-4">
          <div className="animate-spin">
            <Icon name="Loader2" size={32} className="text-primary" />
          </div>
          <p className="text-sm md:text-base text-muted-foreground text-center">
            Loading map preview...
          </p>
        </div>
      </If>

      <If condition={!isValidating && !loadingMap && mapUrl}>
        <div className="relative w-full h-full">
          <iframe
            width="100%"
            height="100%"
            loading="lazy"
            title={`Map showing location: ${address}`}
            referrerPolicy="no-referrer-when-downgrade"
            src={mapUrl}
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
      </If>

      <If condition={!isValidating && !loadingMap && !mapUrl}>
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
      </If>

    </div>
  );
};

export default MapPreview;
