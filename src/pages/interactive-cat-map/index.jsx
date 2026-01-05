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

// Fix Leaflet default marker icon issue
delete L?.Icon?.Default?.prototype?._getIconUrl;
L?.Icon?.Default?.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

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
    name: "Whiskers",
    gender: "male",
    color: "orange",
    weight: 12,
    ownerName: "Sarah Johnson",
    ownerPhone: "(555) 123-4567",
    address: "123 Maple Street, Springfield, IL 62701",
    latitude: 39.7817,
    longitude: -89.6501,
    image: "https://images.unsplash.com/photo-1625477964611-f3f27f0440eb",
    imageAlt: "Orange tabby cat with bright green eyes sitting on wooden surface in natural sunlight"
  },
  {
    id: 2,
    name: "Luna",
    gender: "female",
    color: "black",
    weight: 9,
    ownerName: "Michael Chen",
    ownerPhone: "(555) 234-5678",
    address: "456 Oak Avenue, Springfield, IL 62702",
    latitude: 39.7897,
    longitude: -89.6443,
    image: "https://images.unsplash.com/photo-1568741586108-1c0c410eef2f",
    imageAlt: "Sleek black cat with yellow eyes lying on gray fabric with elegant pose"
  },
  {
    id: 3,
    name: "Mittens",
    gender: "female",
    color: "white",
    weight: 8,
    ownerName: "Emily Rodriguez",
    ownerPhone: "(555) 345-6789",
    address: "789 Pine Road, Springfield, IL 62703",
    latitude: 39.7757,
    longitude: -89.6598,
    image: "https://images.unsplash.com/photo-1586552300242-569438a66e1f",
    imageAlt: "Pure white fluffy cat with blue eyes sitting gracefully on wooden floor"
  },
  {
    id: 4,
    name: "Shadow",
    gender: "male",
    color: "gray",
    weight: 14,
    ownerName: "David Thompson",
    ownerPhone: "(555) 456-7890",
    address: "321 Elm Street, Springfield, IL 62704",
    latitude: 39.7937,
    longitude: -89.6381,
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1d3c84166-1767380940203.png",
    imageAlt: "Gray striped cat with amber eyes resting on soft cushion in cozy indoor setting"
  },
  {
    id: 5,
    name: "Bella",
    gender: "female",
    color: "calico",
    weight: 10,
    ownerName: "Jessica Martinez",
    ownerPhone: "(555) 567-8901",
    address: "654 Birch Lane, Springfield, IL 62705",
    latitude: 39.7697,
    longitude: -89.6542,
    image: "https://images.unsplash.com/photo-1709481800154-ab4d88a548d6",
    imageAlt: "Calico cat with orange, black and white patches sitting on windowsill looking outside"
  },
  {
    id: 6,
    name: "Tiger",
    gender: "male",
    color: "tabby",
    weight: 13,
    ownerName: "Robert Wilson",
    ownerPhone: "(555) 678-9012",
    address: "987 Cedar Drive, Springfield, IL 62706",
    latitude: 39.7877,
    longitude: -89.6621,
    image: "https://images.unsplash.com/photo-1597252109509-a4db0eaf07c8",
    imageAlt: "Brown tabby cat with distinctive stripes lying on green grass in outdoor garden"
  },
  {
    id: 7,
    name: "Smokey",
    gender: "male",
    color: "gray",
    weight: 11,
    ownerName: "Amanda Lee",
    ownerPhone: "(555) 789-0123",
    address: "147 Willow Court, Springfield, IL 62707",
    latitude: 39.7657,
    longitude: -89.6462,
    image: "https://images.unsplash.com/photo-1702969103545-d65c52bbce43",
    imageAlt: "Smoky gray cat with green eyes sitting upright on wooden deck with alert expression"
  },
  {
    id: 8,
    name: "Princess",
    gender: "female",
    color: "white",
    weight: 7,
    ownerName: "Christopher Brown",
    ownerPhone: "(555) 890-1234",
    address: "258 Spruce Street, Springfield, IL 62708",
    latitude: 39.7797,
    longitude: -89.6702,
    image: "https://images.unsplash.com/photo-1598111254642-41403176553a",
    imageAlt: "White Persian cat with long fluffy fur and blue eyes sitting on velvet cushion"
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