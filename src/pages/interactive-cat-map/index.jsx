import React, { useState, useEffect, useRef }             from 'react';
import { useNavigate }                                    from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import Header               from '../../components/ui/Header';
import Breadcrumb           from '../../components/ui/Breadcrumb';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import Button               from '../../components/ui/Button';
import MapFilterPanel       from './components/MapFilterPanel';
import MapMarkerPopup       from './components/MapMarkerPopup';
import MapControls          from './components/MapControls';
import MapLegend            from './components/MapLegend';

// Custom marker icon
const createCustomIcon = (color = '#2563EB') => {
  return L?.divIcon({
    className   : 'custom-marker',
    html        : `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize    : [24, 24],
    iconAnchor  : [12, 12]
  });
};

// Map bounds updater component
const MapBoundsUpdater = ({ cats }) => {
  const map = useMap();

  useEffect(() => {

    const validCats = cats?.filter(c => c.latitude && c.longitude);
    
    if (validCats && validCats.length > 0) {
      const bounds = L.latLngBounds(validCats.map((c) => [c.latitude, c.longitude]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [cats, map]);

  return null;
};

const InteractiveCatMap = () => {
  const navigate                                        = useNavigate();
  const [isFilterPanelOpen    , setIsFilterPanelOpen  ] = useState(false);
  const [mapType              , setMapType            ] = useState('street');
  const [clusteringEnabled    , setClusteringEnabled  ] = useState(true);

  // Нови стейтове за реалните данни
  const [realCats             , setRealCats           ] = useState([]);
  const [filteredCats         , setFilteredCats       ] = useState([]);
  const [isLoading            , setIsLoading          ] = useState(true);

  const [filters              , setFilters            ] = useState({
    search    : '',
    gender    : '',
    color     : '',
    weightMin : '',
    weightMax : ''
  });

// ФУНКЦИЯ ЗА ВЗЕМАНЕ НА ДАННИ ОТ SUPABASE

const formData = {};
const cityOptions = [];

useEffect(() => {
  

  
  const currentAddress = formData?.address;
  const currentCityValue = formData?.recordCity;
  
  // Намираме етикета на града
  const cityObject = cityOptions.find(opt => opt.value === currentCityValue);
  const cityLabel = cityObject ? cityObject.label : "";

  // Проверяваме условията
  if (currentAddress?.length > 5 && cityLabel) {
    const timer = setTimeout(async () => {
      setIsValidatingAddress(true);
      try {
        const coords = await getCoordinates(cityLabel, currentAddress);
        if (coords) {
          setCoordinates(coords);
        }
      } finally {
        setIsValidatingAddress(false);
      }
    }, 1000);

    return () => clearTimeout(timer); // Важно: чистим таймера при всяка промяна!
  }
}, [formData?.address, formData?.recordCity]); // Изпълнява се само при промяна на адрес или град

  // ФИЛТРИРАНЕ (Обновено да работи с realCats)
// 2. Логика за филтриране
useEffect(() => {

  // Филтрираме САМО тези, които имат валидни координати
  let result = realCats.filter(cat => 
    cat.latitude !== null && 
    cat.longitude !== null &&
    !isNaN(parseFloat(cat.latitude)) && 
    !isNaN(parseFloat(cat.longitude))
  );

  if (filters?.gender) {
    result = result.filter((cat) => cat.gender === filters.gender);
  }

  if (filters?.color) {
    result = result.filter((cat) => cat.color === filters.color);
  }

  // Филтър за тегло (ако го имаш в панела)
  if (filters?.weightMin) {
    result = result.filter((cat) => cat.weight >= parseFloat(filters.weightMin));
  }

  // Накрая обновяваме състоянието, което картата рендерира
  setFilteredCats(result);
}, [filters, realCats]); // Преизчислявай, когато филтрите или данните се променят

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleRegisterCat = () => {
    navigate('/cat-registration-form');
  };

  const breadcrumbItems = [
  { label: 'Табло', path: '/dashboard-overview' },
  { label: 'Интерактивна карта', path: '/interactive-cat-map' }];


  const tileLayerUrl = mapType === 'satellite' ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' :
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const tileLayerAttribution = mapType === 'satellite' ? '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community' : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="lg:px-6">
        <div className="px-4 lg:px-0">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <div className="relative">
          <div className="flex items-center justify-between px-4 lg:px-0 mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-2">
                Интерактивна карта на котките
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Разгледайте регистрирани котки по локация и получете достъп до подробна информация.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => setIsFilterPanelOpen(true)}
              iconName="SlidersHorizontal"
              iconPosition="left"
              className="lg:hidden">

              Филтри
            </Button>
          </div>

          <div className="relative flex gap-4">
            <div className="flex-1 relative">
              <div className="h-[calc(100vh-280px)] md:h-[calc(100vh-240px)] lg:h-[calc(100vh-220px)] rounded-lg overflow-hidden shadow-warm-md bg-muted">
                <MapContainer
                  center={[42.1441, 24.7481]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={true}>

                  <TileLayer
                    attribution={tileLayerAttribution}
                    url={tileLayerUrl} />


                  {filteredCats?.map((cat) => {
                    // Проверка дали координатите са числа
                    if (!cat.latitude || !cat.longitude) return null;

                    return (
                      <Marker
                        key={cat.id}
                        position={[cat.latitude, cat.longitude]}
                        icon={createCustomIcon(cat.gender === 'male' ? '#2563EB' : '#e64072')}
                      >
                        <Popup maxWidth={280}>
                          <MapMarkerPopup cat={cat} />
                        </Popup>
                      </Marker>
                    );
                  })}

                  <MapBoundsUpdater cats={filteredCats} />
                </MapContainer>

                <MapControls
                  mapType={mapType}
                  onMapTypeChange={setMapType}
                  clusteringEnabled={clusteringEnabled}
                  onClusteringToggle={() => setClusteringEnabled(!clusteringEnabled)} />


                <MapLegend
                  totalCats={realCats?.length} // Използвай реалния брой
                  filteredCats={filteredCats?.length} 
                />

              </div>
            </div>

            <MapFilterPanel
              onFilterChange={handleFilterChange}
              isOpen={isFilterPanelOpen}
              onClose={() => setIsFilterPanelOpen(false)} />

          </div>
        </div>
      </main>
      <FloatingActionButton
        onClick={handleRegisterCat}
        label="Регистрирай нова котка" />

    </div>);

};

export default InteractiveCatMap;