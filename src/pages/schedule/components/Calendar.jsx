import React, { useState, useEffect } from "react";
import './CalendarCustom.css';
import FullCalendar     from '@fullcalendar/react';
import dayGridPlugin    from '@fullcalendar/daygrid';
import timeGridPlugin   from '@fullcalendar/timegrid';
import supabase         from "utils/supabase";
import { useNavigate }  from 'react-router-dom';
import { color }        from "d3";
import interactionPlugin from '@fullcalendar/interaction';

const Calendar = () => {

  const [myEvents, setMyEvents] = useState([]);
  const navigate = useNavigate();
  const [dayCounts, setDayCounts] = useState({});
  
  const handleEdit = (info) => {
    // Проверка: ако кликнатият елемент е бутон или вътре в бутон, не прави нищо
    if (info.jsEvent.target.closest('button')) {
      return;
    }

    navigate('/cat-registration-form', { 
      state: { catData: info.event.extendedProps.data, isEditing: true } 
    });
  };
  
  // ФУНКЦИЯ ЗА ЗАРЕЖДАНЕ
  const loadCalendarData = async () => {
    const { data, error } = await supabase.from('td_records')
      .select(`*, owner:owner_id (name, phone)`)
      .order('castrated_at', { ascending: false });

    if (error) return;

    const counts = {};
    const events = data.map(element => {
      const dateKey = element.castrated_at.split('T')[0]
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const eventDate = new Date(element.castrated_at);
      eventDate.setHours(0, 0, 0, 0);

      // Вече е "минало" само ако датата е преди днешната
      const isPast = eventDate < today;
      
      const rawGender = element.gender || element.data?.gender;
      const isMale = rawGender === 'male';

      // Броене
      if (!counts[dateKey]) counts[dateKey] = { male: 0, female : 0 };
      if (isMale) counts[dateKey].male++;
      else counts[dateKey].female++;

      // Логиката за цветовете (Розово/Синьо/Сиво)
      let eventColor = isPast ? '#dedede' : (isMale ? '#dbeafe' : '#ffe4e6');
      const genderSym = isMale ? "♂️" : "♀️";
      const species = (element.species || element.data?.species || 'Котка');

      return {
        id: element.id,
        title: `${genderSym} ${species} - ${element.owner?.name}`, 
        start: element.castrated_at,
        extendedProps: { 
          phone: element.owner?.phone, 
          gender: genderSym,
          isMale: isMale,
          species: species,
          ownerName: element.owner?.name,
          displayId: element.id.toString().slice(-4),
          fullId: element.id,
          data: element 
        },
        backgroundColor: eventColor,
        borderColor: isPast ? '#ccc' : (isMale ? '#3b82f6' : '#f43f5e'),
        textColor: isPast ? '#666' : '#000'
      };
    });
    setDayCounts(counts);
    setMyEvents(events);
  };

  useEffect(() => {
      loadCalendarData();
  }, []);

  const handleDelete = async (e, id) => {
      e.stopPropagation();

      if (!window.confirm("Сигурни ли сте, че искате да изтриете този час?")) return;

      try {
          const { error } = await supabase
              .from('td_records')
              .delete()
              .eq('id', id);

          if (error) throw error;

          // Вместо само да филтрираме, викаме функцията за зареждане,
          // за да сме 100% сигурни, че данните са актуални
          await loadCalendarData();
          
      } catch (err) {
          console.error("Грешка при триене:", err.message);
          alert("Възникна грешка при триенето.");
      }
  };

  const handleEventDrop = async (info) => {
    const eventId = info.event.id;
    const newDate = info.event.startStr.split('T')[0]; // Взимаме само датата YYYY-MM-DD

    if (!window.confirm(`Сигурни ли сте, че искате да преместите часа на ${newDate}?`)) {
      info.revert(); // Връща събитието обратно, ако откажете
      return;
    }

    try {
      const { error } = await supabase
        .from('td_records')
        .update({ castrated_at: newDate })
        .eq('id', eventId);

      if (error) throw error;
      
      // Презареждаме, за да се обновят цветовете (ако от сиво стане цветно)
      loadCalendarData();
    } catch (err) {
      console.error("Грешка при преместване:", err);
      alert("Неуспешно преместване.");
      info.revert();
    }
  };

  const handleMissed = async (e, id) => {
      e.stopPropagation();
      if (!window.confirm("Маркирате този час като ПРОПУСНАТ? Стопанинът ще влезе в черния списък.")) return;

      try {
          // Записваме САМО в основната колона status
          const { error } = await supabase
              .from('td_records')
              .update({ status: 'missed' }) 
              .eq('id', id);

          if (error) throw error;
          
          await loadCalendarData(); 
          alert("Часът е маркиран като пропуснат.");
      } catch (err) {
          console.error("Грешка:", err);
          alert("Грешка при обновяване.");
      }
  };

  const handleReceive = async (e, id) => {
      e.stopPropagation();

      try {
          // Директно обновяваме само главната колона
          const { error } = await supabase
              .from('td_records')
              .update({ status: 'received' }) 
              .eq('id', id);

          if (error) throw error;
          
          await loadCalendarData(); 
      } catch (err) {
          console.error("Грешка при приемане:", err);
          alert("Грешка при обновяване на статус.");
      }
  };

  return (
    <div className="mt-10 bg-card p-6 rounded-xl shadow-lg border border-border calendar-container">
      <FullCalendar
          eventClick={handleEdit}
          dayMaxEvents={false}
          plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin ]}
          editable={true}
          eventDrop={handleEventDrop}
          initialView="dayGridDay"
          locale="bg"
          allDaySlot={false} // Скриваме all-day за по-чист изглед
          slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }} // 24ч формат
          headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,dayGridWeek,dayGridDay'
          }}
          buttonText={{
              today: 'Днес', month: 'Месец', week: 'Седмица', day: 'Ден'
          }}
          dayCellContent={(arg) => {
              // Вземаме локалната дата във формат YYYY-MM-DD
              const year = arg.date.getFullYear();
              const month = String(arg.date.getMonth() + 1).padStart(2, '0');
              const day = String(arg.date.getDate()).padStart(2, '0');
              const dateStr = `${year}-${month}-${day}`;
              
              const counts = dayCounts[dateStr];

              return (
                  <div className="w-full flex justify-between items-start p-1">
                      <span className="fc-daygrid-day-number" style={{ float: 'none', padding: 0 }}>
                          {arg.dayNumberText}
                      </span>
                      
                      {counts && (
                          <div className="flex flex-col items-end gap-0.5 pr-1 pt-0.5">
                              <span className="text-[10px] leading-none px-1 rounded bg-pink-100 text-pink-700 font-bold">
                                  ♀️{counts.female}
                              </span>
                              <span className="text-[10px] leading-none px-1 rounded bg-blue-100 text-blue-700 font-bold">
                                  ♂️{counts.male}
                              </span>
                          </div>
                      )}
                  </div>
              );
          }}
          events={myEvents}
          eventContent={(eventInfo) => {
            const { isMale, gender, species, phone, ownerName, displayId } = eventInfo.event.extendedProps;
            const isPast = eventInfo.event.backgroundColor === '#dedede';
            const currentStatus = eventInfo.event.extendedProps.data.status;
            // Списък със статуси, които означават, че животното Е в клиниката:
            const isAtClinic = !['recorded', 'missed', undefined, null].includes(currentStatus);

            return (
              <div className="p-1 overflow-hidden text-[10px] sm:text-xs cursor-pointer hover:brightness-95 transition-all leading-tight relative">
                <button 
                  onTouchStart={(e) => e.stopPropagation()}
                  onClick={(e) => {
                      if (isAtClinic) return; // Спираме действието, ако вече е прието
                      handleReceive(e, eventInfo.event.id);
                  }}
                  className={`absolute top-0 right-14 p-1 font-bold transition-transform hover:scale-120 ${
                      isAtClinic 
                      ? 'text-green-600' 
                      : 'text-gray-400 hover:text-green-500'
                  }`}
                  title="Маркирай като пристигнало (Received)"
                >
                  {/* Ако е в клиниката (който и да е работен статус), показваме тикче */}
                  {isAtClinic ? '✅' : '📥'}
                </button>
                {/* Промяна и на зелената точка (пулсацията) */}
                {isAtClinic && (
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Животното е в клиниката" />
                )}
                <button 
                  onTouchStart={(e) => e.stopPropagation()}
                  onClick={(e) => handleDelete(e, eventInfo.event.id)}
                  className="absolute top-0 right-0 p-1 text-red-500/50 hover:text-red-600 hover:bg-red-50 rounded-bl-lg transition-colors z-50 font-bold"
                  title="Изтрий часа"
                >
                  ✕ 
                </button>

                <button 
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => handleMissed(e, eventInfo.event.id)}
                    className="absolute top-0 right-7 p-1 text-orange-500 hover:text-orange-700 font-bold"
                    title="Маркирай като пропуснат"
                >
                    🚫
                </button>

                {/* Основен акцент: ПОЛ И ВИД */}
                <div className="font-bold flex items-center justify-between mb-0.5 border-b border-black/5 pb-0.5">
                  <div className="flex items-center gap-1">
                    <span style={{ 
                      color: isPast ? '#666' : (isMale ? '#1d4ed8' : '#be123c'), 
                      fontSize: '14px'
                    }}>
                      {gender}
                    </span> 
                    <span className={isPast ? "text-gray-500" : "text-black"}>
                      {species.toUpperCase()}
                    </span>
                  </div>
               
                  {/* ID НОМЕР - откроен в малко сиво правоъгълниче */}
                  {eventInfo.event.extendedProps.data.status === 'received' && (
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Прието в центъра" />
                  )}
                  <span className="bg-black/5 px-1 rounded text-[9px] text-gray-600 font-mono">
                    #{displayId}
                  </span>
                </div>
                
                {/* Вторичен план: СОБСТВЕНИК И ТЕЛЕФОН */}
                <div className="flex flex-col text-gray-500 border-t border-black/5 mt-0.5 pt-0.5 font-normal">
                  <span className="truncate italic">
                    {ownerName || "—"}
                  </span>
                  <span className="text-[9px] tracking-tighter opacity-80">
                    {phone || "няма тел."}
                  </span>
                </div>
              </div>
            );
          }}
      />
    </div>
  );
};

export default Calendar;