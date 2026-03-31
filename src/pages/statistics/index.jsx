import React, { useEffect, useState, useMemo } from 'react';
import supabase from '../../utils/supabase';
import { convertDate } from '../../utils/date';
import Header from "../../components/ui/Header";
import Breadcrumb from '../../components/ui/Breadcrumb';
import Icon from '../../components/AppIcon';
import ZoneStatisticsTable from './components/ZoneStatisticsTable';
import * as XLSX from 'xlsx';
import { mapDbToUi } from '../cat-registration-form/utils/formMapper';


const StatisticsTable = () => {
  const breadcrumbItems = [
    { label: 'Табло'                , path: '/dashboard-overview' },
    { label: 'Статистика'           , path: '/statistics' }
  ];

  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const fatalIDs = ['dead_anesthesia', 'dead_surgery', 'dead_postsurgery'];

  const months = [
    { v: 1, n: "Януари" }   , { v: 2, n: "Февруари" } , { v: 3, n: "Март" },
    { v: 4, n: "Април" }    , { v: 5, n: "Май" }      , { v: 6, n: "Юни" },
    { v: 7, n: "Юли" }      , { v: 8, n: "Август" }   , { v: 9, n: "Септември" },
    { v: 10, n: "Октомври" }, { v: 11, n: "Ноември" } , { v: 12, n: "Декември" }
  ];

  const years = [2025, 2026, 2027, 2028, 2029, 2030];

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const { data: rawData, error } = await supabase
        .from('td_records')
        .select('*'); // Взимаме всичко, за да може маперът да работи коректно

      if (error) throw error;
      
      // --- ФИЛТРИРАН ЛОГ САМО ЗА СПОРНИТЕ ДАТИ ---
      const suspiciousDates = ['2026-03-02', '2026-03-26'];
      
      const filteredDebug = rawData.filter(item => {
        const date = item.castrated_at || item.data?.castratedAt;
        return date && suspiciousDates.some(sDate => date.includes(sDate));
      });

      console.log(`=== ДЕТАЙЛИ ЗА ${suspiciousDates.join(' и ')} ===`);
      console.table(filteredDebug.map(item => ({
        ID: item.id,
        Name: item.data?.recordName || item.name,
        Status: item.data?.status || item.status || "НЯМА СТАТУС",
        Gender: item.gender,
        Raw_Date: item.castrated_at
      })));
      // ------------------------------------------

      // 1. Мапваме данните веднага
      const mappedData = rawData.map(mapDbToUi);
      
      // 2. Групираме
      processData(mappedData);
    } catch (error) {
      console.error('Грешка при статистика:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const processData = (mappedData) => {
    const grouped = {};
    
    mappedData.forEach(item => {
      if (!item.castratedAt) return;
      
      // Филтър за статуси (вече ползваме чистия статус от мапера)
      if (['recorded', 'missed'].includes(item.status)) return;

      const dateObj = new Date(item.castratedAt);
      const dateKey = item.castratedAt.split('T')[0];
      
      // Проверка за смъртност (ползваме чистите полета от мапера/DB)
      const selectedComps = item.selected_complications || item.data?.selectedComplications || [];
      const isDead = item.hasComplications === 'Y' && selectedComps.some(id => fatalIDs.includes(id));
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = { 
          day: dateObj.getDate(),
          month: dateObj.getMonth() + 1,
          year: dateObj.getFullYear(),
          total: 0, 
          femaleCats: 0, maleCats: 0, 
          femaleDogs: 0, maleDogs: 0, 
          dead: 0 
        };
      }

      grouped[dateKey].total += 1;
      
      if (item.species === 'cat') {
        if (item.gender === 'female') grouped[dateKey].femaleCats += 1;
        else if (item.gender === 'male') grouped[dateKey].maleCats += 1;
      } else if (item.species === 'dog') {
        if (item.gender === 'female') grouped[dateKey].femaleDogs += 1;
        else if (item.gender === 'male') grouped[dateKey].maleDogs += 1;
      }

      if (isDead) grouped[dateKey].dead += 1;
    });

    const sortedStats = Object.values(grouped).sort((a, b) => 
      new Date(`${a.year}-${a.month}-${a.day}`) - new Date(`${b.year}-${b.month}-${b.day}`)
    );
    setStats(sortedStats);
  };

  // Използваме useMemo за филтрираните данни, за да не се преизчисляват при всеки рендер
  const filteredStats = useMemo(() => {
    return stats.filter(row => row.month === Number(selectedMonth) && row.year === Number(selectedYear));
  }, [stats, selectedMonth, selectedYear]);

  const totals = useMemo(() => {
    return filteredStats.reduce((acc, row) => ({
      total: acc.total + row.total,
      femaleCats: acc.femaleCats + row.femaleCats,
      maleCats: acc.maleCats + row.maleCats,
      femaleDogs: acc.femaleDogs + row.femaleDogs,
      maleDogs: acc.maleDogs + row.maleDogs,
      dead: acc.dead + row.dead
    }), { total: 0, femaleCats: 0, maleCats: 0, femaleDogs: 0, maleDogs: 0, dead: 0 });
  }, [filteredStats]);

  const exportDailyStatsToExcel = () => {
    const excelData = filteredStats.map(row => ({
      "Day": row.day,
      "Month": row.month,
      "Year": row.year,
      "Total No of animals/day": row.total,
      "Cats (female)": row.femaleCats,
      "Cats (male)": row.maleCats,
      "Dogs (female)": row.femaleDogs,
      "Dogs (male)": row.maleDogs,
      "Dead animals": row.dead || 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clinic");
    XLSX.writeFile(workbook, `Otchet_Dni_${selectedMonth}_${selectedYear}.xlsx`);
  };

  if (loading) return <div className="p-10 text-center text-xl">Зареждане на статистиката...</div>;

  return (
    <div className="w-full bg-background">
        <main className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">

            <Header />
            <Breadcrumb items={breadcrumbItems} />

                <div className="mb-6 md:mb-8">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-2">Месечна статистика</h1>
                    <p className="text-base md:text-lg text-muted-foreground">Статистика за кастрационната кампания.</p>
                </div>

                {/* Контейнер за филтри */}
                <p className="text-base md:text-lg text-muted-foreground mb-2 font-medium flex items-center gap-2">
                    <Icon name="Filter" size={18} className="text-primary" />
                    Филтриране по време:
                </p>
                <div className="flex flex-col md:flex-row gap-4 mb-6 bg-card p-4 rounded-lg shadow-sm border border-border items-end">
                    <div className="flex flex-col gap-2">
                        <select 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="pr-12 bg-background border border-border p-2 rounded-md outline-none focus:ring-2 focus:ring-primary"
                        >
                        {months.map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <select 
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="pr-12 bg-background border border-border p-2 rounded-md outline-none focus:ring-2 focus:ring-primary"
                        >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                
                    <div className="ml-auto text-right">
                        <p className="text-xs text-muted-foreground uppercase">Общо за периода</p>
                        <p className="text-2xl font-bold text-primary">{totals.total} животни</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-2xl font-bold text-primary">Отчет по дни</h2>
                </div>

                <div className="flex justify-end mb-4">
                  <button onClick={exportDailyStatsToExcel} className="bg-emerald-600 text-white px-4 py-2 rounded shadow hover:bg-emerald-700 flex items-center gap-2">
                    <Icon name="Download" size={18} /> Експорт (Дни)
                  </button>
                </div>

                <div className="bg-card rounded-lg shadow-md border border-border overflow-hidden">
                    <table className="w-full text-left border-collapse text-center">
                      <thead>
                          <tr className="bg-muted text-muted-foreground uppercase text-xs">
                              <th colSpan="3" className="p-4 border-b">Дата</th>
                              <th className="p-4 border-b" rowSpan="2">Общо</th>
                              <th className="p-4 border-b" rowSpan="2">Кастрирани</th>
                              <th colSpan="2" className="p-4 border-b">Пол (Котки)</th>
                              <th colSpan="2" className="p-4 border-b">Пол (Кучета)</th>
                              <th className="p-4 border-b" rowSpan="2">Умрели</th>
                              <th className="p-4 border-b" rowSpan="2">Заловени от нас</th>
                          </tr>
                          <tr className="bg-green-50 dark:bg-green-800/20 text-xs">
                              <th className="border border-gray-300 p-1">Ден</th>
                              <th className="border border-gray-300 p-1">Мес.</th>
                              <th className="border border-gray-300 p-1">Год.</th>
                              <th className="border border-gray-300 p-1">Ж</th>
                              <th className="border border-gray-300 p-1">М</th>
                              <th className="border border-gray-300 p-1">Ж</th>
                              <th className="border border-gray-300 p-1">М</th>
                          </tr>
                      </thead>
                      <tbody>
                          {filteredStats.length > 0 ? filteredStats.map((row, index) => (
                          <tr key={index} className="hover:bg-muted/50 text-center border-b border-gray-200">
                              <td className="p-4 border-b">{row.day}</td>
                              <td className="p-4 border-b">{row.month}</td>
                              <td className="p-4 border-b text-xs">{row.year}</td>
                              <td className="p-4 border-b font-bold">{row.total}</td>
                              <td className="p-4 border-b">{row.total}</td>
                              <td className="p-4 border-b text-pink-600">{row.femaleCats}</td>
                              <td className="p-4 border-b text-blue-600">{row.maleCats}</td>
                              <td className="p-4 border-b text-pink-600">{row.femaleDogs}</td>
                              <td className="p-4 border-b text-blue-600">{row.maleDogs}</td>
                              <td className="p-4 border-b">{row.dead || 0}</td>
                              <td className="p-4 border-b text-muted-foreground">—</td>
                          </tr>
                          )) : (
                          <tr>
                            <td colSpan="9" className="p-10 text-center text-muted-foreground">Няма данни за избрания период.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                </div>
          
                <ZoneStatisticsTable 
                  selectedMonth={selectedMonth} 
                  selectedYear={selectedYear} 
                />
        </main>
    </div>
  );
};

export default StatisticsTable;