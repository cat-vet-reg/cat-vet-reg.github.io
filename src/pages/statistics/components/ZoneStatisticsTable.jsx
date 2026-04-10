import React, { useEffect, useState } from 'react';
import supabase         from '../../../utils/supabase';
import { convertDate }  from '../../../utils/date';
import Header           from "../../../components/ui/Header";
import Icon             from '../../../components/AppIcon';
import * as XLSX        from 'xlsx';
import {  speciesOptions,
          genderOptions,
          spicyOptions,
          bcsScores,
          getBcsDescription,
          ageUnitOptions, 
          colorOptions,
          colorStyles,
          habitat,
          origin,
          generalConditionOptions, 
          statusOptions, 
          complicationOptions,
          staffOptions,
          earStatusOptions,
          parasiteOptions,
          discoverySourceOptions,
          reproductiveOptions
          } from "../../../constants/formOptions";

const transliterate = (text) => {
  if (!text) return "-";
  const map = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
    'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f',
    'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sht', 'ъ': 'a', 'ь': 'y',
    'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ж': 'Zh',
    'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N',
    'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F',
    'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sht', 'Ъ': 'A', 'Ь': 'Y',
    'Ю': 'Yu', 'Я': 'Ya'
  };
  return text.split('').map(char => map[char] || char).join('');
};

const reproductiveOptionsEn = [
  { value: "heat"             , label: "In heat" },
  { value: "early_pregnancy"  , label: "Pregnant" },
  { value: "late_pregnancy"   , label: "Pregnant" },
  { value: "mucometra"        , label: "Mucometra" },
  { value: "pyometra"         , label: "Pyometra" },
  { value: "ovarian_cyst"     , label: "Ovarian cyst" },
  { value: "ceh"              , label: "Cystic endometrial hyperplasia" },
  { value: "unilateral_crypto", label: "Cryptorchidism" },
  { value: "bilateral_crypto" , label: "Cryptorchidism" },
  { value: "monorchidism"     , label: "Monorchidism" }
];

const ZoneStatisticsTable = ({ selectedMonth, selectedYear }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchZoneData();
  }, [selectedMonth, selectedYear]);

  const fetchZoneData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('td_records')
        .select(`
          *,
          owner:owner_id (
            name,
            phone
          )
        `)
        .order('castrated_at', { ascending: true });

      if (error) throw error;
      setRecords(data);
    } catch (error) {
      console.error('Грешка при статистика:', error.message);
    } finally {
      setLoading(false);
    }
  };

    // ЛОГИКА ЗА ГРУПИРАНЕ
  const getGroupedData = () => {
    const groups = {};

    records.forEach(record => {
      if (!record.castrated_at) return;

      const scheduledDate = new Date(record.castrated_at);
      const m = scheduledDate.getMonth() + 1;
      const y = scheduledDate.getFullYear();

      // Филтър по месец и година
      if (m !== Number(selectedMonth) || y !== Number(selectedYear)) return;

      // --- ИЗЧИСЛЯВАНЕ НА ВРЕМЕТО ЗА ЧАКАНЕ ---
      const createdDate = new Date(record.created_at);
      // Разлика в милисекунди
      const diffInTime = scheduledDate.getTime() - createdDate.getTime();
      // Превръщане в дни (1000ms * 60s * 60m * 24h)
      const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));
      // Превръщане в седмици (закръглено до 1 десетичен знак, напр. 1.2 седмици)
      const waitingWeeks = diffInDays > 0 ? (diffInDays / 7).toFixed(1) : 0;

      const dateKey = record.castrated_at.split('T')[0];
      const ownerName = record.owner?.name || record.owner_name || "Анонимен";
      const address = record.address || record.location_address || "-";
      const reproductiveStatus = record.medical_details?.reproductive_status || "-";
      const zone = record.data?.zonaNumber || record.zona_number || "0";
      const groupKey = `${dateKey}-${ownerName}-${zone}`;

      const registrationDate = record.created_at ? new Date(record.created_at).toLocaleDateString('bg-BG') : '-';

      // Ако статусът е 'completed' или 'done' - дошъл е. Ако е още 'recorded' и датата е минала - пропуснал е.
      const isKept = record.status === 'completed' || record.status === 'done';
      const isMissed = !isKept && scheduledDate < new Date();

      if (!groups[groupKey]) {
        groups[groupKey] = {
          day: scheduledDate.getDate(),
          month: m,
          year: y,
          owner: ownerName,
          address: address,
          reproductiveStatus: reproductiveStatus,
          zone: zone,
          count: 0,
          registrationDate: registrationDate,
          waitingWeeks: waitingWeeks,
          keptCount: 0,
          missedCount: 0,
          totalInGroup: 0,
          reproductiveStatuses: []
        };
      }
      groups[groupKey].totalInGroup += 1;
      groups[groupKey].reproductiveStatuses.push(reproductiveStatus);
      if (isKept) groups[groupKey].keptCount += 1;
      if (isMissed) groups[groupKey].missedCount += 1;
    });

    // Превръщаме обекта в масив и сортираме по дата (най-новите отгоре)
    return Object.values(groups).sort((a, b) => {
      const dateA = new Date(a.year, a.month - 1, a.day);
      const dateB = new Date(b.year, b.month - 1, b.day);
      return dateA - dateB; // От най-стари към най-нови
    });
  };

  const groupedData = getGroupedData();

  if (loading) return <div className="p-10 text-center">Зареждане на данни...</div>;

  // Обединяваме всички опции в един плосък масив
  const allReproductiveOptions = [
    ...reproductiveOptions.female,
    ...reproductiveOptions.male
  ];

  // Помощна функция, която търси етикета по стойноста
  const getStatusLabel = (statusValue) => {
    const option = allReproductiveOptions.find(opt => opt.value === statusValue);
    
    // Ако не е намерена опция или стойноста е някоя от тези, които искаме да скрием:
    if (!option || 
        option.label === "Няма следи от бременност" || 
        option.value === "none_visible" || 
        option.value === "baby") {
      return "-";
    }

    return option.label;
  };

  const getStatusEn = (val) => {
    const found = reproductiveOptionsEn.find(o => o.value === val);
    // Ако намерим превод, даваме него. Ако не (напр. "-" или "baby"), връщаме тире или оригиналната стойност.
    return found ? found.label : (val === "baby" || val === "none_visible" ? "-" : val);
  };

  // const exportZonesToExcel = () => {
  //   const dataToExport = groupedData.map(row => ({
  //     'Дата на регистрация': row.registrationDate,
  //     'Дата на часа (Ден)': row.day,
  //     'Дата на часа (Месец)': row.month,
  //     'Дата на часа (Година)': row.year,
  //     'Чакане (седмици)': row.waitingWeeks,
  //     'Дошли (Kept)': row.keptCount,
  //     'Пропуснали (Missed)': row.missedCount,
  //     'Зона': row.zone,
  //     'Собственик': row.owner,
  //     'Адрес': row.address,
  //     'Репродуктивен статус': row.reproductiveStatuses.map(s => getStatusLabel(s)).join(', ')
  //   }));

  //   const ws = XLSX.utils.json_to_sheet(dataToExport);
  //   const wb = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, "Зони и Собственици");
  //   XLSX.writeFile(wb, `Zone_Registry_${selectedMonth}_${selectedYear}.xlsx`);
  // };

    const exportZonesToExcel = () => {
    const dataToExport = groupedData.map(row => ({
      'Date (Day)': row.day,
      'Date (Month)': row.month,
      'Date (Year)': row.year,
      'No of Animals': row.totalInGroup,
      'Appointment scheduled for (Date)': row.registrationDate,
      'Чакане (седмици)': row.waitingWeeks,
      'Дошли (Kept)': row.keptCount,
      'Пропуснали (Missed)': row.missedCount,
      'Зона': row.zone,
      'Собственик': transliterate(row.owner),
      'Адрес': row.address,
      'Репродуктивен статус': row.reproductiveStatuses
        .map(s => getStatusEn(s))
        .filter(label => label !== "-")
        .join(', ') || "-"
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Appointments");
    XLSX.writeFile(wb, `Zone_Registry_${selectedMonth}_${selectedYear}.xlsx`);
  };

  return (
    <div className="w-full bg-background">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-primary pt-12">Отчет по Зони и Собственици</h2>
        </div>

        <div className="flex justify-end mb-4">
          <button onClick={exportZonesToExcel} className="bg-emerald-600 text-white px-4 py-2 rounded shadow hover:bg-emerald-700 flex items-center gap-2">
            <Icon name="Download" size={18} /> Експорт (Зони)
          </button>
        </div>

        <div className="bg-card rounded-lg shadow-md border border-border overflow-hidden">
          <table className="w-full text-left border-collapse text-center min-w-[1000px]">
            <thead>
              <tr className="bg-muted text-muted-foreground uppercase text-xs">
                {/* СЕГА "ЗАПИСАН НА" Е С 3 ПОДКОЛОНИ */}
                <th colSpan="3" className="p-4 border-b">Записан на (регистрация)</th>

                <th className="p-4 border-b" rowSpan="2">Брой животни</th>
                
                {/* "ДАТА НА ЧАСА" СТАВА ОБИКНОВЕНА КОЛОНА */}
                <th className="p-4 border-b" rowSpan="2">Дата на часа</th>
                
                <th className="p-4 border-b bg-blue-50/30 text-blue-700 italic" rowSpan="2">Waiting (weeks)</th>
                <th className="p-4 border-b text-green-700" rowSpan="2">Kept</th>
                <th className="p-4 border-b text-red-700" rowSpan="2">Missed</th>
                <th className="p-4 border-b" rowSpan="2">Зона</th>
                <th className="p-4 border-b" rowSpan="2">Собственик</th>
                <th className="p-4 border-b" rowSpan="2">Адрес</th>
                <th className="p-4 border-b" rowSpan="2">Репродуктивен статус</th>
              </tr>
              <tr className="bg-muted text-muted-foreground uppercase text-[10px]">
                <th className="border border-gray-300 p-1">Ден</th>
                <th className="border border-gray-300 p-1">Мес.</th>
                <th className="border border-gray-300 p-1">Год.</th>
              </tr>
            </thead>
            <tbody>
              {groupedData.length > 0 ? groupedData.map((row, idx) => {
                // Разделяме registrationDate (която е низ "DD.MM.YYYY") на части за трите колони
                const regParts = row.registrationDate.split('.');
                
                return (
                  <tr key={idx} className="border-b hover:bg-muted/30 transition-colors text-center text-sm">
                    {/* ТРИТЕ КОЛОНИ ЗА ДАТА НА РЕГИСТРАЦИЯ */}
                    <td className="p-3 border-r border-border">{regParts[0]}</td>
                    <td className="p-3 border-r border-border">{regParts[1]}</td>
                    <td className="p-3 border-r border-border text-xs">{regParts[2]}</td>

                    <td className="p-3 border-r border-border font-bold text-primary text-base bg-primary/5">
                      {row.totalInGroup}
                    </td>
                    
                    {/* ЕДИННА КОЛОНА ЗА ДАТАТА НА ЧАСА */}
                    <td className="p-3 border-r border-border font-bold">
                      {row.day}.{row.month}.{row.year}
                    </td>
                    
                    <td className="p-3 border-r border-border font-mono bg-blue-50/10 text-blue-600">
                      {row.waitingWeeks}
                    </td>
                    
                    <td className="p-3 border-r border-border font-bold text-green-600 bg-green-50/10">
                      {row.keptCount}
                    </td>
                    
                    <td className="p-3 border-r border-border font-bold text-red-600 bg-red-50/10">
                      {row.missedCount}
                    </td>

                    <td className="p-3 border-r border-border">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${row.zone === "0" ? 'bg-slate-100 text-slate-600' : 'bg-pink-50 text-pink-600 border border-pink-100'}`}>
                        Зона {row.zone}
                      </span>
                    </td>

                    <td className="p-3 border-r border-border text-left pl-4 font-medium italic">
                      {row.owner}
                    </td>

                    <td className="p-3 border-r border-border text-left pl-4 text-xs">
                      {row.address}
                    </td>

                    <td className="p-3 text-left pl-4 text-[11px] text-muted-foreground leading-tight min-w-[200px]">
                      {row.reproductiveStatuses && row.reproductiveStatuses.length > 0 
                        ? row.reproductiveStatuses
                            .map(s => getStatusLabel(s))      // Превръщаме ги в етикети или "-"
                            .filter(label => label !== "-")   // Премахваме всички тирета от списъка
                            .join(', ') || "-"                // Ако след филтрирането не остане нищо, сложи едно тире
                        : '-'}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="11" className="p-10 text-center text-muted-foreground italic">Няма данни за избрания период.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-sm text-muted-foreground italic">
          * Забележка: Зона 0 обозначава животни, доведени от населени места извън Пловдив.
        </p>
        
    </div>
  );
};

export default ZoneStatisticsTable;