import React, { useState, useEffect } from "react";
import './CalendarCustom.css';
import FullCalendar     from '@fullcalendar/react';
import dayGridPlugin    from '@fullcalendar/daygrid';


const Calendar = () => {

const myEvents = [
    { 
      id: 'anim_1', 
      title: 'Ж КТ - Нанси Танева - 0896160033', 
      start: '2026-02-14',
      extendedProps: { phone: '0896160033', ownerId: '123', species: 'cat', gender: 'female' },
      backgroundColor: '#e11d48',
      borderColor: '#e11d48'
    },
    { 
      id: 'anim_2', 
      title: 'Ж КТ - Нанси Танева - 0896160033', 
      start: '2026-02-14',
      extendedProps: { phone: '0896160033', ownerId: '123', species: 'cat', gender: 'female' },
      backgroundColor: '#e11d48',
      borderColor: '#e11d48'
    },
    { 
      id: 'anim_3', 
      title: 'М КТ - Нанси Танева - 0896160033', 
      start: '2026-02-14',
      extendedProps: { phone: '0896160033', ownerId: '123', species: 'cat', gender: 'male' },
      backgroundColor: '#10b981', // Зелено, защото приемеме, че това е приключило
      borderColor: '#10b981'
    }
  ];

  const handleEventClick = (info) => {
    // ВАЖНО: FullCalendar слага extendedProps автоматично в обекта event
    const ownerId = info.event.extendedProps.ownerId;
    const appointmentId = info.event.id;
    
    console.log("Клик върху:", info.event.title);
    
    // Пренасочваме към формата за регистрация
    window.location.href = `#/register-animal?owner_id=${ownerId}&from_apt=${appointmentId}`;
  };

  return (
    <div className="mt-10 bg-card p-6 rounded-xl shadow-lg border border-border">
      <FullCalendar
          eventClick={handleEventClick}
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
            const titleParts = eventInfo.event.title.split(' - ');
              
            return (
              <div className="p-1 overflow-hidden text-[10px] sm:text-xs cursor-pointer hover:brightness-110 transition-all leading-tight">
                <div className="font-bold border-b border-white/20 mb-1 pb-1">
                  {titleParts[0]} - {titleParts[1]}
                </div>
                <div className="opacity-90 flex items-center gap-1">
                  <span>📞</span> {titleParts[2]}
                </div>
              </div>
            );
          }}
      />
    </div>
  );

};

export default Calendar;