import React, { useState, useEffect } from "react";
import { useLocation, useNavigate   } from "react-router-dom";

import Header                   from "../../components/ui/Header";
import Breadcrumb               from "../../components/ui/Breadcrumb";
import FloatingActionButton     from "../../components/ui/FloatingActionButton";
import Input                    from "../../components/ui/Input";
import Select                   from "../../components/ui/Select";
import Button                   from "../../components/ui/Button";
import { Checkbox }             from "../../components/ui/Checkbox";

import FormSection              from "./components/FormSection";
import MapPreview               from "./components/MapPreview";
import SuccessModal             from "./components/SuccessModal";
import { cityOptions          } from "../../constants/city_options";
import { breedOptions         } from "../../constants/breed_options";
import InformedConsent          from "./components/informed_consent";

import { $apiCreateNewRecord  } from "../../services/create_new_record";
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
          } from "../../constants/formOptions";

import { mapRecordToForm, defaultFormData } from "./utils/formMapper";
import Autocomplete                         from "react-google-autocomplete";
import { usePlacesWidget }                  from "react-google-autocomplete";
import supabase                             from "../../utils/supabase";
import SignatureCanvas                      from 'react-signature-canvas';
import { useRef }                           from 'react';
import If                                   from "components/If";
import { findDistrict }                     from "../../constants/zona_find";

const CatRegistrationForm = () => {

const navigate = useNavigate();
  const location = useLocation(); 

  // Вземаме данните от навигацията
  const editingData = location.state?.catData;
  const [isEditing, setIsEditing] = useState(!!location.state?.isEditing);

  // ГЛАВНО: Инициализираме formData директно през мапера
  const [formData, setFormData] = useState(() => mapRecordToForm(editingData));
  const [mapUrl, setMapUrl]     = useState('AIzaSyCSyjPTq09LYc7lcBxotOnv-KBTiEfNbOI');


  useEffect(() => {
    fetch(`https://mihail-petrov.me/apimap/index.php`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setMapUrl(data.mapUrl))
      .catch(() => console.log("Using default API key"));
  }, []); // Празен масив = изпълнява се само при "Mount"


  const getCoordinates = async (city, address) => {
    // Търсим само по чистия адрес, за да не объркваме Google с името на града в низа
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&components=locality:${encodeURIComponent(city)}|country:BG&key=${mapUrl}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK') {
        const location = data.results[0].geometry.location;
        return { 
          lat: location.lat, 
          lng: location.lng,
          address: address 
        };
      } else {
        console.error("Geocoding Status Error:", data.status);
        return null;
      }
    } catch (error) {
      console.error("Грешка при връзка с Google Geocoding:", error);
      return null;
    }
  };

  useEffect(() => {

    if (editingData) {
      const mappedData = mapRecordToForm(editingData);
      setFormData(mappedData);
      // console.log("Данни за редактиране (mapped):", mappedData);
    }
  }, [editingData]);

  useEffect(() => {
    if (isEditing) return; // Не пипаме автоматично, ако редактираме

    const dose = formData.gender === "female" ? "0.11" : "0.12";
    handleInputChange("inductionDose", dose);
    
    if (!formData.reproductiveStatus) {
      handleInputChange("reproductiveStatus", "none_visible");
    }
  }, [formData.gender]); // Гледа само пола

  useEffect(() => {
    // Ако няма град или адрес, или АКО ВЕЧЕ ИМАМЕ ЗОНА (за да не преизчисляваме Autocomplete-а), излизаме
    if (!formData.recordCity || !formData.address || formData.zonaNumber) return;

    const timer = setTimeout(async () => {
      setIsValidatingAddress(true);
      const coords = await getCoordinates(formData.recordCity, formData.address);
      
      if (coords) {
        // 1. Намираме зоната
        const detectedZone = findDistrict(coords.lat, coords.lng);
        
        // 2. Обновяваме всичко наведнъж, за да не тригърваме useEffect пак
        setFormData(prev => ({
          ...prev,
          coords: { lat: coords.lat, lng: coords.lng },
          zonaNumber: detectedZone
        }));
      }
      setIsValidatingAddress(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData.recordCity, formData.address, formData.zonaNumber]); // Добавяме zonaNumber тук

  // Автоматично намиране на име на собственик по телефонен номер
  useEffect(() => {
    // Проверяваме само ако телефонът е поне 6 цифри (за да не правим заявки за всяка цифра)
    if (formData.ownerPhone && formData.ownerPhone.length >= 6 && !isEditing) {
      const timer = setTimeout(async () => {
        try {
          const { data, error } = await supabase
            .from('td_owners') // Провери дали таблицата ти се казва така (или 'owners')
            .select('name')
            .eq('phone', formData.ownerPhone)
            .maybeSingle();

          if (data && data.name && !formData.ownerName) {
            // Ако намерим име и полето за име в момента е празно - попълваме го
            handleInputChange("ownerName", data.name);
          }
        } catch (err) {
          console.error("Грешка при търсене на собственик:", err);
        }
      }, 800); // Изчакваме 0.8 сек след спиране на писането (Debounce)

      return () => clearTimeout(timer);
    }
  }, [formData.ownerPhone]);


  // Обекти за изчисленият на бутоните
  const [stamps, setStamps] = useState({
    injectedAt: null,
    fellAsleepAt: null,
    surgeryStartedAt: null,
    propofolClicks: 0
  });

  const getDiffInMinutes = (start, end) => {
    if (!start || !end) return 0;
    const diffMs = end - start;
    return Math.round(diffMs / 60000); // превръща милисекунди в минути
  };

  const SignatureSection = ({ onSaveSignature }) => {
    const sigCanvas = useRef({});

    // Вече няма handleEnd, който се вика автоматично
    const confirmSignature = () => {
      if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
        const data = sigCanvas.current.getCanvas().toDataURL('image/png');
        onSaveSignature(data); // Записваме само когато натиснем бутона
      }
    };

    const clear = () => {
      sigCanvas.current.clear();
      onSaveSignature(null);
    };

    return (
      <div className="space-y-4">
        <div className="border-2 border-dashed border-slate-300 rounded-md bg-white">
          <SignatureCanvas 
            ref={sigCanvas}
            canvasProps={{
              className: 'signature-canvas w-full h-40',
            }} 
          />
        </div>
        <div className="flex gap-2">
          <button 
            type="button" 
            onClick={confirmSignature}
            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-green-700"
          >
            Потвърди подписа
          </button>
          <button 
            type="button" 
            onClick={clear}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm"
          >
            Изчисти
          </button>
        </div>
      </div>
    );
  };

  const [isPrinting, setIsPrinting] = useState(false);


  const [errors               , setErrors               ] = useState({});
  const [isValidatingAddress  , setIsValidatingAddress  ] = useState(false);
  const [isSubmitting         , setIsSubmitting         ] = useState(false);
  const [showSuccessModal     , setShowSuccessModal     ] = useState(false);
  const [registeredCatData    , setRegisteredCatData    ] = useState(null);

  const breadcrumbItems = [
    { label: "Табло"              , path: "/dashboard-overview" },
    { label: "Нова регистрация"   , path: "/cat-registration-form" },
  ];

  const handleImageChange = (e) => {

    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Моля, изберете валиден графичен файл.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file), // Създава временен линк за преглед
      }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleParasiteChange = (parasiteId) => {
    let currentParasites = Array.isArray(formData.parasites) ? [...formData.parasites] : [];
    
    // Ако изберем "Няма видими", изчистваме всичко останало
    if (parasiteId === 'none') {
      currentParasites = ['none'];
    } else {
      // Ако изберем нещо друго, махаме "Няма видими" от списъка
      currentParasites = currentParasites.filter(p => p !== 'none');
      
      if (currentParasites.includes(parasiteId)) {
        currentParasites = currentParasites.filter(p => p !== parasiteId);
      } else {
        currentParasites.push(parasiteId);
      }
    }
    
    handleInputChange("parasites", currentParasites);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.gender) {
      newErrors.gender = "Изберете пол";
    }

    if (!formData?.ageValue) {
      newErrors.ageValue = "Въведете възраст";
    } else if (parseInt(formData.ageValue) <= 0) {
      newErrors.ageValue = "Възрастта трябва да е положително число";
    } else if (
      formData.ageUnit === "months" &&
      parseInt(formData.ageValue) > 24
    ) {
      newErrors.ageValue = "Невалидна възраст в месеци";
    }

    // if (!formData?.color) {
    //   newErrors.color = "Изберете цвят";
    // }

    // if (formData?.color === "custom" && !formData?.customColor?.trim()) {
    //   newErrors.customColor = "Въведете цвят";
    // }

    if (!formData?.address?.trim()) {
      newErrors.address = "Въведете адрес";
    }

    // if (!formData?.recordCity) {
    //   newErrors.recordCity = "Изберете населено място";
    // }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Вече подаваме директно formData.id, което дойде от мапера
    $apiCreateNewRecord(formData, isEditing, formData.id)
      .then(() => {
        setRegisteredCatData({ ...formData, registeredAt: new Date().toISOString() });
        setIsSubmitting(false);
        setShowSuccessModal(true);
      })
      .catch((err) => {
        console.error("Грешка при запис:", err);
        setIsSubmitting(false);
      });
  };

  const handleSuccessModalClose = (state) => {
    setShowSuccessModal(false);

    if (state == "close") {
      setFormData(defaultFormData);
    }

    if (state == "same_owner") {
      setIsEditing(false)
      setFormData({
        ...defaultFormData,
        ownerName: formData.ownerName,
        ownerPhone: formData.ownerPhone,
        donation: formData.donation
      });
      navigate(location.pathname, { replace: true, state: {} }); // <--- ТОВА ИЗЧИСТВА ID-то от паметта на браузъра
    }
  };

  const isFormValid = () => {
    return true;
  };

  const onCheckLocation = (id) => {
    setFormData(prev => {
      const currentConditions = new Set(prev.livingCondition || []);
      if (currentConditions.has(id)) {
        currentConditions.delete(id);
      } else {
        currentConditions.add(id);
      }
      return {
        ...prev,
        livingCondition: Array.from(currentConditions)
      };
    });
  };

  /**
   * 
   * @param {*} key 
   * @param {*} value 
   */
  const processRadio = (key, value) => {

    console.log(key);
    console.log(value);

    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <Breadcrumb items={breadcrumbItems} />

          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-2">
                {isEditing 
                  ? `Редактиране на ${formData.recordName || 'котка'}` 
                  : "Регистрация на животно"}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
                {isEditing 
                  ? "Променете данните за избраното животно." 
                  : "Полетата от формата са опционални и ще ни помогнат за по-пълен регистър."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-6 md:space-y-8">
                <FormSection title="Лице за контакти / Собственик" className="bg-[#e64072]/20 rounded-[20px] p-3">
                  <Input
                    label="Име"
                    type="text"
                    placeholder="Име и фамилия:"
                    required
                    value={formData?.ownerName}
                    onChange={(e) =>
                      handleInputChange("ownerName", e?.target?.value)
                    }
                    error={errors?.ownerName}
                  />

                  <Input
                    label="Номер за кореспонденция"
                    type="tel"
                    placeholder="Телефонен номер:"
                    required
                    value={formData?.ownerPhone}
                    onChange={(e) =>
                      handleInputChange("ownerPhone", e?.target?.value)
                    }
                    error={errors?.ownerPhone}
                  />

                  <label className="text-sm font-medium mb-3 block text-foreground">
                    Оставено ли бе дарение?
                  </label>
                  
                  <div className="flex gap-4 mb-4">
                    <button
                      type="button"
                      onClick={() => handleInputChange("donation", "N")}
                      className={`px-4 py-2 rounded-md border transition-colors ${formData.donation === 'N' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-white text-slate-600'}`}
                    >
                      Не
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange("donation", "Y")}
                      className={`px-4 py-2 rounded-md border transition-colors ${formData.donation === 'Y' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-white text-slate-600'}`}
                    >
                      Да
                    </button>
                  </div>

                </FormSection>

                <FormSection title="Основна информация">
                  <div className="bg-[#e64072]/20 rounded-[20px] p-3">
                    <Input
                      label="Име на животното"
                      type="text"
                      placeholder="Как лицето за контакт нарича животното"
                      value={formData?.recordName}
                      onChange={(e) =>
                        handleInputChange("recordName", e?.target?.value)
                      }
                      error={errors?.recordName}
                    />

                    <label className="block text-sm font-medium text-slate-700 mb-2">Пол</label>
                    <div className="flex justify-between items-center gap-2 mb-6">
                      <button
                        type="button"
                        onClick={() => handleInputChange("gender", "female")}
                        className={`flex-1 py-3 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${
                          formData?.gender === 'female' 
                          ? "bg-secondary text-white ring-2 ring-offset-2 ring-secondary scale-105 z-10" 
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        <span className="text-base">♀️</span> Женски
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleInputChange("gender", "male")}
                        className={`flex-1 py-3 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${
                          formData?.gender === 'male' 
                          ? "bg-primary text-white ring-2 ring-offset-2 ring-primary scale-105 z-10" 
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        <span className="text-base">♂️</span> Мъжки
                      </button>
                    </div>

                    {errors?.gender && (
                      <p className="text-xs text-red-500 mt-[-1rem] mb-4">{errors.gender}</p>
                    )}

                    <label className="block text-sm font-medium text-slate-700 mb-2">Вид животно</label>
                    <div className="flex justify-between items-center gap-2 mb-6">
                      <button
                        type="button"
                        onClick={() => handleInputChange("species", "cat")}
                        className={`flex-1 py-3 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${
                          formData?.species === 'cat' 
                          ? "bg-primary text-white ring-2 ring-offset-2 ring-primary scale-105 z-10" 
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        <span className="text-base">🐱</span> Котка
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInputChange("species", "dog")}
                        className={`flex-1 py-3 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${
                          formData?.species === 'dog' 
                          ? "bg-primary text-white ring-2 ring-offset-2 ring-primary scale-105 z-10" 
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        <span className="text-base">🐶</span> Куче
                      </button>
                    </div>

                    {formData?.species === 'dog' && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                        <label className="block text-sm font-bold text-blue-800 mb-3">
                          Ушна марка (за кучета)
                        </label>
                        
                        <div className="flex gap-4 mb-4">
                          <button
                            type="button"
                            onClick={() => handleInputChange("hasEarTag", "Y")}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                              formData.hasEarTag === "Y" 
                              ? "bg-blue-600 text-white" 
                              : "bg-white text-slate-600 border border-slate-200"
                            }`}
                          >
                            Поставена
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleInputChange("hasEarTag", "N");
                              handleInputChange("earTagNumber", ""); // Изчистваме номера, ако няма марка
                            }}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                              formData.hasEarTag === "N" 
                              ? "bg-blue-600 text-white" 
                              : "bg-white text-slate-600 border border-slate-200"
                            }`}
                          >
                            Не е поставена
                          </button>
                        </div>

                        {formData.hasEarTag === "Y" && (
                          <div className="animate-in fade-in slide-in-from-top-2">
                            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">
                              Номер на ушна марка
                            </label>
                            <input
                              type="text"
                              value={formData.earTagNumber}
                              onChange={(e) => handleInputChange("earTagNumber", e.target.value)}
                              placeholder="Въведете номер..."
                              className="w-full p-2 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                            />
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                  
                  <Input
                    label="Тегло (в килограми)"
                    type="number"
                    placeholder="Въведете теглото"
                    min="0.1"
                    max="50"
                    step="0.1"
                    value={formData?.weight}
                    onChange={(e) =>
                      handleInputChange("weight", e?.target?.value)
                    }
                    error={errors?.weight}
                  />
                  
                  <label>Телесно състояние (BCS 1-9)</label>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center gap-1">
                      {bcsScores.map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => handleInputChange("bcsScore", score.toString())}
                          className={`flex-1 py-3 text-sm font-bold rounded-md transition-all ${
                            formData.bcsScore === score.toString()
                              ? "bg-primary text-white ring-2 ring-offset-2 ring-primary scale-110"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                    
                    {/* Описанието вече се генерира от функцията в formOptions */}
                    {formData.bcsScore && (
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                        <p className={`font-medium ${getBcsDescription(formData.bcsScore).class}`}>
                          {getBcsDescription(formData.bcsScore).text}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-[#e64072]/20 rounded-[20px] p-3">
                    <Input 
                      label="Възраст"
                      type="number"
                      placeholder="Напр. 4"
                      required
                      min="1"
                      max={formData.ageUnit === "months" ? 24 : 30}
                      step="1"
                      value={formData.ageValue}
                      onChange={(e) =>
                        handleInputChange("ageValue", e.target.value)
                      }
                      error={errors?.ageValue}
                    />

                    <Select
                      label="Единица"
                      options={ageUnitOptions}
                      value={formData.ageUnit}
                      onChange={(value) => handleInputChange("ageUnit", value)}
                    />
                  </div>

                  <Select
                    label="Порода на котката"
                    placeholder="Изберете порода"
                    searchable
                    options={breedOptions}
                    value={formData.breed}
                    onChange={(value) => handleInputChange("breed", value)}
                    error={errors?.breed}
                  />

                  <Select
                    label="Цвят на козината"
                    placeholder="Изберете цвят"
                    options={colorOptions}
                    value={formData?.color}
                    onChange={(value) => handleInputChange("color", value)}
                    error={errors?.color}
                  />

                  <Input
                    label="Бележки"
                    type="text"
                    placeholder="Открити заболявания, недъзи и др..."
                    value={formData?.recordNotes}
                    onChange={(e) =>
                      handleInputChange("recordNotes", e?.target?.value)
                    }
                    error={errors?.recordNotes}
                  />

                  {formData?.color === "custom" && (
                    <Input
                      label="Custom Color"
                      type="text"
                      placeholder="Describe the cat's color"
                      required
                      value={formData?.customColor}
                      onChange={(e) =>
                        handleInputChange("customColor", e?.target?.value)
                      }
                      error={errors?.customColor}
                      description="Provide a detailed description of the cat's color"
                    />
                  )}
                </FormSection>
                
                <FormSection title="Темперамент (Spicy Scale)">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {spicyOptions.map((opt) => {
                      // Проверка дали този квадрат е избран в момента
                      const isSelected = formData.temperament === opt.id;

                      return (
                        <button
                          key={opt.id}
                          type="button" // ЗАДЪЛЖИТЕЛНО: предотвратява презареждане на страницата
                          onClick={() => handleInputChange("temperament", opt.id)}
                          className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 h-32 cursor-pointer ${
                            isSelected
                              ? `${opt.color} ${opt.bg} shadow-md scale-105 ring-2 ring-offset-1 ring-opacity-50`
                              : "border-slate-200 bg-white hover:border-slate-300 shadow-sm opacity-70 hover:opacity-100"
                          }`}
                        >
                          <span className="text-3xl mb-2">{opt.icon}</span>
                          <span className={`text-xs font-black ${isSelected ? "text-foreground" : "text-slate-500"}`}>
                            {opt.label}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase mt-1 text-center">
                            {opt.desc}
                          </span>
                          
                          {/* Визуален индикатор за избор */}
                          {isSelected && (
                            <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full text-white flex items-center justify-center text-[10px] shadow-sm ${opt.active.replace('bg-', 'bg-')}`}>
                              ✓
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </FormSection>

                <FormSection title="Къде е намерено / отглеждано животното" className="bg-[#e64072]/20 rounded-[20px] p-3">
                  <Select
                    label="Град / село"
                    placeholder="Започнете да пишете град или село..."
                    required
                    searchable
                    options={cityOptions}
                    value={formData?.recordCity}
                    onChange={(value) => handleInputChange("recordCity", value)}
                    error={errors?.recordCity}
                  />
                  <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Адрес</label>
                        <If condition={mapUrl}>
                          <Autocomplete
                            apiKey={mapUrl}
                            onPlaceSelected={(place) => {
                              console.log(place)
                              if (!place.geometry) return;
                              const lat = place.geometry.location.lat();
                              const lng = place.geometry.location.lng();
                              const detectedZone = findDistrict(lat, lng);
                              // 2. Спираме лоудинг индикатора веднага
                              setIsValidatingAddress(false); 

                              // 3. Обновяваме формата
                              setFormData((prev) => ({
                                ...prev,
                                address: place.formatted_address,
                                coords: { lat, lng },
                                zonaNumber: detectedZone
                              }));
                            }}
                            options={{
                              componentRestrictions: { country: "bg" },
                              types: [], 
                              fields: ["address_components", "geometry", "formatted_address"]
                            }}
                            // Тук ползваме твоите CSS класове за еднакъв дизайн
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Започнете да пишете адрес..."
                            defaultValue={formData?.address}
                          />
                        </If>
                    {errors?.address && <p className="text-xs text-destructive">{errors.address}</p>}
                  </div>

                  <div className="mt-4">
                    <label className="text-sm font-medium text-foreground">Идентифицирана Зона</label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-slate-100 px-3 py-2 text-sm font-bold text-pink-600">
                      {formData?.zonaNumber || "Търсене на зона..."}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 italic">
                      *Зоната се определя автоматично според картата на Пловдив
                    </p>
                  </div>

                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block text-foreground">
                    Къде живее
                  </label>

                  <Checkbox
                    label="на улицата"
                    onChange={(e) => onCheckLocation("street")}
                    checked={formData.livingCondition?.includes("street")}
                  />
                  <Checkbox
                    label="на двора"
                    onChange={(e) => onCheckLocation("outdoor")}
                    checked={formData.livingCondition?.includes("outdoor")}
                  />
                  <Checkbox
                    label="в дома"
                    onChange={(e) => onCheckLocation("indoor")}
                    checked={formData.livingCondition?.includes("indoor")}
                  />

                  {/* Достъп навън */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium block text-foreground">Има ли достъп навън?</label>
                    <div className="flex gap-4">
                      {[{ v: "Y", l: "Да" }, { v: "N", l: "Не" }].map((opt) => (
                        <button
                          key={opt.v}
                          type="button"
                          onClick={() => handleInputChange("outdoorAccess", opt.v)}
                          className={`flex-1 py-2 rounded-md border transition-all ${
                            formData.outdoorAccess === opt.v 
                            ? "bg-primary text-white border-primary shadow-sm" 
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {opt.l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Произход */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium block text-foreground">Откъде е животното?</label>
                    <div className="flex gap-4">
                      {origin.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleInputChange("origin", opt.value)}
                          className={`flex-1 py-2 rounded-md border transition-all ${
                            formData.origin === opt.value 
                            ? "bg-primary text-white border-primary shadow-sm" 
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                </FormSection>
                
                <FormSection title="Сегашен статус и отчетност">

                  {/* Общо състояние */}
                  <Select
                    label="Общо състояние"
                    options={generalConditionOptions}
                    value={formData.generalCondition}
                    onChange={(value) => handleInputChange("generalCondition", value)}
                  />

                  {/* СТАТУС В РЕАЛНО ВРЕМЕ */}
                  <div className="mb-6">
                    <label className="text-sm font-medium mb-3 block text-foreground">Статус на животното</label>
                    <div className="flex flex-wrap gap-2">
                        {statusOptions.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handleInputChange("status", s.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                            formData.status === s.id ? `${s.color} border-current ring-2 ring-offset-1 ring-current` : 'bg-white border-slate-200 text-slate-400'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ПЕРСОНАЛ */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Select
                      className="bg-[#e64072]/20 rounded-[20px] p-3"
                      label="Приел"
                      options={staffOptions}
                      value={formData.staffReceived}
                      onChange={(val) => handleInputChange("staffReceived", val)}
                    />
                    <Select
                      label="Оперирал"
                      options={staffOptions}
                      value={formData.staffSurgeon}
                      onChange={(val) => handleInputChange("staffSurgeon", val)}
                    />
                    <Select
                      label="Издал"
                      options={staffOptions}
                      value={formData.staffReleased}
                      onChange={(val) => handleInputChange("staffReleased", val)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Маркировка на ухото</label>
                    <div className="grid grid-cols-2 gap-2 border p-3 rounded-md bg-slate-50/50">
                      {earStatusOptions.map((opt) => (
                        <Checkbox 
                          key={opt.id}
                          label={opt.label} 
                          checked={formData.earStatus === opt.id} 
                          onChange={() => handleInputChange("earStatus", opt.id)} 
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium block">Паразити</label>
                    <div className="grid grid-cols-2 gap-2 border p-3 rounded-md bg-slate-50/50">
                      {parasiteOptions.map((opt) => (
                        <Checkbox 
                          key={opt.id}
                          label={opt.label} 
                          checked={Array.isArray(formData.parasites) && formData.parasites.includes(opt.id)} 
                          onChange={() => handleParasiteChange(opt.id)} 
                        />
                      ))}
                    </div>
                  </div>

                  {/* ПОЛОВ СТАТУС - Динамичен спрямо пола */}
                    {(formData.gender === 'female' || formData.gender === 'male') && (
                      <div className="animate-in slide-in-from-right-2 duration-300">
                        <Select
                          label="Репродуктивен статус"
                          // Тук вземаме списъка според избрания пол: female или male
                          options={reproductiveOptions[formData.gender]} 
                          value={formData.reproductiveStatus}
                          onChange={(val) => handleInputChange("reproductiveStatus", val)}
                          placeholder="Изберете статус..."
                        />
                      </div>
                    )}
                </FormSection>

                <FormSection title="Откъде разбрахте за нас?">
                  {/* Източник на информация */}
                  <Select
                    label="Откъде разбрахте за нас?"
                    placeholder="Изберете източник"
                    options={discoverySourceOptions}
                    value={formData.discoverySource}
                    onChange={(value) => handleInputChange("discoverySource", value)}
                  />
                </FormSection>

                <FormSection title="Дата на кастрация">
                  <Input
                    type="date"
                    value={formData?.castratedAt || ''}
                    onChange={(e) => handleInputChange("castratedAt", e?.target?.value)}
                    error={errors?.castratedAt}
                  />

                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block text-foreground">
                    Животното беше ли вече кастрирана?
                  </label>

                  <div className="flex gap-4 mb-4">
                    <button
                      type="button"
                      onClick={() => handleInputChange("isAlreadyCastrated", "N")}
                      className={`px-6 py-2 rounded-md border transition-all ${
                        formData.isAlreadyCastrated === 'N' 
                          ? 'bg-slate-100 border-slate-500 text-slate-700 font-bold' 
                          : 'bg-white text-slate-400 border-slate-200'
                      }`}
                    >
                      Не
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleInputChange("isAlreadyCastrated", "Y")}
                      className={`px-6 py-2 rounded-md border transition-all ${
                        formData.isAlreadyCastrated === 'Y' 
                          ? 'bg-blue-100 border-blue-500 text-blue-700 font-bold' 
                          : 'bg-white text-slate-400 border-slate-200'
                      }`}
                    >
                      Да
                    </button>
                  </div>
                </FormSection>
                
                <FormSection title="Анестезиологичен протокол">
                  {/* ИНДУКЦИЯ */}
                  <div className="space-y-4 p-4 border rounded-lg bg-slate-50/50">
                    <h3 className="font-medium text-sm text-slate-700 uppercase tracking-wider">Индукция (TMB - Коктейл)</h3>
                    
                    <Input
                      label="Индукционна доза (мл)"
                      type="number"
                      step="0.01"
                      placeholder="Напр. 0.11"
                      value={formData.inductionDose}
                      onChange={(e) => handleInputChange("inductionDose", e.target.value)}
                    />


                    <Input
                      label="След колко минути заспа животното?"
                      type="number"
                      step="0.5"
                      placeholder="Напр. 5 мин"
                      value={formData.timeToSleep}
                      onChange={(e) => handleInputChange("timeToSleep", e.target.value)}
                    />

                    <Checkbox
                      label="Наложи ли се добавяне на индукция (ре-индукция)?"
                      checked={formData.hasInductionAdd}
                      onChange={() => handleInputChange("hasInductionAdd", !formData.hasInductionAdd)}
                    />

                    {formData.hasInductionAdd && (
                      <Input
                        label="Колко мл бе добавката?"
                        type="number"
                        step="0.05"
                        placeholder="Допълнително количество в мл"
                        value={formData.inductionAddAmount}
                        onChange={(e) => handleInputChange("inductionAddAmount", e.target.value)}
                      />
                    )}
                  </div>

                  {/* ПОДДРЪЖКА */}
                  <div className="space-y-4 p-4 border rounded-lg bg-blue-50/30">
                    <h3 className="font-medium text-sm text-blue-700 uppercase tracking-wider">Поддръжка (Пропофол)</h3>
                    
                    <Checkbox
                      label="Използван ли е Пропофол по време на операция?"
                      checked={formData.propofolUsed}
                      onChange={() => handleInputChange("propofolUsed", !formData.propofolUsed)}
                    />

                    {formData.propofolUsed && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                        <Input
                          label="Общо Пропофол (ml)"
                          type="number"
                          step="0.1"
                          placeholder="Общо мл"
                          value={formData.propofolTotalMl}
                          onChange={(e) => handleInputChange("propofolTotalMl", e.target.value)}
                        />
                        <Input
                          label="Първо добавяне (мин)"
                          type="number"
                          placeholder="На коя минута?"
                          value={formData.propofolFirstMin}
                          onChange={(e) => handleInputChange("propofolFirstMin", e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  {/* ВРЕМЕТРАЕНЕ - Ключово за анализа */}
                  <Input
                    label="Продължителност на операцията (минути)"
                    type="number"
                    placeholder="От първия разрез до последния шев"
                    value={formData.surgeryDuration}
                    onChange={(e) => handleInputChange("surgeryDuration", e.target.value)}
                    iconName="Clock"
                  />

                  {/* ВРЕМЕТРАЕНЕ - Ключово за анализа */}
                  <Input
                    label="Възстановяване (sternal recumbency)"
                    type="number"
                    placeholder="Кога ЖВ се изправи?"
                    value={formData.recoveryTime}
                    onChange={(e) => handleInputChange("recoveryTime", e.target.value)}
                    iconName="Clock"
                  />
                </FormSection>

                <FormSection title="Анестезиологичен протокол (Интерактивен)">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                    
                    {/* Бутон БОЦНАХ */}
                    <button
                      type="button"
                      onClick={() => setStamps(p => ({...p, injectedAt: new Date()}))}
                      className={`p-7 rounded-lg border-2 flex flex-col items-center ${stamps.injectedAt ? 'border-green-500 bg-green-50' : 'border-slate-200'}`}
                    >
                      <span className="text-xs uppercase font-bold text-slate-500">Боцнах</span>
                      <div className="text-lg font-mono">{stamps.injectedAt ? stamps.injectedAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</div>
                    </button>

                    {/* Бутон ЗАСПА */}
                    <button
                      type="button"
                      disabled={!stamps.injectedAt}
                      onClick={() => {
                        const now = new Date();
                        const mins = getDiffInMinutes(stamps.injectedAt, now);
                        handleInputChange("timeToSleep", mins);
                        setStamps(p => ({...p, fellAsleepAt: now}));
                      }}
                      className="p-7 rounded-lg border-2 border-slate-200 active:bg-slate-100 disabled:opacity-50"
                    >
                      <span className="text-xs uppercase font-bold text-slate-500">Заспа</span>
                      <div className="text-sm font-semibold">{formData.timeToSleep ? `${formData.timeToSleep} мин` : 'Натисни'}</div>
                    </button>

                    {/* Бутон НАЧАЛО ОПЕРАЦИЯ */}
                    <button
                      type="button"
                      onClick={() => setStamps(p => ({...p, surgeryStartedAt: new Date()}))}
                      className="p-7 rounded-lg border-2 border-blue-200 bg-blue-50 text-blue-700"
                    >
                      <span className="text-xs uppercase font-bold">Начало</span>
                      <div className="text-lg font-mono">{stamps.surgeryStartedAt ? stamps.surgeryStartedAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</div>
                    </button>

                    {/* Бутон КРАЙ ОПЕРАЦИЯ */}
                    <button
                      type="button"
                      disabled={!stamps.surgeryStartedAt}
                      onClick={() => {
                        const mins = getDiffInMinutes(stamps.surgeryStartedAt, new Date());
                        handleInputChange("surgeryDuration", mins);
                      }}
                      className="p-7 rounded-lg border-2 border-red-100 bg-red-50 text-red-700 disabled:opacity-50"
                    >
                      <span className="text-xs uppercase font-bold">Край</span>
                      <div className="text-sm font-semibold">{formData.surgeryDuration ? `${formData.surgeryDuration} мин` : 'Засечи'}</div>
                    </button>

                    {/* Бутон ПРОПОФОЛ */}
                    <button
                      type="button"
                      onClick={() => {
                        const newCount = stamps.propofolClicks + 1;
                        const total = (newCount * 0.3).toFixed(1);
                        setStamps(p => ({...p, propofolClicks: newCount}));
                        handleInputChange("propofolUsed", true);
                        handleInputChange("propofolTotalMl", total);
                        if (newCount === 1 && stamps.fellAsleepAt) {
                          handleInputChange("propofolFirstMin", getDiffInMinutes(stamps.fellAsleepAt, new Date()));
                        }
                      }}
                      className="p-7 rounded-lg border-2 border-purple-200 bg-purple-50 text-purple-700"
                    >
                      <span className="text-xs uppercase font-bold">Пропофол ({stamps.propofolClicks})</span>
                      <div className="text-sm font-semibold">{formData.propofolTotalMl || 0} мл</div>
                    </button>

                    {/* Бутон СЪБУДИ СЕ */}
                    <button
                      type="button"
                      disabled={!stamps.injectedAt}
                      onClick={() => {
                        const mins = getDiffInMinutes(stamps.injectedAt, new Date());
                        handleInputChange("recoveryTime", mins);
                      }}
                      className="p-7 rounded-lg border-2 border-orange-100 bg-orange-50 text-orange-700"
                    >
                      <span className="text-xs uppercase font-bold">Събуди се</span>
                      <div className="text-sm font-semibold">{formData.recoveryTime ? `${formData.recoveryTime} мин` : 'Засечи'}</div>
                    </button>
                  </div>
                </FormSection>

                <FormSection title="Медицински усложнения">
                  <label className="text-sm font-medium mb-3 block text-foreground">
                    Имаше ли усложнения?
                  </label>
                  
                  <div className="flex gap-4 mb-4">
                    <button
                      type="button"
                      onClick={() => handleInputChange("hasComplications", "N")}
                      className={`px-4 py-2 rounded-md border transition-colors ${formData.hasComplications === 'N' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-white text-slate-600'}`}
                    >
                      Не
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange("hasComplications", "Y")}
                      className={`px-4 py-2 rounded-md border transition-colors ${formData.hasComplications === 'Y' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-white text-slate-600'}`}
                    >
                      Да
                    </button>
                  </div>

                  {formData.hasComplications === 'Y' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {/* ВНИМАНИЕ: Тук е фиксът - ползваме .general, а не целия обект */}
                        {[...(complicationOptions[formData.gender] || []), ...complicationOptions.general].map((comp) => (
                          <label key={comp.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={(formData.selectedComplications || []).includes(comp.id)}
                              onChange={(e) => {
                                const current = formData.selectedComplications || [];
                                const updated = e.target.checked 
                                  ? [...current, comp.id] 
                                  : current.filter(item => item !== comp.id);
                                handleInputChange("selectedComplications", updated);
                              }}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-slate-700">{comp.label}</span>
                          </label>
                        ))}
                      </div>

                      <Input
                        label="Допълнителни бележки към усложненията"
                        placeholder="Опишете детайли (напр. колко мл кръв, как е овладяно)..."
                        value={formData.recordComplications}
                        onChange={(e) => handleInputChange("recordComplications", e.target.value)}
                      />
                    </div>
                  )}
                </FormSection>

                <FormSection title="Валидиране на протокола">
                  <SignatureSection 
                    // Използваме съществуващата функция за промяна на данни
                    onSaveSignature={(data) => handleInputChange("signature", data)} 
                  />
                  {formData.signature && (
                    <p className="text-xs text-green-600 mt-2">✓ Подписът е приет дигитално</p>
                  )}
                </FormSection>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    type="submit"
                    variant="default"
                    fullWidth
                    disabled={!isFormValid() || isSubmitting}
                    loading={isSubmitting}
                    iconName="CheckCircle2"
                    iconPosition="left"
                  >
                    {isEditing ? "Редактирай ЖВ" : "Регистрирай ЖВ"}
                    {/* {isSubmitting ? "Регистрираме..." : "Регистрирай ЖВ"} */}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    onClick={handleSuccessModalClose}
                    disabled={isSubmitting}
                  >
                    Изчисти
                  </Button>

                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => window.print()}
                    >
                    🖨️ Принтирай Протокол
                  </Button>
                </div>
              </div>

              <div className="lg:sticky lg:top-24 lg:self-start">
                <FormSection
                  title="Карта на адреса"
                  description="Каква е локацията на животното"
                >
                  <MapPreview
                    address={formData?.address}
                    coordinates={formData?.coords}
                    isValidating={isValidatingAddress}
                  />
                </FormSection>

                <FormSection title="Снимка на животното">
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-muted-foreground/25">
                        {formData.imagePreview ? (
                          <img
                            src={formData.imagePreview}
                            alt="Preview"
                            className="h-full w-full object-contain rounded-lg"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg
                              className="w-8 h-8 mb-4 text-muted-foreground"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">
                                Кликни за качване
                              </span>{" "}
                              или влачи снимка
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PNG, JPG или WebP
                            </p>
                          </div>
                        )}

                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>

                    {formData.imagePreview && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            image: null,
                            imagePreview: "",
                          }))
                        }
                      >
                        Премахни снимката
                      </Button>
                    )}
                  </div>
                </FormSection>

              </div>
            </div>
          </form>
        </div>      
      </div>

      <InformedConsent 
        key={formData.signature ? 'signed' : 'empty'}
        data={{formData}} 
        signature={formData.signature}
      />

      <FloatingActionButton onClick={handleSubmit} label="Регистрирай животното" />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        catData={registeredCatData}
      />
    </>
  );
};

export default CatRegistrationForm;
