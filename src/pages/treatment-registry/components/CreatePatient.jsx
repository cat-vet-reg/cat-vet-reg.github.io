import React, { useState, useEffect }  from 'react';
import { X, Save }          from 'lucide-react';
import { defaultFormData }  from "../../cat-registration-form/utils/formMapper";
import Button       from "../../../components/ui/Button"; 
import Icon         from "../../../components/AppIcon";
import supabase     from "../../../utils/supabase";
import { $apiCreateNewRecord  } from "../../../services/create_new_record";
import Select       from "../../../components/ui/Select";
import { Checkbox } from "../../../components/ui/Checkbox";
import {  genderOptions, 
          spicyOptions,
          bcsScores,
          getBcsDescription,
          ageUnitOptions, 
          colorOptions,
          habitat,
          origin,
          generalConditionOptions, 
          statusOptions,  
          complicationOptions,
          staffOptions,
          earStatusOptions,
          parasiteOptions,
          discoverySourceOptions,
          reproductiveOptions 
          } from "../../../constants/formOptions";
import { breedOptions } from '../../../constants/breed_options';
import { cityOptions          } from "../../../constants/city_options";

const CreatePatient = ({ isOpen, onClose, onSave }) => {

  const [errors               , setErrors               ] = useState({});
  
  // Използваме твоите ключове от defaultFormData
  const [formData, setFormData] = useState({
    ...defaultFormData,
    // Можем да добавим специфични инициализации тук
    status: 'treatment' 
  });

  const handleInputChange = (fieldOrEvent, value) => {
    // Проверяваме дали първият аргумент е събитие
    if (fieldOrEvent?.target) {
      const { name, value: val, type, checked } = fieldOrEvent.target;
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? (checked ? 'Y' : 'N') : val,
      }));
    } else {
      // Ако е ръчно извикване (напр. от бутоните за Пол или Вид)
      setFormData((prev) => ({
        ...prev,
        [fieldOrEvent]: value,
      }));
    }
    if (errors[fieldOrEvent]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldOrEvent];
        return newErrors;
      });
    }
  };

  const handleSave = async () => {
    if (!formData.recordName || formData.recordName.trim() === "") {
      alert("Моля, въведете име на пациента.");
      return;
    }

    try {
      // Създаваме копие на данните за изпращане
      const dataToSend = {
        ...formData,
        // Ако castratedAt е празен стринг, го превръщаме в null, 
        // за да не дава грешка в базата данни
        castratedAt: formData.castratedAt === "" ? null : formData.castratedAt,
        
        // Добра практика е да направим същото и за други числови/дата полета, ако са празни
        weight: formData.weight === "" ? null : formData.weight,
        ageValue: formData.ageValue === "" ? null : formData.ageValue
      };

      await $apiCreateNewRecord(dataToSend, false, null);

      alert("Пациентът е записан успешно!");
      onSave(formData); 
      onClose();
    } catch (error) {
      console.error("Грешка при запис чрез API:", error);
      alert(`Грешка при запис: ${error.message}`);
    }
  };

  useEffect(() => {
    // 1. Изчистваме интервалите, ако има такива
    const phoneToSearch = formData.ownerPhone?.trim();

    // 2. Търсим само ако имаме 6+ символа и модалът е отворен
    if (isOpen && phoneToSearch && phoneToSearch.length >= 6) {
      console.log("Търсене на собственик с телефон:", phoneToSearch); // За дебъгване в конзолата

      const timer = setTimeout(async () => {
        try {
          const { data, error } = await supabase
            .from('td_owners') 
            .select('name')
            .eq('phone', phoneToSearch)
            .maybeSingle();

          if (error) {
            console.error("Supabase грешка:", error);
            return;
          }

          if (data) {
            console.log("Намерен собственик:", data);
            setFormData(prev => ({
              ...prev,
              // Попълваме само ако потребителят още не е написал нещо различно
              ownerName: prev.ownerName === "" ? data.name : prev.ownerName,
              address: prev.address === "" ? (data.location_address || "") : prev.address
            }));
          }
        } catch (err) {
          console.error("Грешка при изпълнение на заявката:", err);
        }
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [formData.ownerPhone, isOpen]); // Добавяме isOpen като зависимост

  if (!isOpen) return null;

return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 md:p-4">
      <div className="bg-background w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-border flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="bg-muted/50 px-5 py-3 flex justify-between items-center border-b shrink-0">
          <h2 className="text-lg font-bold flex items-center gap-2 text-primary">
            <Icon name="PlusCircle" size={20} /> Нов пациент
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 md:p-6 space-y-6 overflow-y-auto">
          
          {/* Ред 1: Име и Вид */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[11px] uppercase font-bold opacity-60 ml-1">Име на животното</label>
              <input 
                name="recordName"
                placeholder="напр. Рижко"
                value={formData.recordName}
                onChange={handleInputChange}
                className="w-full h-10 px-3 rounded-xl border bg-card focus:ring-2 ring-primary/20 outline-none border-border text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase font-bold opacity-60 ml-1">Вид</label>
              <div className="flex gap-1 h-10">
                {['cat', 'dog'].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFormData(p => ({...p, species: s}))}
                    className={`flex-1 rounded-xl border flex items-center justify-center transition-all ${
                      formData.species === s 
                      ? 'bg-primary text-white border-primary shadow-sm' 
                      : 'bg-card hover:bg-muted border-border'
                    }`}
                  >
                    <Icon name={s === 'cat' ? 'Cat' : 'Dog'} size={18} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Ред 2: Пол, Тегло, Възраст, Маркировка */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase font-bold opacity-60 ml-1">Пол</label>
              <div className="flex gap-1 h-10">
                {['female', 'male'].map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFormData(p => ({...p, gender: g}))}
                    className={`flex-1 rounded-xl border flex items-center justify-center transition-all font-bold ${
                      formData.gender === g 
                      ? (g === 'female' ? 'bg-pink-500 border-pink-500 text-white shadow-sm' : 'bg-blue-500 border-blue-500 text-white shadow-sm') 
                      : 'bg-card border-border'
                    }`}
                  >
                    {g === 'female' ? '♀' : '♂'}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase font-bold opacity-60 ml-1">Тегло (кг)</label>
              <input 
                name="weight" type="number" step="0.1" value={formData.weight} onChange={handleInputChange} 
                className="w-full h-10 px-3 rounded-xl border bg-card outline-none border-border text-sm focus:ring-2 ring-primary/20" 
                placeholder="0.0" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase font-bold opacity-60 ml-1">Възраст</label>
              <div className="flex gap-1 h-10">
                  <input 
                    name="ageValue" type="number" value={formData.ageValue} onChange={handleInputChange} 
                    className="w-12 md:w-14 h-full px-2 rounded-xl border bg-card border-border text-sm outline-none" 
                    placeholder="0" />
                  <select 
                    name="ageUnit" value={formData.ageUnit} onChange={handleInputChange} 
                    className="flex-1 h-full px-1 rounded-xl border bg-card border-border text-[10px] md:text-[11px] font-medium outline-none"
                  >
                    <option value="months">Мес.</option>
                    <option value="years">Год.</option>
                  </select>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase font-bold opacity-60 ml-1 text-nowrap">Маркировка</label>
              <div 
                onClick={() => handleInputChange("earStatus", formData.earStatus === 'marked' ? '' : 'marked')}
                className={`flex items-center justify-center gap-2 h-10 px-2 rounded-xl border cursor-pointer transition-all ${
                  formData.earStatus === 'marked' ? 'bg-primary/10 border-primary text-primary shadow-inner' : 'bg-card border-border text-muted-foreground'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${formData.earStatus === 'marked' ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                   {formData.earStatus === 'marked' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <span className="text-[11px] font-bold uppercase text-nowrap">Рязано</span>
              </div>
            </div>
          </div>

          {/* Ред 3: Порода и Цвят */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase font-bold opacity-60 ml-1">Порода</label>
              <Select 
                name="breed" searchable options={breedOptions} value={formData.breed} 
                onChange={(val) => handleInputChange("breed", val)}
                className="w-full h-10 border-border shadow-none" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase font-bold opacity-60 ml-1">Цвят</label>
              <Select 
                name="color" options={colorOptions} value={formData.color} 
                onChange={(val) => handleInputChange("color", val)} 
                className="w-full h-10 border-border shadow-none" 
              />
            </div>
          </div>

          <div>
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase font-bold opacity-60 ml-1">Населено място (град/село)</label>
              <Select           
                name="recordCity" searchable placeholder="Търси град или село..."
                options={cityOptions} value={formData.recordCity}
                onChange={(val) => handleInputChange("recordCity", val)}
                className="w-full h-10 border-border"
              />
            </div>
          </div>

          {/* Секция Собственик и Локация */}
          <div className="pt-4 border-t border-border mt-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase font-bold opacity-60 ml-1">Телефон на собственик</label>
                <input 
                  name="ownerPhone" value={formData.ownerPhone} onChange={handleInputChange} 
                  className="w-full h-10 px-3 rounded-xl border bg-card font-mono text-sm border-border outline-none focus:ring-2 ring-primary/20" 
                  placeholder="0888..." />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase font-bold opacity-60 ml-1">Име на собственик</label>
                <input 
                  name="ownerName" value={formData.ownerName} onChange={handleInputChange} 
                  className="w-full h-10 px-3 rounded-xl border bg-card text-sm border-border outline-none focus:ring-2 ring-primary/20" 
                  placeholder="Имена..." />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 md:p-5 border-t bg-muted/30 flex flex-col md:flex-row justify-end items-center gap-3 shrink-0">
          <button 
            type="button" onClick={onClose} 
            className="w-full md:w-auto order-2 md:order-1 text-sm font-bold text-muted-foreground hover:text-foreground py-2 px-4 transition-colors"
          >
            ОТКАЗ
          </button>
          <button 
            onClick={handleSave} 
            className="w-full md:w-auto order-1 md:order-2 bg-primary text-white px-8 h-12 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            <Icon name="Save" size={20} /> ЗАПАЗИ
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePatient;