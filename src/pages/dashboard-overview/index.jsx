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
        <p className="text-muted-foreground text-sm italic">В момента няма записани специфични усложнения в базата данни.</p>
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

  return (
    <div className="bg-card rounded-xl shadow-warm p-6 mb-8 border border-primary/10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Icon name="Activity" size={20} className="text-primary" />
            Скорост на възстановяване (Доза vs. Събуждане)
          </h2>
          <p className="text-sm text-muted-foreground italic">
            Анализ на фиксиран протокол 0.11 мл спрямо теглото
          </p>
        </div>

        {/* Филтър по пол директно в графиката */}
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

      <div className="relative h-72 w-full flex items-end gap-3 border-b border-l border-slate-200 pb-2 pl-4">
        {/* Y-axis етикет за Доза */}
        <div className="absolute -left-10 top-1/2 -rotate-90 text-[10px] text-muted-foreground uppercase tracking-widest">
          Доза (мл/кг)
        </div>

        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center group relative h-full justify-end">
            {/* Tooltip при посочване */}
            <div className="absolute -top-12 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[10px] p-2 rounded shadow-xl transition-opacity z-20 pointer-events-none min-w-[100px]">
              <div className="font-bold border-b border-slate-700 mb-1">{item.weightGroup}</div>
              <div>Доза: {item.meanDose} мл/кг</div>
              <div>Възст.: {item.meanRecovery} мин.</div>
              <div className="text-emerald-400">Котки: {item.count} бр.</div>
            </div>
            
            {/* СТЪЛБ: Средна доза (Mean Dose) */}
            {/* СТЪЛБ (Доза) */}
<div 
  className="w-full max-w-[30px] rounded-t-sm transition-all duration-500 relative"
  style={{ 
    height: `${Math.min(parseFloat(item.meanDose) * 6000, 240)}px`,
    // Ако повече от 30% от котките имат нужда от добавка, стълбът става оранжев
    backgroundColor: item.topUpRate > 30 ? 'var(--color-warning)' : 'rgba(16, 185, 129, 0.4)' 
  }} 
>
  {/* Малък индикатор за добавка над стълба */}
  {item.topUpRate > 0 && (
    <div className="absolute -top-4 w-full text-[8px] text-center font-bold text-orange-600">
      +{item.topUpRate}%
    </div>
  )}
</div>
            
            {/* ТОЧКА И ЛИНИЯ: Време за възстановяване */}
            <div 
              className="absolute w-3 h-3 bg-rose-500 rounded-full border-2 border-white shadow-md z-10 transition-all duration-500"
              style={{ bottom: `${parseFloat(item.meanRecovery) * 2.5}px` }}
            >
              {/* Свързваща линия (декоративна за визуализация на тренда) */}
              {index > 0 && (
                <div className="hidden md:block absolute h-[2px] bg-rose-300 -left-full top-1/2 -z-10 origin-right"></div>
              )}
            </div>

            <span className="text-[10px] mt-3 text-muted-foreground font-bold font-mono">
              {item.weightGroup}
            </span>
          </div>
        ))}
      </div>

      {/* Легенда */}
      <div className="flex justify-center gap-6 mt-8">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-500 rounded-sm"></div>
          <span className="text-xs font-medium text-slate-600">Средна доза (мл/кг)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
          {/* <span className="text-xs font-medium text-slate-600">Sternal Recumbency (мин)</span> */}
          <span className="text-xs font-medium text-slate-600">Събуждане (мин)</span>
        </div>
      </div>
    </div>
  );
};

const DashboardOverview = () => {
  const navigate = useNavigate();
  const [realCats, setRealCats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [anesthesiaGender, setAnesthesiaGender] = useState('all');
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
    const total = realCats.length;
    const now = new Date();
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // СКОРОШНИ (ползваме запазения created_at)
    const recent = realCats.filter(cat => new Date(cat.created_at) > monthAgo).length;

    // Броене на половете
    const maleCount = realCats.filter(cat => cat.gender === 'male').length;
    const femaleCount = realCats.filter(cat => cat.gender === 'female').length;

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
    const rate = total > 0 ? ((hasComplicationsCount / total) * 100).toFixed(1) : 0;

    // ДАННИ ЗА ГРАФИКАТА
    const counts = {};
    realCats.forEach(cat => {
      const selected = cat.selectedComplications || [];
      if (Array.isArray(selected)) {
        selected.forEach(id => {
          if (id) counts[id] = (counts[id] || 0) + 1;
        });
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
  // Анестезия
    const groups = {};
    
    const filteredForAnesthesia = anesthesiaGender === 'all' 
      ? realCats 
      : realCats.filter(cat => cat.gender === anesthesiaGender);

    filteredForAnesthesia.forEach(cat => {
      const weight = parseFloat(cat.weight);
      
      // 1. ОПРЕДЕЛЯМЕ БАЗОВАТА ДОЗА ВЪТРЕ В ЦИКЪЛА (според пола на конкретната котка)
      const baseDose = cat.gender === 'male' ? 0.12 : 0.11;
      
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
    
    // ГРЕШКА 3: Добавяме обекта gender в return-а
    return { 
      total, 
      recent, 
      locations: totalLocationsCount, 
      newLocations: newLocationsCount, 
      rate, 
      complicationsChartData,
      anesthesiaChartData,
      gender: { male: maleCount, female: femaleCount } // ТОВА ЛИПСВАШЕ
    };
  }, [realCats, anesthesiaGender]);

  const statsData = [
  {
    title: "Брой Регистрирани Котки",
    value: stats.total.toString(),
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
      value: `${stats.rate}%`,
      change: stats.rate > 5 ? "Внимание" : "Нормално",
      changeType: stats.rate > 5 ? "negative" : "positive",
      icon: "AlertTriangle",
      iconColor: stats.rate > 5 ? "var(--color-destructive)" : "var(--color-warning)"
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ComplicationsSimpleChart data={stats.complicationsChartData} totalCats={stats.total} />
            <GenderRatioChart 
              male={stats.gender.male} 
              female={stats.gender.female} 
              total={stats.total} 
            />
            <AnesthesiaRecoveryChart 
            data={stats.anesthesiaChartData} 
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