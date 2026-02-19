import React, { useState } from 'react';
import { X, Save, Thermometer, Weight, ClipboardList, Activity } from 'lucide-react';
import Button from '../../../components/ui/Button';
import supabase from '../../../utils/supabase';

const AddProtocol = ({ isOpen, onClose, petId, onSave, lastProtocolNumber = 0 }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    protocol_number: lastProtocolNumber + 1,
    protocol_creation_date: new Date().toISOString().split('T')[0],
    temperature: '',
    weight: '',
    anamnesis: '',
    clinical_signs: '',
    examination: '',
    diagnosis: '',
    treatment: '',
    medications: '',
    notes: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Подготвяме JSON обекта според твоята структура
      const protocolData = {
        protocol_number: formData.protocol_number,
        protocol_creation_date: formData.protocol_creation_date,
        pet_id: petId,
        temperature: parseFloat(formData.temperature),
        weight: parseFloat(formData.weight),
        anamnesis: formData.anamnesis,
        examination: formData.examination,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        medications: formData.medications.split(',').map(m => m.trim()).filter(m => m !== ""),
        clinical_signs: formData.clinical_signs ? formData.clinical_signs.split(',') : [],
        manipulations: [],
        differential_diagnosis: "",
        notes: formData.notes
      };

      const { data, error } = await supabase
        .from('td_protocols') // Използваме точното име на таблицата
        .insert([
          { 
            record_id: petId, // Връзката към животното
            data: protocolData // Всичко отива в JSON колоната
          }
        ])
        .select();

      if (error) throw error;

      // Подаваме нагоре чистите данни от обекта data
      onSave(data[0].data); 
      onClose();
    } catch (err) {
      alert("Грешка: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-border">
        {/* Header */}
        <div className="sticky top-0 bg-card z-10 px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="text-primary" /> Нов Медицински Протокол №{formData.protocol_number}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Секция: Основни показатели */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Дата</label>
              <input type="date" name="protocol_creation_date" value={formData.protocol_creation_date} onChange={handleChange} className="w-full p-2.5 rounded-lg border bg-background" required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block flex items-center gap-1"><Thermometer size={14}/> Температура (°C)</label>
              <input type="number" step="0.1" name="temperature" value={formData.temperature} onChange={handleChange} placeholder="38.5" className="w-full p-2.5 rounded-lg border bg-background" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block flex items-center gap-1"><Weight size={14}/> Тегло (кг)</label>
              <input type="number" step="0.01" name="weight" value={formData.weight} onChange={handleChange} placeholder="4.2" className="w-full p-2.5 rounded-lg border bg-background" />
            </div>
          </div>

          <hr className="border-border" />

          {/* Секция: Клинична картина */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Анамнеза</label>
                <textarea name="anamnesis" value={formData.anamnesis} onChange={handleChange} rows="4" className="w-full p-2.5 rounded-lg border bg-background resize-none" placeholder="История на заболяването..."></textarea>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block font-bold">Клинични признаци</label>
                <input type="text" name="clinical_signs" value={formData.clinical_signs} onChange={handleChange} className="w-full p-2.5 rounded-lg border bg-background font-semibold" placeholder="Отделени със запетая..." required />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Изследвания</label>
                <textarea name="examination" value={formData.examination} onChange={handleChange} rows="4" className="w-full p-2.5 rounded-lg border bg-background resize-none" placeholder="Резултати (напр. лигавици, ПКК, Ширмер тест)..."></textarea>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block font-bold text-destructive">Диагноза</label>
                <input type="text" name="diagnosis" value={formData.diagnosis} onChange={handleChange} className="w-full p-2.5 rounded-lg border bg-background font-semibold" placeholder="Основна диагноза..." />
              </div>
            </div>
          </div>

          {/* Секция: Лечение */}
          <div className="bg-primary/5 p-4 rounded-xl space-y-4 border border-primary/10">
            <h3 className="font-bold flex items-center gap-2 text-primary"><ClipboardList size={18}/> Назначено лечение</h3>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Лечение (описание)</label>
              <textarea name="treatment" value={formData.treatment} onChange={handleChange} rows="3" className="w-full p-2.5 rounded-lg border bg-background" placeholder="Схема на прилагане..."></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Медикаменти (разделени със запетая)</label>
                <textarea name="medications" value={formData.medications} onChange={handleChange} rows="3" className="w-full p-2.5 rounded-lg border bg-background" placeholder="Аркол, Цикло, Диферион..."></textarea>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Манипулации (разделени със запетая)</label>
                <textarea name="manipulations" value={formData.manipulations} onChange={handleChange} rows="3" className="w-full p-2.5 rounded-lg border bg-background" placeholder="напр. катетеризация, тарзорафия..."></textarea>
              </div>
            </div>

          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="ghost" type="button" onClick={onClose}>Отказ</Button>
            <Button variant="default" type="submit" iconName="Save" disabled={isSubmitting}>
              {isSubmitting ? "Записване..." : "Запази Протокол"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProtocol;