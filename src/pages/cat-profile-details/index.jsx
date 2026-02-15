import React, { useState, useEffect } from 'react';
import { useNavigate, useParams }     from 'react-router-dom';
import Header                 from '../../components/ui/Header';
import Breadcrumb             from '../../components/ui/Breadcrumb';
import ProfileHeader          from './components/ProfileHeader';
import BasicInfoCard          from './components/BasicInfoCard';
import LocationMapCard        from './components/LocationMapCard';
import OwnerContactCard       from './components/OwnerContactCard';
import ActionButtons          from './components/ActionButtons';
import supabase               from '../../utils/supabase';
import ProtocolsCard          from './components/ProtocolsCard';
import AddProtocol            from './components/AddProtocol';

    const MOCK_PROTOCOLS = [
    {
      protocol_number           : 0,
      protocol_creation_date    : "01.01.2026",
      pet_id                    : 1,
      temperature               : 38,
      weight                    : 2,
      anamnesis                 : "анорексия, отпадналост",
      clinical_signs            : ["треска"],
      examination               : "CaniV-4 - положителен за дирофилариоза. ПКК - силна левкоцитоза, анемия.",
      diagnosis                 : "Дирофилариоза",
      treatment                 : "Синулокс 2,4, Байтрил 2,7, Мелбек 0,54, Витамин Б12 1 мл. Ако прояде, започвам Хемовет/ Уолмарк, Имидокарб, Глюкортин.",
      medications               : ["Синулокс", "Байтрил", "Мелбек", "Витамин Б12"],
      manipulations             : ["взимане на кръв", "CaniV-4", "ПКК"],
      differential_diagnosis    : "",
      notes                     : ""
    },
    {
      protocol_number           : 1,
      protocol_creation_date    : "15.01.2026",
      pet_id                    : 1,
      temperature               : 39.9,
      weight                    : 2.1,
      anamnesis                 : "хапнал е малко",
      clinical_signs            : [""],
      examination               : "",
      diagnosis                 : "",
      treatment                 : "",
      medications               : [],
      manipulations             : [],
      differential_diagnosis    : "",
      notes                     : ""
    },
    {
      protocol_number           : 2,
      protocol_creation_date    : "01.02.2026",
      pet_id                    : 1,
      temperature               : 39.9,
      weight                    : 2.3,
      anamnesis                 : "всичко е наред, давам доксициклин пред устата",
      clinical_signs            : [""],
      examination               : "",
      diagnosis                 : "",
      treatment                 : "",
      medications               : [],
      manipulations             : [],
      differential_diagnosis    : "",
      notes                     : ""
    },
    {
    protocol_number           : 3,
    protocol_creation_date    : "21.02.2026",
    pet_id                    : 1,
    temperature               : 39.9,
    weight                    : 2.5,
    anamnesis                 : "Хемофталм,няма гнойни флокули, мек рибаунд, спокойно неболезнено око, лекозрамифорно зачервяване. ДОС,без корнеални дефекти.",
    clinical_signs            : [""],
    examination               : "Тонометър ОС 14 ОД З. Флуоресцин-б.о.",
    diagnosis                 : "",
    treatment                 : "спираме азарга и цефален.  вигамокс 3 х дн. Предни с хлорамфеникол  2 х дн. докси още седмица. хедилон по 1/6т/ден за седмица и спираме. кнтр. след 14 дни",
    medications               : ["Бетадин р-р", "Хлорамфеникол + преднизолон 1% колир", "Вигамокс очен колир"],
    manipulations             : ["Тонометрия"],
    differential_diagnosis    : "",
    notes                     : ""
    }
  ];

const CatProfileDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [catData, setCatData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // const [protocols, setProtocols] = useState([]);
  const [protocols, setProtocols] = useState(MOCK_PROTOCOLS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchCatDetails = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('td_records') // или 'vw_get_all_records'
          .select(`
            *,
            owner:td_owners(name, phone)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        const formattedCat = {
          ...data,
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
        console.error("Грешка при зареждане на животното:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCatDetails();
    }

    const fetchProtocols = async () => {
      try {
        const { data, error } = await supabase
          .from('treatment_protocols') // Увери се, че името на таблицата е такова
          .select('*')
          .eq('pet_id', id)
          .order('protocol_number', { ascending: false });

        if (error) throw error;
        setProtocols(data || []);
      } catch (err) {
        console.error("Грешка при протоколите:", err.message);
      }
    };

    if (id) fetchProtocols();

  }, [id]);

  const breadcrumbItems = [
    { label: 'Табло'              , path: '/dashboard-overview' },
    { label: 'Регистрация животни', path: '/cat-registry-list' },
    { label: 'Профил на животното', path: '#' }
  ];

  const handleEdit = () => {
    navigate('/cat-registration-form', { state: { catData: catData, isEditing: true } });
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

  const handleProtocolSaved = (newProtocol) => {
    setProtocols(prev => [newProtocol, ...prev]);
  };

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

  // Ако няма такова животно
  if (!catData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <p className="text-xl text-red-500 mb-4">Животното не беше намерено!</p>
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
        
        <ProfileHeader cat={catData} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <BasicInfoCard cat={catData} />
            <LocationMapCard cat={catData} />
            <ProtocolsCard 
              protocols={protocols} 
              onAddProtocol={() => setIsModalOpen(true)}
            />
            <AddProtocol 
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              petId={id}
              onSave={handleProtocolSaved}
              lastProtocolNumber={protocols.length > 0 ? protocols[0].protocol_number : 0}
            />
          </div>
          
          <div className="space-y-4 md:space-y-6">
            <OwnerContactCard owner={catData?.owner} />
            <ActionButtons onEdit={() => handleEdit(catData)} onDelete={handleDelete} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CatProfileDetails;