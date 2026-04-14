import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  useMap, 
  GeoJSON, 
  useMapEvents 
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import Header from '../../components/ui/Header';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import MapFilterPanel from './components/MapFilterPanel';
import MapMarkerPopup from './components/MapMarkerPopup';
import MapControls from './components/MapControls';
import MapLegend from './components/MapLegend';
import { $apiGetCats } from '../../services/create_new_record';
import zonesData from '../../constants/map.json';
import { mapDbToUi } from '../cat-registration-form/utils/formMapper';
import MissingCoordsList from './components/MissingCoordsList';
import supabase from '../../utils/supabase';
import WaitingStats from '../schedule/components/WaitingStats';

// --- Помощни компоненти и икони ---
const ZoomTracker = ({ onZoomChange }) => {
  useMapEvents({ zoomend: (e) => onZoomChange(e.target.getZoom()) });
  return null;
};

// Икона за единична котка
const createCustomIcon = (color) => L.divIcon({
  className: 'custom-marker',
  html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
  iconSize: [24, 24], iconAnchor: [12, 12]
});

// Икона за група (клъстер)
const createClusterIcon = (count, color) => L.divIcon({
  className: 'custom-marker-cluster',
  html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; box-shadow: 0 2px 8px rgba(0,0,0,0.3); font-size: 14px;">${count}</div>`,
  iconSize: [32, 32], iconAnchor: [16, 16]
});

const MapBoundsUpdater = ({ cats }) => {
  const map = useMap();
  useEffect(() => {
    const validPoints = cats
      .filter(c => c.coords?.lat && c.coords?.lng)
      .map(c => [c.coords.lat, c.coords.lng]);
    if (validPoints.length > 0) {
      const bounds = L.latLngBounds(validPoints);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [cats, map]);
  return null;
};

// --- Основен компонент ---
const InteractiveCatMap = () => {
  const navigate = useNavigate();
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [mapType, setMapType] = useState('street');
  const [realCats, setRealCats] = useState([]); // Тук пазим всичко от DB
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'all', gender: '', color: '' });
  const [zoomLevel, setZoomLevel] = useState(13);

  // 1. Зареждане на данни (td_records + td_waiting_list)
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setIsLoading(true);
        const recordsRes = await $apiGetCats(); 
        const mappedRecords = recordsRes.data.map(cat => ({
          ...mapDbToUi(cat),
          sourceTable: 'records'
        }));

        const { data: waitingData } = await supabase.from("td_waiting_list").select("*");
        const mappedWaiting = (waitingData || []).map(item => ({
          ...item,
          recordName: item.owner_name, // За съвместимост с UI
          coords: { lat: item.lat, lng: item.lng },
          status: 'waiting_list',
          sourceTable: 'waiting'
        }));

        setRealCats([...mappedRecords, ...mappedWaiting]);
      } catch (e) {
        console.error("Грешка:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadAllData();
  }, []);

  // 2. Логика на филтриране (Чиста и подредена)
  const allFilteredData = useMemo(() => {
    let result = [...realCats];

    if (filters.status === 'done') {
      result = result.filter(c => c.sourceTable === 'records' && c.status !== 'recorded');
    } 
    else if (filters.status === 'appointments') {
      result = result.filter(c => c.sourceTable === 'records' && c.status === 'recorded');
    }
    else if (filters.status === 'waiting') {
      result = result.filter(c => c.sourceTable === 'waiting');
    }

    // 2. Текущ етап (detailedStatus) - работи само за записи от td_records
    if (filters.detailedStatus) {
      result = result.filter(c => c.status === filters.detailedStatus);
    }

    // 3. Здравен статус (condition)
    if (filters.condition) {
      // В зависимост от това как се казва полето в базата ти (вероятно health_status или condition)
      result = result.filter(c => c.health_status === filters.condition || c.condition === filters.condition);
    }

    // 4. Пол
    if (filters.gender) {
      result = result.filter(c => c.gender === filters.gender);
    }

    // 5. Източник (source)
    if (filters.source) {
      result = result.filter(c => c.discovery_source === filters.source || c.source === filters.source);
    }


    // 6. Период на запис (timeRange)
    if (filters.timeRange && filters.timeRange !== 'all') {
      const now = new Date();
      // Задаваме началото на днешния ден (00:00), за да е точно филтрирането
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const daysLimit = parseInt(filters.timeRange);

      result = result.filter(c => {
        // Взимаме датата от created_at или date полето
        const dateValue = c.created_at || c.date;
        if (!dateValue) return false;

        const recordDate = new Date(dateValue);
        
        // Проверка за валидна дата
        if (isNaN(recordDate.getTime())) return false;

        // Изчисляваме разликата в милисекунди и превръщаме в дни
        const diffTime = now.getTime() - recordDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        return diffDays <= daysLimit;
      });
    }    
    
    return result;
  }, [realCats, filters]);

  // Разделяме за Картата и за Списъка под нея
  const filteredCats = useMemo(() => 
    allFilteredData.filter(cat => cat.coords?.lat && cat.coords?.lng), 
  [allFilteredData]);

  const catsWithoutCoords = useMemo(() => 
    allFilteredData.filter(cat => !cat.coords?.lat || !cat.coords?.lng), 
  [allFilteredData]);

  // Групиране на маркери на еднакви координати
  const groupedCats = useMemo(() => {
    const groups = {};
    filteredCats.forEach(cat => {
      const key = `${cat.coords.lat},${cat.coords.lng}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(cat);
    });
    return Object.values(groups);
  }, [filteredCats]);

  // --- Настройки на Leaflet ---
  const tileLayerUrl = mapType === 'satellite' 
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' 
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  // 1. Цветове за картата:
  const COLOR_DONE = '#10B981';      // Зелено - Кастрирани
  const COLOR_APPOINTMENT = '#F59E0B'; // Оранжево - Записан час (td_records)
  const COLOR_WAITING = '#DC2626';     // Червено - Чакащи за час (td_waiting_list)
  const zoneStyle = { fillColor: "#2563EB", weight: 2, opacity: 0.8, color: "#2563EB", fillOpacity: 0.1 };

  const onEachZone = (feature, layer) => {
    if (feature.properties && feature.properties.Zona) {
      const zoneName = `Зона ${feature.properties.Zona}`;

      // Динамичен етикет при посочване
      layer.on({
        mouseover: (e) => {
          e.target.setStyle({ fillOpacity: 0.3, weight: 3 });
          e.target.bindTooltip(zoneName, { sticky: true, className: 'zone-label-hover' }).openTooltip();
        },
        mouseout: (e) => {
          e.target.setStyle({ fillOpacity: 0.1, weight: 2 });
          e.target.closeTooltip();
        }
      });

      // Постоянен етикет при висок зум
      if (zoomLevel >= 14) {
        layer.bindTooltip(zoneName, { permanent: true, direction: 'center', className: 'zone-label-permanent' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <style>{`
        .zone-label-permanent { background: rgba(255,255,255,0.8); border: 1px solid #2563EB; color: #2563EB; font-weight: bold; padding: 2px 4px; border-radius: 4px; font-size: 10px; }
        .zone-label-hover { background: #2563EB !important; color: white !important; font-weight: bold; border: none !important; border-radius: 4px; padding: 4px 8px; }
      `}</style>
      
      <main className="lg:px-6 py-4 z-0">
        <h1 className="text-2xl font-bold my-4">Интерактивна карта</h1>

        {/* Flex контейнер за Карта + Панел */}
        <div className="flex flex-col lg:flex-row gap-4 w-full">
          {/* Контейнер на картата */}
          <div className="h-[500px] lg:h-[600px] relative rounded-lg overflow-hidden border w-full lg:flex-1 z-10">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">Зареждане...</div>
            ) : (
              <MapContainer center={[42.1441, 24.7481]} zoom={13} style={{ height: '100%', width: '100%' }} tap={false} zoomControl={false}>
                <TileLayer url={tileLayerUrl} />
                <ZoomTracker onZoomChange={setZoomLevel} />
                
                <GeoJSON 
                  key={`zones-${zoomLevel}`} 
                  data={zonesData} 
                  style={zoneStyle} 
                  onEachFeature={onEachZone} 
                />
                
                {groupedCats.map((group, idx) => {
                  // Проверяваме съдържанието на групата за определяне на приоритетния цвят
                  const hasWaitingList = group.some(c => c.sourceTable === 'waiting');
                  const hasAppointment = group.some(c => c.sourceTable === 'records' && c.status === 'recorded');

                  let markerColor;
                  if (hasWaitingList) {
                    markerColor = COLOR_WAITING;     // ЧЕРВЕНО: котки без час
                  } else if (hasAppointment) {
                    markerColor = COLOR_APPOINTMENT; // ОРАНЖЕВО: котки със записан час
                  } else {
                    markerColor = COLOR_DONE;        // ЗЕЛЕНО: вече кастрирани котки
                  }

                  return (
                    <Marker 
                      key={idx} 
                      position={[group[0].coords.lat, group[0].coords.lng]}
                      icon={group.length > 1 
                        ? createClusterIcon(group.length, markerColor) 
                        : createCustomIcon(markerColor)}
                    >
                      <Popup><MapMarkerPopup cats={group} /></Popup>
                    </Marker>
                  );
                })}
                <MapBoundsUpdater cats={filteredCats} />
              </MapContainer>
            )}
            <MapControls mapType={mapType} onMapTypeChange={setMapType} />
            <MapLegend 
              totalCats={realCats.length} 
              filteredCats={filteredCats.length} 
              catsData={allFilteredData}
              activeFilters={filters}
            />
          </div>

          {/* Панелът с филтри */}
          <div className="lg:order-2">
             <MapFilterPanel 
               isOpen={isFilterPanelOpen} 
               onClose={() => setIsFilterPanelOpen(false)} 
               onFilterChange={setFilters} 
             />
          </div>
        </div>

        <WaitingStats data={filteredCats} />
        <MissingCoordsList catsWithoutCoords={catsWithoutCoords} />
      </main>

      {/* Бутонът се показва само на мобилни устройства */}
      <div className="lg:hidden fixed bottom-6 right-6 z-[1000]">
        <FloatingActionButton onClick={() => setIsFilterPanelOpen(true)} label="Филтри" />
      </div>
    </div>
  );
};

export default InteractiveCatMap;