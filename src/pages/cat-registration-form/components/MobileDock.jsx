import React from 'react';
import Icon from "../../../components/AppIcon";

const MobileDock = ({ scrollToSection, sectionRefs }) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md">
      <div className="bg-white/80 backdrop-blur-lg border border-slate-200 shadow-2xl rounded-2xl p-1.5 flex justify-around items-center gap-1">
        
        <button 
          onClick={() => scrollToSection(sectionRefs.owner)} 
          className="flex flex-col items-center justify-center flex-1 py-2 rounded-xl hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-all"
          title="Собственик"
        >
          <Icon name="User" size={18}/>
          <span className="text-[9px] font-bold uppercase mt-1 tracking-tighter">Собственик</span>
        </button>

        <div className="w-px h-6 bg-slate-100" />

        <button 
          onClick={() => scrollToSection(sectionRefs.basic)} 
          className="flex flex-col items-center justify-center flex-1 py-2 rounded-xl hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-all"
          title="Животно"
        >
          <Icon name="Cat" size={18}/>
          <span className="text-[9px] font-bold uppercase mt-1 tracking-tighter">Животно</span>
        </button>

        <div className="w-px h-6 bg-slate-100" />

        <button 
          onClick={() => scrollToSection(sectionRefs.location)} 
          className="flex flex-col items-center justify-center flex-1 py-2 rounded-xl hover:bg-pink-50 text-slate-600 hover:text-pink-600 transition-all"
          title="Локация"
        >
          <Icon name="MapPin" size={18} className="text-pink-500"/>
          <span className="text-[9px] font-bold uppercase mt-1 tracking-tighter">Карта</span>
        </button>

        <div className="w-px h-6 bg-slate-100" />

        <button 
          onClick={() => scrollToSection(sectionRefs.status)} 
          className="flex flex-col items-center justify-center flex-1 py-2 rounded-xl hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-all"
          title="Статус"
        >
          <Icon name="Activity" size={18}/>
          <span className="text-[9px] font-bold uppercase mt-1 tracking-tighter">Статус</span>
        </button>

        <div className="w-px h-6 bg-slate-100" />

        <button 
          onClick={() => scrollToSection(sectionRefs.anesthesia)} 
          className="flex flex-col items-center justify-center flex-1 py-2 rounded-xl hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 transition-all"
          title="Анестезия"
        >
          <Icon name="Syringe" size={18} className="text-emerald-500"/>
          <span className="text-[9px] font-bold uppercase mt-1 tracking-tighter">Медикаменти</span>
        </button>
        
      </div>
    </div>
  );
};

export default MobileDock;