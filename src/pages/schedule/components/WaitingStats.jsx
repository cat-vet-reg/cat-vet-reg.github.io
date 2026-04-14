import React from 'react';
import { TrendingUp, Users, Map as MapIcon } from "lucide-react";

const WaitingStats = ({ data = [] }) => {
  // 1. Изчисляване на статистиката
  const getZoneStats = () => {
    if (!data.length) return [];
    
    const stats = data.reduce((acc, item) => {
      const zone = item.zona_number || "Няма зона";
      acc[zone] = (acc[zone] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(stats)
      .map(([zone, count]) => ({ zone, count }))
      .sort((a, b) => b.count - a.count);
  };

  const zoneStats = getZoneStats();
  const topZone = zoneStats[0];

  if (data.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      
      {/* КАРТА 1: ПРИОРИТЕТНА ЗОНА */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-200/50">
        <div className="relative z-10">
          <div className="bg-white/20 w-fit p-2 rounded-lg mb-4">
            <TrendingUp size={20} className="text-white" />
          </div>
          <span className="text-blue-100 text-[10px] uppercase font-black tracking-widest opacity-80">
            Топ Приоритет
          </span>
          <h4 className="text-4xl font-black mt-1">Зона {topZone?.zone}</h4>
          <p className="text-blue-100 text-sm mt-2 font-medium">
            {topZone?.count} записани чакат кастрация тук.
          </p>
        </div>
        {/* Декоративен елемент */}
        <div className="absolute -right-4 -bottom-4 opacity-20 transform rotate-12">
            <MapIcon size={120} />
        </div>
      </div>

      {/* КАРТА 2: КЛАСАЦИЯ ПО ЗОНИ */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h4 className="text-slate-800 font-bold flex items-center gap-2 mb-4">
            <Users size={18} className="text-slate-400" />
            Натовареност по райони
          </h4>
          
          <div className="flex flex-wrap gap-2">
            {zoneStats.map((stat, index) => (
              <div 
                key={stat.zone} 
                className={`group flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all ${
                  index === 0 
                    ? 'border-blue-200 bg-blue-50/50 shadow-sm' 
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                  index === 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Зона</div>
                  <div className="text-sm font-black text-slate-700 leading-none">{stat.zone}</div>
                </div>
                <div className="ml-2 bg-white px-2 py-1 rounded-lg border border-slate-100 text-xs font-bold text-blue-600">
                  {stat.count}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[10px] text-slate-400 mt-6 border-t border-slate-50 pt-4 italic">
            * Системата препоръчва кастрация по съседни зони (метод на спиралата).
        </p>
      </div>
    </div>
  );
};

export default WaitingStats;