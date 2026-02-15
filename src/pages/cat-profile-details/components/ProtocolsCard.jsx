import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProtocolsCard = ({ protocols = [], onAddProtocol }) => {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="bg-card rounded-xl shadow-warm p-4 md:p-6 lg:p-8 mt-6 border border-border/40">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
            <Icon name="Stethoscope" size={20} className="text-primary" />
          </div>
          <h2 className="text-xl md:text-2xl font-semibold text-foreground">
            Медицински Протоколи
          </h2>
        </div>
        <Button variant="default" size="sm" iconName="Plus" onClick={onAddProtocol}>
          Добави Протокол
        </Button>
      </div>

      <div className="space-y-4">
        {protocols.map((protocol) => {
          const isExpanded = expandedId === protocol.protocol_number;
          
          return (
            <div 
              key={protocol.protocol_number} 
              className={`rounded-xl border transition-all duration-200 ${
                isExpanded ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-muted/20 hover:bg-muted/40'
              }`}
            >
              {/* Заглавна част - Кликаема */}
              <div 
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : protocol.protocol_number)}
              >
                <div className="flex flex-col gap-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isExpanded ? 'text-primary' : 'text-muted-foreground'}`}>
                    Протокол №{protocol.protocol_number}
                  </span>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-medium px-2 py-0.5 bg-background rounded border border-border shadow-sm text-muted-foreground">
                      📅 {protocol.protocol_creation_date}
                    </span>
                    <span className="font-bold text-foreground text-m">
                      {protocol.diagnosis || "контрола"}
                    </span>
                    {protocol.temperature && (
                      <span className="text-xs font-bold text-orange-600 flex items-center gap-1">
                        <Icon name="Thermometer" size={12} /> {protocol.temperature}°C
                      </span>
                    )}
                    {protocol.weight && (
                      <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                        <Icon name="Scale" size={12} /> {protocol.weight} кг
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-xs text-muted-foreground hidden sm:inline">
                     {isExpanded ? "Свий" : "Виж детайли"}
                   </span>
                   <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={20} className={isExpanded ? "text-primary" : "text-muted-foreground"} />
                </div>
              </div>

              {/* Разгънати детайли - Целият протокол на един екран */}
              {isExpanded && (
                <div className="px-5 pb-6 pt-2 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="h-px bg-primary/10 w-full" />
                  
                  {/* Първи ред: Обективно състояние */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-background/50 p-3 rounded-lg border border-border/50">
                      <p className="text-[11px] font-bold text-primary uppercase mb-1">Анамнеза</p>
                      <p className="text-sm leading-relaxed italic">"{protocol.anamnesis}"</p>
                    </div>
                    <div className="bg-background/50 p-3 rounded-lg border border-border/50">
                      <p className="text-[11px] font-bold text-primary uppercase mb-1">Клинични признаци</p>
                      <p className="text-sm">{protocol.clinical_signs?.join(', ') || "Няма вписани"}</p>
                    </div>
                    <div className="bg-background/50 p-3 rounded-lg border border-border/50">
                      <p className="text-[11px] font-bold text-primary uppercase mb-1">Изследвания / Преглед</p>
                      <p className="text-sm">{protocol.examination || "—"}</p>
                    </div>
                  </div>

                  {/* Втори ред: Терапия */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-[11px] font-bold text-secondary uppercase mb-2">Назначено лечение</p>
                        <div className="p-4 bg-secondary/5 rounded-xl border border-secondary/20 text-sm leading-relaxed font-medium">
                          {protocol.treatment || "Няма специфично лечение."}
                        </div>
                      </div>
                      
                      {protocol.medications?.length > 0 && (
                        <div>
                          <p className="text-[11px] font-bold text-secondary uppercase mb-2">Приложени медикаменти</p>
                          <div className="flex flex-wrap gap-2">
                            {protocol.medications.map((med, i) => (
                              <span key={i} className="bg-secondary text-secondary-foreground text-[10px] px-2.5 py-1 rounded-md font-bold shadow-sm">
                                {med}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                       <div>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase mb-2">Манипулации</p>
                        <div className="flex flex-wrap gap-2">
                          {protocol.manipulations?.length > 0 ? (
                            protocol.manipulations.map((man, i) => (
                              <span key={i} className="bg-muted text-muted-foreground text-[10px] px-2 py-1 rounded border border-border">
                                🛠️ {man}
                              </span>
                            ))
                          ) : <span className="text-xs italic text-muted-foreground">Няма вписани манипулации</span>}
                        </div>
                      </div>
                      
                      {protocol.notes && (
                        <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200/50">
                          <p className="text-[11px] font-bold text-amber-700 uppercase mb-1">Бележки</p>
                          <p className="text-xs text-amber-900">{protocol.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {protocols.length === 0 && (
          <div className="text-center py-16 bg-muted/10 border-2 border-dashed border-border rounded-2xl">
            <Icon name="ClipboardList" size={48} className="mx-auto text-muted/30 mb-4" />
            <p className="text-muted-foreground font-medium">Историята е празна. Добавете първия протокол.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProtocolsCard;