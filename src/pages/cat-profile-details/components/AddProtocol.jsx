import React, { useState, useEffect } from 'react';
import { X, Save, Thermometer, Weight, ClipboardList, Activity, Link as LinkIcon } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import supabase from '../../../utils/supabase';

const AddProtocol = ({ isOpen, onClose, petId, onSave, protocolToEdit = null, lastProtocolNumber = 0 }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Инициализираме празно състояние
  const initialFormState = {
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
    manipulations: '',
    notes: '',
    photo_link: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // Синхронизация при отваряне
  useEffect(() => {
    if (isOpen) {
      if (protocolToEdit) {
        setFormData({
          ...protocolToEdit,
          clinical_signs: protocolToEdit.clinical_signs?.join(', ') || '',
          medications: protocolToEdit.medications?.join(', ') || '',
          manipulations: protocolToEdit.manipulations?.join(', ') || '',
          photo_link: Array.isArray(protocolToEdit.photo_link) ? protocolToEdit.photo_link.join(', ') : protocolToEdit.photo_link || ''
        });
      } else {
        setFormData({
          ...initialFormState,
          protocol_number: Number(lastProtocolNumber) + 1
        });
      }
    }
  }, [isOpen, protocolToEdit, lastProtocolNumber]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const protocolData = {
        protocol_number: parseInt(formData.protocol_number),
        protocol_creation_date: formData.protocol_creation_date,
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        anamnesis: formData.anamnesis,
        examination: formData.examination,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        medications: formData.medications ? formData.medications.split(',').map(m => m.trim()).filter(m => m !== "") : [],
        clinical_signs: formData.clinical_signs ? formData.clinical_signs.split(',').map(s => s.trim()).filter(s => s !== "") : [],
        manipulations: formData.manipulations ? formData.manipulations.split(',').map(m => m.trim()).filter(m => m !== "") : [],
        photo_link: formData.photo_link ? formData.photo_link.split(',').map(l => l.trim()).filter(l => l !== "") : [],
        notes: formData.notes
      };

      let result;

      if (protocolToEdit && protocolToEdit.db_id) {
        result = await supabase
          .from('td_protocols')
          .update({ data: protocolData })
          .eq('id', protocolToEdit.db_id)
          .select();
      } else {
        result = await supabase
          .from('td_protocols')
          .insert([{ record_id: petId, data: protocolData }])
          .select();
      }

      if (result.error) throw result.error;

      const savedRecord = result.data[0];
      const updatedDataForUI = { ...savedRecord.data, db_id: savedRecord.id };
      
      onSave(updatedDataForUI); 
      onClose();

    } catch (err) {
      console.error("Грешка при запис:", err);
      alert("Грешка: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-border">
        {/* Header */}
        <div className="sticky top-0 bg-card z-10 px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-foreground">
            <Activity className="text-primary" /> 
            {protocolToEdit ? `Редакция на Протокол №${formData.protocol_number}` : `Нов Протокол №${formData.protocol_number}`}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Секция: Основни показатели */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block text-foreground">Дата</label>
              <input 
                type="date" 
                name="protocol_creation_date" 
                value={formData.protocol_creation_date ?? ''} 
                onChange={handleChange} 
                className="w-full p-2.5 rounded-lg border bg-background text-foreground" 
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block flex items-center gap-1 text-foreground"><Thermometer size={14}/> Температура (°C)</label>
              <input 
                type="number" 
                step="0.1" 
                name="temperature" 
                value={formData.temperature ?? ''} 
                onChange={handleChange} 
                placeholder="38.5" 
                className="w-full p-2.5 rounded-lg border bg-background text-foreground" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block flex items-center gap-1 text-foreground"><Weight size={14}/> Тегло (кг)</label>
              <input 
                type="number" 
                step="0.01" 
                name="weight" 
                value={formData.weight ?? ''} 
                onChange={handleChange} 
                placeholder="4.2" 
                className="w-full p-2.5 rounded-lg border bg-background text-foreground" />
            </div>
          </div>

          <hr className="border-border" />

          {/* Секция: Клинична картина */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block text-destructive">Анамнеза *</label>
                <textarea name="anamnesis" 
                  value={formData.anamnesis ?? ''} 
                  onChange={handleChange} 
                  rows="4" 
                  className="w-full p-2.5 rounded-lg border bg-background text-foreground resize-none" 
                  placeholder="История на заболяването..."
                  required
                ></textarea>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block font-bold text-foreground">Клинични признаци</label>
                <input 
                  type="text" 
                  name="clinical_signs" 
                  value={formData.clinical_signs ?? ''} 
                  onChange={handleChange} 
                  className="w-full p-2.5 rounded-lg border bg-background text-foreground font-semibold" 
                  placeholder="Отделени със запетая..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block text-foreground">Изследвания</label>
                <textarea name="examination" 
                  value={formData.examination ?? ''} 
                  onChange={handleChange} 
                  rows="4" 
                  className="w-full p-2.5 rounded-lg border bg-background text-foreground resize-none" 
                  placeholder="Резултати (напр. лигавици, ПКК, Ширмер тест)..."
                ></textarea>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block font-bold text-destructive">Диагноза *</label>
                <input 
                  type="text" 
                  name="diagnosis" 
                  value={formData.diagnosis ?? ''} 
                  onChange={handleChange} 
                  className="w-full p-2.5 rounded-lg border bg-background text-foreground font-semibold" 
                  placeholder="Основна диагноза..." 
                  required 
                />
              </div>
            </div>
          </div>

          {/* Секция: Лечение */}
          <div className="bg-primary/5 p-4 rounded-xl space-y-4 border border-primary/10">
            <h3 className="font-bold flex items-center gap-2 text-primary"><ClipboardList size={18}/> Назначено лечение</h3>
            <div>
              <label className="text-sm font-medium mb-1.5 block text-foreground">Лечение (описание)</label>
              <textarea name="treatment" 
                value={formData.treatment ?? ''} 
                onChange={handleChange} 
                rows="3" 
                className="w-full p-2.5 rounded-lg border bg-background text-foreground" 
                placeholder="Схема на прилагане..."
              ></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block text-foreground">Медикаменти (със запетая)</label>
                <textarea name="medications" 
                  value={formData.medications ?? ''} 
                  onChange={handleChange} 
                  rows="3" 
                  className="w-full p-2.5 rounded-lg border bg-background text-foreground" 
                  placeholder="Аркол, Цикло..."
                ></textarea>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block text-foreground">Манипулации (със запетая)</label>
                <textarea name="manipulations" 
                  value={formData.manipulations ?? ''} 
                  onChange={handleChange} 
                  rows="3" className="w-full p-2.5 rounded-lg border bg-background text-foreground" 
                  placeholder="напр. катетеризация..."
                ></textarea>
              </div>
            </div>
          </div>

          {/* Секция: Снимки и Бележки */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="text-sm font-medium mb-1.5 block text-foreground">Бележки</label>
                <textarea
                  name="notes" 
                  value={formData.notes ?? ''} 
                  onChange={handleChange} 
                  rows="2" 
                  className="w-full p-2.5 rounded-lg border bg-background text-foreground" 
                  placeholder="Допълнителна информация..."
                ></textarea>
             </div>
             <div>
                <label className="text-sm font-medium mb-1.5 block flex items-center gap-2 text-foreground">
                  <LinkIcon size={14}/> Линк към снимки (Drive)
                </label>
                <input 
                  type="url" 
                  name="photo_link" 
                  value={formData.photo_link ?? ''} 
                  onChange={handleChange} 
                  className="w-full p-2.5 rounded-lg border bg-background text-blue-600 underline" 
                  placeholder="https://drive.google.com/..." 
                />
             </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>Отказ</Button>
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