import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header               from '../../components/ui/Header';
import Breadcrumb           from '../../components/ui/Breadcrumb';
import ProfileHeader        from './components/ProfileHeader';
import BasicInfoCard        from './components/BasicInfoCard';
import LocationMapCard      from './components/LocationMapCard';
import OwnerContactCard     from './components/OwnerContactCard';
import ActionButtons        from './components/ActionButtons';
import supabase             from '../../utils/supabase';
import ProtocolsCard        from './components/ProtocolsCard';
import MedicalTreatmentCard from './components/MedicalTreatmentCard';
import AddProtocol          from './components/AddProtocol';
import AddMedicalTreatment  from './components/AddMedicalTreatment';
import Icon                 from '../../components/AppIcon';
import { $apiDeleteRecord } from '../../services/create_new_record'
import IdentificationCard   from './components/IdentificationCard';


const CatProfileDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Използваме 'id' от тук
  
  const [catData, setCatData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [protocols, setProtocols] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProtocol, setEditingProtocol] = useState(null);
  const [isProtocolModalOpen, setIsProtocolModalOpen] = useState(false);
  const [treatments, setTreatments] = useState([]);
  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
  const [medicalType, setMedicalType] = useState('vaccine');
  const [medicalCategory, setMedicalCategory] = useState(null);
  const [identification, setIdentification] = useState(null);
  const [editingTreatment, setEditingTreatment] = useState(null);

  // Функция за отваряне на модала за редактиране
  const handleEditProtocol = (protocol) => {
    setEditingProtocol(protocol); // Запазваме данните на избрания протокол
    setIsProtocolModalOpen(true); // Отваряме модала
  };

  // 1. Изнесена функция за протоколите
  const fetchProtocols = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('td_protocols')
        .select('*')
        .eq('record_id', id)
        .order('id', { ascending: false });

      if (!error && data) {
        // Проверяваме дали данните са в колона 'data'
        setProtocols(data.map(p => ({
          ...(p.data || p),
          db_id: p.id 
        })));
      }
    } catch (err) {
      console.error("Грешка при зареждане на протоколи:", err);
    }
  }, [id]);

  
  // За ваксина, обезпаразитяване
  const fetchTreatments = useCallback(async () => {
    const { data, error } = await supabase
      .from('td_medical_treatments')
      .select('*')
      .eq('animal_id', id)
      .order('administered_at', { ascending: false });

    if (!error && data) setTreatments(data);
  }, [id]);

  // За микрочип и паспорт
  const fetchIdentification = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('td_identifications')
        .select('*')
        .eq('record_id', id)
        .maybeSingle(); // maybeSingle е по-добре от single(), защото ако няма чип, няма да хвърли грешка

      if (!error && data) {
        setIdentification(data);
      }
    } catch (err) {
      console.error("Грешка при зареждане на идентификация:", err);
    }
  }, [id]);

  const handleProtocolSaved = (newProtocol) => {
    setProtocols(prev => [newProtocol, ...prev]);
    setIsModalOpen(false);
  };

  // 2. Основен useEffect за данните на котката
  useEffect(() => {
    const fetchCatDetails = async () => {
      try {
        setIsLoading(true);
        
        // 1. Търсим в td_records по ID
        const { data, error } = await supabase
          .from('td_records') 
          .select('*')
          .eq('id', id)
          .single(); // Използваме single(), защото търсим точно един запис

        if (error) throw error;

        if (data) {
          // Мапваме данните към структурата, която компонентите ти очакват
          setCatData({
            ...data,
            // Тук подсигуряваме, че статусът и координатите са в правилния формат
            status: data.status || 'recorded',
            foundLocation: data.address,
            coordinates: { 
              lat: data.coords?.lat || data.latitude, 
              lng: data.coords?.lng || data.longitude 
            },
            owner: {
              name: data.owner_name || "Неизвестен",
              phone: data.owner_phone || "Няма телефон",
              email: "Няма предоставен имейл" 
            }
          });
        }
      } catch (error) {
        console.error("Грешка при зареждане на профила:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCatDetails();      // 1. Основни данни
      fetchProtocols();       // 2. Операционни протоколи
      fetchTreatments();      // 3. Ваксини/Обезпаразитяване
      fetchIdentification();  // 4. Чип и Паспорт
    }
  }, [id, fetchProtocols, fetchTreatments, fetchIdentification]);

  // За ваксина, обезпаразитяване
  const handleAddMedical = (type, category) => {
    setMedicalType(type);
    setMedicalCategory(category);
    setIsMedicalModalOpen(true);
  };

  const handleEditMedical = (treatment) => {
    setMedicalType(treatment.type);
    setMedicalCategory(treatment.category);
    setEditingTreatment(treatment);
    setIsMedicalModalOpen(true);
  };
  const handleDelete = async () => {
    console.log("Опит за изтриване на запис с ID:", catData?.id); // Добави това за дебъг
    if (!catData?.id) {
      alert("Грешка: Липсва ID на записа.");
      return;
    }
    
    try {
      await $apiDeleteRecord(catData.id);
      navigate('/cat-registry-list'); 
    } catch (err) {
      alert("Неуспешно изтриване: " + err.message);
    }
  };

  if (isLoading) return <div className="p-10 text-center">Зареждане...</div>;
  if (!catData) return <div className="p-10 text-center text-red-500">Животното не е намерено!</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-[1600px] mx-auto px-4 py-6">
        {/* <Breadcrumb items={[
          { label: 'Табло', path: '/dashboard-overview' },
          { label: 'Регистрация', path: '/cat-registry-list' },
          { label: 'Профил', path: '#' }
        ]} /> */}
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-4">
          
          {/* ЛЯВА КОЛОНА (САЙДБАР): Всички данни за животното (Фиксирани) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-6 h-[calc(100vh-40px)] overflow-y-auto no-scrollbar pb-10">
            
            {/* Обединяваме хедъра и инфо картата за компактност */}
            <div className="space-y-4">
              <ProfileHeader cat={catData} isSidebar={true} /> 
              <BasicInfoCard cat={catData} />
              <OwnerContactCard owner={catData?.owner} />
              <IdentificationCard identification={identification} />
              <LocationMapCard cat={catData} />
              
              <div className="pt-2">
                <ActionButtons 
                  onEdit={() => navigate('/cat-registration-form', { state: { catData, isEditing: true } })} 
                  onDelete={handleDelete} 
                />
              </div>
            </div>
          </aside>
          
          {/* ДЯСНА КОЛОНА (РАБОТНА ЗОНА): Само протоколите */}
          <div className="lg:col-span-8">
              <div className="p-0">
                {/* Секция Протоколи */}
                <ProtocolsCard 
                  protocols={protocols} 
                  onAddProtocol={() => {
                    setEditingProtocol(null);
                    setIsProtocolModalOpen(true);
                  }}
                  onEditProtocol={handleEditProtocol}
                />

                {/* Използваме само isProtocolModalOpen, за да няма объркване */}
                <AddProtocol 
                  isOpen={isProtocolModalOpen}
                  onClose={() => {
                    setIsProtocolModalOpen(false);
                    setEditingProtocol(null);
                  }}
                  petId={id}
                  protocolToEdit={editingProtocol} // Не забравяй да подадеш това!
                  onSave={(updatedProtocol) => {
                    // Ако редактираме, обновяваме масива, ако е нов - добавяме го най-отгоре
                    if (editingProtocol) {
                      setProtocols(prev => prev.map(p => p.db_id === updatedProtocol.db_id ? updatedProtocol : p));
                    } else {
                      setProtocols(prev => [updatedProtocol, ...prev]);
                    }
                    setIsProtocolModalOpen(false);
                    setEditingProtocol(null);
                  }}
                  lastProtocolNumber={protocols.length > 0 ? Math.max(...protocols.map(p => p.protocol_number || 0)) : 0}
                />
              </div>
              {/*Ваксинации и обезпаразитявания*/}
              <div className="p-0">
                <MedicalTreatmentCard 
                  treatments={treatments} 
                  onAdd={handleAddMedical}
                  onEdit={handleEditMedical}
                />
                <AddMedicalTreatment 
                  isOpen={isMedicalModalOpen}
                  onClose={() => setIsMedicalModalOpen(false)}
                  petId={id}
                  type={medicalType}
                  category={medicalCategory}
                  onSave={(newRecord) => {
                    setTreatments(prev => [newRecord, ...prev]);
                  }}
                />
              </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default CatProfileDetails;