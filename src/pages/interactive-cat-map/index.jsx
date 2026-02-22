import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  useMap, 
  GeoJSON, 
  Tooltip, 
  useMapEvents 
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import MapFilterPanel from './components/MapFilterPanel';
import MapMarkerPopup from './components/MapMarkerPopup';
import MapControls from './components/MapControls';
import MapLegend from './components/MapLegend';
import { $apiGetCats } from '../../services/create_new_record';
import zonesData from '../../constants/map.json';

// Компонент за следене на Zoom
const ZoomTracker = ({ onZoomChange }) => {
  useMapEvents({
    zoomend: (e) => {
      onZoomChange(e.target.getZoom());
    },
  });
  return null;
};

const createCustomIcon = (color = '#2563EB') => L.divIcon({
  className: 'custom-marker',
  html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
  iconSize: [24, 24], iconAnchor: [12, 12]
});

const createClusterIcon = (count) => L.divIcon({
  className: 'custom-marker-cluster',
  html: `<div style="background-color: #e64072; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; box-shadow: 0 2px 8px rgba(0,0,0,0.3); font-size: 14px;">${count}</div>`,
  iconSize: [32, 32], iconAnchor: [16, 16]
});

const MapBoundsUpdater = ({ cats }) => {
  const map = useMap();
  useEffect(() => {
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
  const [zoomLevel, setZoomLevel] = useState(13); // Държим следа за зума

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const response = await $apiGetCats();
        setRealCats(response.data || []);
      } catch (e) {
        console.error("Грешка при зареждане:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    let result = realCats.filter(cat => 
      cat.map_coordinates?.lat != null && cat.map_coordinates?.lng != null
    );
    if (filters.gender) result = result.filter(c => c.gender === filters.gender);
    if (filters.color) result = result.filter(c => c.color === filters.color);
    setFilteredCats(result);
  }, [filters, realCats]);

  const groupedCats = useMemo(() => {
    const groups = {};
    filteredCats.forEach(cat => {
      const key = `${cat.map_coordinates.lat},${cat.map_coordinates.lng}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(cat);
    });
    return Object.values(groups);
  }, [filteredCats]);

  const tileLayerUrl = mapType === 'satellite' 
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' 
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const zoneStyle = {
    fillColor: "#e64072",
    weight: 3,
    opacity: 1,
    color: "#e64072",
    fillOpacity: 0.15
  };

  const onEachZone = (feature, layer) => {
    if (feature.properties && feature.properties.Zona) {
      // ПОКАЗВАМЕ НОМЕРА САМО ПРИ ЗУМ >= 14
      if (zoomLevel >= 14) {
        layer.bindTooltip(
          `Зона ${feature.properties.Zona}`, 
          { permanent: true, direction: 'center', className: 'zone-label' }
        );
      }

      layer.on({
        mouseover: (e) => e.target.setStyle({ fillOpacity: 0.4, weight: 4 }),
        mouseout: (e) => e.target.setStyle({ fillOpacity: 0.15, weight: 3 })
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <style>{`
        .zone-label {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #e64072;
          color: #e64072;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          pointer-events: none;
        }
      `}</style>
      <main className="lg:px-6 py-4">
        <div className="px-4 lg:px-0">
          <Breadcrumb items={[{ label: 'Табло', path: '/' }, { label: 'Карта', path: '/map' }]} />
          <h1 className="text-2xl font-bold my-4">Интерактивна карта</h1>
        </div>

        <div className="h-[600px] relative rounded-lg overflow-hidden border">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">Зареждане...</div>
          ) : (
            <MapContainer center={[42.1441, 24.7481]} zoom={13} style={{ height: '100%' }}>
              <TileLayer url={tileLayerUrl} />
              
              {/* ВКЛЮЧВАМЕ СЛЕДЕНЕТО НА ЗУМ */}
              <ZoomTracker onZoomChange={setZoomLevel} />
              
              <GeoJSON 
                key={`zoom-${zoomLevel}`} // Презарежда зоните при смяна на зума
                data={zonesData} 
                style={zoneStyle} 
                onEachFeature={onEachZone} 
              />
              
              {groupedCats.map((group, idx) => (
                <Marker 
                  key={idx} 
                  position={[group[0].map_coordinates.lat, group[0].map_coordinates.lng]}
                  icon={group.length > 1 ? createClusterIcon(group.length) : createCustomIcon('#2563EB')}
                >
                  <Popup><MapMarkerPopup cats={group} /></Popup>
                </Marker>
              ))}
              <MapBoundsUpdater cats={filteredCats} />
            </MapContainer>
          )}
          <MapControls mapType={mapType} onMapTypeChange={setMapType} />
          <MapLegend totalCats={realCats.length} filteredCats={filteredCats.length} />
        </div>
      </main>
      <MapFilterPanel isOpen={isFilterPanelOpen} onClose={() => setIsFilterPanelOpen(false)} onFilterChange={setFilters} />
      <FloatingActionButton onClick={() => setIsFilterPanelOpen(true)} label="Филтри" />
    </div>
  );
};

export default InteractiveCatMap;