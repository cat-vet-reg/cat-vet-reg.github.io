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
    // КОРИГИРАНО: data: records
    const { data: records, error: err1 } = await supabase.from('td_records')
      .select(`*, owner:owner_id (name, phone)`)
      .order('castrated_at', { ascending: false });
    
    const { data: adminEvents, error: err2 } = await supabase.from('td_calendar_events').select('*');
    
    if (err1 || err2) {
        console.error("Грешка при зареждане:", err1, err2);
        return;
    }

    const counts = {};
    
    // Подготовка на животните
    const animalEvents = (records || []).map(element => {
      const dateKey = element.castrated_at.split('T')[0];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const eventDate = new Date(element.castrated_at);
      eventDate.setHours(0, 0, 0, 0);

      const isPast = eventDate < today;
      
      // КОРИГИРАНО: елементът сам по себе си е записа
      const rawGender = element.gender || element.data?.gender;
      const isMale = rawGender === 'male';

      if (!counts[dateKey]) counts[dateKey] = { male: 0, female : 0 };
      if (isMale) counts[dateKey].male++;
      else counts[dateKey].female++;

      let eventColor = isPast ? '#dedede' : (isMale ? '#dbeafe' : '#ffe4e6');
      const genderSym = isMale ? "♂️" : "♀️";
      const species = (element.species || element.data?.species || 'Котка');

      return {
        id: element.id.toString(),
        title: `${genderSym} ${species} - ${element.owner?.name}`, 
        start: element.castrated_at,
        extendedProps: { 
          type: 'animal', // Важно за разграничаване
          phone: element.owner?.phone, 
          gender: genderSym,
          isMale: isMale,
          species: species,
          ownerName: element.owner?.name,
          displayId: element.id.toString().slice(-4),
          data: element 
        },
        backgroundColor: eventColor,
        borderColor: isPast ? '#ccc' : (isMale ? '#3b82f6' : '#f43f5e'),
        textColor: isPast ? '#666' : '#000'
      };
    });

    // Подготовка на административните събития
    const staffEvents = (adminEvents || []).map(ev => ({
      id: `admin-${ev.id}`,
      title: ev.note,
      start: ev.date,
      allDay: true, 
      display: 'block',
      extendedProps: { 
          type: 'admin', 
          adminType: ev.type 
      },
      backgroundColor: ev.type === 'holiday' ? '#fca5a5' : '#fef08a', 
      textColor: '#000',
      borderColor: 'transparent'
    }));

    setDayCounts(counts);
    setMyEvents([...animalEvents, ...staffEvents]);
  };

  // ФУНКЦИЯ ЗА ДОБАВЯНЕ НА БЕЛЕЖКА (Отпуска/Празник)
  const handleDateClick = async (arg) => {
    const note = window.prompt("Въведете бележка (напр. 'Д-р Петрова - отпуска' или 'Почивен ден'):");
    if (!note) return;

    const type = window.confirm("Това официален празник ли е? (Cancel за отпуска/отсъствие)") ? 'holiday' : 'leave';

    const { error } = await supabase
      .from('td_calendar_events')
      .insert([{ date: arg.dateStr, note, type }]);

    if (!error) loadCalendarData();
  };

  const handleEventClick = (info) => {
    // Ако е административно събитие, можем да го изтрием
    if (info.event.extendedProps.type === 'admin') {
      if (window.confirm("Изтриване на тази бележка?")) {
        const id = info.event.id.replace('admin-', '');
        supabase.from('td_calendar_events').delete().eq('id', id).then(() => loadCalendarData());
      }
      return;
    }
    
    // Ако е животно - стандартната логика за редакция
    if (info.jsEvent.target.closest('button')) return;
    navigate('/cat-registration-form', { 
      state: { catData: info.event.extendedProps.data, isEditing: true } 
    });
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
          dateClick={handleDateClick}
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
            // 1. ПЪРВО ПРОВЕРЯВАМЕ ТИПА
            const type = eventInfo.event.extendedProps.type;

            // АКО Е АДМИНИСТРАТИВНО СЪБИТИЕ
            if (type === 'admin') {
                return (
                    <div className="p-1 text-[10px] font-bold uppercase overflow-hidden truncate">
                        {eventInfo.event.extendedProps.adminType === 'holiday' ? '🏮 ' : '👨‍⚕️ '} 
                        {eventInfo.event.title}
                    </div>
                );
            }

            // АКО Е ЖИВОТНО (Вадим данните само ако е animal)
            const { isMale, gender, species, phone, ownerName, displayId, data } = eventInfo.event.extendedProps;
            const isPast = eventInfo.event.backgroundColor === '#dedede';
            const currentStatus = data?.status;
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
      {/* Секция с инструкции под календара */}
<div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border-t border-slate-200 pt-6">
  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
    <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
      📅 Работа с графици
    </h3>
    <ul className="space-y-1.5 text-slate-600">
      <li>• <strong>Нов запис:</strong> Кликнете на празно място в деня, за да добавите отпуска или празник.</li>
      <li>• <strong>Преместване:</strong> Хванете и плъзнете (drag & drop) запис на котка, за да промените датата му.</li>
      <li>• <strong>Редакция:</strong> Кликнете върху името на стопанина, за да отворите формата за редакция.</li>
      <li>• <strong>Изтриване:</strong> Кликнете върху жълта/червена лента, за да я премахнете от графика.</li>
    </ul>
  </div>

  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
    <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
      🎨 Легенда на цветовете
    </h3>
    <div className="grid grid-cols-2 gap-2">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-[#ffe4e6] border border-[#f43f5e]"></span>
        <span>Женски котки</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-[#dbeafe] border border-[#3b82f6]"></span>
        <span>Мъжки котки</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-[#fef08a]"></span>
        <span>Отпуска / Отсъствие</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-[#fca5a5]"></span>
        <span>Официален празник</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-[#dedede]"></span>
        <span>Минали събития</span>
      </div>
      <div className="flex items-center gap-2">
        <span>✅ / 📥</span>
        <span>Прием в клиниката</span>
      </div>
    </div>
  </div>
</div>
    </div>
  );
};

export default Calendar;