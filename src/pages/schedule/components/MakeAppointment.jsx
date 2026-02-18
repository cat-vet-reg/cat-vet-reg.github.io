import React, { useState, useEffect } from "react";
import Icon from "../../../components/AppIcon";
import supabase from "../../../utils/supabase"

const MakeAppointment = ({ selectedDate, onAnimalAdd }) => {

  const [isExistingOwner, setIsExistingOwner] = useState(false);
  const [appointment, setAppointment] = useState({
      phone       : '',
      ownerName   : '',
      // Тук казваме на формата да ползва датата от календара
      date: selectedDate ? selectedDate.toISOString().split('T')[0] : '', 
      animals: []
  });

  // Важно: Трябва да обновим датата във формата, когато тя се промени в календара
  useEffect(() => {
      if (selectedDate) {
          setAppointment(prev => ({
              ...prev,
              date: selectedDate.toISOString().split('T')[0]
          }));
      }
  }, [selectedDate]);

  // Автоматично намиране на име на собственик по телефонен номер
useEffect(() => {
    // Ако изтриеш телефона, нулираме статуса
    if (!appointment.phone || appointment.phone.length < 6) {
        setIsExistingOwner(false);
        return;
    }

    const timer = setTimeout(async () => {
        try {
            const { data } = await supabase
                .from('td_owners')
                .select('name')
                .eq('phone', appointment.phone)
                .maybeSingle();

            if (data && data.name) {
                setAppointment(prev => ({ ...prev, ownerName: data.name }));
                setIsExistingOwner(true); // <--- Намерен е!
            } else {
                setIsExistingOwner(false); // <--- Нов човек
            }
        } catch (err) {
            console.error("Грешка:", err);
        }
    }, 800);

    return () => clearTimeout(timer);
}, [appointment.phone]);
  
  const [currentAnimal, setCurrentAnimal] = useState({
      species: 'cat',
      gender: 'female',
      count: 1
  });

  const addAnimalToList = () => {
      // Добавяме към списъка
      setAppointment(prev => ({
          ...prev,
          animals: [...prev.animals, { ...currentAnimal, id: Date.now() }]
      }));
      // Връщаме дефолтни стойности за следващото добавяне
      setCurrentAnimal({ species: 'cat', gender: 'female', count: 1 });
  };

  const removeAnimal = (id) => {
      setAppointment(prev => ({
          ...prev,
          animals: prev.animals.filter(a => a.id !== id)
      }));
  };

  /**
   * 
   */
  const registerAnimalIntoTheSYstem = (animal) => {
      onAnimalAdd(animal);
  };

  return (
      <div className="bg-card p-6 rounded-xl shadow-lg border border-border mx-auto">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
              <Icon name="CalendarPlus" className="text-primary" /> Запиши час
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <input 
                  type="text" 
                  placeholder="тел. Номер" 
                  className="p-2 rounded border bg-background border-border" 
                  value={appointment.phone}
                  onChange={(e) => setAppointment({...appointment, phone: e.target.value})}
              />
              <input 
              type="text" 
              placeholder="Име и фамилия" 
              className={`p-2 rounded border transition-colors duration-300 ${
                  isExistingOwner 
                  ? 'bg-red-50 border-red-300 text-red-900 shadow-[0_0_10px_rgba(230,64,114,0.2)]' 
                  : 'bg-background border-border text-foreground'
              }`} 
              value={appointment.ownerName}
              onChange={(e) => {
                  setAppointment({...appointment, ownerName: e.target.value});
                  // Ако потребителят реши ръчно да промени името, 
                  // можеш да изключиш червеното, за да не го дразни
                  setIsExistingOwner(false); 
              }}
          />
              <input 
                  type="date" 
                  className="p-2 rounded border bg-background border-border" 
                  value={appointment.date}
                  onChange={(e) => setAppointment({...appointment, date: e.target.value})}
              />
          </div>

          <div className="bg-muted/30 p-4 rounded-lg border border-dashed border-border mb-4">
              <div className="flex flex-wrap gap-3 items-end">
                  <div>
                      <label className="text-xs block mb-1 text-muted-foreground">Вид</label>
                      <select 
                          className="p-2 pr-12 rounded border bg-background border-border"
                          value={currentAnimal.species}
                          onChange={(e) => setCurrentAnimal({...currentAnimal, species: e.target.value})}
                      >
                          <option value="cat">Котка</option>
                          <option value="dog">Куче</option>
                      </select>
                  </div>
                  <div>
                      <label className="text-xs block mb-1 text-muted-foreground">Пол</label>
                      <select 
                          className="p-2 pr-12 rounded border bg-background border-border"
                          value={currentAnimal.gender}
                          onChange={(e) => setCurrentAnimal({...currentAnimal, gender: e.target.value})}
                      >
                          <option value="female">Женско</option>
                          <option value="male">Мъжко</option>
                      </select>
                  </div>
                  <div>
                      <label className="text-xs block mb-1 text-muted-foreground">Брой</label>
                      <input 
                          type="number" 
                          min="1" 
                          className="p-2 w-16 rounded border bg-background border-border" 
                          value={currentAnimal.count}
                          onChange={(e) => setCurrentAnimal({...currentAnimal, count: parseInt(e.target.value) || 1})}
                      />
                  </div>
                  <button 
                      onClick={addAnimalToList}
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-all font-medium"
                  >
                      + Добави ЖВ
                  </button>
              </div>
          </div>

          <div className="space-y-2 mb-6">
              <p className="font-bold text-sm text-foreground">Списък с ЖВ:</p>
              {appointment.animals.length === 0 && <p className="text-xs text-muted-foreground italic">Списъкът е празен...</p>}
              {appointment.animals.map((animal) => (
                  <div key={animal.id} className="flex justify-between items-center bg-background p-2 rounded border border-border">
                      <span className="text-sm">
                          <span className="font-bold text-primary">{animal.count}</span> {animal.gender === 'female' ? 'Ж' : 'М'} {animal.species === 'cat' ? 'КТ' : 'КЧ'}
                      </span>
                      <button 
                          onClick={() => removeAnimal(animal.id)}
                          className="text-destructive hover:underline text-xs"
                      >
                          Премахни
                      </button>
                  </div>
              ))}
          </div>

          <button className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-lg shadow-md hover:bg-green-700 transition-colors"
          onClick={() => registerAnimalIntoTheSYstem(appointment)}>
              Запиши час
          </button>
      </div>
  );
};

export default MakeAppointment;