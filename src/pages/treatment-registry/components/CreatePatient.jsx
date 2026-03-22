import React, { useState }  from 'react';
import { X, Save }          from 'lucide-react';
import { defaultFormData }  from "../../cat-registration-form/utils/formMapper";
import Button       from "../../../components/ui/Button"; 
import Icon         from "../../../components/AppIcon";
import supabase     from "../../../utils/supabase";

const CreatePatient = ({ isOpen, onClose, onSave }) => {
  // Използваме твоите ключове от defaultFormData
  const [formData, setFormData] = useState({
    ...defaultFormData,
    // Можем да добавим специфични инициализации тук
    status: 'recorded' 
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 'Y' : 'N') : value
    }));
  };

// ОТКОМЕНТИРАЙ КОГАТО ИМА НОВА СТРУКТУРА В СУПАБЕЙС
  //   import { mapFormToRecord } from "../../cat-registration-form/utils/formMapper";

// const handleSave = async () => {
//   try {
//     // ЕДИН РЕД КОД ПРАВИ ВСИЧКО:
//     const recordToSave = mapFormToRecord({ ...formData, status: 'recorded' });

//     const { data, error } = await supabase
//       .from('td_records')
//       .insert([recordToSave])
//       .select();

//     if (error) throw error;
//     onSave(data[0]);
//     onClose();
//   } catch (error) {
//     console.error(error);
//   }
// };
  const handleSave = async () => {
    try {
      // 1. Подготвяме обекта за Supabase спрямо твоите изисквания
      const recordToSave = {
        name: formData.recordName,
        species: formData.species,
        gender: formData.gender,
        weight: formData.weight,
        owner_name: formData.ownerName,
        owner_phone: formData.ownerPhone,
        location_address: formData.address,
        status: 'recorded',
        created_at: new Date().toISOString(),
        // Тук добавяш и останалите полета, които са важни за базата
      };

      const { data, error } = await supabase
        .from('records') // Увери се, че това е името на таблицата ти
        .insert([recordToSave])
        .select();

      if (error) throw error;

      onSave(data[0]);
      onClose();
    } catch (error) {
      console.error("Грешка при запис:", error.message);
      alert("Възникна грешка при създаването на пациента.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border">
        
        {/* Header */}
        <div className="bg-muted px-6 py-4 flex justify-between items-center border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Icon name="Plus" className="text-primary" /> Нов пациент за лечение
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={24} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto scrollbar-custom">
          
          <div className="space-y-1">
            <label className="text-sm font-semibold">Име на животното</label>
            <input 
              name="recordName"
              value={formData.recordName}
              onChange={handleChange}
              className="w-full p-2 rounded-md border bg-card focus:ring-2 ring-primary outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold">Вид</label>
            <select 
              name="species"
              value={formData.species}
              onChange={handleChange}
              className="w-full p-2 rounded-md border bg-card outline-none"
            >
              <option value="cat">Котка</option>
              <option value="dog">Куче</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold">Пол</label>
            <select 
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full p-2 rounded-md border bg-card outline-none"
            >
              <option value="female">Женски</option>
              <option value="male">Мъжки</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold">Тегло (кг)</label>
            <input 
              name="weight"
              type="number"
              value={formData.weight}
              onChange={handleChange}
              className="w-full p-2 rounded-md border bg-card outline-none"
            />
          </div>

          <div className="md:col-span-2 border-t pt-4 mt-2">
            <h3 className="text-sm font-bold text-primary mb-3">Информация за собственика</h3>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold">Име на собственик</label>
            <input 
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              className="w-full p-2 rounded-md border bg-card outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold">Телефон</label>
            <input 
              name="ownerPhone"
              value={formData.ownerPhone}
              onChange={handleChange}
              className="w-full p-2 rounded-md border bg-card outline-none"
            />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-sm font-semibold">Адрес</label>
            <input 
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2 rounded-md border bg-card outline-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t bg-muted/30 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Отказ</Button>
          <Button variant="default" onClick={handleSave} iconName="Save">
            Запази пациента
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreatePatient;