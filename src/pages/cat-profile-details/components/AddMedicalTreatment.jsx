import React, { useState, useEffect } from 'react';
import supabase from '../../../utils/supabase';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AddMedicalTreatment = ({ isOpen, onClose, petId, type, category, onSave, treatmentToEdit }) => {
  const [formData, setFormData] = useState({
    product_name: '',
    batch_number: '',
    administered_at: new Date().toISOString().split('T')[0],
    next_due_date: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  // Логика за проверка дали ваксината е против бяс
  const isRabiesVaccine = type === 'vaccine' && 
    (formData.product_name.toLowerCase().includes('бяс') || 
     formData.product_name.toLowerCase().includes('rabies'));

  useEffect(() => {
    if (isOpen) {
      if (treatmentToEdit) {
        // Ако редактираме, попълваме формата със съществуващите данни
        setFormData({
          product_name: treatmentToEdit.product_name || '',
          batch_number: treatmentToEdit.batch_number || '',
          administered_at: treatmentToEdit.administered_at || '',
          next_due_date: treatmentToEdit.next_due_date || '',
          notes: treatmentToEdit.notes || ''
        });
      } else {
        // Ако е нов запис, зануляваме
        setFormData({
          product_name: '',
          batch_number: '',
          administered_at: new Date().toISOString().split('T')[0],
          next_due_date: '',
          notes: ''
        });
      }
    }
  }, [isOpen, treatmentToEdit]);

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        animal_id: petId,
        type: type,
        category: category,
        product_name: formData.product_name,
        batch_number: formData.batch_number,
        administered_at: formData.administered_at,
        next_due_date: formData.next_due_date || null,
        notes: formData.notes,
      };

      let result;
      if (treatmentToEdit) {
        // РЕДАКЦИЯ
        result = await supabase
          .from('td_medical_treatments')
          .update(payload)
          .eq('id', treatmentToEdit.id)
          .select()
          .single();
      } else {
        // НОВ ЗАПИС
        const { data: userData } = await supabase.auth.getUser();
        payload.created_by = userData?.user?.id;
        
        result = await supabase
          .from('td_medical_treatments')
          .insert([payload])
          .select()
          .single();
      }

      if (result.error) throw result.error;
      
      onSave(result.data);
      onClose();
    } catch (err) {
      console.error("Грешка:", err.message);
      alert("Възникна грешка при записа.");
    } finally {
      setLoading(false);
    }
  };

  // Променяме заглавието динамично
  const modeTitle = treatmentToEdit ? 'Редактиране на' : 'Нова';
  const typeTitle = type === 'vaccine' ? 'Ваксинация' : 'Обезпаразитяване';

  if (!isOpen) return null;

  const title = type === 'vaccine' ? 'Нова Ваксинация' : 
                category === 'external' ? 'Външно обезпаразитяване' : 'Вътрешно обезпаразитяване';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Icon name={type === 'vaccine' ? 'ShieldCheck' : 'Bug'} size={18} className="text-primary" />
            {modeTitle} {typeTitle}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <Icon name="X" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Продукт */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Продукт / Марка</label>
            <input 
              required
              className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2 ring-primary/20"
              value={formData.product_name}
              onChange={e => setFormData({...formData, product_name: e.target.value})}
              placeholder={type === 'vaccine' ? "напр. Nobivac Tricat" : "напр. NexGard Combo"}
            />
          </div>


          {/* Ново поле: Партиден номер (Batch Number) */}
          {type === 'vaccine' && (
            <div className="animate-in slide-in-from-top-2 duration-200">
              <label className={`block text-[10px] font-bold uppercase mb-1 ${isRabiesVaccine ? 'text-destructive' : 'text-slate-500'}`}>
                Партиден номер {isRabiesVaccine && <span className="text-red-500">* (Задължително)</span>}
              </label>
              <input 
                className={`w-full border rounded-lg p-2 text-sm outline-none focus:ring-2 ${isRabiesVaccine ? 'border-red-300 ring-red-100 bg-red-50/20' : 'ring-primary/20'}`}
                value={formData.batch_number}
                onChange={e => setFormData({...formData, batch_number: e.target.value})}
                placeholder="напр. B123456"
                required={isRabiesVaccine}
              />
            </div>
          )}

          {/* Дата */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Дата на поставяне</label>
              <input 
                type="date"
                required
                className="w-full border rounded-lg p-2 text-sm"
                value={formData.administered_at}
                onChange={e => setFormData({...formData, administered_at: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 text-amber-600">Следваща дата</label>
              <input 
                type="date"
                className="w-full border border-amber-200 bg-amber-50/30 rounded-lg p-2 text-sm"
                value={formData.next_due_date}
                onChange={e => setFormData({...formData, next_due_date: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Бележки</label>
            <textarea 
              className="w-full border rounded-lg p-2 text-sm h-20 resize-none"
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <div className="pt-2 flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={onClose} type="button">Отказ</Button>
            <Button variant="default" className="flex-1" type="submit" disabled={loading}>
              {loading ? 'Запис...' : 'Запази'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMedicalTreatment;