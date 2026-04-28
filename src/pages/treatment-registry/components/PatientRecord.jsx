import React, { useState, useEffect } from 'react';
import { X, Plus, ChevronDown, ChevronUp, FileText, Activity, User, Info } from 'lucide-react';
import Button from "../../../components/ui/Button";
import Icon from "../../../components/AppIcon";
import supabase from "../../../utils/supabase";

const PatientRecordModal = ({ isOpen, onClose, patientData }) => {
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'protocols', 'results'
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showProtocolForm, setShowProtocolForm] = useState(false);
  const [protocols, setProtocols] = useState([]);
  
  // Локално състояние за нов протокол
  const [newProtocol, setNewProtocol] = useState({
    temperature: '',
    weight: '',
    anamnesis: '',
    clinical_signs: '',
    examination: '',
    diagnosis: '',
    treatment: '',
    medications: '',
    manipulations: '',
    notes: '',
    outcome: 'в процес на лечение'
  });

  if (!isOpen || !patientData) return null;

  const animalTypeLabels = {
    cat: 'котка', dog: 'куче'
  };

  // Функция за запис на нов протокол
  const handleSaveProtocol = async () => {
    const protocolToSave = {
      ...newProtocol,
      pet_id: patientData.pet_id,
      protocol_creation_date: new Date().toISOString().split('T')[0],
      protocol_number: protocols.length + 1
    };
    
    // Тук добавяш логиката за запис в Supabase (table: protocols)
    console.log("Saving protocol:", protocolToSave);
    setProtocols([...protocols, protocolToSave]);
    setShowProtocolForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 md:p-6">
      <div className="bg-background w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border">
        
        {/* Header - Инфо за пациента */}
        <div className="bg-primary/10 px-6 py-4 flex justify-between items-center border-b border-primary/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary rounded-full text-white">
              <Icon name={patientData.species === 'cat' ? 'Cat' : 'Dog'} size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight leading-none">
                {patientData.recordName || patientData.pet_name}
              </h2>
              <p className="text-sm text-muted-foreground">Пациент #{patientData.pet_id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X size={28} />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex bg-muted/50 p-1 gap-1 border-b">
          <TabBtn active={activeTab === 'info'} onClick={() => setActiveTab('info')} icon={<User size={18}/>} label="Картон" />
          <TabBtn active={activeTab === 'protocols'} onClick={() => setActiveTab('protocols')} icon={<FileText size={18}/>} label="Протоколи" />
          <TabBtn active={activeTab === 'results'} onClick={() => setActiveTab('results')} icon={<Activity size={18}/>} label="Изследвания" />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-custom">
          
          {/* TAB: INFO */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="space-y-4">
                <h3 className="text-lg font-bold border-b pb-2 flex items-center gap-2">
                   <Icon name="Dog" className="text-primary"/> Данни за пациента
                </h3>
                <InfoRow label="Вид" value={animalTypeLabels[patientData.species] || patientData.species} />
                <InfoRow label="Пол" value={patientData.gender} />
                <InfoRow label="Порода" value={patientData.breed || 'Няма информация'} />
                <InfoRow label="Тегло" value={`${patientData.weight} кг`} />
                <div className="flex flex-wrap gap-2 pt-2">
                   <span className="text-xs font-bold uppercase text-muted-foreground w-full">Заболявания:</span>
                   {patientData.pets_diseases?.map((d, i) => (
                     <span key={i} className="bg-destructive/10 text-destructive px-3 py-1 rounded-full text-sm font-medium border border-destructive/20 cursor-pointer hover:bg-destructive/20">
                       {d}
                     </span>
                   ))}
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-lg font-bold border-b pb-2 flex items-center gap-2">
                   <User className="text-primary"/> Собственик
                </h3>
                <InfoRow label="Име" value={patientData.ownerName || patientData.owner_name} />
                <InfoRow label="Телефон" value={patientData.ownerPhone} />
                <InfoRow label="Адрес" value={patientData.address || patientData.location_address} />
              </section>
            </div>
          )}

          {/* TAB: PROTOCOLS */}
          {activeTab === 'protocols' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">История на лечението</h3>
                <Button onClick={() => setShowProtocolForm(true)} iconName="Plus">Нов протокол</Button>
              </div>

              {showProtocolForm && (
                <div className="bg-muted/30 p-4 rounded-xl border-2 border-dashed border-primary/30 mb-6 space-y-4">
                  <h4 className="font-bold text-primary">Попълване на нов протокол</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="Температура" className="form-input" onChange={(e) => setNewProtocol({...newProtocol, temperature: e.target.value})} />
                    <input type="number" placeholder="Тегло" className="form-input" onChange={(e) => setNewProtocol({...newProtocol, weight: e.target.value})} />
                    <textarea placeholder="Анамнеза" className="col-span-2 form-input" rows="2" onChange={(e) => setNewProtocol({...newProtocol, anamnesis: e.target.value})} />
                    <textarea placeholder="Лечение" className="col-span-2 form-input" rows="2" onChange={(e) => setNewProtocol({...newProtocol, treatment: e.target.value})} />
                  </div>
                  <div className="col-span-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Изход от прегледа / Статус</label>
                  <select 
                    className="form-input w-full mt-1"
                    value={newProtocol.outcome}
                    onChange={(e) => setNewProtocol({...newProtocol, outcome: e.target.value})}
                  >
                    <option value="в процес на лечение">В процес на лечение</option>
                    <option value="клинично здрав / излекуван">Клинично здрав / Излекуван</option>
                    <option value="подобрение">Подобрение</option>
                    <option value="без промяна">Без промяна</option>
                    <option value="влошаване">Влошаване</option>
                    <option value="усложнение">Усложнение (виж бележки)</option>
                  </select>
                </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProtocol} variant="default">Запази</Button>
                    <Button onClick={() => setShowProtocolForm(false)} variant="outline">Отказ</Button>
                  </div>
                </div>
              )}

              {/* Списък с протоколи - акордеон */}
              <div className="space-y-2">
                {protocols.length === 0 && <p className="text-center text-muted-foreground py-10">Няма записани протоколи за този пациент.</p>}
                {protocols.map((p, idx) => (
                  <div key={idx} className="border rounded-lg overflow-hidden bg-card">
                    <button 
                      onClick={() => setSelectedProtocol(selectedProtocol === idx ? null : idx)}
                      className="w-full flex justify-between p-4 hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-bold">Протокол №{p.protocol_number} — {p.protocol_creation_date}</span>
                      {selectedProtocol === idx ? <ChevronUp /> : <ChevronDown />}
                    </button>
                    {selectedProtocol === idx && (
                      <div className="p-4 border-t bg-background space-y-2 text-sm">
                        <p><strong>Анамнеза:</strong> {p.anamnesis}</p>
                        <p><strong>Лечение:</strong> {p.treatment}</p>
                        {/* Показваме Outcome със специален стил, за да се набива на очи */}
                        <div className="mt-2 p-2 bg-primary/5 rounded border border-primary/10">
                          <p><strong>Изход/Статус:</strong> <span className="font-bold text-primary">{p.outcome || "Няма информация"}</span></p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: RESULTS */}
          {activeTab === 'results' && (
             <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Activity size={48} className="mb-4 opacity-20" />
                <p>Няма прикачени лабораторни резултати.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Помощни компоненти вътре във файла
const TabBtn = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold transition-all ${active ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:bg-background/50'}`}
  >
    {icon} {label}
  </button>
);

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between border-b border-muted py-2">
    <span className="text-muted-foreground">{label}:</span>
    <span className="font-semibold">{value || '—'}</span>
  </div>
);

export default PatientRecordModal;