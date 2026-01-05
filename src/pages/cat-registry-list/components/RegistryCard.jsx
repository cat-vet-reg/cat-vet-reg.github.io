import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const RegistryCard = ({ 
  cat, 
  isSelected, 
  onSelect, 
  onViewDetails, 
  onEdit 
}) => {
  return (
    <div className="bg-card rounded-lg p-4 shadow-warm hover:shadow-warm-md transition-smooth">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <Checkbox
            checked={isSelected}
            onChange={() => onSelect(cat?.id)}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-1">{cat?.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon 
                name={cat?.gender === 'Male' ? 'Mars' : 'Venus'} 
                size={14} 
                color={cat?.gender === 'Male' ? 'var(--color-primary)' : 'var(--color-secondary)'} 
              />
              <span>{cat?.gender}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            iconName="Eye"
            onClick={() => onViewDetails(cat?.id)}
            aria-label={`View details for ${cat?.name}`}
          />
          <Button
            variant="ghost"
            size="icon"
            iconName="Edit"
            onClick={() => onEdit(cat?.id)}
            aria-label={`Edit ${cat?.name}`}
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded-full border border-border flex-shrink-0"
            style={{ backgroundColor: cat?.colorHex }}
          />
          <span className="text-sm text-muted-foreground">{cat?.color}</span>
        </div>

        <div className="flex items-center gap-2">
          <Icon name="Weight" size={16} className="text-muted-foreground flex-shrink-0" />
          <span className="text-sm text-muted-foreground data-text">{cat?.weight} кг</span>
        </div>

        <div className="flex items-start gap-2">
          <Icon name="MapPin" size={16} className="text-muted-foreground flex-shrink-0 mt-0.5" />
          <span className="text-sm text-muted-foreground line-clamp-2">{cat?.foundLocation}</span>
        </div>

        <div className="flex items-center gap-2">
          <Icon name="User" size={16} className="text-muted-foreground flex-shrink-0" />
          <span className="text-sm text-muted-foreground">{cat?.ownerName}</span>
        </div>

        <div className="flex items-center gap-2">
          <Icon name="Calendar" size={16} className="text-muted-foreground flex-shrink-0" />
          <span className="text-sm text-muted-foreground data-text">{cat?.registrationDate}</span>
        </div>
      </div>
    </div>
  );
};

export default RegistryCard;