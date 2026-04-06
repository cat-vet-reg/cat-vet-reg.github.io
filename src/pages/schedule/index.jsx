import React, { useState, useEffect } from "react";

import Header           from "../../components/ui/Header";
import Breadcrumb       from "../../components/ui/Breadcrumb";
import MakeAppointment  from "./components/MakeAppointment";
import Calendar         from "./components/Calendar";
import WaitingList      from "./components/WaitingList";
import Blacklist        from "./components/Blacklist";
import { $apiCreateNewRecord } from "services/create_new_record";

const Schedule = () => {

  const [date, setDate] = useState(new Date());
  const [refreshKey, setRefreshKey] = useState(0);
  const [prefillData, setPrefillData] = useState(null);

  const handleSelectFromWaitingList = (item) => {
    console.log("Избрано животно от списъка:", item);
    
    // 2. ЗАПИШИ ДАННИТЕ ТУК (вместо setFormData)
    setPrefillData({
      ownerName: item.owner_name,
      phone: item.phone,
      address: item.address,
      animalType: item.animal_type,
      gender: item.gender,
      zonaNumber: item.zona_number,
      coords: { lat: item.lat, lng: item.lng }
    });

    // 2. Скролваме нагоре до формата, за да я видиш веднага
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // 3. (Опционално) Ако ползваш модален прозорец, отвори го тук:
    // setIsModalOpen(true); 
  };

  const breadcrumbItems = [
      { label: 'Табло'    , path: '/dashboard-overview' },
      { label: 'График'   , path: '/schedule' }
  ];

  const registerAnimalIntoTheSystem = async (e) => {
    try {
      // Въртим цикъл през всяка добавена група (напр. "2 котки")
      for (const group of e.animals) {
        
        // Въртим втори цикъл за всяка бройка в групата (count)
        for (let i = 0; i < group.count; i++) {
          await $apiCreateNewRecord({
            gender: group.gender,
            ownerName: e.ownerName,
            ownerPhone: e.phone,
            castratedAt: e.date,
            status: 'recorded',
            data: {
              ...group,
              ownerName: e.ownerName,
              ownerPhone: e.phone,
              status: 'recorded',
              count: 1 // В базата влиза като отделна единица
            }
          });
        }
      }

      // ТОВА Е ВАЖНОТО: Обновяваме календара едва след като ВСИЧКИ записи са готови
      setRefreshKey(prev => prev + 1);
      alert("Успешно записани часове!");

    } catch (error) {
      console.error("Грешка при запис:", error);
      alert("Грешка при записването.");
    }
  };

  const handleMarkAsMissed = async (recordId) => {
    try {
        // Намираме записа и му сменяме статуса вътре в JSON обекта 'data'
        const { error } = await supabase
            .from('td_records')
            .update({ 
                'data': supabase.rpc('jsonb_set', {
                    target: 'data',
                    path: '{status}',
                    value: '"missed"'
                })
            })
            .eq('id', recordId);

        if (error) throw error;

        // Обновяваме календара и черния списък
        setRefreshKey(prev => prev + 1);
        alert("Животното е отбелязано като 'Пропуснато'.");
    } catch (err) {
        console.error("Грешка при обновяване на статус:", err);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <Breadcrumb items={breadcrumbItems} />

          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-2">
                График
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
                График на записаните часове за кастрация в Кастрационния център
            </p>
          </div>

          {/* Секция: Календар */}
          <div className="mb-10">
              <Calendar selectedDate={date} key={refreshKey} />
          </div>

          <hr className="my-10 border-border" />

          {/* СЕКЦИЯ: Форма + Черен списък едно до друго */}
          <div className="mb-10">
            <MakeAppointment 
                selectedDate={date}
                prefillData={prefillData} 
                onAnimalAdd={(e) => registerAnimalIntoTheSystem(e)} 
            />
          </div>
          
          <div className="mb-10 items-start">
                  {/* Подаваме refreshKey, за да се обновява списъка автоматично */}
                  <Blacklist key={`blacklist-${refreshKey}`} />
          </div>
          
          <div className="mb-10 border-border">
            <WaitingList onSelectToSchedule={handleSelectFromWaitingList} />
          </div>

        </div>
      </div>

    </>
  );

};

export default Schedule;
