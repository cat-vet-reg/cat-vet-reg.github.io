import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

const MissingCoordsList = ({ catsWithoutCoords }) => {
  const navigate = useNavigate();
if (catsWithoutCoords.length === 0) return null;


return (
 <div className="mt-8 bg-white rounded-2xl shadow-sm border border-blue-100 p-6 md:p-8">
      {/* Заглавие със синя икона */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-blue-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 leading-tight">
              Животни за локализиране
            </h2>
            <p className="text-sm text-slate-500 mt-0.5 font-medium">
              Нуждаят се от позициониране в района на Пловдив
            </p>
          </div>
        </div>
        
        <div className="px-4 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
          {catsWithoutCoords.length} записа
        </div>
      </div>

      {/* Списък с карти */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
        {catsWithoutCoords.map(cat => (
          <div 
            key={cat.id} 
            className="group relative bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all duration-300"
          >
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {cat.recordName}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">#{cat.id}</span>
              </div>
              
              <div className="flex items-start gap-2 text-xs text-slate-500 min-h-[32px]">
                <svg className="w-4 h-4 text-blue-300 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="line-clamp-2">{cat.location_address || "Липсва адрес"}</span>
              </div>

              <button 
                onClick={() => navigate('/cat-registration-form', { state: { catData: cat, isEditing: true } })}
                className="mt-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm shadow-blue-100 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Редактирай локация
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MissingCoordsList;