import React, { useState, useEffect } from "react";
import './CalendarCustom.css';
import FullCalendar     from '@fullcalendar/react';
import dayGridPlugin    from '@fullcalendar/daygrid';
import supabase from "utils/supabase";
import { useNavigate } from 'react-router-dom';
import { color } from "d3";


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

  return (
    <div className="mt-10 bg-card p-6 rounded-xl shadow-lg border border-border">
      <FullCalendar
          eventClick={handleEdit}
          dayMaxEvents={false}
          plugins={[ dayGridPlugin ]}
          initialView="dayGridMonth"
          locale="bg"
          headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,dayGridWeek'
          }}
          buttonText={{
              today: 'Днес',
              month: 'Месец',
              week: 'Седмица'
          }}
          events={myEvents}
          eventContent={(eventInfo) => {
            const { isMale, gender, species, phone, ownerName } = eventInfo.event.extendedProps;
            
            // Проверяваме дали събитието е сиво (минало), за да не слагаме ярки цветове на иконите
            const isPast = eventInfo.event.backgroundColor === '#dedede';

            return (
              <div className="p-1 overflow-hidden text-[10px] sm:text-xs cursor-pointer hover:brightness-110 transition-all leading-tight">
                <button 
                onClick={(e) => handleDelete(e, eventInfo.event.id)}
                className="absolute top-0 right-0 p-1 text-red-500 hover:bg-red-50 rounded-bl-lg transition-colors z-50 font-bold"
                title="Изтрий часа"
              >
                ✕ 
              </button>
                <div className="font-bold border-b border-black/10 mb-1 pb-1 flex items-center gap-1">
                  <span style={{ 
                    color: isPast ? '#666' : (isMale ? '#2563eb' : '#e11d48'), 
                    fontSize: '14px'
                  }}>
                    {gender}
                  </span> 
                  <span className="truncate">{species}</span>
                </div>
                
                <div className="flex flex-col opacity-90 text-black">
                  <span className="truncate font-medium">👤 {ownerName}</span>
                  <span className="text-[9px]">📞 {phone}</span>
                </div>
              </div>
            );
          }}
      />
    </div>
  );

};

export default Calendar;