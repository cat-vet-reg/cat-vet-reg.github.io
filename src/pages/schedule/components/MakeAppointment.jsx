import React, { useState, useEffect } from "react";
import Icon from "../../../components/AppIcon";
import supabase from "../../../utils/supabase"

const MakeAppointment = ({ selectedDate, onAnimalAdd, prefillData }) => {

  const [isExistingOwner, setIsExistingOwner] = useState(false);
	const [isBlacklisted, setIsBlacklisted] = useState(false);
	const [ownerStats, setOwnerStats] = useState({ total: 0, donations: 0 });
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

  // Автоматично намиране на име на собственик по телефонен номер и проверка за Черен списък
	useEffect(() => {
			if (!appointment.phone || appointment.phone.length < 6) {
					setIsExistingOwner(false);
					setIsBlacklisted(false);
					return;
			}

			const timer = setTimeout(async () => {
					try {
							// 1. Първо търсим името в td_owners
							const { data: owner } = await supabase
									.from('td_owners')
									.select('name')
									.eq('phone', appointment.phone)
									.maybeSingle();

							if (owner) {
									setAppointment(prev => ({ ...prev, ownerName: owner.name }));
									setIsExistingOwner(true);
							} else {
									setIsExistingOwner(false);
							}

							// 2. ВАЖНО: Проверяваме в td_records за статус 'missed'
							const { data: missedRecords } = await supabase
									.from('td_records')
									.select('id')
									// Проверяваме и двата варианта за всеки случай
									.or(`data->>ownerPhone.eq.${appointment.phone},data->>phone.eq.${appointment.phone}`)
									.filter('data->>status', 'eq', 'missed')
									.limit(1);

							if (missedRecords && missedRecords.length > 0) {
									console.log("Намерен в черния списък!");
									setIsBlacklisted(true);
							} else {
									setIsBlacklisted(false);
							}

							// 3. Проверка за история на даренията
							const { data: history } = await supabase
									.from('td_records')
									.select('data')
									.filter('data->>ownerPhone', 'eq', appointment.phone);

							if (history) {
									const totalAnimals = history.length;
									// Тук приемаме, че в JSON обекта 'data' записвате donation: true или подобно
									const totalDonations = history.filter(h => h.data?.hasDonation === true || h.data?.donationAmount > 0).length;

									setOwnerStats({ total: totalAnimals, donations: totalDonations });
							}

					} catch (err) {
							console.error("Грешка при проверка:", err);
					}
			}, 800);

			return () => clearTimeout(timer);
	}, [appointment.phone]);
  
  const [currentAnimal, setCurrentAnimal] = useState({
      species: 'cat',
      gender: 'female',
      count: 1
  });

  useEffect(() => {
      if (prefillData) {
        // Използваме setAppointment (правилното име), а не setFormData
        setAppointment(prev => ({
          ...prev,
          ownerName: prefillData.ownerName || "",
          phone: prefillData.phone || "",
          // Тъй като в този компонент нямаш полета за адрес и зона в самия стейт, 
          // добавяме ги тук, за да се запазят при изпращане
          address: prefillData.address || "",
          zonaNumber: prefillData.zonaNumber || "",
          coords: prefillData.coords || null,
        }));

        // Автоматично добавяме и животното в списъка, ако има такова
        if (prefillData.animalType) {
          setAppointment(prev => ({
            ...prev,
            animals: [{
              id: Date.now(),
              species: prefillData.animalType === 'dog' ? 'dog' : 'cat',
              gender: prefillData.gender || 'female',
              count: 1
            }]
          }));
        }
      }
    }, [prefillData]);

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
  const registerAnimalIntoTheSYstem = (appointmentData) => {
    // 1. Проверка дали имаме животни
    if (!appointmentData.animals || appointmentData.animals.length === 0) {
      alert("Моля, първо добавете животното в списъка чрез бутона '+ Добави ЖВ'");
      return;
    }

    // 2. Просто предаваме данните нагоре към родителя (Schedule)
    onAnimalAdd(appointmentData);

    // 3. Изчистваме формата
    setAppointment({
      phone: '',
      ownerName: '',
      date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
      animals: []
    });
    setIsExistingOwner(false);
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
							{/* ПРЕДУПРЕЖДЕНИЕ ЗА ЧЕРЕН СПИСЪК */}
							{isBlacklisted && (
									<div className="col-span-1 md:col-span-2 bg-red-600 text-white p-3 rounded-lg flex items-center gap-3 shadow-lg border-2 border-red-800 mt-2">
											<Icon name="AlertTriangle" size={24} className="animate-bounce" />
											<div>
													<p className="font-black text-sm uppercase">Внимание: Черен списък!</p>
													<p className="text-xs">Този човек има пропуснати часове в миналото. Бъдете внимателни!</p>
											</div>
									</div>
							)}
							{/* Секция със статистика под името */}
							{isExistingOwner && (
									<div className="col-span-1 md:col-span-2 mt-1 flex gap-4 text-xs font-medium">
											<span className="text-muted-foreground">
													Донесени ЖВ: <strong className="text-foreground">{ownerStats.total}</strong>
											</span>
											<span className={ownerStats.donations < (ownerStats.total / 2) ? "text-orange-600" : "text-green-600"}>
													Дарения: <strong>{ownerStats.donations}</strong>
											</span>
											
											{ownerStats.total > 3 && ownerStats.donations <= 1 && (
													<span className="text-red-500 font-bold animate-pulse">
															(Рядко дарява!)
													</span>
											)}
									</div>
							)}
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