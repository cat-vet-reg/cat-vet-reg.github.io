import React, { useState, useEffect, useRef } from "react";
import Header           from "../../components/ui/Header";

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
  const calendarRef = useRef(null);
  const blacklistRef = useRef(null);
  const waitingListRef = useRef(null);
  const appointmentFormRef = useRef(null);

  const scrollToSection = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
      notes       : item.data?.notes,
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

  const handleSelectFromCalendar = (record) => {
    console.log("Избрано животно от календара за редакция:", record);

    // Мапираме данните от td_records към структурата на prefillData
    setPrefillData({
      id: record.id,
      isEditing: true, // Флаг, че редактираме съществуващ час, а не създаваме нов
      ownerName: record.owner?.name || record.data?.ownerName || "",
      phone: record.owner?.phone || record.data?.ownerPhone || "",
      address: record.address || record.data?.address || "",
      city: record.record_city || record.data?.recordCity || "",
      zonaNumber: record.zona_number,
      notes: record.data?.notes || "",
      coords: record.map_coordinates || record.data?.coords,
      // Ако искате да попълните и конкретното животно/процедура във формата:
      animals: [
        {
          species: record.species || 'cat',
          gender: record.gender || (record.data?.gender) || 'female',
          count: 1
        }
      ],
      date: record.castrated_at ? record.castrated_at.split('T')[0] : "",
      time: record.data?.appointment_time || "",
      appointmentType: record.visit_type || record.data?.appointment_type || "castration"
    });

    // Плавно скролване до формата "Запиши час"
    if (appointmentFormRef.current) {
      appointmentFormRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

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

            // НОВИТЕ ПОЛЕТА: На корена на обекта
            appointmentTime : appointmentData.time,
            appointmentType : appointmentData.appointmentType,
            notes           : appointmentData.notes,
            
            // Други дефолтни стойности, които API очаква
            donation    : appointmentData.donation || "N",
            data: {
              donation        : appointmentData.donation || "N",
              appointment_time: appointmentData.time,
              appointment_type: appointmentData.appointmentType,
              notes           : appointmentData.notes,
              status          : 'recorded'
            }
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
        alert("Успешно записани часове!");

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
          {/* <Breadcrumb items={breadcrumbItems} /> */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-2">
                График
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
                График на записаните часове за кастрация в Кастрационния център
            </p>
          </div>

          {/* ФИКСИРАНА НАВИГАЦИЯ */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
            <div className="bg-white/80 backdrop-blur-lg border border-slate-200 shadow-2xl rounded-2xl p-2 flex justify-around items-center gap-1">
            
              <button 
                onClick={() => scrollToSection(calendarRef)}
                className="flex flex-col items-center justify-center flex-1 py-2 rounded-xl hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-all"
              >
                <span className="text-lg">📅</span>
                <span className="text-[10px] font-bold uppercase tracking-tighter">График</span>
              </button>

              <div className="w-px h-8 bg-slate-200" /> {/* Разделител */}

              <button 
                onClick={() => scrollToSection(appointmentFormRef)}
                className="flex flex-col items-center justify-center flex-1 py-2 rounded-xl hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-all"
              >
                <span className="text-lg">📝</span>
                <span className="text-[10px] font-bold uppercase tracking-tighter">Час</span>
              </button>

              <div className="w-px h-8 bg-slate-200" />

              <button 
                onClick={() => scrollToSection(blacklistRef)}
                className="flex flex-col items-center justify-center flex-1 py-2 rounded-xl hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-all"
              >
                <span className="text-lg">🚫</span>
                <span className="text-[10px] font-bold uppercase tracking-tighter">Черен</span>
              </button>

              <div className="w-px h-8 bg-slate-200" />

              <button 
                onClick={() => scrollToSection(waitingListRef)}
                className="flex flex-col items-center justify-center flex-1 py-2 rounded-xl hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-all"
              >
                <span className="text-lg">⏳</span>
                <span className="text-[10px] font-bold uppercase tracking-tighter">Чакащи</span>
              </button>
            </div>
          </div>

          {/* Секция: Календар */}
          <div ref={calendarRef} className="mb-10">
              <Calendar 
                selectedDate={date} 
                key={refreshKey}
                onEditEvent={handleSelectFromCalendar} />
          </div>
          <hr className="my-10 border-border" />

          {/* СЕКЦИЯ: Форма + Черен списък */}
          <div className="mb-10">
            <div ref={appointmentFormRef} className="mb-10">
              <div className="border-l-4 border-blue-600 p-4">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Запиши час</h2>
              </div>
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
          
          <div ref={blacklistRef} className="mb-10 items-start">
            {/* Подаваме refreshKey, за да се обновява списъка автоматично */}
            <div className="border-l-4 border-blue-600 p-4">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Черен списък</h2>
            </div>
            <Blacklist key={`blacklist-${refreshKey}`} />
          </div>
          
          <div ref={waitingListRef} className="mb-10 border-border">
            <div className="border-l-4 border-blue-600 p-4">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Списък на чакащи</h2>
            </div>
            <WaitingList
            key={`waiting-list-${refreshKey}`}
            onSelectToSchedule={handleSelectFromWaitingList} 
            onStartEdit={() => scrollToSection(waitingListRef)} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Schedule;