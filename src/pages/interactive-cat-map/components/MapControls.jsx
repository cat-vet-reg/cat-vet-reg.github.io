import React from 'react';
import Icon from '../../../components/AppIcon';

const MapControls = ({ mapType, onMapTypeChange, clusteringEnabled, onClusteringToggle }) => {
  const mapTypes = [
    { value: 'street', label: 'Street', icon: 'Map' },
    { value: 'satellite', label: 'Satellite', icon: 'Globe' }
  ];

  return (
    <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
      <div className="bg-card rounded-lg shadow-warm-md overflow-hidden">
        {mapTypes?.map((type) => (
          <button
            key={type?.value}
            onClick={() => onMapTypeChange(type?.value)}
            className={`
              flex items-center gap-2 px-4 py-3 w-full transition-smooth
              ${mapType === type?.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-foreground hover:bg-muted'
              }
            `}
            aria-label={`Switch to ${type?.label} view`}
            aria-pressed={mapType === type?.value}
          >
            <Icon name={type?.icon} size={18} />
            <span className="text-sm font-medium">{type?.label}</span>
          </button>
        ))}
      </div>
      <button
        onClick={onClusteringToggle}
        className={`
          flex items-center gap-2 px-4 py-3 rounded-lg shadow-warm-md transition-smooth
          ${clusteringEnabled
            ? 'bg-primary text-primary-foreground'
            : 'bg-card text-foreground hover:bg-muted'
          }
        `}
        aria-label="Toggle marker clustering"
        aria-pressed={clusteringEnabled}
      >
        <Icon name="Layers" size={18} />
        <span className="text-sm font-medium">Clustering</span>
      </button>
    </div>
  );
};

export default MapControls;