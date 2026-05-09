import React, { useState, useEffect } from 'react';
import Autocomplete from "react-google-autocomplete";
import { findDistrict } from '../../../constants/zona_find';
import supabase from '../../../utils/supabase';
import { Trash2, CalendarCheck, Dog, Cat } from "lucide-react";
import WaitingStats from './WaitingStats';

const WaitingList = ({ onSelectToSchedule, onStartEdit }) => {
  const [waitingList, setWaitingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapUrl, setMapUrl] = useState(null);
  const [autocompleteKey, setAutocompleteKey] = useState(0);
  const [animalsToAdd, setAnimalsToAdd] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [filterType, setFilterType] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  const [filterZone, setFilterZone] = useState("all");

  const [currentAnimal, setCurrentAnimal] = useState({
    animal_type: "cat",
    gender: "female",
    count: 1
  });

  const [newEntry, setNewEntry] = useState({
    owner_name: "",
    phone: "",
    address: "",
    lat: null,
    lng: null,
    zona_number: null,
    animal_type: "cat",
    gender: "female",
    status: "waiting",
    notes: ""
  });

  // 1. Зареждане на API Ключа - ЕДНОКРАТНО
  useEffect(() => {
    fetch(`https://mihail-petrov.me/apimap/index.php`)
      .then(res => res.json())
      .then(data => setMapUrl(data.mapUrl))
      .catch(() => setMapUrl("AIzaSyCSyjPTq09LYc7lcBxotOnv-KBTiEfNbOI")); // Fallback
  }, []); // Важно: празен масив!

  // 2. Зареждане на списъка от Supabase
  const fetchWaitingList = async () => {
    setLoading(true);
    const { data, error } = await supabase
    .from("td_waiting_list")
    .select("*"); // Взимаме само каквото има, без филтри и сортиране

    if (error) {
      console.error("Грешка:", error.message);
    } else {
      // console.log("Данни от таблицата:", data);
      setWaitingList(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWaitingList();
  }, []);

  // Автоматично търсене на име по телефон
  useEffect(() => {
    const findOwnerName = async () => {
      // Търсим само ако телефонът е поне 6 цифри (за да не правим излишни заявки)
      const phone = newEntry.phone.trim();
      if (phone.length >= 6) {
        const { data, error } = await supabase
          .from('td_owners')
          .select('name')
          .eq('phone', phone)
          .maybeSingle(); // maybeSingle не хвърля грешка, ако няма резултат

        if (data && data.name && !newEntry.owner_name) {
          setNewEntry(prev => ({ ...prev, owner_name: data.name }));
        }
      }
    };

    // Използваме леко забавяне (debounce), за да не стреляме заявка при всяка цифра
    const timer = setTimeout(() => {
      findOwnerName();
    }, 500);

    return () => clearTimeout(timer);
  }, [newEntry.phone]);

  const addAnimalToLocalList = () => {
    setAnimalsToAdd(prev => [...prev, { ...currentAnimal, id: Date.now() }]);
    // Рестартираме избора за следващото животно
    setCurrentAnimal({ animal_type: "cat", gender: "female", count: 1 });
  };

  const removeAnimalFromLocalList = (id) => {
    setAnimalsToAdd(prev => prev.filter(a => a.id !== id));
  };

  // 3. Добавяне на нов запис
  const handleSave = async () => {
    // 1. Проверка за име
    if (!newEntry.owner_name) {
      alert("Моля, въведете име на собственика!");
      return;
    }

    // 2. Проверка за телефон
    if (newEntry.phone.length < 10) {
      alert("Телефонният номер трябва да е точно 10 цифри!");
      return;
    }

    // Подготвяме зоната - ако е празна, става null, ако не - цяло число
    const zonaValue = newEntry.zona_number ? parseInt(newEntry.zona_number) : null;

    if (editingId) {
      // ЛОГИКА ЗА РЕДАКЦИЯ
      const { error } = await supabase
        .from("td_waiting_list")
        .update({
          owner_name   : newEntry.owner_name,
          phone        : newEntry.phone,
          address      : newEntry.address,
          lat          : newEntry.lat,
          lng          : newEntry.lng,
          zona_number  : zonaValue, // Използваме обработената стойност
          animal_type  : currentAnimal.animal_type,
          gender       : currentAnimal.gender,
          notes        : newEntry.notes
        })
        .eq("id", editingId);

      if (error) {
        alert("Грешка при обновяване: " + error.message);
      } else {
        setEditingId(null);
        resetForm();
        alert("Записът е обновен успешно!");
      }
    } else {
      // ЛОГИКА ЗА НОВ ЗАПИС
      if (animalsToAdd.length === 0) {
        alert("Добавете поне едно животно!");
        return;
      }

      const recordsToInsert = [];
      animalsToAdd.forEach(group => {
        for (let i = 0; i < group.count; i++) {
          recordsToInsert.push({
            owner_name: newEntry.owner_name,
            phone: newEntry.phone,
            address: newEntry.address,
            lat: newEntry.lat,
            lng: newEntry.lng,
            zona_number: zonaValue, // Използваме обработената стойност (null или число)
            animal_type: group.animal_type,
            gender: group.gender,
            notes: newEntry.notes,
            status: "waiting"
          });
        }
      });

      const { error } = await supabase.from("td_waiting_list").insert(recordsToInsert);
      if (error) alert("Грешка при запис: " + error.message);
      else resetForm();
    }
  };

  const resetForm = () => {
    setNewEntry({ owner_name: "", phone: "", address: "", lat: null, lng: null, zona_number: null, notes: "" });
    setAnimalsToAdd([]);
    setAutocompleteKey(prev => prev + 1);
    fetchWaitingList();
  };

  // 4. Функция за стартиране на редакция
  const startEdit = (item) => {
    setEditingId(item.id);
    setNewEntry({
      owner_name: item.owner_name,
      phone: item.phone,
      address: item.address,
      lat: item.lat,
      lng: item.lng,
      zona_number: item.zona_number,
      notes: item.notes || ""
    });

    // Пълним данните за конкретното животно в селекторите
    setCurrentAnimal({
      animal_type: item.animal_type,
      gender: item.gender,
      count: 1 // При редакция на ред, редактираме 1 бройка
    });
    // Извиквам ФУНКЦИЯТА ЗА СКРОЛВАНЕ тук
    if (onStartEdit) {
      onStartEdit();
    }
  };

  // 5. Изтриване на запис
  const handleDelete = async (id) => {
    if (!window.confirm("Изтриване на чакащия?")) return;
    const { error } = await supabase.from("td_waiting_list").delete().eq("id", id);
    if (!error) fetchWaitingList();
  };

  // Създаваме филтрирания списък
  const filteredList = waitingList.filter(item => {
    const matchesType = filterType === 'all' || item.animal_type === filterType;
    
    // Добавяме това:
    const matchesGender = filterGender === 'all' || item.gender === filterGender;
    
    const itemZone = item.zona_number === null ? "null" : String(item.zona_number);
    const matchesZone = filterZone === 'all' || itemZone === filterZone;

    return matchesType && matchesZone && matchesGender; // Включваме го тук
  });

  // Уникални зони за падащото меню
  const uniqueZones = [...new Set(waitingList.map(item => item.zona_number))].filter(Boolean).sort((a, b) => a - b);

  return (
    <div className="p-5 bg-slate-50 border-b border-slate-200">
      <h3 className="text-lg font-bold text-slate-700 mb-4">Добавяне в списък на чакащи</h3>
      
      <div className="flex flex-col gap-5">
        {/* ПЪРВИ РЕД: Лични данни и Адрес */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            className={`h-10 rounded-md border px-3 py-2 text-sm transition-colors ${
              newEntry.owner_name ? 'border-red-300 text-red-900 shadow-[0_0_10px_rgba(230,64,114,0.2)]' : 'border-input'
            }`}
            placeholder="Име и Фамилия"
            value={newEntry.owner_name}
            onChange={(e) => setNewEntry({ ...newEntry, owner_name: e.target.value })}
          />
          <div className="flex flex-col gap-1">
            <input
              className={`h-10 rounded-md border px-3 py-2 text-sm transition-all ${
                newEntry.phone.length > 0 && newEntry.phone.length < 10 
                ? 'border-orange-400 bg-orange-50 shadow-[0_0_8px_rgba(251,146,60,0.1)]' 
                : 'border-input bg-white'
              }`}
              placeholder="Телефон (10 цифри)"
              value={newEntry.phone}
              maxLength={10} // Ограничаваме до 10 символа макс
              onChange={(e) => {
                // Позволяваме само въвеждане на цифри
                const value = e.target.value.replace(/\D/g, ""); 
                setNewEntry({ ...newEntry, phone: value });
              }}
            />
            {newEntry.phone.length > 0 && newEntry.phone.length < 10 && (
              <span className="text-[9px] text-orange-600 font-bold italic ml-1">
                * Трябват още {10 - newEntry.phone.length} цифри
              </span>
            )}
          </div>
          {/* Адресът заема 2 колони място, за да е дълъг */}
          <div className="md:col-span-2">
            {mapUrl && (
              <Autocomplete
                key={autocompleteKey}
                apiKey={mapUrl}
                onPlaceSelected={(place) => {
                  if (!place.geometry) return;
                  const lat = place.geometry.location.lat();
                  const lng = place.geometry.location.lng();
                  const zone = findDistrict(lat, lng);
                  setNewEntry({
                    ...newEntry,
                    address: place.formatted_address,
                    lat, lng,
                    zona_number: zone
                  });
                }}
                options={{ componentRestrictions: { country: "bg" }, types: ["geocode"] }}
                className="h-10 w-full rounded-md border border-input px-3 py-2 text-sm bg-white"
                placeholder="Въведете адрес (изберете от списъка)..."
              />
            )}
          </div>
          {/* Полето за Зона */}
          <div className={`h-10 flex items-center px-3 rounded-md text-sm font-bold transition-colors ${
            newEntry.zona_number 
            ? "bg-blue-100 text-blue-700" 
            : "bg-slate-200 text-slate-500"
          }`}>
            {newEntry.zona_number ? `Зона: ${newEntry.zona_number}` : "Извън Пловдив / Без зона"}
          </div>

          {/* НОВОТО ПОЛЕ ЗА БЕЛЕЖКИ */}
          <input
            className="h-10 md:col-span-1 rounded-md border border-input px-3 py-2 text-sm bg-white"
            placeholder="Бележки (напр. агресивно)"
            value={newEntry.notes}
            onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
          />
        </div>

        {/* ВТОРИ РЕД: Животно и Бутон */}
        <div className="bg-slate-200/50 p-3 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Вид</label>
            <select 
              className="h-9 w-full rounded-md border border-input px-3 text-sm bg-white"
              value={currentAnimal.animal_type}
              onChange={(e) => setCurrentAnimal({...currentAnimal, animal_type: e.target.value})}
            >
              <option value="cat">Котка</option>
              <option value="dog">Куче</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Пол</label>
            <select 
              className="h-9 w-full rounded-md border border-input px-3 text-sm bg-white"
              value={currentAnimal.gender}
              onChange={(e) => setCurrentAnimal({...currentAnimal, gender: e.target.value})}
            >
              <option value="female">Женски</option>
              <option value="male">Мъжки</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Брой</label>
            <input 
              type="number" min="1"
              className="h-9 w-full rounded-md border border-input px-3 text-sm bg-white"
              value={currentAnimal.count}
              onChange={(e) => setCurrentAnimal({...currentAnimal, count: parseInt(e.target.value) || 1})}
            />
          </div>
          {/* Смени оригиналния бутон с това: */}
          {editingId ? (
            <div className="h-9 flex items-center justify-center bg-amber-100 text-amber-700 rounded-md text-xs font-bold border border-amber-200">
              Режим на редакция
            </div>
          ) : (
            <button 
              onClick={addAnimalToLocalList}
              className="h-9 bg-slate-600 text-white rounded-md text-sm font-bold hover:bg-slate-700 transition-all"
            >
              + Добави животно
            </button>
          )}
        </div>

        {/* МАЛЪК СПИСЪК С ДОБАВЕНИТЕ ЖИВОТНИ */}
        {animalsToAdd.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {animalsToAdd.map(a => (
              <div key={a.id} className="bg-white border border-pink-200 px-3 py-1 rounded-full flex items-center gap-2 text-xs">
                <span className="font-bold text-pink-600">{a.count}</span>
                <span>{a.animal_type === 'cat' ? 'Котки' : 'Кучета'} ({a.gender === 'female' ? 'ж' : 'м'})</span>
                <button onClick={() => removeAnimalFromLocalList(a.id)} className="text-slate-400 hover:text-red-500 ml-1">×</button>
              </div>
            ))}
          </div>
        )}

        {/* ГЛАВЕН БУТОН ЗА ЗАПИС В БАЗАТА */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSave}
            className={`h-12 flex-1 rounded-md font-bold text-white transition-all shadow-md ${
              editingId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-pink-600 hover:bg-pink-700'
            }`}
          >
            {editingId ? "✅ Запази промените" : `Запиши всички в чакащи`}
          </button>

          {editingId && (
            <button
              onClick={() => { setEditingId(null); resetForm(); }}
              className="h-12 px-6 bg-slate-300 text-slate-700 rounded-md font-bold hover:bg-slate-400"
            >
              Отказ
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Филтър:</span>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs font-bold border-none bg-slate-100 rounded-lg p-2 focus:ring-0"
          >
            <option value="all">Всички видове</option>
            <option value="cat">Само Котки</option>
            <option value="dog">Само Кучета</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select 
            value={filterZone} 
            onChange={(e) => setFilterZone(e.target.value)}
            className="text-xs font-bold border-none bg-slate-100 rounded-lg p-2 focus:ring-0"
          >
            <option value="all">Всички Зони</option>
            {uniqueZones.map(z => <option key={z} value={String(z)}>Зона {z}</option>)}
            <option value="null">Извън града</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select 
            value={filterGender} 
            onChange={(e) => setFilterGender(e.target.value)}
            className="text-xs font-bold border-none bg-slate-100 rounded-lg p-2 focus:ring-0"
          >
            <option value="all">Всички полове</option>
            <option value="female">Само Женски</option>
            <option value="male">Само Мъжки</option>
          </select>
        </div>
        
        <div className="ml-auto text-[10px] font-bold text-slate-400">
          Показани: {filteredList.length} от {waitingList.length}
        </div>
      </div>

      <WaitingStats data={filteredList} />

      <div className="overflow-x-auto max-h-[600px] overflow-y-auto border border-slate-200 rounded-lg shadow-inner bg-white">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-100 text-slate-600 text-[11px] uppercase tracking-wider">
            <tr>
              <th className="p-4 border-b">Записан на</th>
              <th className="p-4 border-b">Зона</th>
              <th className="p-4 border-b">Животно</th>
              <th className="p-4 border-b">Собственик / Телефон</th>
              <th className="p-4 border-b">Адрес</th>
              <th className="p-4 border-b">Бележки</th>
              <th className="p-4 border-b text-right">Действие</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center p-10 text-slate-400">
                  <div className="flex justify-center items-center gap-2">
                    <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                    Зареждане на списъка...
                  </div>
                </td>
              </tr>
            ) : waitingList.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-10 text-slate-400">Няма чакащи в списъка.</td>
              </tr>
            ) : (
              filteredList.map((item) => (
                <tr key={item.id} className="hover:bg-pink-50/30 transition-colors group">
                  <td className="p-4">
                    <span className="flex flex-col text-slate-700 text-xs">
                      <span className="font-medium">
                        {new Date(item.created_at).toLocaleDateString('bg-BG')}
                      </span>
                      <span className="text-slate-400">
                        {new Date(item.created_at).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })} ч.
                      </span>
                    </span>
                  </td>
                  <td className="p-4">
                    {item.zona_number ? (
                      <span className="bg-pink-100 text-pink-700 px-2.5 py-1 rounded-lg font-bold text-xs">
                        Зона {item.zona_number}
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg font-medium text-[10px]">
                        Извън града
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-slate-700">
                      {item.animal_type === 'dog' ? (
                        <Dog size={18} className="text-amber-600" />
                      ) : (
                        <Cat size={18} className="text-blue-500" />
                      )}
                      <span className="text-sm font-medium">
                        {item.animal_type === 'dog' ? 'Куче' : 'Котка'}, 
                        <span className="ml-1 text-slate-500">
                          {item.gender === 'female' ? 'ж.' : 'м.'}
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-semibold text-slate-700">{item.owner_name}</div>
                    <div className="text-xs text-slate-500">{item.phone}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-xs text-slate-600 max-w-[200px] truncate" title={item.address}>
                      {item.address}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-xs text-slate-500 italic whitespace-normal break-words min-w-[150px] max-w-[200px]">
                      {item.notes || "-"}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onSelectToSchedule(item)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                        title="Запиши час"
                      >
                        <CalendarCheck size={20} />
                      </button>
                      <button
                        onClick={() => startEdit(item)}
                        className="p-2 text-amber-600 hover:bg-amber-100 rounded-full transition-colors"
                        title="Редактирай данните"
                      >
                        <span className="text-lg">✏️</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Изтрий"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WaitingList;