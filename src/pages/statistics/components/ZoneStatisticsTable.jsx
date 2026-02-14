import React, { useEffect, useState } from 'react';
import supabase from '../../../utils/supabase';
import { convertDate } from '../../../utils/date';
import Header from "../../../components/ui/Header";

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

  // Филтриране на данните според избрания месец и година
  const filteredRecords = records.filter(record => {
    if (!record.castrated_at) return false;
    const dateObj = new Date(record.castrated_at);
    return (dateObj.getMonth() + 1) === Number(selectedMonth) && 
           dateObj.getFullYear() === Number(selectedYear);
  });

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
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted text-muted-foreground uppercase text-xs text-center">
                <th colSpan="3" className="p-4 border-b">Дата</th>
                <th className="p-4 border-b">Собственик</th>
                <th className="p-4 border-b">Зона</th>
                <th className="p-4 border-b">Брой животни</th>
              </tr>
              <tr className="bg-muted text-muted-foreground uppercase text-xs text-center">
                <th className="border border-gray-300 p-1">Ден</th>
                <th className="border border-gray-300 p-1">Мес.</th>
                <th className="border border-gray-300 p-1">Год.</th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? filteredRecords.map((record, idx) => {
                const dateObj = new Date(record.castrated_at);
                // Корекция на пътя до името:
                const ownerName = record.owner?.name || record.owner_name || "Анонимен";
                const zone = record.data?.zonaNumber || record.zona_number || "0";

                return (
                  <tr key={record.id || idx} className="border-b hover:bg-muted/30 transition-colors text-center text-sm">
                    <td className="p-3 border-r border-border">{dateObj.getDate()}</td>
                    <td className="p-3 border-r border-border">{dateObj.getMonth() + 1}</td>
                    <td className="p-3 border-r border-border text-xs">{dateObj.getFullYear()}</td>
                    <td className="p-3 border-r border-border text-left pl-4 font-medium">{ownerName}</td>
                    <td className="p-3 border-r border-border">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${zone === "0" ? 'bg-slate-100 text-slate-600' : 'bg-pink-50 text-pink-600 border border-pink-100'}`}>
                        Зона {zone}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground italic">
                      {record.name || "Без име"} ({record.gender === 'female' ? 'Ж' : 'М'})
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-muted-foreground italic">Няма намерени записи за този месец.</td>
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