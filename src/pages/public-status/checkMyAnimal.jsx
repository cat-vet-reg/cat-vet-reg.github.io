import { TREATMENT_INFO } from './treatmentTexts';
import { POST_OP_GUIDE } from './postOpInstructions';
import { statusOptions, statusDescriptions, staffOptions } from "../../constants/formOptions";

export default function CheckMyAnimal({ animalData }) {
  if (!animalData) return null;

  const currentStatus = statusOptions.find(opt => opt.id === animalData.status);

  return (

  <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 animate-in fade-in duration-500">
    {animalData && (
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 animate-in fade-in duration-500">
        
        {/* ЛЯВА КОЛОНА: КАРТА ЖВ инфо и СТАТУС */}
        <div className="md:w-1/3 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 self-start">
          <div className="text-center mb-6 border-b pb-4">
            <span className="text-slate-400 text-[10px] uppercase tracking-[0.2em]">Пациент</span>
            <h1 className="text-2xl font-black text-slate-800 mt-1">{animalData.name}</h1>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500 text-xs">Текущ статус:</span>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-sm ${currentStatus?.color || 'bg-slate-100'}`}>
                {currentStatus?.label || animalData.status}
              </span>
            </div>

            {animalData.castrated_at && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-emerald-700 text-[10px] uppercase font-bold block mb-1">Дата на кастрация:</span>
                <span className="text-emerald-900 font-bold text-sm">
                  {new Date(animalData.castrated_at).toLocaleDateString('bg-BG', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </span>
              </div>
            )}

            {animalData.staff_surgeon && (
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <span className="text-blue-700 text-[10px] uppercase font-bold block mb-1">Ветеринарен хирург:</span>
                <span className="text-blue-900 font-bold text-sm">
                  {staffOptions.find(opt => opt.value === animalData.staff_surgeon)?.label || "---"}
                </span>
              </div>
            )}

            {/* СПИСЪК ПРОЦЕДУРИ */}
            <div className="pt-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Извършени днес:</h3>
              <div className="flex flex-wrap gap-2">
                {animalData.services?.map(s => (
                  <span key={s} className="bg-slate-100 text-slate-700 text-[10px] px-2 py-1 rounded-md font-bold">
                    {s}
                  </span>
                )) || <span className="text-slate-400 italic text-xs">Стандартен преглед</span>}
              </div>
            </div>
          </div>
          
          <p className="text-[10px] text-center text-slate-400 mt-8 italic">
            * Информацията се обновява в реално време.
          </p>
        </div>

        {/* ДЯСНА КОЛОНА: ИНФОРМАЦИЯ И ГРИЖИ */}
        <div className="md:w-2/3 space-y-6">

          {/*СТАТУС*/}
          <div className="space-y-10">
            <div className="space-y-6">
              <div className="border-l-4 border-blue-600 pl-4">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Текущ статус:</h2>
                <p className="text-slate-500 text-sm leading-relaxed antialiased">Какво означава това:</p>
              </div>
              <div className="text-slate-500 text-sm leading-relaxed antialiased">
                Текущият статус на Вашето животно е <strong className="text-slate-800">{currentStatus?.label.toLowerCase()}</strong>, 
                което означава, че {statusDescriptions[animalData.status] || "информацията се обновява."}
              </div>
            </div>

            {/* СЕКЦИЯ ДАРЕНИЕ */}
            <div className={`p-6 rounded-2xl border transition-all ${
              animalData.data?.hasDonation || animalData.data?.donationAmount > 0 
              ? 'bg-emerald-50 border-emerald-100' 
              : 'bg-amber-50 border-amber-100 shadow-inner'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${
                  animalData.data?.hasDonation || animalData.data?.donationAmount > 0 ? 'bg-emerald-500' : 'bg-amber-500'
                } text-white`}>
                  {/* Икона Сърце */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                </div>
                
                <div className="space-y-2">
                  <h3 className={`text-lg font-black uppercase tracking-tight ${
                    animalData.data?.hasDonation || animalData.data?.donationAmount > 0 ? 'text-emerald-800' : 'text-amber-800'
                  }`}>
                    {animalData.data?.hasDonation || animalData.data?.donationAmount > 0 ? 'Благодарим за подкрепата!' : 'Вашето дарение е важно'}
                  </h3>
                  
                  {animalData.data?.hasDonation || animalData.data?.donationAmount > 0 ? (
                    <p className="text-emerald-700 text-sm leading-relaxed">
                      Вашето дарение помага на центъра да продължи да предлага тези услуги безплатно за бездомни животни. Благодарим Ви, че сте част от промяната!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-amber-900 text-sm leading-relaxed font-medium">
                        Всички кастрации и прегледи в нашия център се финансират изцяло от дарения. Вашата подкрепа днес ще ни позволи да помогнем на следващото животно в беда.
                      </p>
                      <p className="text-amber-800 text-xs italic">
                        * Можете да оставите дарение на място при получаване на животното. Самото дарение може да е парично или под формата на консумативи - пакети нестерилни марли, пелени 60х90 см, нестерилни S и M ръкавици, белина и др.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="border-l-4 border-blue-600 pl-4">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Постоперативни препоръки</h2>
                <p className="text-slate-500 text-sm">Прочетете внимателно за успешното заздравяване</p>
              </div>

              <div className="flex flex-col gap-8">
                {POST_OP_GUIDE
                  .filter(item => !item.onlyFor || item.onlyFor === animalData.gender)
                  .map((item, index) => {
                    // Проверяваме дали индексът е четен (0, 2, 4...) или нечетен (1, 3, 5...)
                    const isEven = index % 2 === 0;

                    return (
                      <div 
                        key={index} 
                        className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} 
                          items-center gap-6 bg-white p-2 rounded-[2rem] shadow-sm border border-slate-100 
                          hover:shadow-xl transition-all duration-300 overflow-hidden group`}
                      >
                        {/* СЕКЦИЯ КАРТИНКА */}
                        <div className="w-full md:w-2/5 h-64 overflow-hidden rounded-[1.5rem] relative">
                          <img 
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>

                        {/* СЕКЦИЯ ТЕКСТ */}
                        <div className={`w-full md:w-3/5 p-6 ${isEven ? 'md:pr-10' : 'md:pl-10'} text-center md:text-left`}>
                          <h3 className="text-xl font-black text-slate-800 mb-3 tracking-tight">
                            {item.title}
                          </h3>
                          <p className="text-slate-500 text-sm leading-relaxed antialiased">
                            {item.description}
                          </p>
                          
                          {/* Опционално: Малък детайл за завършеност */}
                          <div className={`mt-4 h-1 w-12 bg-blue-100 rounded-full mx-auto md:mx-0 ${!isEven && 'md:ml-auto'}`}></div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* СПЕШНИ КОНТАКТИ */}
            <div className="bg-red-50 rounded-[2.5rem] p-8 border border-red-100">
              <h3 className="text-red-800 font-black text-xl mb-4 uppercase">🆘 При спешност</h3>
              <p className="text-red-700 text-sm mb-6 leading-relaxed">
                Свържете се с нас веднага, ако забележите бледи венци, трудно дишане или обилно кървене.
              </p>
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-red-200 flex flex-col items-center">
                <a href="tel:0896160033" className="text-4xl font-black text-slate-900 hover:text-red-600 transition-colors tracking-tight">
                  032-207-379
                </a>
                <a href="tel:0896160033" className="text-4xl font-black text-slate-900 hover:text-red-600 transition-colors tracking-tight">
                  089-616-00-33
                </a>
                <p className="text-slate-400 text-xs mt-3 font-medium text-center">Немски кастрационен център – Пловдив</p>
              </div>
            </div>
          </div>

          {/*ИЗВЪРШЕНИ УСЛУГИ*/}
            <div className="border-l-4 border-blue-600 pl-4">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
              Детайли за днешните процедури:
              </h2>
            </div>

          {animalData.services?.map(serviceKey => {
            const info = TREATMENT_INFO[serviceKey];
            if (!info) return null;

            return (
              <div key={serviceKey} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                <h3 className="text-lg font-bold text-slate-800 mb-2">{info.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm mb-4">
                  {info.description}
                </p>
                {info.care && (
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
                    <span className="text-xl">💡</span>
                    <div className="text-xs text-amber-900 leading-normal italic">
                      <strong className="block not-italic mb-1 text-amber-800">Важно за възстановяването:</strong>
                      {info.care}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

        </div>
      </div>
    )}
  </div>
  );
}