import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import StatCard from './components/StatCard';
import RecentActivityCard from './components/RecentActivityCard';
import QuickActionButton from './components/QuickActionButton';
import MiniMap from './components/MiniMap';
import SearchBar from './components/SearchBar';
import Icon from '../../components/AppIcon';
import { $apiGetCats } from '../../services/create_new_record';
import { complicationOptions } from '../../constants/formOptions';
import { mapRecordToForm } from '../cat-registration-form/utils/formMapper';

// Графика за усложнения
const ComplicationsSimpleChart = ({ data, totalCats }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-card rounded-xl shadow-warm p-6 mb-8 border border-dashed border-slate-300">
        <h2 className="text-xl font-semibold mb-2 text-foreground">Топ усложнения</h2>
        <p className="text-muted-foreground text-sm italic">В момента няма записани специфични усложнения в базата данни за посочения период от време.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-warm p-6 mb-8 border border-destructive/10">
      <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
        <span className="w-2 h-6 bg-destructive rounded-full"></span>
        Анализ на усложненията
      </h2>
      <div className="space-y-4">
        {data.slice(0, 5).map((item, index) => (
          <div key={index}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground font-medium">{item.name}</span>
              <span className="text-foreground">{item.count} случая</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 text-[0px]">
              <div 
                className="bg-destructive h-2 rounded-full transition-all duration-500" 
                style={{ width: `${Math.max((item.count / totalCats) * 100, 10)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const GenderRatioChart = ({ male, female, total }) => {
  const malePercent = total > 0 ? ((male / total) * 100).toFixed(1) : 0;
  const femalePercent = total > 0 ? ((female / total) * 100).toFixed(1) : 0;

  return (  
    <div className="bg-card rounded-xl shadow-warm p-6 mb-8 border border-slate-200">
      <h2 className="text-xl font-semibold mb-6 text-foreground flex items-center gap-2">
        <Icon name="Users" size={20} className="text-primary" />
        Разпределение по пол
      </h2>
      
      <div className="space-y-6">
        {/* Женски котки */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span className="w-3 h-3 rounded-full bg-pink-400"></span>
              Женски
            </span>
            <span className="text-sm font-bold text-foreground">{female} ({femalePercent}%)</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3">
            <div 
              className="bg-pink-400 h-3 rounded-full transition-all duration-700" 
              style={{ width: `${femalePercent}%` }}
            ></div>
          </div>
        </div>

        {/* Мъжки котки */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span className="w-3 h-3 rounded-full bg-blue-400"></span>
              Мъжки
            </span>
            <span className="text-sm font-bold text-foreground">{male} ({malePercent}%)</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3">
            <div 
              className="bg-blue-400 h-3 rounded-full transition-all duration-700" 
              style={{ width: `${malePercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 text-center">
        <p className="text-xs text-muted-foreground">
          Общо анализирани: <span className="font-semibold">{total} котки</span>
        </p>
      </div>
    </div>
  );
};

const AnesthesiaRecoveryChart = ({ data, activeGender, onGenderChange }) => {
  if (!data || data.length === 0) return null;

  // Намираме макс. време за възстановяване за мащабиране на SVG-то
  const maxRecovery = Math.max(...data.map(d => parseFloat(d.meanRecovery)), 60);

  // Изчисляване на точките за кривата
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100; // Позиция по X
    const y = 100 - (parseFloat(item.meanRecovery) / (maxRecovery * 1.2)) * 100; // Позиция по Y
    return `${x},${y}`;
  }).join(' L ');

  const svgPath = `M ${points}`;

  return (
    <div className="bg-card rounded-xl shadow-warm p-6 mb-8 border border-primary/10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Icon name="Activity" size={20} className="text-primary" />
            Скорост на възстановяване
          </h2>
          <p className="text-sm text-muted-foreground italic">
            Доза (мл/кг) спрямо времето за събуждане
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg">
          {['all', 'male', 'female'].map((g) => (
            <button
              key={g}
              onClick={() => onGenderChange(g)}
              className={`px-3 py-1 text-xs rounded-md transition-all ${
                activeGender === g 
                ? 'bg-white shadow-sm text-primary font-bold' 
                : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {g === 'all' ? 'Всички' : g === 'male' ? 'Мъжки' : 'Женски'}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-72 w-full border-b border-l border-slate-200 pb-2 pl-4">
        {/* Y-axis етикет */}
        <div className="absolute -left-10 top-1/2 -rotate-90 text-[10px] text-muted-foreground uppercase tracking-widest">
          Доза (мл/кг)
        </div>

        {/* --- SVG КРИВА (за събуждането) --- */}
        <div className="absolute inset-0 pr-6 pt-2 pb-2 pl-6 pointer-events-none" style={{ left: '12px' }}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
            <path
              d={svgPath}
              fill="none"
              stroke="#f43f5e" // rose-500
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              className="opacity-30"
            />
          </svg>
        </div>

        {/* Контейнер за стълбовете и точките */}
        <div className="absolute inset-0 flex items-end gap-3 pr-6 pl-6" style={{ left: '12px' }}>
          {data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center group relative h-full justify-end">
              
              {/* Tooltip */}
              <div className="absolute -top-12 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[10px] p-2 rounded shadow-xl transition-opacity z-30 pointer-events-none min-w-[100px]">
                <div className="font-bold border-b border-slate-700 mb-1">{item.weightGroup}</div>
                <div>Доза: {item.meanDose} мл/кг</div>
                <div>Възст.: {item.meanRecovery} мин.</div>
                <div className="text-emerald-400">Котки: {item.count} бр.</div>
              </div>

              {/* СТЪЛБ (Доза) */}
              <div 
                className="w-full max-w-[32px] rounded-t-sm transition-all duration-500 relative z-10"
                style={{ 
                  height: `${Math.min(parseFloat(item.meanDose) * 6000, 240)}px`,
                  backgroundColor: item.topUpRate > 30 ? '#f59e0b' : 'rgba(16, 185, 129, 0.4)' 
                }} 
              >
                {item.topUpRate > 0 && (
                  <div className="absolute -top-4 w-full text-[8px] text-center font-bold text-orange-600">
                    +{item.topUpRate}%
                  </div>
                )}
              </div>
              
              {/* ТОЧКА (Възстановяване) - вече е върху кривата */}
              <div 
                className="absolute w-3 h-3 bg-rose-500 rounded-full border-2 border-white shadow-md z-20 transition-all duration-500"
                style={{ bottom: `${(parseFloat(item.meanRecovery) / (maxRecovery * 1.2)) * 100}%`, transform: 'translateY(50%)' }}
              ></div>

              <span className="text-[10px] absolute -bottom-6 text-muted-foreground font-bold font-mono">
                {item.weightGroup}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Легенда */}
      <div className="flex justify-center gap-6 mt-10">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-500/40 rounded-sm border border-emerald-500"></div>
          <span className="text-xs font-medium text-slate-600">Доза (мл/кг)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
          <div className="w-6 h-[2px] bg-rose-500/30 -ml-1"></div>
          <span className="text-xs font-medium text-slate-600">Събуждане (мин)</span>
        </div>
      </div>
    </div>
  );
};

const SurgerySpeedChart = ({ data, activeGender, onGenderChange }) => {
  if (!data || data.length === 0) return null;

  const maxMinutes = Math.max(...data.map(d => parseFloat(d.avgDuration)), 30);
  const genderText = activeGender === 'all' ? 'всички' : activeGender === 'male' ? 'мъжки' : 'женски';

  // Генериране на точките за линията (SVG path)
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100; // Процент по X
    const y = 100 - (parseFloat(item.avgDuration) / maxMinutes) * 100; // Процент по Y (обърнат)
    return `${x},${y}`;
  }).join(' L ');

  const svgPath = `M ${points}`;

  return (
    <div className="bg-card rounded-xl shadow-warm p-6 mb-8 border border-primary/10 lg:col-span-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Icon name="Timer" size={20} className="text-primary" />
            Ефективност: Време за кастрация на ({genderText} котки)
          </h2>
          <p className="text-sm text-muted-foreground italic">
            Средна продължителност на операцията (минути) по дни
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg self-start">
          {['all', 'male', 'female'].map((g) => (
            <button
              key={g}
              onClick={() => onGenderChange(g)}
              className={`px-3 py-1 text-xs rounded-md transition-all ${
                activeGender === g 
                ? 'bg-white shadow-sm text-primary font-bold' 
                : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {g === 'all' ? 'Всички' : g === 'male' ? 'Мъжки' : 'Женски'}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-64 w-full border-b border-l border-slate-200 pb-2 pl-4">
        {/* Y-axis етикети */}
        <div className="absolute -left-10 top-0 h-full flex flex-col justify-between text-[10px] text-muted-foreground py-2">
          <span>{maxMinutes}м</span>
          <span>{Math.round(maxMinutes/2)}м</span>
          <span>0м</span>
        </div>

        {/* SVG Линията (Кривата) */}
        <div className="absolute inset-0 pr-4 pt-2 pb-2 pl-4 pointer-events-none" style={{ left: '16px' }}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
            <path
              d={svgPath}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              className="opacity-40"
            />
          </svg>
        </div>

        {/* Контейнер за точките и X-оста */}
        <div className="absolute inset-0 flex items-end gap-1 pr-4 pl-4" style={{ left: '16px' }}>
          {data.map((item, index) => {
            const bottomPos = (parseFloat(item.avgDuration) / maxMinutes) * 100;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                {/* Tooltip */}
                <div className="absolute opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[10px] p-2 rounded shadow-xl transition-opacity z-30 pointer-events-none whitespace-nowrap"
                     style={{ bottom: `${bottomPos + 5}%` }}>
                  {item.date}: <span className="font-bold">{item.avgDuration} мин.</span>
                </div>
                
                {/* Точка на графиката */}
                <div 
                  className="w-3 h-3 bg-primary border-2 border-white rounded-full z-20 hover:scale-150 transition-transform cursor-pointer shadow-sm"
                  style={{ bottom: `${bottomPos}%`, position: 'absolute', transform: 'translateY(50%)' }}
                ></div>

                {/* Вертикална помощна линия */}
                <div className="w-[1px] bg-slate-50 h-full absolute z-10 group-hover:bg-primary/10"></div>

                {/* Етикет за дата */}
                <span className="text-[8px] absolute -bottom-8 text-muted-foreground rotate-45 origin-left whitespace-nowrap">
                  {data.length > 10 ? (index % 2 === 0 ? item.date : '') : item.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {/* Празно пространство за завъртаните етикети */}
      <div className="h-8"></div>
    </div>
  );
};

const DashboardOverview = () => {
  const navigate = useNavigate();
  const [realCats, setRealCats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [anesthesiaGender, setAnesthesiaGender] = useState('female');
  const [timeRange, setTimeRange] = useState('3months'); // '1week', '1month', '3months', 'all'

  // 1. Зареждане и Мапване на данните
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const response = await $apiGetCats();
        if (response.data) {
          // Превръщаме суровите данни в обекти през твоя мапер
          const mapped = response.data.map(record => {
            const mappedObj = mapRecordToForm(record);
            // Пазим created_at за изчисленията на датите
            return { ...mappedObj, created_at: record.created_at };
          });
          setRealCats(mapped);
        }
      } catch (err) {
        console.error("Грешка при зареждане:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // 2. Изчисляване на статистики
  const stats = useMemo(() => {
    
    const now = new Date();

    // --- 1. ГЛОБАЛНИ СТАТИСТИКИ (НЕ се влияят от филтъра) ---
    const globalTotal = realCats.length;
    
    // Глобален процент усложнения
    const globalComplicationsCount = realCats.filter(cat => cat.hasComplications === 'Y' || cat.hasComplications === true).length;
    const globalRate = globalTotal > 0 ? ((globalComplicationsCount / globalTotal) * 100).toFixed(1) : 0;

    // --- 2. ФИЛТРИРАНЕ ПО ВРЕМЕ (за графиките) ---
    const filteredByTime = realCats.filter(cat => {
      if (timeRange === 'all') return true;
      
      // 1. Проверка дали изобщо има дата на кастрация
      if (!cat.castratedAt && !cat.castrated_at) return false;
      
      // 2. Опит за създаване на дата (поддържаме и двата възможни ключа от мапера)
      const dateValue = cat.castratedAt || cat.castrated_at;
      const catDate = new Date(dateValue);
      
      // 3. Проверка дали датата е валидна
      if (isNaN(catDate.getTime())) return false;
      
      // 4. Изчисляване на разликата в дни
      const diffInTime = now.getTime() - catDate.getTime();
      const diffInDays = diffInTime / (1000 * 60 * 60 * 24);
      
      if (timeRange === '1week') return diffInDays <= 7;
      if (timeRange === '1month') return diffInDays <= 30;
      if (timeRange === '3months') return diffInDays <= 90;
      return true;
    });

    // ВАЖНО: Оттук нататък в useMemo използваме filteredByTime вместо realCats!
    const periodTotal = filteredByTime.length;
    
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // СКОРОШНИ (ползваме запазения created_at)
    const recent = realCats.filter(cat => new Date(cat.created_at) > monthAgo).length;

    // Броене на половете
    const maleCount = filteredByTime.filter(cat => cat.gender === 'male').length;
    const femaleCount = filteredByTime.filter(cat => cat.gender === 'female').length;

    // ЛОКАЦИИ (в мапера е полето .address)
    const allLocations = new Set(realCats.map(cat => cat.address).filter(Boolean));
    const totalLocationsCount = allLocations.size;

    const oldLocations = new Set(
      realCats
        .filter(cat => new Date(cat.created_at) < oneWeekAgo)
        .map(cat => cat.address)
        .filter(Boolean)
    );

    const recentLocations = new Set(
      realCats
        .filter(cat => new Date(cat.created_at) >= oneWeekAgo)
        .map(cat => cat.address)
        .filter(Boolean)
    );

    const newLocationsCount = [...recentLocations].filter(loc => !oldLocations.has(loc)).length;

    // УСЛОЖНЕНИЯ (ползваме изчистеното .hasComplications)
    const hasComplicationsCount = realCats.filter(cat => cat.hasComplications === 'Y').length;
    const rate = periodTotal > 0 ? ((hasComplicationsCount / periodTotal) * 100).toFixed(1) : 0;

    // ДАННИ ЗА ГРАФИКАТА
    // УСЛОЖНЕНИЯ - По-сигурно изчисляване
    const counts = {};
    filteredByTime.forEach(cat => {
      // ПРОВЕРКА: Броим усложненията САМО ако е потвърдено, че котката има такива
      if (cat.hasComplications === 'Y' || cat.hasComplications === true) {
        const selected = cat.selectedComplications || [];
        if (Array.isArray(selected)) {
          selected.forEach(id => {
            // id трябва да съществува и да не е празен низ
            if (id && id.trim() !== "") {
              counts[id] = (counts[id] || 0) + 1;
            }
          });
        }
      }
    });

    const allOptions = [
      ...(complicationOptions?.female || []),
      ...(complicationOptions?.male || []),
      ...(complicationOptions?.general || [])
    ];

    const complicationsChartData = Object.keys(counts).map(id => {
      const option = allOptions.find(opt => opt.id === id);
      return { 
        name: option ? option.label : `Друго: ${id}`, 
        count: counts[id] 
      };
    }).sort((a, b) => b.count - a.count);

    // Анестезия
    const groups = {};
    
    const filteredForAnesthesia = anesthesiaGender === 'all' 
      ? filteredByTime 
      : filteredByTime.filter(cat => cat.gender === anesthesiaGender);

    filteredForAnesthesia.forEach(cat => {
      const weight = parseFloat(cat.weight);
      
      // 1. ОПРЕДЕЛЯМЕ БАЗОВАТА ДОЗА ВЪТРЕ В ЦИКЪЛА (според пола на конкретната котка)
      const inductionDose = parseFloat(cat.inductionDose);
      const fallbackDose = cat.gender === 'male' ? 0.12 : 0.11;
      const baseDose = (!isNaN(inductionDose) && inductionDose > 0) ? inductionDose : fallbackDose;
      
      // 2. ДОБАВЯМЕ ДОПЪЛНИТЕЛНАТА УПОЙКА, АКО ИМА ТАКАВА
      const topUp = parseFloat(cat.inductionAddAmount) || 0;
      const totalVolume = baseDose + topUp;
      
      // 3. ИЗЧИСЛЯВАМЕ ВРЕМЕТО
      const propofolTime = parseFloat(cat.propofolFirstMin);
      const surgeryTime = parseFloat(cat.surgeryDuration || cat.duration);
      const effectiveTime = (!isNaN(propofolTime) && propofolTime > 0) 
        ? propofolTime 
        : (!isNaN(surgeryTime) && surgeryTime > 0 ? surgeryTime : 0);

      // 4. ПРОВЕРКА ЗА ВАЛИДНОСТ
      if (!isNaN(weight) && weight > 0 && effectiveTime > 0) {
        const groupKey = weight;
          
        if (!groups[groupKey]) {
          groups[groupKey] = { 
            weightGroup: groupKey, 
            totalDoseSum: 0, // Сумираме (общо количество / тегло)
            totalRecoveryTime: 0, 
            count: 0,
            topUpCount: 0
          };
        }
        
        // Изчисляваме дозата на кг за тази конкретна котка
        groups[groupKey].totalDoseSum += (totalVolume / weight);
        groups[groupKey].totalRecoveryTime += effectiveTime;
        groups[groupKey].count += 1;
        
        if (cat.hasInductionAdd === true || cat.hasInductionAdd === 'Y') {
          groups[groupKey].topUpCount += 1;
        }
      }
    });

    const anesthesiaChartData = Object.values(groups).map(g => ({
      weightGroup: `${g.weightGroup} кг`,
      meanDose: (g.totalDoseSum / g.count).toFixed(4),
      meanRecovery: (g.totalRecoveryTime / g.count).toFixed(1),
      count: g.count,
      topUpRate: ((g.topUpCount / g.count) * 100).toFixed(0)
    })).sort((a, b) => parseFloat(a.weightGroup) - parseFloat(b.weightGroup));

    //Нужно време за ОПЕРАЦИЯ
    const surgeryDates = {};

    filteredForAnesthesia.forEach(cat => {
      const duration = parseFloat(cat.surgeryDuration || cat.duration);
      const dateValue = cat.castratedAt || cat.castrated_at;
      
      if (!isNaN(duration) && duration > 0 && dateValue) {
        const dateObj = new Date(dateValue);
        if (!isNaN(dateObj.getTime())) {
          // Форматираме датата като "1 Ян" или "01.01"
          const formattedDate = dateObj.toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' });
          
          if (!surgeryDates[formattedDate]) {
            surgeryDates[formattedDate] = { sum: 0, count: 0, rawDate: dateObj };
          }
          surgeryDates[formattedDate].sum += duration;
          surgeryDates[formattedDate].count += 1;
        }
      }
    });

    const surgerySpeedData = Object.keys(surgeryDates)
      .map(date => ({
        date,
        avgDuration: (surgeryDates[date].sum / surgeryDates[date].count).toFixed(1),
        count: surgeryDates[date].count,
        timestamp: surgeryDates[date].rawDate.getTime()
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    
    // ГРЕШКА 3: Добавяме обекта gender в return-а
    return { 
      globalTotal,      // За голямата карта
      globalRate,       // За картата "Усложнения"
      periodTotal,      // За графиките отдолу
      recent, 
      locations: totalLocationsCount, 
      newLocations: newLocationsCount, 
      rate, 
      complicationsChartData,
      gender: { male: maleCount, female: femaleCount },
      anesthesiaChartData,
      surgerySpeedData
    };
  }, [realCats, anesthesiaGender, timeRange]);

  const statsData = [
  {
    title: "Брой Регистрирани Котки",
    value: stats.globalTotal.toString(),
    icon: "Cat",
    iconColor: "var(--color-primary)"
  },
  {
    title: "Скорошни регистрирани котки",
    value: stats.recent.toString(),
    change: `+${stats.recent}`,
    changeType: "positive",
    trend: "този месец",
    icon: "TrendingUp",
    iconColor: "var(--color-success)"
  },
  {
    title: "Активни локации",
    value: stats.locations.toString(),
    change: `+${stats.newLocations}`,
    changeType: "positive",
    trend: "от миналата седмица",
    icon: "MapPin",
    iconColor: "var(--color-secondary)"
  },
  {
    title: "Усложнения",
      value: `${stats.globalRate}%`,
      change: stats.globalRate > 5 ? "Внимание" : "Нормално",
      changeType: stats.globalRate > 5 ? "negative" : "positive",
      icon: "AlertTriangle",
      iconColor: stats.globalRate > 5 ? "var(--color-destructive)" : "var(--color-warning)"
  }];

  const quickActions = [
  {
    title: "Регистрирай Нова Котка",
    description: "Добави нова котка в регистъра с пълна информация и локацията",
    icon: "Plus",
    iconColor: "var(--color-primary)",
    path: "/cat-registration-form"
  },
  {
    title: "Виж интерактивна карта",
    description: "Виж регистрираните котки на картата, показваща техните локации",
    icon: "Map",
    iconColor: "var(--color-secondary)",
    path: "/interactive-cat-map"
  },
  {
    title: "Търси в регистъра",
    description: "Виж целия списък на регистрираните котки с търсачка и опции за филтриране.",
    icon: "List",
    iconColor: "var(--color-accent)",
    path: "/cat-registry-list"
  }];

  const registrationHotspots = [
  { area: "Пловдив", count: 89, color: "var(--color-primary)" },
  { area: "Асеновград", count: 67, color: "var(--color-secondary)" },
  { area: "Раковски", count: 54, color: "var(--color-accent)" },
  { area: "Съединение", count: 37, color: "var(--color-success)" }];

  if (isLoading) return <div className="p-10 text-center">Зареждане на таблото...</div>;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <Breadcrumb items={[{ label: 'Табло', path: '/dashboard-overview' }]} />
          <div className="mb-6 md:mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-2">Текущо табло</h1>
            <p className="text-base md:text-lg text-muted-foreground">Статистика за кастрационната кампания.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {statsData.map((stat, index) => <StatCard key={index} {...stat} />)}
          </div>
 
          <p className="text-base md:text-lg text-muted-foreground">Избери време за филтриране на графиките:</p>
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto">
            {[
              { id: '1week'   , label: '7 дни' },
              { id: '1month'  , label: '1 месец' },
              { id: '3months' , label: '3 месеца' },
              { id: 'all'     , label: 'Всички' }
            ].map((range) => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  timeRange === range.id 
                  ? 'bg-white shadow-sm text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          <br></br>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ComplicationsSimpleChart data={stats.complicationsChartData} totalCats={stats.periodTotal} />
            <GenderRatioChart 
              male={stats.gender.male} 
              female={stats.gender.female} 
              total={stats.periodTotal} 
            />
            <AnesthesiaRecoveryChart 
              data={stats.anesthesiaChartData} 
              activeGender={anesthesiaGender} 
              onGenderChange={setAnesthesiaGender} 
            />
            <SurgerySpeedChart 
              data={stats.surgerySpeedData}
              activeGender={anesthesiaGender}
              onGenderChange={setAnesthesiaGender} 
             />
          </div>
          
         
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
               <MiniMap registrationHotspots={registrationHotspots} />
            </div>
            <div className="bg-card rounded-lg p-6 shadow-warm">
              <h2 className="text-xl font-semibold mb-4">Бързи действия</h2>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <QuickActionButton key={index} {...action} onClick={() => navigate(action.path)} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <FloatingActionButton onClick={() => navigate('/cat-registration-form')} />
    </>
  );
};

export default DashboardOverview;