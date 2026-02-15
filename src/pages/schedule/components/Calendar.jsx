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


  // const myEvents = [
    // { 
    //   id              : 'anim_1', 
    //   title           : 'Ж КТ - Нанси Танева - 0896160033', 
    //   start           : '2026-02-14',
    //   extendedProps   : { phone: '0896160033', ownerId: '123', species: 'cat', gender: 'female' },
    //   backgroundColor : '#e11d48',
    //   borderColor     : '#e11d48'
    // },
    // { 
    //   id: 'anim_2', 
    //   title: 'Ж КТ - Нанси Танева - 0896160033', 
    //   start: '2026-02-14',
    //   extendedProps: { phone: '0896160033', ownerId: '123', species: 'cat', gender: 'female' },
    //   backgroundColor: '#e11d48',
    //   borderColor: '#e11d48'
    // },
    // { 
    //   id: 'anim_3', 
    //   title: 'М КТ - Нанси Танева - 0896160033', 
    //   start: '2026-02-14',
    //   extendedProps: { phone: '0896160033', ownerId: '123', species: 'cat', gender: 'male' },
    //   backgroundColor: '#10b981', // Зелено, защото приемеме, че това е приключило
    //   borderColor: '#10b981'
    // }
  // ];

  const handleEdit = (cat) => {

    console.log("@=====================")
    console.log(cat.event.extendedProps.data);
    console.log("@=====================")

    navigate('/cat-registration-form', { state: { catData: cat.event.extendedProps.data, isEditing: true } });
  };


  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('td_records')
        .select(`*, owner:owner_id (name, phone)`)
        .order('castrated_at', { ascending: false });

      if (error) return;

      const events = data.map(element => {
        const isPast = Date.now() > new Date(element.castrated_at);
        const eventColor = isPast ? '#dedede' : '#a1ffa6';
        
        // Определяме пола и вида (проверка дали са в element или element.data)
        const genderSym = (element.gender === 'male' || element.data?.gender === 'male') ? "♂️" : "♀️";
        const species = (element.species || element.data?.species || 'Котка');

        return {
          id: element.id,
          // Заглавието вече включва пола и вида
          title: `${genderSym} ${species} - ${element.owner?.name}`, 
          start: element.castrated_at,
          extendedProps: { 
            phone: element.owner?.phone, 
            gender: genderSym,
            species: species,
            ownerName: element.owner?.name,
            data: element 
          },
          backgroundColor: eventColor,
          borderColor: eventColor,
          textColor: isPast ? '#666' : '#000'
        };
      });

      setMyEvents(events); // Директно сетваме целия масив
    })();
  }, []);

  const handleEventClick = (info) => {
    // ВАЖНО: FullCalendar слага extendedProps автоматично в обекта event
    const ownerId       = info.event.extendedProps.ownerId;
    const appointmentId = info.event.id;
    
    console.log("Клик върху:", info.event.title);
    
    // Пренасочваме към формата за регистрация
    window.location.href = `#/register-animal?owner_id=${ownerId}&from_apt=${appointmentId}`;
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
            const { gender, species, phone, ownerName } = eventInfo.event.extendedProps;
            const isMale = gender === "♂️";

            return (
              <div className="p-1 overflow-hidden text-[10px] sm:text-xs cursor-pointer hover:brightness-110 transition-all leading-tight">
                <div className="font-bold border-b border-white/20 mb-1 pb-1 flex items-center gap-1">
                  {/* По-голям и цветен символ за пол */}
                  <span style={{ 
                    color: isMale ? '#3b82f6' : '#f43f5e', 
                    fontSize: '16px',
                    fontWeight: 'bold' 
                  }}>
                    {gender}
                  </span> 
                  <span className="truncate">{species}</span>
                </div>
                
                <div className="flex flex-col opacity-90">
                  <span className="truncate">👤 {ownerName}</span>
                  <span>📞 {phone}</span>
                </div>
              </div>
            );
          }}
      />
    </div>
  );

};

export default Calendar;