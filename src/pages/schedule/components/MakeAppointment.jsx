import React, { useState, useEffect } from "react";
import Icon from "../../../components/AppIcon";
import supabase from "../../../utils/supabase";

const MakeAppointment = ({ selectedDate, onAnimalAdd, prefillData }) => {
    const [isExistingOwner, setIsExistingOwner] = useState(false);
    const [isBlacklisted, setIsBlacklisted] = useState(false);
    const [ownerStats, setOwnerStats] = useState({ total: 0, donations: 0 });

    // Състояние за търсене по ID на животно
    const [searchRecordId, setSearchRecordId] = useState("");
    const [isSearchingRecord, setIsSearchingRecord] = useState(false);
    const [recordSearchError, setRecordSearchError] = useState("");

    const [appointment, setAppointment] = useState({
        phone: '',
        ownerName: '',
        date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
        time: '09:00', // Час по подразбиране
        appointmentType: 'castration', // Вид час по подразбиране
        notes: '', // Бележки / Описание
        animals: [],
        // Добавяме тези, за да не се губят от prefillData
        address: '',
        zonaNumber: '',
        coords: null
    });

    const [currentAnimal, setCurrentAnimal] = useState({
        species: 'cat',
        gender: 'female',
        count: 1
    });

    // 1. Синхронизация с календара
    useEffect(() => {
        if (selectedDate) {
            setAppointment(prev => ({
                ...prev,
                date: selectedDate.toISOString().split('T')[0]
            }));
        }
    }, [selectedDate]);

    // 2. Обработка на prefillData (от Списъка на чакащи)
    useEffect(() => {
        if (prefillData) {
            // Ако prefillData съдържа цялостна дата и час в едно поле (напр. ISO стринг)
            let initialDate = appointment.date;
            let initialTime = "09:00";
            
            if (prefillData.appointment_time) {
                const d = new Date(prefillData.appointment_time);
                if (!isNaN(d.getTime())) {
                    initialDate = d.toISOString().split('T')[0];
                    initialTime = d.toTimeString().split(' ')[0].substring(0, 5);
                }
            }

            setAppointment(prev => ({
                ...prev,
                ownerName: prefillData.ownerName || "",
                phone: prefillData.phone || "",
                notes: prefillData.notes,
                address: prefillData.address || "",
                zonaNumber: prefillData.zonaNumber || "",
                coords: prefillData.coords || null,
                // Ако идва конкретно животно, го добавяме в списъка
                animals: prefillData.animalType ? [{
                    id: Date.now(),
                    species: prefillData.animalType === 'dog' ? 'dog' : 'cat',
                    gender: prefillData.gender || 'female',
                    count: 1
                }] : prev.animals
            }));
        }
    }, [prefillData]);

    // 3. Проверка на собственика (Blacklist & Stats)
    useEffect(() => {
        if (!appointment.phone || appointment.phone.length < 6) {
            setIsExistingOwner(false);
            setIsBlacklisted(false);
            setOwnerStats({ total: 0, donations: 0 });
            return;
        }

        const timer = setTimeout(async () => {
          try {
              // 1. Взимаме данните за собственика и причината за Blacklist
              const { data: owner } = await supabase
                .from('td_owners')
                .select('name, blacklist_reason')
                .eq('phone', appointment.phone)
                .maybeSingle();

              // 2. Взимаме статистиката от записите
              const { data: records } = await supabase
                .from('td_records')
                .select('status, data')
                .eq('owner_phone', appointment.phone);

              if (owner || (records && records.length > 0)) {
                setIsExistingOwner(true);

                const total = records?.filter(r => r.status !== 'missed').length || 0;
                // Проверяваме в полето data.donation дали е "Y" (според твоя JSON)
                const donations = records?.filter(r =>
                      r.data?.donation === 'Y' || 
                      (r.data?.donationAmount && Number(r.data.donationAmount) > 0)
                  ).length || 0;
                const hasMissed = records?.some(r => r.data?.status === 'missed');

                // Blacklisted е ако има пропуснати часове ИЛИ ако има записана причина в td_owners
                setIsBlacklisted(hasMissed || !!owner?.blacklist_reason);

                setOwnerStats({ 
                    total, 
                    donations, 
                    reason: owner?.blacklist_reason || (hasMissed ? "Пропуснати часове в миналото" : null)
                });

          if (owner?.name && !appointment.ownerName) {
                setAppointment(prev => ({ ...prev, ownerName: owner.name }));
            }
              }
          } catch (err) {
              console.error("Грешка:", err);
          }
      }, 600);

        return () => clearTimeout(timer);
    }, [appointment.phone]);

// ТЪРСЕНЕ НА СЪЩЕСТВУВАЩО ЖИВОТНО ПО IDВ td_records
    const handleSearchAnimalById = async () => {
        if (!searchRecordId.trim()) return;

        setIsSearchingRecord(true);
        setRecordSearchError("");

        try {
            const { data: rec, error } = await supabase
                .from('td_records')
                .select('id, name, species, gender, owner_name, owner_phone, location_address, zona_number, map_coordinates')
                .eq('id', searchRecordId.trim())
                .maybeSingle();

            if (error) throw error;

            if (!rec) {
                setRecordSearchError(`Не е намерено животно с ID #${searchRecordId}`);
                setIsSearchingRecord(false);
                return;
            }

            // Добавяме намереното животно към списъка с животни за този час
            const existingAnimalObj = {
                id: Date.now(),
                record_id: rec.id, // Връзката към td_records
                name: rec.name || `Животно #${rec.id}`,
                species: rec.species || 'cat',
                gender: rec.gender || 'female',
                count: 1
            };

            // Автоматично попълваме и данните за собственика и адреса, ако липсват
            setAppointment(prev => ({
                ...prev,
                ownerName: rec.owner_name || prev.ownerName,
                phone: rec.owner_phone || prev.phone,
                address: rec.location_address || prev.address,
                zonaNumber: rec.zona_number || prev.zonaNumber,
                coords: rec.map_coordinates || prev.coords,
                appointmentType: prev.appointmentType === 'castration' ? 'examination' : prev.appointmentType, // Препоръчваме 'преглед' ако вече съществува
                animals: [...prev.animals, existingAnimalObj]
            }));

            setSearchRecordId("");
        } catch (err) {
            console.error("Грешка при търсене на record:", err);
            setRecordSearchError("Възникна грешка при търсенето.");
        } finally {
            setIsSearchingRecord(false);
        }
    };

    const addAnimalToList = () => {
        setAppointment(prev => ({
            ...prev,
            animals: [...prev.animals, { ...currentAnimal, id: Date.now() }]
        }));
        setCurrentAnimal({ species: 'cat', gender: 'female', count: 1 });
    };

    const removeAnimal = (id) => {
        setAppointment(prev => ({
            ...prev,
            animals: prev.animals.filter(a => a.id !== id)
        }));
    };

    const handleFinalSubmit = () => {
        if (appointment.animals.length === 0) {
            alert("Моля, добавете поне едно животно.");
            return;
        }
        
        if (isBlacklisted && !window.confirm("Този човек е в ЧЕРНИЯ СПИСЪК. Сигурни ли сте, че искате да му запишете час?")) {
            return;
        }

        // ФИКС: Използваме директен локален формат на стринга, за да спрем таймзона отместването
        const localISOString = `${appointment.date}T${appointment.time}:00.000`;
        
        // Създаваме финалния обект, който подаваме нагоре
        const finalAppointmentData = {
            phone: appointment.phone,
            ownerName: appointment.ownerName,
            date: appointment.date, // Добавяме го за по-лесно четене в родителя
            time: appointment.time, // Добавяме го за по-лесно четене в родителя
            appointment_time: localISOString, // Праща се чист стринг без "Z" отзад
            appointmentType: appointment.appointmentType,
            notes: appointment.notes,
            animals: appointment.animals,
            address: appointment.address,
            zonaNumber: appointment.zonaNumber,
            coords: appointment.coords
        };

        onAnimalAdd(finalAppointmentData);

        // Ресет на формата
        setAppointment({
            phone: '',
            ownerName: '',
            date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
            time: '09:00',
            appointmentType: 'castration',
            notes: '',
            animals: [],
            address: '',
            zonaNumber: '',
            coords: null
        });
        setIsBlacklisted(false);
        setIsExistingOwner(false);
    };

    return (
        <div className="bg-card p-6 rounded-xl shadow-lg border border-border mx-auto">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
                <Icon name="CalendarPlus" className="text-primary" /> Запиши час
            </h3>

            {/* БЪРЗО ТЪРСЕНЕ НА СЪЩЕСТВУВАЩО ЖИВОТНО ПО ID */}
            <div className="mb-5 p-3 bg-muted/40 rounded-lg border border-border">
                <label className="text-xs font-semibold text-muted-foreground block mb-1 flex items-center gap-1">
                    <Icon name="Search" size={13} /> Търсене на съществуващо животно по ID (td_records):
                </label>
                <div className="flex gap-2">
                    <input 
                        type="number"
                        placeholder="напр. 683"
                        className="p-2 text-sm rounded border bg-background border-border w-36"
                        value={searchRecordId}
                        onChange={(e) => setSearchRecordId(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchAnimalById()}
                    />
                    <button
                        type="button"
                        onClick={handleSearchAnimalById}
                        disabled={isSearchingRecord || !searchRecordId}
                        className="bg-secondary text-secondary-foreground px-3 py-2 rounded-md hover:opacity-90 text-sm font-medium flex items-center gap-1 disabled:opacity-50"
                    >
                        {isSearchingRecord ? "Търсене..." : "Зареди пациент"}
                    </button>
                </div>
                {recordSearchError && (
                    <p className="text-xs text-destructive mt-1 font-medium">{recordSearchError}</p>
                )}
            </div>

            {/* Полета за телефон и име */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-1">
                    <input 
                        type="text" 
                        placeholder="тел. Номер (минимум 10 цифри)" 
                        className={`p-2 rounded border transition-colors duration-300 ${
                            appointment.phone.length > 0 && appointment.phone.length < 10 
                            ? 'border-orange-400 bg-orange-50 shadow-[0_0_8px_rgba(251,146,60,0.2)]' // Оранжево за предупреждение
                            : 'bg-background border-border text-foreground'
                        }`} 
                        value={appointment.phone}
                        onChange={(e) => {
                            // Позволяваме само цифри (филтър)
                            const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                            setAppointment({...appointment, phone: onlyNums});
                        }}
                    />
                    {appointment.phone.length > 0 && appointment.phone.length < 10 && (
                        <span className="text-[10px] text-orange-600 font-bold ml-1 italic">
                            * Номерът трябва да е поне 10 цифри
                        </span>
                    )}
                </div>
                <div className="flex flex-col gap-1">
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
                          setIsExistingOwner(false); 
                      }}
                  />
                </div>
            </div>

            {/* Статистика и Предупреждение */}
            {isExistingOwner && (
                <div className="mb-4 p-3 rounded-lg bg-muted/50 text-xs flex flex-wrap gap-4 items-center">
                    <span className="flex items-center gap-1"><Icon name="History" size={14}/> Донесени: <b>{ownerStats.total}</b></span>
                    <span className="flex items-center gap-1"><Icon name="Heart" size={14} className="text-red-500"/> Дарения: <b>{ownerStats.donations}</b></span>
                    {isBlacklisted && (
                        <span className="text-destructive font-bold flex items-center gap-1 animate-pulse">
                            <Icon name="Skull" size={14}/> В ЧЕРНИЯ СПИСЪК!
                        </span>
                    )}
                </div>
            )}

            {/* <div className="mb-6">
                 <label className="text-xs text-muted-foreground block mb-1">Дата на записания час</label>
                 <input 
                    type="date" 
                    className="p-2 w-full rounded border bg-background border-border" 
                    value={appointment.date}
                    onChange={(e) => setAppointment({...appointment, date: e.target.value})}
                />
            </div> */}

            {/* НОВА СЕКЦИЯ: ДАТА, ЧАС И ВИД ЧАС */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                     <label className="text-xs text-muted-foreground block mb-1">Дата</label>
                     <input 
                        type="date" 
                        className="p-2 w-full rounded border bg-background border-border text-sm" 
                        value={appointment.date}
                        onChange={(e) => setAppointment({...appointment, date: e.target.value})}
                    />
                </div>
                <div>
                     <label className="text-xs text-muted-foreground block mb-1">Час</label>
                     <input 
                        type="time" 
                        className="p-2 w-full rounded border bg-background border-border text-sm" 
                        value={appointment.time}
                        onChange={(e) => setAppointment({...appointment, time: e.target.value})}
                    />
                </div>
                <div>
                     <label className="text-xs text-muted-foreground block mb-1">Вид час</label>
                     <select 
                        className="p-2 w-full rounded border bg-background border-border text-sm" 
                        value={appointment.appointmentType}
                        onChange={(e) => setAppointment({...appointment, appointmentType: e.target.value})}
                     >
                        <option value="castration">⚡ Кастрация</option>
                        <option value="surgery">🏥 Операция</option>
                        <option value="examination">🩺 Преглед</option>
                        <option value="prevention">🛡️ Профилактика</option>
                     </select>
                </div>
            </div>

            {/* НОВА СЕКЦИЯ: БЕЛЕЖКИ / ОПИСАНИЕ */}
            <div className="mb-4">
                <label className="text-xs text-muted-foreground block mb-1">Бележки / Описание на случая</label>
                <textarea 
                    placeholder="Добави специфични детайли за часа (напр. симптоми, улична локация, транспорт)..."
                    rows="2"
                    className="p-2 w-full rounded border bg-background border-border text-sm resize-none"
                    value={appointment.notes || ""}
                    onChange={(e) => setAppointment({...appointment, notes: e.target.value})}
                />
            </div>

            {/* Секция за добавяне на животно */}
            <div className="bg-muted/30 p-4 rounded-lg border border-dashed border-border mb-4">
                <div className="flex flex-wrap gap-3 items-end">
                    <div>
                        <label className="text-xs block mb-1 text-muted-foreground">Вид</label>
                        <select 
                            className="p-2 rounded border bg-background border-border"
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
                            className="p-2 rounded border bg-background border-border"
                            value={currentAnimal.gender}
                            onChange={(e) => setCurrentAnimal({...currentAnimal, gender: e.target.value})}
                        >
                            <option value="female">Женско</option>
                            <option value="male">Мъжко</option>
                        </select>
                    </div>
                    <button 
                        onClick={addAnimalToList}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-all font-medium"
                    >
                        + Добави ЖВ
                    </button>
                </div>
            </div>

            {/* Списък с добавени животни */}
            <div className="space-y-2 mb-6">
                {appointment.animals.map((animal) => (
                    <div key={animal.id} className="flex justify-between items-center bg-background p-2 rounded border border-border">
                        <span className="text-sm font-medium">
                            {animal.count}x {animal.species === 'cat' ? 'Котка' : 'Куче'} ({animal.gender === 'female' ? 'Ж' : 'М'})
                        </span>
                        <button onClick={() => removeAnimal(animal.id)} className="text-destructive text-xs">Премахни</button>
                    </div>
                ))}
            </div>

        {/* Добави това точно над финалния бутон */}
        {isBlacklisted && ownerStats.reason && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive text-xs text-center font-semibold">
                    Причина за черен списък: {ownerStats.reason}
                </p>
            </div>
        )}

        <button 
            className={`w-full py-3 rounded-xl font-bold text-lg shadow-md transition-colors ${
                isBlacklisted ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
            onClick={handleFinalSubmit}
        >
            {isBlacklisted ? 'Запиши въпреки всичко' : 'Запиши час'}
        </button>
        </div>
    );
};

export default MakeAppointment;