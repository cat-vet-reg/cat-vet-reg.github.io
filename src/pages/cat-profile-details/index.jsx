import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ProfileHeader from './components/ProfileHeader';
import BasicInfoCard from './components/BasicInfoCard';
import LocationMapCard from './components/LocationMapCard';
import OwnerContactCard from './components/OwnerContactCard';
import ActionButtons from './components/ActionButtons';
import supabase from '../../utils/supabase';
import ProtocolsCard from './components/ProtocolsCard';
import AddProtocol from './components/AddProtocol';

const CatProfileDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Използваме 'id' от тук
  
  const [catData, setCatData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [protocols, setProtocols] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Изнесена функция за протоколите
  const fetchProtocols = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('td_protocols')
        .select('*')
        .eq('record_id', id) // Тук беше грешката с catId
        .order('id', { ascending: false });

      if (!error && data) {
        // Проверяваме дали данните са в колона 'data'
        setProtocols(data.map(p => p.data || p));
      }
    } catch (err) {
      console.error("Грешка при зареждане на протоколи:", err);
    }
  }, [id]);

  // 2. Основен useEffect за данните на котката
  useEffect(() => {
    const fetchCatDetails = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('td_records')
          .select(`*, owner:td_owners(name, phone)`)
          .eq('id', id)
          .single();

        if (error) throw error;

        setCatData({
          ...data,
          foundLocation: data.location_address,
          coordinates: { lat: data.latitude, lng: data.longitude },
          owner: {
            name: data.owner?.name || data.owner_name,
            phone: data.owner?.phone || data.owner_phone,
            email: "Няма предоставен имейл" 
          }
        });
      } catch (error) {
        console.error("Грешка при зареждане:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCatDetails();
      fetchProtocols();
    }
  }, [id, fetchProtocols]);

  const handleProtocolSaved = (newProtocol) => {
    setProtocols(prev => [newProtocol, ...prev]);
    setIsModalOpen(false);
  };

  if (isLoading) return <div className="p-10 text-center">Зареждане...</div>;
  if (!catData) return <div className="p-10 text-center text-red-500">Животното не е намерено!</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumb items={[
          { label: 'Табло', path: '/dashboard-overview' },
          { label: 'Регистрация', path: '/cat-registry-list' },
          { label: 'Профил', path: '#' }
        ]} />
        
        <ProfileHeader cat={catData} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <BasicInfoCard cat={catData} />
            <LocationMapCard cat={catData} />
            
            {/* Секция Протоколи */}
            <ProtocolsCard 
              protocols={protocols} 
              onAddProtocol={() => setIsModalOpen(true)}
            />

            <AddProtocol 
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              petId={id}
              onSave={handleProtocolSaved}
              lastProtocolNumber={protocols.length > 0 ? (protocols[0].protocol_number || 0) : 0}
            />
          </div>
          
          <div className="space-y-6">
            <OwnerContactCard owner={catData?.owner} />
            <ActionButtons 
              onEdit={() => navigate('/cat-registration-form', { state: { catData, isEditing: true } })} 
              onDelete={async () => {
                if(window.confirm("Изтриване?")) {
                  await supabase.from('td_records').delete().eq('id', id);
                  navigate('/cat-registry-list');
                }
              }} 
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CatProfileDetails;