import React from 'react';
import { useNavigate } from 'react-router-dom';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const RecentActivityCard = ({ cat }) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate('/cat-profile-details', { state: { catId: cat?.id } });
  };

  const getGenderIcon = (gender) => {
    return gender === 'Male' ? 'Mars' : 'Venus';
  };

  const getGenderColor = (gender) => {
    return gender === 'Male' ? 'var(--color-primary)' : 'var(--color-secondary)';
  };

  return (
    <div 
      className="bg-card rounded-lg p-3 md:p-4 shadow-warm hover:shadow-warm-md transition-smooth cursor-pointer"
      onClick={handleViewProfile}
    >
      <div className="flex gap-3 md:gap-4">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden">
            <Image 
              src={cat?.image} 
              alt={cat?.imageAlt}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-base md:text-lg font-semibold text-foreground truncate">
              {cat?.name}
            </h4>
            <Icon 
              name={getGenderIcon(cat?.gender)} 
              size={16} 
              color={getGenderColor(cat?.gender)} 
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="MapPin" size={14} />
              <span className="truncate">{cat?.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="User" size={14} />
              <span className="truncate">{cat?.ownerName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="Clock" size={14} />
              <span>{cat?.registeredTime}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentActivityCard;