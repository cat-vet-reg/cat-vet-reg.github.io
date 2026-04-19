export default function CheckMyAppointments({ appointments, waitingList }) {
  // Проверяваме дали и двата списъка са празни
  const hasAppointments = appointments && appointments.length > 0;
  const hasWaiting = waitingList && waitingList.length > 0;

  if (!hasAppointments && !hasWaiting) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 pb-20">
      
      {/* --- СЕКЦИЯ 1: ЗАПИСАНИ ЧАСОВЕ --- */}
      {hasAppointments && (
        <section>
          <h2 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tight flex items-center gap-2">
            <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
            Вашите записани часове
          </h2>
          <div className="grid gap-4">
            {appointments.map((apt) => (
              <div key={apt.id} className="bg-white p-6 rounded-3xl shadow-md border border-slate-100 flex flex-col md:row justify-between items-center gap-4">
                 {/* ... твоят код за показване на час ... */}
                 <div className="flex items-center gap-4 w-full">
                    <div className="bg-blue-50 p-4 rounded-2xl text-2xl">
                        {apt.species === 'cat' ? '🐱' : '🐶'}
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900">{apt.name || "Пациент"}</h3>
                        <p className="text-slate-500 text-sm">
                        {apt.species === 'cat' ? 'Котка' : 'Куче'}, {apt.gender === 'male' ? 'Мъжки' : 'Женски'}
                        </p>
                    </div>
                 </div>
                 <div className="text-center md:text-right w-full">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Дата на прием</span>
                    <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-black text-lg inline-block">
                        {new Date(apt.castrated_at).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long' })}
                    </div>
                    <p className="text-slate-400 text-xs mt-1 italic">* Прием в 9:00 ч.</p>
                 </div>
              </div>
            ))}
          </div>

          {/* ИНСТРУКЦИИ - показват се само ако има час */}
          <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] mt-6">
            <h3 className="text-amber-800 font-black uppercase text-xs mb-4 flex items-center gap-2">
              <span>⚠️</span> Важни инструкции за деня на кастрацията:
            </h3>
            <ul className="space-y-3 text-amber-900 text-sm">
              <li><strong>1.</strong> Животното трябва да е хранено сутринта в деня на кастрацията.</li>
              <li><strong>2.</strong> Вода може да се дава в малки количества.</li>
              <li><strong>3.</strong> Всяка котка трябва да е в здрава и сигурни транспортна чанта.</li>
            </ul>
          </div>
        </section>
      )}

      {/* --- СЕКЦИЯ 2: СПИСЪК НА ЧАКАЩИ --- */}
      {hasWaiting && (
        <section>
          <h2 className="text-xl font-black text-slate-400 mb-6 uppercase tracking-tight flex items-center gap-2">
            <span className="w-2 h-8 bg-slate-300 rounded-full"></span>
            В списъка на чакащите
          </h2>
          <div className="grid gap-3">
            {waitingList.map((wait) => (
              <div key={wait.id} className="bg-slate-50/50 p-5 rounded-2xl border border-dashed border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{wait.animal_type === 'cat' ? '🐱' : '🐶'}</span>
                  <div>
                    <p className="font-bold text-slate-700">
                        {wait.animal_type === 'cat' ? 'Котка' : 'Куче'}, {wait.gender === 'female' ? 'Женски' : 'Мъжки'}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Зона {wait.zona_number}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="bg-white text-slate-400 border border-slate-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                    В изчакване
                  </span>
                </div>
              </div>
            ))}
            <p className="text-slate-400 text-[14px] text-center mt-2 italic">
              Ще се свържем с Вас по телефона при наличие на свободни часове за Вашата зона.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}