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

  const handleEdit = (cat) => {

    console.log("@=====================")
    console.log(cat.event.extendedProps.data);
    console.log("@=====================")

    navigate('/cat-registration-form', { state: { catData: cat.event.extendedProps.data, isEditing: true } });
  };


  // ФУНКЦИЯ ЗА ЗАРЕЖДАНЕ
  const loadCalendarData = async () => {
    const { data, error } = await supabase.from('td_records')
      .select(`*, owner:owner_id (name, phone)`)
      .order('castrated_at', { ascending: false });

    if (error) return;

    const events = data.map(element => {
      const isPast = Date.now() > new Date(element.castrated_at);
      const rawGender = element.gender || element.data?.gender;
      const isMale = rawGender === 'male';

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

  return (
    <div className="mt-10 bg-card p-6 rounded-xl shadow-lg border border-border calendar-container">
      <FullCalendar
          eventClick={handleEdit}
          dayMaxEvents={false}
          plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin ]}
          editable={true}
          eventDrop={handleEventDrop}
          initialView="dayGridWeek"
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
          events={myEvents}
          eventContent={(eventInfo) => {
            const { isMale, gender, species, phone, ownerName, displayId } = eventInfo.event.extendedProps;
            const isPast = eventInfo.event.backgroundColor === '#dedede';

            return (
              <div className="p-1 overflow-hidden text-[10px] sm:text-xs cursor-pointer hover:brightness-95 transition-all leading-tight relative">
                <button 
                  onClick={(e) => handleDelete(e, eventInfo.event.id)}
                  className="absolute top-0 right-0 p-1 text-red-500/50 hover:text-red-600 hover:bg-red-50 rounded-bl-lg transition-colors z-50 font-bold"
                  title="Изтрий часа"
                >
                  ✕ 
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