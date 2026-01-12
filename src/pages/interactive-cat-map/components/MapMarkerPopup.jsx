import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MapMarkerPopup = ({ cats }) => {
  const navigate = useNavigate();
  const STORAGE_URL = "https://gxnhbymgifwnkipdraye.supabase.co/storage/v1/object/public/protocol_images";

  // Функция за навигация
  const goToProfile = (id) => {
    navigate(`/cat-profile-details/${id}`);
  };

  // СЛУЧАЙ 1: МНОГО КОТКИ
  if (cats.length > 1) {
    return (
      <div className="w-64 p-1 max-h-80 overflow-y-auto overflow-x-hidden">
        <h3 className="font-bold text-sm mb-3 border-b pb-1">Котки тук ({cats.length})</h3>
        <div className="space-y-2">
          {cats.map(cat => (
            <div key={cat.id} className="flex items-center justify-between gap-2 p-2 bg-muted/30 rounded">
              <div className="flex items-center gap-2 truncate">
                <span className="text-sm font-medium truncate">{cat.name}</span>
              </div>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => goToProfile(cat.id)}>
                <Icon name="ExternalLink" size={14} />
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // СЛУЧАЙ 2: САМО ЕДНА КОТКА
  const cat = cats[0];
  return (
    <div className="w-64 bg-card rounded-lg overflow-hidden">
      <div className="relative h-32 bg-muted">
        <img
          src={`${STORAGE_URL}/records/${cat.id}/avatar.png?t=${new Date(cat.updated_at || cat.created_at).getTime()}`}
          alt={cat?.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
        />
        <div style={{ display: 'none' }} className="w-full h-full items-center justify-center bg-muted">
           <Icon name="Cat" size={32} className="text-muted-foreground" />
        </div>
      </div>
      <div className="p-3 space-y-2">
        <h4 className="text-base font-semibold text-foreground">{cat?.name}</h4>
        <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Icon name={cat?.gender === 'male' ? 'Mars' : 'Venus'} size={14} />
            <span>{cat?.gender === 'male' ? 'Мъжки' : 'Женски'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="MapPin" size={14} />
            <span className="truncate">{cat?.location_address || 'Няма адрес'}</span>
          </div>
        </div>
        <Button variant="default" fullWidth size="sm" onClick={() => goToProfile(cat.id)} iconName="ExternalLink" iconPosition="right">
          Детайли
        </Button>
      </div>
    </div>
  );
};

export default MapMarkerPopup;