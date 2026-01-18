import React from "react";
import { cityOptions } from "../../../constants/city_options";
import { breedOptions } from "../../../constants/breed_options";
import {  genderOptions, 
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

const InformedConsent = ({ data }) => {
  if (!data) return null;

  const getLabel = (options, value) => {
    // Ако няма стойност или опции, просто върни празно или тире
    if (!value) return "—"; 
    if (!options || !Array.isArray(options)) return value;

    const found = options.find((opt) => opt.value === value || opt.id === value);
    return found ? found.label : value;
  };

const getLivingConditionsLabel = (conditions) => {
  let condArray = conditions instanceof Set ? Array.from(conditions) : conditions;
  if (!condArray || (Array.isArray(condArray) && condArray.length === 0)) return "—";

  if (Array.isArray(condArray)) {
    return condArray
      .map((key) => {
        // Търсим етикета директно в твоята константа habitat
        const found = habitat.find(h => h.value === key);
        return found ? found.label : key;
      })
      .filter(Boolean)
      .join(", ");
  }
  return condArray;
};

  const currentDate = new Date().toLocaleDateString("bg-BG");

  return (
    <div className="informed-print-container">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-lg font-bold">Ветеринарна клиника „Немски кастрационен център - Пловдив“</h2>
        <div className="h-px bg-black w-full my-4"></div>
        <h3 className="text-md font-semibold">
          Информирано съгласие за кастрация на КОТКА № {data.id || "_______"}
        </h3>
      </div>

      {/* Секция Дарение */}
      <div className="mb-6 p-3 border border-black rounded-sm bg-gray-50/50">
        <div className="flex items-center">
          {/* Квадратче за отметка */}
          <div className="w-5 h-5 border border-black flex items-center justify-center mr-3 bg-white">
            {data.donation === "Y" && (
              <span className="text-black font-bold text-sm">✓</span>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">
              Направено доброволно дарение за дейността на Немски кастрационен център
            </p>
            <p className="text-[10px] text-gray-600 leading-tight">
              (Даренията се използват изцяло за консумативи и грижа за бездомните животни)
            </p>
          </div>
        </div>
      </div>

      {/* Данни за стопанин */}
      <div className="space-y-2 mb-6">
        <p className="font-bold border-b border-gray-200">Данни за стопанин:</p>
        <p>• <strong>Име:</strong> {data.ownerName || "........................."}</p>
        <p>• <strong>Адрес, откъдето е котката:</strong> {getLabel(cityOptions, data.recordCity)}, {data.address}</p>
        <p>• <strong>Телефон:</strong> {data.ownerPhone || "........................."}</p>
      </div>

      {/* Данни за пациента */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6">
        <div className="col-span-2 font-bold border-b border-gray-200 mb-1">Данни за пациента:</div>
        <p>• <strong>Име:</strong> {data.recordName || "......"}</p>
        <p>• <strong>Килограми:</strong> {data.weight ? `${data.weight} кг.` : "......"}</p>
        <p>• <strong>Порода:</strong> {getLabel(breedOptions, data.breed)}</p>
        <p>• <strong>Цвят:</strong> {getLabel(colorOptions, data.color)}</p>
        <p>• <strong>Пол:</strong> {getLabel(genderOptions, data.gender)}</p>
        <p>• <strong>Възраст:</strong> {data.ageValue || "......"} {data.ageUnit === "months" ? "мес." : "год."}</p>
        <p className="col-span-2">• <strong>Къде живее котката:</strong> {getLivingConditionsLabel(data.livingConditions)}</p>
        <p className="col-span-2">• <strong>Има ли достъп навън:</strong> {data.outdoorAccess === "Y" ? "Да" : "Не"}</p>
        <p className="col-span-2">• <strong>Откъде е котката:</strong> {getLabel(origin, data.origin)}</p>
        <p className="col-span-2">• <strong>Общо състояние:</strong> {getLabel(generalConditionOptions, data.generalCondition)}</p>
        <p className="col-span-2">• <strong>Друга информация:</strong> {data.recordNotes || "Няма"}</p>
      </div>

      {/* Правен текст */}
      <div className="text-[12px] space-y-3 text-justify border-t pt-4">
        <p>В качеството си на собственик/упълномощено лице на гореописаното животно декларирам, че съм отговорен за него и имам право да дам това съгласие.</p>
        <p>С настоящата декларация приемам и упълномощавам за медицинско и/или хирургическо лечение екипа на Кастрационния център. Екипът може да назначи лечение, което смята за необходимо.</p>
        <p>Декларирам, че съм напълно запознат и разбирам:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Пълномощията за медицинско и/или хирургическо лечение.</li>
          <li>Причината за хирургическата намеса, нейните предимства и възможни усложнения.</li>
          <li>Съгласен съм да сътруднича с информация и да спазвам контролните прегледи.</li>
          <li>Поемам отговорност при невъзможност за предоставяне на пациента в уговорения час.</li>
          <li>Запознат съм с рисковете от анестезия.</li>
        </ul>
      </div>

      {/* Подписи */}
      <div className="mt-12 flex justify-between items-end border-t pt-4">
        <p><strong>Дата:</strong> {currentDate}</p>
        <div className="text-center">
          <p className="mb-1">...........................................</p>
          <p className="text-xs italic text-gray-500">Подпис на собственика</p>
        </div>
      </div>

      {/* CSS за принтиране */}
            <style>{`
        /* СТРАТЕГИЯ: Вместо display: none, използваме офсет */
        @media screen {
          .informed-print-container {
            position: absolute;
            left: -9999px; /* Изпращаме го далеч наляво, извън екрана */
            top: 0;
          }
        }

        @media print {
          /* 1. Скриваме абсолютно всичко от основния интерфейс */
          body > #root > *:not(.informed-print-container),
          header, 
          form, 
          button, 
          .floating-btn {
            display: none !important;
          }

          /* 2. Показваме само нашия контейнер */
          .informed-print-container {
            position: static !important;
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            color: black !important;
          }

          /* Изчистваме принудително всички фонове и сенки */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-shadow: none !important;
          }

          @page {
            size: A4;
            margin: 1.5cm;
          }
        }
      `}</style>

    </div>
  );
};

export default InformedConsent;