// Добави към импортите:
import { TREATMENT_INFO } from './treatmentTexts';

// ... вътре в компонента, след като имаш animalData:

return (
  <div className="max-w-6xl mx-auto p-4 flex flex-col md:flex-row gap-8">
    
    {/* ЛЯВА КОЛОНА: КАРТА СЪС СТАТУС (30% ширина) */}
    <div className="md:w-1/3 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 self-start">
      <div className="text-center mb-6">
        <span className="text-slate-400 text-xs uppercase tracking-widest">Пациент</span>
        <h1 className="text-2xl font-black text-slate-800">{animalData.name}</h1>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
          <span className="text-slate-500 text-sm">Статус:</span>
          <span className={`px-4 py-1 rounded-full text-xs font-bold ${currentStatus?.color}`}>
            {currentStatus?.label}
          </span>
        </div>

        {animalData.services?.length > 0 && (
          <div className="pt-4">
            <h3 className="text-sm font-bold text-slate-700 mb-3 border-b pb-2">Извършени процедури:</h3>
            <div className="flex flex-col gap-2">
              {animalData.services.map(s => (
                <div key={s} className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>

    {/* ДЯСНА КОЛОНА: ИНФОРМАЦИЯ (70% ширина) */}
    <div className="md:w-2/3 space-y-6">
      <h2 className="text-xl font-bold text-slate-800 border-l-4 border-blue-600 pl-4">
        Какви процедури бяха направени днес:
      </h2>

      {animalData.services?.map(serviceKey => {
        const info = TREATMENT_INFO[serviceKey];
        if (!info) return null;

        return (
          <div key={serviceKey} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-right-4">
            <h3 className="text-lg font-bold text-slate-800 mb-2">{info.title}</h3>
            <p className="text-slate-600 leading-relaxed text-sm mb-4">
              {info.description}
            </p>
            {info.care && (
              <div className="bg-amber-50 p-3 rounded-lg flex gap-3 items-start">
                <span className="text-lg text-amber-500">⚠️</span>
                <p className="text-xs text-amber-800 font-medium leading-tight">
                  <span className="font-bold block mb-1">Грижа:</span>
                  {info.care}
                </p>
              </div>
            )}
          </div>
        );
      })}

      {/* ОБЩИ ИНСТРУКЦИИ - Винаги се виждат */}
      <div className="bg-blue-900 text-white p-6 rounded-2xl shadow-lg mt-8">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          🏠 Как да се погрижите у дома?
        </h3>
        <ul className="text-sm space-y-2 opacity-90">
          <li>• Осигурете тиха и топла стая без течение.</li>
          <li>• Предложете малко количество вода след 2-3 часа.</li>
          <li>• Ако забележите необичайно зачервяване, се свържете с нас.</li>
        </ul>
      </div>
    </div>
  </div>
);