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

      const { data, error } = await supabase.from('td_records').select(`*, owner:owner_id (name, phone)`)
      .order('castrated_at', { ascending: false }) // Първо по дата
      .order('id', { ascending: false });

      for(const element of data) {

        const date      = element.castrated_at; 
        const isPast    = Date.now() >  new Date(date);
        const color     = isPast ? '#dedede' : '#6bbe6f';


        setMyEvents(prev => [...prev, {
          id              : element.id, 
          title           : `${element.owner.name}`, 
          phone           : `${element.owner.phone}`, 
          start           : element.castrated_at,
          data            : element,
          extendedProps   : { 
            phone   : element.owner.phone, 
            ownerId : '123', 
            species : element?.data?.species, 
            gender  : (element?.data?.gender == 'male') ? "♂️" : "♀️",
            date    : element.castrated_at
          },
          backgroundColor : color,
          borderColor     : color          
        }]);
      }
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
              // Разделяме текста, за да го стилизираме
            const title     = eventInfo.event.title;
            const phone     = eventInfo.event.extendedProps.phone;
            const date      = eventInfo.event.extendedProps.date; 
            const gender    = eventInfo.event.extendedProps.gender; 
            const isPast    = Date.now() >  date;

              
            return (
              <div className="p-1 overflow-hidden text-[10px] sm:text-xs cursor-pointer hover:brightness-110 transition-all leading-tight">
                <div className="font-bold border-b border-white/20 mb-1 pb-1">
                  <span style={{color: '#ff0000', fontSize: 24}}>{gender}</span> {title}
                </div>
                <div className="opacity-90 flex items-center gap-1">
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