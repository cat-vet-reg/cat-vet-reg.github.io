import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ProfileHeader from './components/ProfileHeader';
import BasicInfoCard from './components/BasicInfoCard';
import LocationMapCard from './components/LocationMapCard';
import OwnerContactCard from './components/OwnerContactCard';
import ActionButtons from './components/ActionButtons';

// Внос на supabase клиента
import supabase from '../../utils/supabase';

const CatProfileDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Взема реалното ID от URL (напр. /cat-profile-details/14)
  
  const [catData, setCatData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCatDetails = async () => {
      try {
        setIsLoading(true);
        
        // Вземаме данните от твоя изглед или таблица
        const { data, error } = await supabase
          .from('td_records') // или 'vw_get_all_records'
          .select(`
            *,
            owner:td_owners(name, phone)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        // Форматираме данните, за да паснат на твоите под-компоненти
        const formattedCat = {
          ...data,
          // Уверяваме се, че структурата съвпада с това, което ProfileHeader и другите очакват
          foundLocation: data.location_address,
          coordinates: {
            lat: data.latitude,
            lng: data.longitude
          },
          owner: {
            name: data.owner?.name || data.owner_name,
            phone: data.owner?.phone || data.owner_phone,
            email: "Няма предоставен имейл" 
          }
        };

        setCatData(formattedCat);
      } catch (error) {
        console.error("Грешка при зареждане на котката:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCatDetails();
    }
  }, [id]);

  const breadcrumbItems = [
    { label: 'Табло', path: '/dashboard-overview' },
    { label: 'Регистрация котки', path: '/cat-registry-list' },
    { label: 'Профил на котката', path: '#' }
  ];

  const handleEdit = () => {
    navigate('/cat-registration-form', { state: { catData, mode: 'edit' } });
  };

  const handleDelete = async () => {
    if (window.confirm("Сигурни ли сте, че искате да изтриете този запис?")) {
      try {
        const { error } = await supabase.from('td_records').delete().eq('id', id);
        if (error) throw error;
        navigate('/cat-registry-list');
      } catch (error) {
        alert("Грешка при изтриване: " + error.message);
      }
    }
  };

  // Показваме индикатор за зареждане, за да не гърми кода докато чакаме базата
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-xl text-muted-foreground">Зареждане на данните...</p>
        </div>
      </div>
    );
  }

  // Ако няма такава котка
  if (!catData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <p className="text-xl text-red-500 mb-4">Котката не беше намерена!</p>
          <button onClick={() => navigate('/cat-registry-list')} className="text-blue-500 underline">
            Върни се към списъка
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
        <Breadcrumb items={breadcrumbItems} />
        
        {/* Вече подаваме catData (реалните данни), а не mockCatData */}
        <ProfileHeader cat={catData} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <BasicInfoCard cat={catData} />
            <LocationMapCard cat={catData} />
          </div>
          
          <div className="space-y-4 md:space-y-6">
            <OwnerContactCard owner={catData?.owner} />
            <ActionButtons onEdit={handleEdit} onDelete={handleDelete} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CatProfileDetails;