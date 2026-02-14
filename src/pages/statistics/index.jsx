import React, { useEffect, useState } from 'react';
import supabase from '../../utils/supabase';
import { convertDate } from '../../utils/date';
import Header from "../../components/ui/Header";
import Breadcrumb from '../../components/ui/Breadcrumb';
import Icon from '../../components/AppIcon';
import ZoneStatisticsTable from './components/ZoneStatisticsTable';


const StatisticsTable = () => {
  const breadcrumbItems = [
    { label: 'Табло'                , path: '/dashboard-overview' },
    { label: 'Статистика'           , path: '/statistics' }
  ];

  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    { v: 1, n: "Януари" }   , { v: 2, n: "Февруари" } , { v: 3, n: "Март" },
    { v: 4, n: "Април" }    , { v: 5, n: "Май" }      , { v: 6, n: "Юни" },
    { v: 7, n: "Юли" }      , { v: 8, n: "Август" }   , { v: 9, n: "Септември" },
    { v: 10, n: "Октомври" }, { v: 11, n: "Ноември" } , { v: 12, n: "Декември" }
  ];

  const years = [2025, 2026];

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      // Взимаме основните колони + обекта 'data', където са species и останалите
      const { data: rawData, error } = await supabase
        .from('td_records')
        .select('castrated_at, gender, has_complications, data'); 

      if (error) throw error;
      processData(rawData);
    } catch (error) {
      console.error('Грешка при статистика:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const processData = (rawData) => {
    const grouped = {};
    
    rawData.forEach(item => {
      const rawDate = item.castrated_at;
      if (!rawDate) return;

      const fatalIDs = ['dead_anesthesia', 'dead_surgery', 'dead_postsurgery'];
      const dateObj = new Date(rawDate);
      const dateKey = rawDate.split('T')[0]; 
      
      // ИЗВЛИЧАНЕ НА ДАННИТЕ ОТ JSON ОБЕКТА
      const animalSpecies = item.data?.species || item.species || "cat";
      // Логика за проверка на смъртност:
      // 1. Проверяваме дали изобщо има отбелязано усложнение (Y)
      // 2. Проверяваме дали някое от избраните усложнения е в списъка fatalIDs
      const hasComplication = item.data?.hasComplications || item.has_complications || "N";
      const selectedComps = item.data?.selectedComplications || []; // Масив от ID-та
      
      const isDead = hasComplication === 'Y' && selectedComps.some(id => fatalIDs.includes(id));
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = { 
          day: dateObj.getDate(),
          month: dateObj.getMonth() + 1,
          year: dateObj.getFullYear(),
          total: 0, 
          femaleCats: 0, 
          maleCats: 0, 
          femaleDogs: 0, 
          maleDogs: 0, 
          dead: 0 
        };
      }

      grouped[dateKey].total += 1;
      
      // Логика за Котки vs Кучета
      if (animalSpecies === 'cat') {
        if (item.gender === 'female') grouped[dateKey].femaleCats += 1;
        if (item.gender === 'male') grouped[dateKey].maleCats += 1;
      } else if (animalSpecies === 'dog') {
        if (item.gender === 'female') grouped[dateKey].femaleDogs += 1;
        if (item.gender === 'male') grouped[dateKey].maleDogs += 1;
      }

      // Добавяме към колона "Умрели" само ако е потвърдено фатално ID
      if (isDead) {
        grouped[dateKey].dead += 1;
      }
    });

    const sortedStats = Object.values(grouped).sort((a, b) => 
      new Date(`${b.year}-${b.month}-${b.day}`) - new Date(`${a.year}-${a.month}-${a.day}`)
    );
    setStats(sortedStats);
  };

  // Филтрираме данните според избора
  const filteredStats = stats.filter(row => 
    row.month === Number(selectedMonth) && row.year === Number(selectedYear)
  );

  // Изчисляваме общо само за филтрираните данни
  const totals = filteredStats.reduce((acc, row) => ({
    total: acc.total + row.total,
    femaleCats: acc.femaleCats + row.femaleCats,
    maleCats: acc.maleCats + row.maleCats,
    dead: acc.dead + row.dead
  }), { total: 0, femaleCats: 0, maleCats: 0, dead: 0 });

  if (loading) return <div className="p-10 text-center">Зареждане на статистика за Пловдив...</div>;

  return (
    <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto">

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
                        {filteredStats.map((row, index) => (
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
                        ))}
                    </tbody>
                    </table>

                </div>
                
                
                <ZoneStatisticsTable />

        </div>
    </div>
  );
};

export default StatisticsTable;