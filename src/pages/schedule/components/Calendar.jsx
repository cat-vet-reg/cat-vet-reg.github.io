import React, { useState, useEffect } from "react";
import * as XLSX    from 'xlsx';
import jsPDF        from 'jspdf';
import autoTable    from 'jspdf-autotable';
import './CalendarCustom.css';
import FullCalendar       from '@fullcalendar/react';
import dayGridPlugin      from '@fullcalendar/daygrid';
import timeGridPlugin     from '@fullcalendar/timegrid';
import supabase           from "utils/supabase";
import { useNavigate }    from 'react-router-dom';
import interactionPlugin  from '@fullcalendar/interaction';
import { useRef }         from 'react';


const Calendar = ({ selectedDate, onEditEvent }) => {

  const [myEvents, setMyEvents] = useState([]);
  const navigate = useNavigate();
  const [dayCounts, setDayCounts] = useState({});
  const [weeklyStats, setWeeklyStats] = useState({ male: 0, female: 0, total: 0 });
  const calendarRef = useRef(null);

  const visitTypeLabels = {
    castration: { label: "Кастрация", icon: "✂️" },
    checkup: { label: "Преглед", icon: "🩺" },
    vaccine: { label: "Ваксина", icon: "💉" },
    surgery: { label: "Операция", icon: "🏥" }
  };

  const handleEdit = (info) => {
    // Проверка: ако кликнатият елемент е бутон или вътре в бутон, не прави нищо
    if (info.jsEvent.target.closest('button')) {
      return;
    }

if (onEditEvent) {
      onEditEvent(info.event.extendedProps.data);
    }
  };


  const handleViewDetails = (catId) => {
    navigate(`/cat-profile-details/${catId}`);
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
// Подготовка на животните
const animalEvents = (records || []).map(element => {
  // 1. Проверяваме дали има реален запис за час в appointments
  const appointment = element.appointments?.[0] || {};
  // Използваме appointment_time ако съществува, в противен случай падаме до castrated_at
  const targetDateStr = appointment.appointment_time || element.castrated_at;

  if (!targetDateStr) {
      return null; 
  }

  // Подсигуряваме правилен парсинг на датата
  const normalizedDateStr = targetDateStr.replace(' ', 'T');
  const dateKey = targetDateStr.split('T')[0];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eventDate = new Date(targetDateStr);
  const isPast = eventDate < today;
  
  const rawGender = element.gender || element.data?.gender;
  const isMale = rawGender === 'male';

  // Броене на кастрациите за деня
  const currentVisitType = element.visit_type || appointment.appointment_type || 'castration';
  if (currentVisitType === 'castration') {
    if (!counts[dateKey]) counts[dateKey] = { male: 0, female : 0 };
    if (isMale) counts[dateKey].male++;
    else counts[dateKey].female++;
  }

       // Цветова схема според типа процедура (ако не е минало събитие)
      let eventColor = '#ffe4e6'; // по подразбиране женска кастрация
      let borderColor = '#f43f5e';
      
      if (isPast) {
        eventColor = '#dedede';
        borderColor = '#ccc';
      } else {
        switch(currentVisitType) {
          case 'checkup':
            eventColor = '#e0f2fe'; // светло синьо
            borderColor = '#0284c7';
            break;
          case 'vaccine':
            eventColor = '#f0fdf4'; // светло зелено
            borderColor = '#22c55e';
            break;
          case 'surgery':
            eventColor = '#faf5ff'; // лилаво
            borderColor = '#a855f7';
            break;
          default:
            eventColor = isMale ? '#dbeafe' : '#ffe4e6';
            borderColor = isMale ? '#3b82f6' : '#f43f5e';
        }
      }

      const genderSym = isMale ? "♂️" : "♀️";
      const species = (element.species || element.data?.species || 'Котка');

  // По-сигурна проверка за наличие на реален записан час
  const hasTime = normalizedDateStr.includes('T') && 
                  normalizedDateStr.split('T')[1] !== '00:00:00' && 
                  normalizedDateStr.split('T')[1] !== '00:00:00.000' && 
                  normalizedDateStr.split('T')[1] !== '00:00:00.000Z' &&
                  !normalizedDateStr.endsWith('00:00:00');

  return {
    id: element.id.toString(),
    title: `${genderSym} ${species} - ${element.owner?.name}`, 
    start: normalizedDateStr, // Вече ще бъде "2026-07-19T09:00:00.000"
    allDay: !hasTime, // Тъй като има час, ще стане false и ще се позиционира правилно
    backgroundColor: eventColor,
    borderColor: borderColor,
    textColor: isPast ? '#666' : '#000',
    extendedProps: { 
      type: 'animal',
      visitType: currentVisitType,
      phone: element.owner?.phone, 
      gender: genderSym,
      isMale: isMale,
      species: species,
      ownerName: element.owner?.name,
      displayId: element.id.toString().slice(-4),
      data: element 
    }
  };
}).filter(ev => ev !== null);

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
    const note = window.prompt("Въведете бележка (напр. 'Д-р Танева - отпуска' или 'Почивен ден'):");
    if (!note) return;

    const type = window.confirm("Това официален празник ли е? (Cancel за отпуска/отсъствие)") ? 'holiday' : 'leave';

    const { error } = await supabase
      .from('td_calendar_events')
      .insert([{ date: arg.dateStr, note, type }]);

    if (!error) loadCalendarData();
  };

  // ОБЕДИНЕНА И КОРИГИРАНА ФУНКЦИЯ ЗА КЛИК ВЪРХУ СЪБИТИЕ
  const handleEventClick = (info) => {
    // Проверка: ако е кликнато върху вътрешен бутон (изтриване, прием, пропуснат), не прави нищо
    if (info.jsEvent.target.closest('button')) return;

    // Ако е административно събитие
    if (info.event.extendedProps.type === 'admin') {
      if (window.confirm("Изтриване на тази бележка?")) {
        const id = info.event.id.replace('admin-', '');
        supabase.from('td_calendar_events')
          .delete()
          .eq('id', id)
          .then(() => loadCalendarData());
      }
      return;
    }
    
    // КЛИК ПО ЖИВОТНО: Отваря профила му, вместо формата за час
    const catId = info.event.id; // Вземаме ID-то на записа/котката
    if (catId) {
      handleViewDetails(catId);
    }
  };

  // Можете да махнете или пренапишете navigateToEdit, ако се вика от иконата на моливчето:
  const navigateToEdit = (catData) => {
    if (onEditEvent) {
      onEditEvent(catData);
    }
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
    // info.event.startStr ни дава пълния ISO стринг (напр. "2026-07-20T10:30:00")
    const newDateTime = info.event.startStr; 
    const newDateOnly = newDateTime.split('T')[0];

    if (!window.confirm(`Сигурни ли сте, че искате да преместите часа на ${newDateTime.replace('T', ' ')}?`)) {
      info.revert();
      return;
    }

    try {
      // 1. Вземаме старите разширени данни за събитието, за да не загубим нещо
      const originalData = info.event.extendedProps.data || {};
      
      // 2. Подготвяме обновения масив appointments
      const updatedAppointments = (originalData.appointments || []).map((app, index) => {
        // Обновяваме първия (или основния) час с новото време от влаченето
        if (index === 0 || !app.appointment_time) {
          return {
            ...app,
            appointment_time: newDateTime,
            status: app.status || 'recorded'
          };
        }
        return app;
      });

      // Ако случайно масивът е бил празен, добавяме новия час
      if (updatedAppointments.length === 0) {
        updatedAppointments.push({
          appointment_time: newDateTime,
          appointment_type: originalData.visit_type || 'castration',
          status: originalData.status || 'recorded'
        });
      }

      // 3. Изпълняваме ъпдейта към Супабейс
      const { error } = await supabase
        .from('td_records')
        .update({ 
          castrated_at: newDateOnly, // Държим чистата дата тук
          appointments: updatedAppointments // Записваме обновения масив с новата дата и час
        })
        .eq('id', eventId);

      if (error) throw error;
      
      await loadCalendarData();
      alert("Часът е преместен успешно!");
    } catch (err) {
      console.error("Грешка при преместване:", err);
      alert("Неуспешно преместване. Проверете връзката или структурата на данните.");
      info.revert(); // Връща събитието на старото му място в календара
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

  const handleDatesSet = (dateInfo) => {
    // dateInfo.start и dateInfo.end са обхватът, който се вижда в момента
    const start = dateInfo.start;
    const end = dateInfo.end;

    let maleCount = 0;
    let femaleCount = 0;

    // Филтрираме събитията, които са от тип 'animal' и попадат в периода
    myEvents.forEach(ev => {
      if (ev.extendedProps?.type === 'animal') {
        const eventDate = new Date(ev.start);
        if (eventDate >= start && eventDate < end) {
          if (ev.extendedProps.isMale) maleCount++;
          else femaleCount++;
        }
      }
    });

    setWeeklyStats({
      male: maleCount,
      female: femaleCount,
      total: maleCount + femaleCount
    });
  };

  const suppliesConfig = {
    blue_needles: 1,
    orange_needles: 1,
    pink_needles: 0.5,
    syringes_oneml: 1,
    syringes_twoml: 1,
    catheters: 1,
    leukoplast: 0.01,

    drape_60_90: 0.5,
    gloves: 1.1,
    scalpel: 1,
    gauzes: 6,
    suture_3_0: 1,
    suture_2_0: 1,

    cocktail_ml: 0.11,
    novocaine_ml: 0.5,
    shotapen_ml: 0.5,
    rheumocam_ml: 0.02,
    fipronil_ml: 0.5,
    fluids_ml: 50,
    alcohol_ml: 10,
    hibiscrub_ml: 15
  };

  const supplyLabels = {
    orange_needles: "Оранжеви игли",
    blue_needles: "Сини игли",
    pink_needles: "Розови игли",
    syringes_oneml: "Спринцовки 1мл",
    syringes_twoml: "Спринцовки 2мл",
    catheters: "Абокати",
    drape_60_90: "Ст. кърпи 60/90",
    shotapen_ml: "Шотапен (мл)",
    rheumocam_ml: "Ревмокам (мл)",
    fipronil_ml: "Фипронил (мл)",
    fluids_ml: "Флуиди (мл)",
    alcohol_ml: "Спирт (мл)",
    hibiscrub_ml: "Хибискръб (мл)"
  };

  const exportWeeklyPDF = (currentView) => {

    // ЗАШТИТА: Ако не сме в седмичен изглед, предупреждаваме потребителя
    if (currentView.type !== 'dayGridWeek') {
      alert("Моля, превключете на изглед 'Седмица', за да генеририте този отчет правилно.");
      return;
    }

    const start = currentView.activeStart;
    const end = currentView.activeEnd;

    const doc = new jsPDF('landscape');

    // 1. Вграждане на шрифта
    doc.addFont("https://cdn.jsdelivr.net/npm/roboto-font@0.1.0/fonts/Roboto/roboto-regular-webfont.ttf", "Roboto", "normal");
    doc.setFont("Roboto");

    //const title = `ГРАФИК ЗА ПЕРИОДА: ${start.toLocaleDateString('bg-BG')} - ${new Date(end - 1).toLocaleDateString('bg-BG')}`;
    doc.setFontSize(12);
    //doc.text(title, 14, 12);

    // 2. Генериране на заглавия с ДЕН + ДАТА (на български)
    const daysBase = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    // const daysBase = ["Понеделник", "Вторник", "Сряда", "Четвъртък", "Петък", "Събота", "Неделя"];
    const daysWithDates = daysBase.map((dayName, index) => {
      const date = new Date(start);
      date.setDate(date.getDate() + index);
      const formattedDate = date.toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit' });
      return `${dayName}\n${formattedDate}`;
    });

    const scheduleByDay = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

    myEvents.forEach(ev => {
      if (ev.extendedProps?.type === 'animal') {
        const eventDate = new Date(ev.start);
        if (eventDate >= start && eventDate < end) {
          let dayIndex = eventDate.getDay();
          dayIndex = dayIndex === 0 ? 6 : dayIndex - 1;

          const props = ev.extendedProps || {};
          const d = props.data || {};
          
          const genderLabel = d.gender === 'female' ? "женска" : (d.gender === 'male' ? "мъжка" : "");
          const speciesLabel = d.species === 'cat' ? "котка" : (d.species || "котка");
          
          // Новата подредба по твое изискване
          const ownerLine = `${props.ownerName || "—"} - ${props.phone || "—"}`;
          const animalLine = `№${d.id || ev.id || "—"} ${genderLabel} ${speciesLabel}`;

          scheduleByDay[dayIndex].push(`${ownerLine}\n${animalLine}`);
        }
      }
    });

    const maxRows = Math.max(...Object.values(scheduleByDay).map(d => d.length), 10);
    const tableRows = [];

    for (let i = 0; i < maxRows; i++) {
      const row = [];
      for (let day = 0; day < 7; day++) {
        row.push(scheduleByDay[day][i] || "");
      }
      tableRows.push(row);
    }

    // 3. Генериране на таблицата с принудителен шрифт Roboto навсякъде
    autoTable(doc, {
      head: [daysWithDates],
      body: tableRows,
      startY: 20,
      styles: { 
        font: "Roboto",     // Това оправя кирилицата в редовете
        fontSize: 7, 
        cellPadding: 2, 
        valign: 'middle', 
        lineWidth: 0.1,
        overflow: 'linebreak' 
      },
      headStyles: { 
        font: "Roboto",     // Това оправя кирилицата в заглавията (Понеделник...)
        fillColor: [52, 73, 94], 
        textColor: 255, 
        halign: 'center',
        fontSize: 8,
        cellPadding: 1      // Малко по-тясно заглавие, за да има място за датата
      },
      columnStyles: {
        0: { cellWidth: 39 }, 1: { cellWidth: 39 }, 2: { cellWidth: 39 },
        3: { cellWidth: 39 }, 4: { cellWidth: 39 }, 5: { cellWidth: 39 }, 6: { cellWidth: 39 }
      },
      margin: { left: 10, right: 10 },
      theme: 'grid'
    });

    doc.save(`Grafik_ODBKH_${start.toISOString().split('T')[0]}.pdf`);
  };

  // Използваме 768px като граница за мобилни устройства
  const [initialView, setInitialView] = useState(
    window.innerWidth < 768 ? 'timeGridDay' : 'timeGridWeek'
  );

  useEffect(() => {
    const handleResize = () => {
      const calendarApi = calendarRef.current?.getApi();
      if (!calendarApi) return;

      if (window.innerWidth < 768) {
        if (calendarApi.view.type !== 'timeGridDay') {
          calendarApi.changeView('timeGridDay');
        }
      } else {
        if (calendarApi.view.type !== 'timeGridWeek') {
          calendarApi.changeView('timeGridWeek');
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="mt-10 bg-card p-6 rounded-xl shadow-lg border border-border calendar-container">
      {/* Бутон за Експорт */}
      <div className="flex justify-end gap-3 mb-4 no-print">
        <button
          onClick={() => {
            const api = calendarRef.current.getApi();
            exportWeeklyPDF(api.view);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md"
        >
          🖨️ ПРИНТИРАЙ ТАЗИ СЕДМИЦА
        </button>
      </div>
      <FullCalendar
        ref={calendarRef}
        datesSet={handleDatesSet}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        dayMaxEvents={false}
        plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin ]}
        editable={true}
        eventDrop={handleEventDrop}
        initialView={initialView}
        locale="bg"
        allDaySlot={true} // Позволява застъпване на целодневни бележки
        slotMinTime="08:00:00" // Отрежете графика за работно време
        slotMaxTime="20:00:00"
        slotEventOverlap={false} 
        eventOrder="start,-duration,allDay,title"
        slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }} // 24ч формат
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: window.innerWidth < 768 ? 'timeGridDay' : 'dayGridMonth,timeGridWeek,timeGridDay' 
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
          const { isMale, gender, species, phone, ownerName, displayId, data, visitType } = eventInfo.event.extendedProps;
          const isPast = eventInfo.event.backgroundColor === '#dedede';
          const currentStatus = data?.status;
          const isAtClinic = !['recorded', 'missed', undefined, null].includes(currentStatus);
          
          // Извличане на форматиран час (напр. "09:30")
          const formattedTime = eventInfo.event.start 
            ? new Date(eventInfo.event.start).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' }) 
            : '';

          const visitConfig = visitTypeLabels[visitType] || { label: "Преглед", icon: "🐾" };

          return (
            <div className="p-1 text-[10px] sm:text-xs cursor-pointer relative flex flex-col gap-0.5 group">
              {/* Бутони за бързи действия в десния ъгъл */}
              <div className="absolute top-0 right-0 hidden group-hover:flex items-center bg-white/80 backdrop-blur-xs rounded-bl-md shadow-sm z-50">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleReceive(e, eventInfo.event.id); }}
                  className={`p-1 font-bold ${isAtClinic ? 'text-green-600' : 'text-gray-400 hover:text-green-500'}`}
                  title="Пристигнал"
                >
                  {isAtClinic ? '✅' : '📥'}
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleMissed(e, eventInfo.event.id); }}
                  className="p-1 text-orange-500 hover:text-orange-700 font-bold"
                  title="Пропуснат"
                >
                  🚫
                </button>
                {/* НОВИЯТ БУТОН ЗА РЕДАКЦИЯ */}
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); // Спира събитието да не отиде към handleEventClick
                    navigateToEdit(data); 
                  }}
                  className="p-1 text-blue-600 hover:text-blue-800 font-bold"
                  title="Редактирай"
                >
                  ✏️
                </button>
                <button 
                  onClick={(e) => handleDelete(e, eventInfo.event.id)}
                  className="p-1 text-red-500 hover:text-red-700 font-bold"
                  title="Изтрий"
                >
                  ✕
                </button>
              </div>

              {/* РЕД 1: Час и Тип процедура (Нов акцент!) */}
              <div className="font-black text-blue-900 flex items-center gap-1 text-[11px]">
                {formattedTime && <span className="bg-white/60 px-1 rounded border border-black/5">{formattedTime} ч.</span>}
                <span className="truncate" title={visitConfig.label}>
                  {visitConfig.icon} {visitConfig.label.toUpperCase()}
                </span>
              </div>

              {/* РЕД 2: Пол и Вид на животното */}
              <div className="font-bold flex items-center gap-1 border-b border-black/5 pb-0.5">
                <span style={{ color: isPast ? '#666' : (isMale ? '#1d4ed8' : '#be123c') }}>{gender}</span> 
                <span className="truncate">{species.toUpperCase()}</span>
                {isAtClinic && <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block" />}
                <span className="ml-auto text-[9px] text-gray-500 font-mono">#{displayId}</span>
              </div>
              
              {/* РЕД 3: Стопанин */}
              <div className="text-gray-600 truncate font-medium">
                {ownerName || "—"} {phone ? `(${phone})` : ''}
              </div>
            </div>
          );
        }}
      />

      {/* Прогноза */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl text-white shadow-md">
          <h4 className="text-xs uppercase opacity-80 font-bold">Планирани за периода</h4>
          <div className="text-2xl font-black">
            {weeklyStats.total} животни (♂️{weeklyStats.male} | ♀️{weeklyStats.female})
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm col-span-2">
          <h4 className="text-xs uppercase text-slate-500 font-bold mb-2">Нужни консумативи (прогноза)</h4>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm col-span-full">
            <h4 className="text-xs uppercase text-slate-500 font-black mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Прогноза за нужни консумативи (Седмичен отчет)
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {Object.entries(supplyLabels).map(([key, label]) => {
                const amount = weeklyStats.total * (suppliesConfig[key] || 0);
                
                return (
                  <div key={key} className="flex items-center gap-3 p-2 rounded-lg border border-slate-50 hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-lg shadow-sm">
                      {key.includes('needle') || key.includes('catheter') ? '📍' : 
                      key.includes('syringe') ? '💉' : 
                      key.includes('_ml') ? '🧪' : '📦'}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] font-bold text-slate-700 truncate leading-tight">
                        {amount.toLocaleString()} <small className="text-[10px] font-normal text-slate-400 uppercase">{key.includes('_ml') ? 'мл' : 'бр'}</small>
                      </span>
                      <span className="text-[10px] text-slate-500 truncate uppercase tracking-tighter">
                        {label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

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
            <li>• <strong>Изтриване:</strong> Кликнете върху червения хикс, за да я премахнете от графика.</li>
            <li>• <strong>Почивен ден/отпуска:</strong> Кликнете върху дадения ден два пъти, при което въведете "Почивен ден" или "Отпуска".</li>
            <li>• <strong>Бутон Редакция (✏️):</strong> Появява се в горния десен ъгъл при посочване на часа с мишката.</li>
            <li>• <strong>Изгледи:</strong> Използвайте бутона "Седмица" или "Ден" горе вдясно за детайлно разписание по часове.</li>
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