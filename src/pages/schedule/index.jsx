import React, { useState, useEffect, useRef } from "react";
import Header           from "../../components/ui/Header";
import Breadcrumb       from "../../components/ui/Breadcrumb";

import supabase         from "../../utils/supabase";
import { $apiCreateNewRecord } from "../../services/create_new_record";

import WaitingList      from "./components/WaitingList";
import MakeAppointment  from "./components/MakeAppointment";
import Blacklist        from "./components/Blacklist";
import Calendar         from "./components/Calendar";

const Schedule = () => {
  const [date, setDate] = useState(new Date());
  const [refreshKey, setRefreshKey] = useState(0);
  const [prefillData, setPrefillData] = useState(null);

  // референция към формата
  const appointmentFormRef = useRef(null);

  const handleSelectFromWaitingList = (item) => {
    console.log("Избрано животно от списъка:", item);

    // 2. ЗАПИШИ ДАННИТЕ ТУК (в td_waiting_list)
    setPrefillData({
      id          : item.id,
      ownerName   : item.owner_name,
      phone       : item.phone,
      address     : item.address,
      animalType  : item.animal_type,
      gender      : item.gender,
      zonaNumber  : item.zona_number,
      coords      : { lat: item.lat, lng: item.lng }
    });
    // 3. Скролни до конкретния елемент вместо до 0
    if (appointmentFormRef.current) {
      appointmentFormRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center' // подравнява елемента в горната част на екрана

      });
     }
  };
  const breadcrumbItems = [
    { label: 'Табло'    , path: '/dashboard-overview' },
    { label: 'График'   , path: '/schedule' }
  ];

  const registerAnimalIntoTheSystem = async (appointmentData) => {
    try {
      // Въртим цикъл, ако потребителят е добавил повече от едно животно (напр. "2 котки")
      for (const animalGroup of appointmentData.animals) {
        for (let i = 0; i < animalGroup.count; i++) {
          
          // Подготвяме обекта във формат, който defaultFormData разбира
          const formData = {
            ownerName   : appointmentData.ownerName,
            ownerPhone  : appointmentData.phone,
            address     : appointmentData.address,
            recordCity  : appointmentData.city || "",
            zonaNumber  : appointmentData.zonaNumber,
            coords      : appointmentData.coords,
            
            species     : animalGroup.species,
            gender      : animalGroup.gender,
            castratedAt : appointmentData.date,
            status      : 'recorded', // Важно: началният статус е записан
            
            // Други дефолтни стойности, които API очаква
            donation    : appointmentData.donation || "N",
          };

          // ИЗПОЛЗВАМЕ ТВОЯТА ГОТОВА ФУНКЦИЯ
          await $apiCreateNewRecord(formData);
        }
      }

      // Ако записът е дошъл от списъка на чакащи, изтриваме го
      if (appointmentData.id) {
        console.log("Премахвам от Waiting List запис с ID:", appointmentData.id);
        const { error: deleteError } = await supabase
          .from('td_waiting_list')
          .delete()
          .eq('id', appointmentData.id);

        if (deleteError) {
          console.error("Грешка при триене от чакащи:", deleteError);
          // Не спираме процеса тук, защото записите в регистъра вече са направени
        }
      }

        // 3. Обновяваме UI
        setRefreshKey(prev => prev + 1); // Това ще презареди Календара и WaitingList
        setPrefillData(null); // Изчистваме "паметта" на формата
        alert("Успешно записани часове и премахнати от списъка на чакащи!");

    } catch (error) {
      console.error("Грешка при запис:", error);
      alert("Грешка при записването.");
    }
  };

  const handleMarkAsMissed = async (recordId) => {
    try {
      // Обновяваме статуса на двете места
      const { error } = await supabase
        .from('td_records')
        .update({
          status: 'missed',
          // Ползваме RPC, за да не презапишем целия JSON 'data', а само статуса в него
          data: supabase.rpc('jsonb_set', {
            target: 'data',
            path: '{status}',
            value: '"missed"'
          })
        })
        .eq('id', recordId);

      if (error) throw error;
      
      setRefreshKey(prev => prev + 1);
      alert("Животното е отбелязано като 'Пропуснато'.");
    } catch (err) {
      console.error("Грешка:", err);
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
            <div ref={appointmentFormRef} className="mb-10">
              <MakeAppointment
                selectedDate={date}
                prefillData={prefillData}
                onAnimalAdd={(e) => {
                  // Взимаме данните от формата и добавяме ID-то от префила, ако съществува
                  const dataWithId = { ...e, id: prefillData?.id };
                  registerAnimalIntoTheSystem(dataWithId);
                }}
              />
            </div>
          </div>
          
          <div className="mb-10 items-start">
                  {/* Подаваме refreshKey, за да се обновява списъка автоматично */}
                  <Blacklist key={`blacklist-${refreshKey}`} />
          </div>
          
          <div className="mb-10 border-border">
            <WaitingList
            key={`waiting-list-${refreshKey}`}
            onSelectToSchedule={handleSelectFromWaitingList} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Schedule;