import React from 'react';
import Header     from "../../components/ui/Header";
import Breadcrumb from "../../components/ui/Breadcrumb";
import Icon from "../../components/AppIcon";
import Button           from '../../components/ui/Button'; 

import {  speciesOptions,
          genderOptions,
          spicyOptions,
          bcsScores,
          getBcsDescription,
          ageUnitOptions, 
          colorOptions,
          colorStyles,
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
          } from "../../constants/formOptions";
import { breedOptions         } from "../../constants/breed_options";
import { cityOptions          } from "../../constants/city_options";

const Today = () => {

    const breadcrumbItems = [
      { label: 'Табло', path: '/dashboard-overview' },
      { label: 'Лечение', path: '/treatment' },
    ];
  // Примерни фалшиви данни за таблицата
  const animals = [
    {
      id: 445,
      created_at: "2026-04-06T10:13:42.82482+00:00",
      name: "Проба 12",
      notes: null,
      gender: "female",
      weight: null,
      age_value: null,
      age_unit: null,
      color: null,
      location_address: "g.k. Hristo Botev-NorthYuzhen, ul. \"Byalo more\" 5, 4013 Plovdiv, Bulgaria",
      location_city: "Plovdiv_PDV",
      owner_id: 34,
      living_condition: [
          "street"
      ],
      map_coordinates: {
          lat: 42.129679,
          lng: 24.7424175,
          zona_number: 58
      },
      data: {
          donation: "N",
          age_value: 5,
          age_unit: "months",
          weight: 3.4,
          color: "gray_white",
          custom_color: "",
          has_ear_tag: "N",
          ear_tag_number: "",
          bcs_score: "5",
          temperament: "mild",
          notes: "",
          breed: "european",
          outdoor_access: "Y",
          origin: "street",
          general_condition: "good",
          discovery_source: "friends",
          image_preview: "https://gexgpozvrhurkhrlvaah.supabase.co/storage/v1/object/public/protocol_images/records/445/avatar.png",
          signature: ""
      },
      has_complications: "N",
      record_complications: "",
      castrated_at: "2026-04-06",
      medical_details: {
          is_already_castrated: "N",
          induction_dose: 0.1,
          time_to_sleep: "5",
          has_induction_add: false,
          induction_add_amount: null,
          propofol_used: true,
          propofol_total_ml: 0.6,
          propofol_first_min: 25,
          surgery_duration: "40",
          recovery_time: "50",
          staff_received: "dr_dimitrova",
          staff_released: "yana",
          ear_status: "marked",
          parasites: "none",
          reproductive_status: "post_pregnancy"
      },
      breed: null,
      origin: null,
      status: "released",
      species: "cat",
      bcs_score: null,
      donation: null,
      ear_status: null,
      has_ear_tag: null,
      parasites: null,
      signature: null,
      owner_name: "Нанси Танева",
      owner_phone: "0896160033",
      zona_number: null,
      custom_color: null,
      temperament: null,
      time_to_sleep: null,
      ear_tag_number: null,
      image_preview: null,
      propofol_used: null,
      staff_surgeon: "dr_taneva",
      induction_dose: null,
      outdoor_access: null,
      staff_received: null,
      staff_released: null,
      discovery_source: null,
      has_induction_add: null,
      propofol_total_ml: null,
      surgery_duration: null,
      general_condition: null,
      propofol_first_min: null,
      induction_add_amount: null,
      is_already_castrated: null,
      reproductive_status: null,
      selected_complications: [],
      owner: {
          name: "Нанси Танева",
          phone: "0896160033"
      },
      address: "g.k. Hristo Botev-NorthYuzhen, ul. \"Byalo more\" 5, 4013 Plovdiv, Bulgaria"
    },
  ];


  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl mb-2 font-bold flex items-center gap-3">
              Днес
            </h1>
          </div>
        </div>

        <div className="mt-8 bg-card rounded-lg shadow-warm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Данни животно и собственик</th>
                  <th className="border p-2 text-left">Услуги</th>
                  <th className="border p-2 text-left">кг</th>
                  <th className="border p-2 text-left">пол</th>
                  <th className="border p-2 text-left">Упойка (мл)</th>
                  <th className="border p-2 text-left">Преглед</th>
                  <th className="border p-2 text-left">Операция - таймери</th>
                  <th className="border p-2 text-left">статус</th>
                  <th className="border p-2 text-left">Хирург</th>
                </tr>
              </thead>
              <tbody>
                {animals.map((animal) => (
                  <tr key={animal.id} className="hover:bg-slate-50 transition-colors">
                    <td className="border p-3 min-w-[320px] align-top">
                  <div className="flex flex-col gap-2">
                    
                    {/* 1. ЗАГЛАВИЕ: № и Име */}
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">№{animal.id}</span>
                      <h3 className="font-bold text-sm">
                        - {animal.name}
                      </h3>
                      <button className="hover:opacity-70 transition-opacity">
                        <Icon name="ExternalLink" size={14} color="#e64072" />
                      </button>
                      
                      {/* Дарение - малък дискретен маркер до името */}
                      {animal.data?.donation === 'Y' && (
                        <span className="bg-green-100 text-green-700 text-[9px] font-black px-1 rounded border border-green-200 uppercase">
                          Дарение
                        </span>
                      )}
                    </div>

                    {/* 2. ОСНОВНИ ДАННИ (Вид, Пол, Репродуктивен статус) */}
                    <div className="flex flex-wrap gap-1 items-center text-xs">
                      <span className="font-medium text-slate-500">
                        {speciesOptions.find(opt => opt.value === animal.species)?.label || animal.species}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="font-medium text-slate-500">
                        {genderOptions.find(opt => opt.value === (animal.data?.gender || animal.gender))?.label}
                      </span>
                      
                      {/* РЕПРОДУКТИВЕН СТАТУС - Вече е тук, до пола */}
                      {animal.medical_details?.reproductive_status && animal.medical_details.reproductive_status !== 'none_visible' && (
                        <>
                          <span className="text-slate-400">•</span>
                          <span className="text-pink-600 font-bold bg-pink-50 px-1 rounded animate-pulse">
                            {reproductiveOptions.female.find(opt => opt.value === animal.medical_details.reproductive_status)?.label || 
                            reproductiveOptions.male.find(opt => opt.value === animal.medical_details.reproductive_status)?.label || 
                            animal.medical_details.reproductive_status}
                          </span>
                        </>
                      )}
                    </div>

                    {/* 3. ФИЗИЧЕСКИ ПОКАЗАТЕЛИ (Badges) */}
                    <div className="flex flex-wrap gap-1 mt-1 text-xs">
                      <div 
                          className="w-3.5 h-3.5 rounded-full border"
                          style={{ background: colorStyles[animal.data?.color] || '#ccc', border: '1px solid #000000'}} 
                      />
                      <span className="text-[11px] text-slate-500 self-center font-medium">
                        {colorOptions.find(opt => opt.value === animal.data?.color)?.label || animal.data?.color}
                      </span>
                      <span className="text-slate-400 text-xs">•</span>
                      <span className="text-[11px] text-slate-500 self-center font-medium">
                        {breedOptions.find(opt => opt.value === animal.data?.breed)?.label || animal.data?.breed}
                      </span>
                      <span className="text-slate-400 text-xs">•</span>
                      <div className="text-[11px] text-slate-500 self-center font-medium">
                        {animal.data?.age_value} {ageUnitOptions.find(opt => opt.value === animal.data?.age_unit)?.label}
                      </div>
                    </div>

                    {/* 4. ОПИСАНИЕ (Цвят, Темперамент, Порода) */}
                    <div className="flex flex-wrap gap-1 items-center text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        {spicyOptions.find(opt => opt.id === animal.data?.temperament)?.icon} 
                        {spicyOptions.find(opt => opt.id === animal.data?.temperament)?.desc}
                      </span>
                      <span className="text-slate-400 text-xs">•</span>
                      <div className="flex items-center bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-[11px] font-bold border border-amber-100">
                        BCS: {animal.data?.bcs_score}
                      </div>
                      <span className="text-slate-400 text-xs">•</span>
                      <div className="text-[11px] text-slate-500 self-center font-medium">
                        {animal.data?.weight || '??'} кг
                      </div>
                    </div>

                    {/* 5. СОБСТВЕНИК И ЛОКАЦИЯ */}
                    <div className="mt-2 pt-2 border-t border-slate-100 space-y-1 text-[11px]">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        <Icon name="User" size={12} className="text-slate-400" />
                        {animal.owner?.name || animal.owner_name} 
                        <span className="font-normal text-slate-500">({animal.owner?.phone})</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Icon name="MapPin" size={11} />
                        <span>
                          {cityOptions.find(opt => opt.value === animal.location_city)?.label || animal.location_city}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span>
                          {habitat.find(opt => opt.value === animal.living_condition?.[0])?.label || animal.living_condition}
                        </span>
                      </div>
                    </div>

                  </div>
                </td>

                    <td className="border p-2">
                      {/* Безопасно рендиране на услуги */}
                      {animal.services?.map((s, i) => (
                        <span key={i} className="block text-xs bg-gray-100 mb-1 p-1 rounded">{s}</span>
                      )) || <span className="text-gray-400 text-xs">Стандарт</span>}
                        <Icon name="ExternalLink" size={14} color="#e64072" />
                    </td>

                    <td className="border p-2 font-mono">{animal.data?.weight}</td>
                    
                    <td className="border p-2 text-center">
                        {animal.gender === 'female' ? 'Женски' : 'Мъжки'}
                    </td>

                    <td className="border p-2">
                      {/* Вземаме дозата от правилното място */}
                      <span className='text-gray-400 text-xs'>Kitty magic - </span>
                      <span className="text-blue-600 font-bold">{animal.medical_details?.induction_dose || animal.induction_dose || '---'}
                      </span>
                      <span className='text-gray-400 text-xs'> ml</span>
                    </td>

                    <td className="border p-2 max-w-[150px]">
                      <small className="truncate block">{animal.data?.notes || "Няма бележки"}</small>
                    </td>

                    <td className="border p-2 min-w-[140px]">
                  <div className="flex flex-col gap-1 text-xs">
                    {/* Ред за Индукция */}
                    <div className="flex justify-between items-center bg-slate-100 p-1 rounded">
                      <span>💉 {animal.medical_details?.induction_dose} мл</span>
                      <span className="font-bold text-slate-500">{animal.medical_details?.time_to_sleep}' заспиване</span>
                    </div>

                    {/* Ред за Пропофол - показва се само ако е ползван */}
                    {animal.medical_details?.propofol_used && (
                      <div className="flex justify-between items-center bg-purple-50 text-purple-700 p-1 rounded border border-purple-100">
                        <span className="flex items-center gap-1">✨ Проп: {animal.medical_details?.propofol_total_ml} мл</span>
                        <span className="text-[10px]">на {animal.medical_details?.propofol_first_min}' мин</span>
                      </div>
                    )}

                    {/* Ред за Времетраене */}
                    <div className="flex items-center gap-2 mt-1">
                      <Icon name="Clock" size={12} className="text-blue-500" />
                      <span className="font-bold text-blue-700">{animal.medical_details?.surgery_duration} мин</span>
                      <span className="text-gray-400">|</span>
                      <span className={`${animal.medical_details?.recovery_time > 60 ? 'text-orange-500 font-bold' : 'text-gray-500'}`}>
                        🌅 {animal.medical_details?.recovery_time}'
                      </span>
                    </div>
                  </div>
                </td>

                    <td className="border p-2">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        animal.status === 'released' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {animal.status}
                      </span>
                    </td>

                    <td className="border p-2 text-xs">
                      <p>Приел -
                        {staffOptions.find(opt => opt.value === animal.medical_details?.staff_received)?.label || animal.medical_details?.staff_received}
                      </p>
                      <p className='font-bold'>🩺
                        {staffOptions.find(opt => opt.value === animal?.staff_surgeon)?.label || animal?.staff_surgeon}
                      </p>
                      <p>Върнал - 
                        {staffOptions.find(opt => opt.value === animal.medical_details?.staff_released)?.label || animal.medical_details?.staff_released}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Today;