import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const MapMarkerPopup = ({ cat }) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate('/cat-profile-details', { state: { catId: cat?.id } });
  };

  return (
    <div className="w-64 bg-card rounded-lg overflow-hidden">
      <div className="relative h-40 bg-muted">
        <Image
          src={cat?.image}
          alt={cat?.imageAlt}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 space-y-3">
        <div>
          <h4 className="text-lg font-semibold text-foreground mb-1">{cat?.name}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2">{cat?.address}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Icon 
              name={cat?.gender === 'male' ? 'Mars' : 'Venus'} 
              size={16} 
              className="text-muted-foreground" 
            />
            <span className="text-foreground capitalize">{cat?.gender}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Palette" size={16} className="text-muted-foreground" />
            <span className="text-foreground capitalize">{cat?.color}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Weight" size={16} className="text-muted-foreground" />
            <span className="text-foreground">{cat?.weight} lbs</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Phone" size={16} className="text-muted-foreground" />
            <span className="text-foreground">{cat?.ownerPhone}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-sm text-muted-foreground mb-2">Owner</p>
          <p className="text-sm font-medium text-foreground">{cat?.ownerName}</p>
        </div>

        <Button
          variant="default"
          fullWidth
          onClick={handleViewProfile}
          iconName="ExternalLink"
          iconPosition="right"
        >
          View Full Profile
        </Button>
      </div>
    </div>
  );
};

export default MapMarkerPopup;