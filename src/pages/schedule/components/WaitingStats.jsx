import React from 'react';
import { TrendingUp, Users, Map as MapIcon, Dog, Cat } from "lucide-react";

const WaitingStats = ({ data = [] }) => {
  if (data.length === 0) return (
    <div className="mb-6 p-4 bg-white border border-slate-200 rounded-2xl text-center text-slate-400 text-xs italic">
      Няма данни за избраните филтри
    </div>
  );

  // Изчисляване на статистика
  const total = data.length;
  const cats = data.filter(d => d.animal_type === 'cat').length;
  const dogs = data.filter(d => d.animal_type === 'dog').length;
  
  // Детайлна статистика
  const catFemales = data.filter(d => d.animal_type === 'cat' && d.gender === 'female').length;
  const catMales = data.filter(d => d.animal_type === 'cat' && d.gender === 'male').length;
  
  const dogFemales = data.filter(d => d.animal_type === 'dog' && d.gender === 'female').length;
  const dogMales = data.filter(d => d.animal_type === 'dog' && d.gender === 'male').length;

  const totalCats = catFemales + catMales;
  const totalDogs = dogFemales + dogMales;
  
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
<div className="flex flex-col gap-3">
  {/* ГОРЕН РЕД: ОБЩО ЧАКАЩИ (заема целия ред) */}
  <div className="flex items-baseline gap-2 pb-1 border-b border-slate-100">
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Общо чакащи:</span>
    <span className="text-2xl font-black text-slate-700">{total}</span>
  </div>

  {/* ДОЛЕН РЕД: ГРИД С ДВЕ КОЛОНИ (Котки и Кучета) */}
  <div className="grid grid-cols-2 gap-2">
    {/* КАРТА: КОТКИ */}
    <div className="bg-blue-50/50 p-2 rounded-xl border border-blue-100/50">
      <div className="flex items-center text-blue-600 mb-1">
        <Cat size={14} className="mr-1" />
        <span className="text-[10px] font-black uppercase">Котки ({totalCats})</span>
      </div>
      <div className="flex justify-between text-[11px] font-bold">
        <span className="text-pink-500">♀ {catFemales}</span>
        <span className="text-blue-400">♂ {catMales}</span>
      </div>
    </div>

    {/* КАРТА: КУЧЕТА */}
    <div className="bg-amber-50/50 p-2 rounded-xl border border-amber-100/50">
      <div className="flex items-center text-amber-600 mb-1">
        <Dog size={14} className="mr-1" />
        <span className="text-[10px] font-black uppercase">Кучета ({totalDogs})</span>
      </div>
      <div className="flex justify-between text-[11px] font-bold">
        <span className="text-pink-500">♀ {dogFemales}</span>
        <span className="text-amber-500">♂ {dogMales}</span>
      </div>
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