import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ProfileHeader from './components/ProfileHeader';
import BasicInfoCard from './components/BasicInfoCard';
import LocationMapCard from './components/LocationMapCard';
import OwnerContactCard from './components/OwnerContactCard';
import ActionButtons from './components/ActionButtons';

const CatProfileDetails = () => {
  const navigate = useNavigate();

  const mockCatData = {
    id: "CAT-2026-001",
    name: "Whiskers",
    gender: "Male",
    color: "Orange Tabby",
    weight: 4.5,
    foundLocation: "Central Park, New York, NY 10024, United States",
    coordinates: {
      lat: 40.7829,
      lng: -73.9654
    },
    status: "active",
    registeredAt: "2026-01-02T14:30:00",
    owner: {
      name: "Sarah Johnson",
      phone: "+1 (555) 123-4567",
      email: "sarah.johnson@email.com"
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard-overview' },
    { label: 'Cat Registry', path: '/cat-registry-list' },
    { label: 'Profile Details', path: '/cat-profile-details' }
  ];

  const handleEdit = () => {
    navigate('/cat-registration-form', { state: { catData: mockCatData, mode: 'edit' } });
  };

  const handleDelete = () => {
    navigate('/cat-registry-list');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
        <Breadcrumb items={breadcrumbItems} />
        
        <ProfileHeader cat={mockCatData} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <BasicInfoCard cat={mockCatData} />
            <LocationMapCard cat={mockCatData} />
          </div>
          
          <div className="space-y-4 md:space-y-6">
            <OwnerContactCard owner={mockCatData?.owner} />
            <ActionButtons onEdit={handleEdit} onDelete={handleDelete} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CatProfileDetails;