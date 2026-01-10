import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import Button from '../../components/ui/Button';
import MapFilterPanel from './components/MapFilterPanel';
import MapMarkerPopup from './components/MapMarkerPopup';
import MapControls from './components/MapControls';
import MapLegend from './components/MapLegend';

// Използваме твоя нов сервиз
import { $apiGetCats } from '../../services/create_new_record';

const createCustomIcon = (color = '#2563EB') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const MapBoundsUpdater = ({ cats }) => {
  const map = useMap();
  useEffect(() => {
    // Твоите координати в базата са в полето map_coordinates
    const validPoints = cats
      .filter(c => c.map_coordinates?.lat && c.map_coordinates?.lng)
      .map(c => [c.map_coordinates.lat, c.map_coordinates.lng]);
    
    if (validPoints.length > 0) {
      const bounds = L.latLngBounds(validPoints);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [cats, map]);
  return null;
};

const InteractiveCatMap = () => {
  const navigate = useNavigate();
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [mapType, setMapType] = useState('street');
  const [realCats, setRealCats] = useState([]);
  const [filteredCats, setFilteredCats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ gender: '', color: '' });

  // 1. Вземане на данните чрез твоята функция $apiGetCats
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const response = await $apiGetCats();
      setRealCats(response.data || []);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // 2. Филтриране
  useEffect(() => {
    let result = realCats.filter(cat => 
      cat.map_coordinates?.lat != null && cat.map_coordinates?.lng != null
    );

    if (filters.gender) result = result.filter(c => c.gender === filters.gender);
    if (filters.color) result = result.filter(c => c.color === filters.color);

    setFilteredCats(result);
  }, [filters, realCats]);

  const tileLayerUrl = mapType === 'satellite' 
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' 
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="lg:px-6 py-4">
        <div className="px-4 lg:px-0">
          <Breadcrumb items={[{ label: 'Табло', path: '/' }, { label: 'Карта', path: '/map' }]} />
          <h1 className="text-2xl font-bold my-4">Интерактивна карта</h1>
        </div>

        <div className="h-[600px] relative rounded-lg overflow-hidden border">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">Зареждане...</div>
          ) : (
            <MapContainer center={[42.1441, 24.7481]} zoom={13} style={{ height: '100%' }}>
              <TileLayer url={tileLayerUrl} />
              
              {filteredCats.map((cat) => (
                <Marker 
                  key={cat.id} 
                  position={[cat.map_coordinates.lat, cat.map_coordinates.lng]}
                  icon={createCustomIcon(cat.gender === 'male' ? '#2563EB' : '#e64072')}
                >
                  <Popup>
                    <MapMarkerPopup cat={cat} />
                  </Popup>
                </Marker>
              ))}
              
              <MapBoundsUpdater cats={filteredCats} />
            </MapContainer>
          )}
          <MapControls mapType={mapType} onMapTypeChange={setMapType} />
          <MapLegend totalCats={realCats.length} filteredCats={filteredCats.length} />
        </div>
      </main>
      
      <MapFilterPanel 
        isOpen={isFilterPanelOpen} 
        onClose={() => setIsFilterPanelOpen(false)} 
        onFilterChange={setFilters} 
      />
      
      <FloatingActionButton onClick={() => navigate('/cat-registration-form')} label="Нова котка" />
    </div>
  );
};

export default InteractiveCatMap;