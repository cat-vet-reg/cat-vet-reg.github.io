import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import MapFilterPanel from './components/MapFilterPanel';
import MapMarkerPopup from './components/MapMarkerPopup';
import MapControls from './components/MapControls';
import MapLegend from './components/MapLegend';

// Custom marker icon
const createCustomIcon = (color = '#2563EB') => {
  return L?.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// Map bounds updater component
const MapBoundsUpdater = ({ cats }) => {
  const map = useMap();

  useEffect(() => {
    if (cats?.length > 0) {
      const bounds = L?.latLngBounds(cats?.map((cat) => [cat?.latitude, cat?.longitude]));
      map?.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [cats, map]);

  return null;
};

const InteractiveCatMap = () => {
  const navigate = useNavigate();
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [mapType, setMapType] = useState('street');
  const [clusteringEnabled, setClusteringEnabled] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    gender: '',
    color: '',
    weightMin: '',
    weightMax: ''
  });

  const mockCats = [
  {
    id: 1,
    name: "Рижко",
    gender: "male",
    color: "orange",
    weight: 7,
    ownerName: "Ивана Иванова",
    ownerPhone: "(555) 123-4567",
    address: "ж.к. Тракия, бул. „Освобождение“ 45",
    latitude: 42.133997,
    longitude: 24.781278,
    image: "https://images.unsplash.com/photo-1625477964611-f3f27f0440eb",
    imageAlt: "Orange tabby cat with bright green eyes sitting on wooden surface in natural sunlight"
  },
  {
    id: 2,
    name: "Luna",
    gender: "female",
    color: "black",
    weight: 4,
    ownerName: "Въльо Въльов",
    ownerPhone: "(555) 234-5678",
    address: "Капана, ул. „Абаджийска“ 3",
    latitude: 42.150607,
    longitude: 24.749878,
    image: "https://images.unsplash.com/photo-1568741586108-1c0c410eef2f",
    imageAlt: "Sleek black cat with yellow eyes lying on gray fabric with elegant pose"
  },
  {
    id: 3,
    name: "Симба",
    gender: "female",
    color: "white",
    weight: 6,
    ownerName: "Емилия Емилова",
    ownerPhone: "(555) 345-6789",
    address: "Смирненски, ул. „Рая“ 18",
    latitude: 42.138978,
    longitude: 24.716914,
    image: "https://images.unsplash.com/photo-1586552300242-569438a66e1f",
    imageAlt: "Pure white fluffy cat with blue eyes sitting gracefully on wooden floor"
  },
  {
    id: 4,
    name: "Мими",
    gender: "male",
    color: "gray",
    weight: 4,
    ownerName: "Давид Давидов",
    ownerPhone: "(555) 456-7890",
    address: "Център, ул. „Иван Вазов“ 24",
    latitude: 42.143154,
    longitude: 24.748919,
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1d3c84166-1767380940203.png",
    imageAlt: "Gray striped cat with amber eyes resting on soft cushion in cozy indoor setting"
  },
  {
    id: 5,
    name: "Бела",
    gender: "female",
    color: "calico",
    weight: 3,
    ownerName: "Милена Милева",
    ownerPhone: "(555) 567-8901",
    address: "Кършияка, ул. „Победа“ 12",
    latitude: 42.155408,
    longitude: 24.740128,
    image: "https://images.unsplash.com/photo-1709481800154-ab4d88a548d6",
    imageAlt: "Calico cat with orange, black and white patches sitting on windowsill looking outside"
  },
  {
    id: 6,
    name: "Тигърчо",
    gender: "male",
    color: "tabby",
    weight: 3,
    ownerName: "Румен Руменов",
    ownerPhone: "(555) 678-9012",
    address: "Коматево, ул. „Здравец“ 7",
    latitude: 42.120961,
    longitude: 24.721036,
    image: "https://images.unsplash.com/photo-1597252109509-a4db0eaf07c8",
    imageAlt: "Brown tabby cat with distinctive stripes lying on green grass in outdoor garden"
  },
  {
    id: 7,
    name: "Гушко",
    gender: "male",
    color: "gray",
    weight: 4,
    ownerName: "Анита Велянова",
    ownerPhone: "(555) 789-0123",
    address: "Прослав, ул. „Елин Пелин“ 9",
    latitude: 42.164203,
    longitude: 24.706522,
    image: "https://images.unsplash.com/photo-1702969103545-d65c52bbce43",
    imageAlt: "Smoky gray cat with green eyes sitting upright on wooden deck with alert expression"
  },
  {
    id: 8,
    name: "Принцеса",
    gender: "female",
    color: "white",
    weight: 7,
    ownerName: "Михаил Петров",
    ownerPhone: "0896160033",
    address: "ж.к. Христо Ботев - СеверЮжен, ул. „Бяло море“ 6",
    latitude: 42.129744,
    longitude: 24.742296,
    image: "https://images.unsplash.com/photo-1598111254642-41403176553a",
    imageAlt: "White Persian cat with long fluffy fur and blue eyes sitting on velvet cushion"
  },
  {
    id: 7,
    name: "Мърка",
    gender: "female",
    color: "gray",
    weight: 4,
    ownerName: "Ангел Ангелов",
    ownerPhone: "(555) 789-0123",
    address: "Съдийски, ул. „Варшава“ 11",
    latitude: 42.136087,
    longitude: 24.753614,
    image: "https://images.unsplash.com/photo-1702969103545-d65c52bbce43",
    imageAlt: "Smoky gray cat with green eyes sitting upright on wooden deck with alert expression"
  },
  {
    id: 11,
    name: "Биляна",
    gender: "female",
    color: "orange",
    weight: 3,
    ownerName: "Иван Ангелов",
    ownerPhone: "(555) 123-4567",
    address: "кв. Хан Аспарух - А9 Тракия, бул. „Освобождение“",
    latitude: 42.139743,
    longitude: 24.790469,
    image: "https://images.unsplash.com/photo-1625477964611-f3f27f0440eb",
    imageAlt: "Orange tabby cat with bright green eyes sitting on wooden surface in natural sunlight"
  }];


  const [filteredCats, setFilteredCats] = useState(mockCats);

  useEffect(() => {
    let filtered = mockCats;

    if (filters?.search) {
      const searchLower = filters?.search?.toLowerCase();
      filtered = filtered?.filter((cat) =>
      cat?.address?.toLowerCase()?.includes(searchLower) ||
      cat?.ownerName?.toLowerCase()?.includes(searchLower)
      );
    }

    if (filters?.gender) {
      filtered = filtered?.filter((cat) => cat?.gender === filters?.gender);
    }

    if (filters?.color) {
      filtered = filtered?.filter((cat) => cat?.color === filters?.color);
    }

    if (filters?.weightMin) {
      filtered = filtered?.filter((cat) => cat?.weight >= parseFloat(filters?.weightMin));
    }

    if (filters?.weightMax) {
      filtered = filtered?.filter((cat) => cat?.weight <= parseFloat(filters?.weightMax));
    }

    setFilteredCats(filtered);
  }, [filters]);

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
                  center={[39.7817, -89.6501]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={true}>

                  <TileLayer
                    attribution={tileLayerAttribution}
                    url={tileLayerUrl} />


                  {filteredCats?.map((cat) =>
                  <Marker
                    key={cat?.id}
                    position={[cat?.latitude, cat?.longitude]}
                    icon={createCustomIcon(cat?.gender === 'male' ? '#2563EB' : '#e64072')}>

                      <Popup maxWidth={280} closeButton={true}>
                        <MapMarkerPopup cat={cat} />
                      </Popup>
                    </Marker>
                  )}

                  <MapBoundsUpdater cats={filteredCats} />
                </MapContainer>

                <MapControls
                  mapType={mapType}
                  onMapTypeChange={setMapType}
                  clusteringEnabled={clusteringEnabled}
                  onClusteringToggle={() => setClusteringEnabled(!clusteringEnabled)} />


                <MapLegend
                  totalCats={mockCats?.length}
                  filteredCats={filteredCats?.length} />

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