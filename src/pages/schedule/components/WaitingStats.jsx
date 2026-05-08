import React from 'react';
import { TrendingUp, Users, Map as MapIcon, Dog, Cat } from "lucide-react";

const WaitingStats = ({ data = [] }) => {
  if (data.length === 0) return null;

  // Изчисляване на статистика
  const total = data.length;
  const cats = data.filter(d => d.animal_type === 'cat').length;
  const dogs = data.filter(d => d.animal_type === 'dog').length;
  
  const getZoneStats = () => {
    const stats = data.reduce((acc, item) => {
      const zone = item.zona_number || "Извън града";
      acc[zone] = (acc[zone] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(stats)
      .map(([zone, count]) => ({ zone, count }))
      .sort((a, b) => b.count - a.count);
  };

  const zoneStats = getZoneStats();
  const topZone = zoneStats[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
      {/* КАРТА: ОБЩО */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="text-[10px] font-black text-slate-400 uppercase mb-2">Общо чакащи</div>
        <div className="flex items-end justify-between">
          <span className="text-3xl font-black text-slate-700">{total}</span>
          <div className="flex gap-2 pb-1">
            <span className="flex items-center text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">
              <Cat size={12} className="mr-1" /> {cats}
            </span>
            <span className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
              <Dog size={12} className="mr-1" /> {dogs}
            </span>
          </div>
        </div>
      </div>

      {/* КАРТА: ПРИОРИТЕТНА ЗОНА */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-4 text-white shadow-md">
        <div className="relative z-10">
          <div className="text-[10px] font-black text-blue-100 uppercase opacity-80">Топ Район</div>
          <div className="text-2xl font-black">Зона {topZone?.zone}</div>
          <div className="text-xs text-blue-100">{topZone?.count} животни</div>
        </div>
        <MapIcon size={60} className="absolute -right-2 -bottom-2 opacity-20 rotate-12" />
      </div>

      {/* КАРТА: КЛАСАЦИЯ ЗОНИ */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="text-[10px] font-black text-slate-400 uppercase mb-2">Натовареност по зони</div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {zoneStats.slice(0, 5).map((stat, i) => (
            <div key={i} className="flex-shrink-0 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
              <div className="text-[10px] font-bold text-slate-400">Зона {stat.zone}</div>
              <div className="text-sm font-black text-slate-700">{stat.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WaitingStats;