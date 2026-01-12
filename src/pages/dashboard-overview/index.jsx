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

    loadData(); // Извикваме я

    const timer = setInterval(() => {
      // Можеш да добавиш логика тук, ако ти трябва текущо време
    }, 60000);
  }, []);

  // 2. Изчисляване на динамичните статистики (useMemo ги преизчислява само при промяна на realCats)
  const stats = useMemo(() => {
    const total = realCats.length;
    
    // Филтър за последния месец
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    const recent = realCats.filter(cat => new Date(cat.created_at) > monthAgo).length;
    
    // Броене на уникални локации
    const locations = new Set(realCats.map(cat => cat.location_address).filter(Boolean)).size;

    // Усложнения (ако нямаш такова поле, временно слагаме 0 или примерен процент)
    const hasComplications = realCats.filter(cat => cat.health_status === 'complication').length;
    const rate = total > 0 ? ((hasComplications / total) * 100).toFixed(1) : 0;

    return { total, recent, locations, rate };
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
    trend: "тази седмица",
    icon: "TrendingUp",
    iconColor: "var(--color-success)"
  },
  {
    title: "Активни локации",
    value: stats.locations.toString(),
    change: "+3",
    changeType: "positive",
    trend: "нови локации",
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