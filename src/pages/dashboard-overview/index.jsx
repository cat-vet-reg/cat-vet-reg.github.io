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

// Можеш да ползваш обикновен div с прогрес барове, ако не искаш външни библиотеки веднага
const ComplicationsSimpleChart = ({ data }) => {
  // Ако няма данни, показваме съобщение вместо нищо
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
                style={{ width: `${Math.max((item.count / 10) * 100, 5)}%` }} // Минимум 5% за да се вижда
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DashboardOverview = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [realCats, setRealCats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
          try {
            const response = await $apiGetCats();
            setRealCats(response.data || []);
          } catch (err) {
            console.error("Грешка при зареждане на таблото:", err);
          } finally {
            setIsLoading(false);
          }
        };

        loadData();
  }, []);


  useEffect(() => {
    if (realCats.length > 0) {
      console.log("Първа котка от базата:", realCats[0]);
      console.log("Усложнения на първата котка:", realCats[0].selected_complications);
    }
  }, [realCats]);

  // 2. Изчисляване на динамичните статистики (useMemo ги преизчислява само при промяна на realCats)
  const stats = useMemo(() => {
    const total = realCats.length;
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    const recent = realCats.filter(cat => new Date(cat.created_at) > monthAgo).length;
    
    // 1. Всички уникални локации до момента
    const allLocations = new Set(realCats.map(cat => cat.location_address).filter(Boolean));
    const totalLocationsCount = allLocations.size;

    // 2. Локации, които са съществували ПРЕДИ миналата седмица
    const oldLocations = new Set(
      realCats
        .filter(cat => new Date(cat.created_at) < oneWeekAgo)
        .map(cat => cat.location_address)
        .filter(Boolean)
    );

    // 3. Локации на котки, регистрирани ПРЕЗ последната седмица
    const recentLocations = new Set(
      realCats
        .filter(cat => new Date(cat.created_at) >= oneWeekAgo)
        .map(cat => cat.location_address)
        .filter(Boolean)
    );

    // 4. НОВИ ЛОКАЦИИ: Тези, които ги има в скорошните, но ги е нямало в старите
    const newLocationsCount = [...recentLocations].filter(loc => !oldLocations.has(loc)).length;

    const hasComplicationsCount = realCats.filter(cat => {
      const val = cat?.hasComplications || cat?.has_complications || cat?.complications;
      return val?.toString().toUpperCase() === 'Y';
    }).length;
    const rate = total > 0 ? ((hasComplicationsCount / total) * 100).toFixed(1) : 0;


    // --- ДАННИ ЗА ДИАГРАМА ---
    const counts = {};
    
    realCats.forEach(cat => {
      // 1. Проверяваме всички възможни имена на полето, които видяхме в твоя код
      const selected = cat?.selected_complications || cat?.selectedComplications || [];
      
      // 2. Уверяваме се, че работим с масив
      let complicationsArray = [];
      if (Array.isArray(selected)) {
        complicationsArray = selected;
      } else if (typeof selected === 'string' && selected.startsWith('[')) {
        try {
          complicationsArray = JSON.parse(selected);
        } catch (e) {
          complicationsArray = [];
        }
      }

      // 3. Броим
      complicationsArray.forEach(id => {
        if (id) {
          counts[id] = (counts[id] || 0) + 1;
        }
      });
    });

    // Взимаме етикетите от formOptions
    const allOptions = [
      ...(complicationOptions?.female || []),
      ...(complicationOptions?.male || []),
      ...(complicationOptions?.general || [])
    ];

    const complicationsChartData = Object.keys(counts).map(id => {
      const option = allOptions.find(opt => opt.id === id);
      return { 
        name: option ? option.label : id, 
        count: counts[id] 
      };
    }).sort((a, b) => b.count - a.count);

    // ВАЖНО: Ако масивът е празен, връщаме празен масив за компонента
    return { total, recent, locations: totalLocationsCount, newLocations: newLocationsCount, rate, complicationsChartData };
  }, [realCats]);

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

  const handleRegisterCat = () => {
    navigate('/cat-registration-form');
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <Breadcrumb items={[{ label: 'Табло', path: '/dashboard-overview' }]} />

          <div className="mb-6 md:mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-2">
              Текущо табло
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Добре дошли! На текущото табло е представено какво се случва с новорегистрираните котки.
            </p>
          </div>

          {/* <div className="mb-6 md:mb-8">
            <SearchBar suggestions={searchSuggestions} />
          </div> */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {statsData.map((stat, index) =>
            <StatCard key={index} {...stat} />
            )}
          </div>

          <ComplicationsSimpleChart data={stats.complicationsChartData} />
         
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
    </>);

};

export default DashboardOverview;