import React, { useEffect, useState } from 'react';
import supabase from '../../../utils/supabase';
import { convertDate } from '../../../utils/date';
import Header from "../../../components/ui/Header"
import {  genderOptions, 
          bcsScores,
          getBcsDescription,
          ageUnitOptions, 
          colorOptions, 
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
          } from "../../../constants/formOptions";;

const ZoneStatisticsTable = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchZoneData();
  }, []);

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
        .order('castrated_at', { ascending: false });

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

      const dateObj = new Date(record.castrated_at);
      const m = dateObj.getMonth() + 1;
      const y = dateObj.getFullYear();

      // Филтър по месец и година
      if (m !== Number(selectedMonth) || y !== Number(selectedYear)) return;

      const dateKey = record.castrated_at.split('T')[0];
      const ownerName = record.owner?.name || record.owner_name || "Анонимен";
      const address = record.address || record.location_address || "-";
      const reproductiveStatus = record.reproductiveStatus || record.data?.reproductiveStatus || "-";
      const zone = record.data?.zonaNumber || record.zona_number || "0";

      // Създаваме уникален ключ за деня, човека и зоната
      const groupKey = `${dateKey}-${ownerName}-${zone}`;

      if (!groups[groupKey]) {
        groups[groupKey] = {
          day: dateObj.getDate(),
          month: m,
          year: y,
          owner: ownerName,
          address: address,
          reproductiveStatus: reproductiveStatus,
          zone: zone,
          count: 0
        };
      }
      // Увеличаваме бройката за този собственик в този ден
      groups[groupKey].count += 1;
    });

    // Превръщаме обекта в масив и сортираме по дата (най-новите отгоре)
    return Object.values(groups).sort((a, b) => b.day - a.day);
  };

  const groupedData = getGroupedData();

  if (loading) return <div className="p-10 text-center">Зареждане на данни...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-6xl mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-primary">Регистър по Зони и Собственици</h2>
          
          <div className="flex gap-2">
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border p-2 pr-8 rounded-md bg-card cursor-pointer"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('bg-BG', {month: 'long'})}</option>
              ))}
            </select>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border p-2 pr-8 rounded-md bg-card cursor-pointer"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-md border border-border overflow-hidden">
          <table className="w-full text-left border-collapse text-center">
            <thead>
              <tr className="bg-muted text-muted-foreground uppercase text-xs">
                <th colSpan="3" className="p-4 border-b">Дата</th>
                <th className="p-4 border-b" rowSpan="2">Брой животни</th>
                <th className="p-4 border-b" rowSpan="2">Зона</th>
                <th className="p-4 border-b" rowSpan="2">Собственик</th>
                <th className="p-4 border-b" rowSpan="2">Адрес</th>
                <th className="p-4 border-b" rowSpan="2">Репродуктивен статус</th>
              </tr>
              <tr className="bg-muted text-muted-foreground uppercase text-xs">
                <th className="border border-gray-300 p-1">Ден</th>
                <th className="border border-gray-300 p-1">Мес.</th>
                <th className="border border-gray-300 p-1">Год.</th>
              </tr>
            </thead>
            <tbody>
              {groupedData.length > 0 ? groupedData.map((row, idx) => (
                <tr key={idx} className="border-b hover:bg-muted/30 transition-colors text-center text-sm">
                  <td className="p-3 border-r border-border">{row.day}</td>
                  <td className="p-3 border-r border-border">{row.month}</td>
                  <td className="p-3 border-r border-border text-xs">{row.year}</td>
                  <td className="p-3 border-r border-border font-bold text-primary text-base bg-primary/5">
                    {row.count}
                  </td>
                  <td className="p-3 border-r border-border">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${row.zone === "0" ? 'bg-slate-100 text-slate-600' : 'bg-pink-50 text-pink-600 border border-pink-100'}`}>
                      Зона {row.zone}
                    </span>
                  </td>
                  <td className="p-3 border-r border-border text-left pl-4 font-medium">
                    {row.owner}
                  </td>
                  <td className="p-3 border-r border-border text-left pl-4 font-medium">
                    {row.address}
                  </td>
                  <td className="p-3 border-r border-border text-left pl-4 font-medium">
                    {
                        row.reproductiveStatus === 'baby'               ? 'Бебешка матка' : 
                        row.reproductiveStatus === 'heat'               ? 'Разгонена' : 
                        row.reproductiveStatus === 'early_pregnancy'    ? 'Начална бременност' : 
                        row.reproductiveStatus === 'late_pregnancy'     ? 'Напреднала бременност' : 
                        row.reproductiveStatus === 'post_pregnancy'     ? 'След бременност (кърмеща/родила)' : 
                        row.reproductiveStatus === 'mucometra'          ? 'Мукометра' : 
                        row.reproductiveStatus === 'pyometra'           ? 'Пиометра' : 
                        row.reproductiveStatus === 'ovarian_cyst'       ? 'Киста на яйчника' : 
                        row.reproductiveStatus === 'unilateral_crypto'  ? 'Едностранен крипторхизъм' : 
                        row.reproductiveStatus === 'bilateral_crypto'   ? 'Двустранен крипторхизъм' : 
                        row.reproductiveStatus === 'monorchidism'       ? 'Монорхидизъм' : '-'
                    }
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-muted-foreground italic">Няма данни за избрания период.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-sm text-muted-foreground italic">
          * Забележка: Зона 0 обозначава животни, доведени от населени места извън Пловдив.
        </p>
        
      </main>
    </div>
  );
};

export default ZoneStatisticsTable;