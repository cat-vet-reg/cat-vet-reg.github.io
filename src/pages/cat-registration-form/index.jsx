import React, { useState, useEffect } from "react";
import { useLocation, useNavigate   } from "react-router-dom";

import Header                   from "../../components/ui/Header";
import FloatingActionButton     from "../../components/ui/FloatingActionButton";
import Input                    from "../../components/ui/Input";
import Icon                    from "../../components/AppIcon";
import Select                   from "../../components/ui/Select";
import Button                   from "../../components/ui/Button";
import FormSection              from "./components/FormSection";
import MapPreview               from "./components/MapPreview";
import SuccessModal             from "./components/SuccessModal";

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
import supabase                             from "../../utils/supabase";
import SignatureCanvas                      from 'react-signature-canvas';
import { useRef }                           from 'react';
import { findDistrict }                     from "../../constants/zona_find";

import MobileDock           from "./components/MobileDock";
import OwnerSection         from "./components/OwnerSection";
import AnimalBasicSection   from "./components/AnimalBasicSection";
import TemperamentSection   from "./components/TemperamentSection";
import LocationSection      from "./components/LocationSection";
import StatusSection        from "./components/StatusSection";
import AnesthesiaSectionRaw from "./components/AnesthesiaSectionRaw";
import AnesthesiaSection    from "./components/AnesthesiaSection";
import ComplicationSection  from "./components/ComplicationSection";

const HIGH_VOLUME_DEFAULTS = {
  // Данни за собственика
  ownerName: "Нанси Танева",
  ownerPhone: "0896160033",
  ownerAddress: "Center of Hope Veterinary Hospital, Piteasca",
  ownerEgn: "",

  // Геолокация (Румъния)
  recordCity: "Piteasca_ROM", // Или съкращението, което ползвате в select-а за Питеаска
  address: "Center of Hope Veterinary Hospital",
  zonaNumber: "99", // Служебен номер за външна зона/обучение

  // Данни за животното (вътре в "data" обекта на JSON-а)
  ageValue: "1",
  ageUnit: "years",
  birthDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0], // Точно преди 1 година
  origin: "street",
  livingCondition: ["street"],
  
  // Медицински детайли
  castratedAt: new Date().toISOString().split('T')[0], // Днешната дата (YYYY-MM-DD)
  status: "released", // Директно го маркираме като приключен случай / върнато
  isAlreadyCastrated: "N"
};

const CatRegistrationForm = () => {

  const navigate = useNavigate();
  const location = useLocation(); 
  const [regType, setRegType] = useState('neutering');

  // Вземаме данните от навигацията
  const editingData = location.state?.catData;
  const [isEditing, setIsEditing] = useState(!!location.state?.isEditing);
const [formData, setFormData] = useState(() => {
    const initialMapped = mapRecordToForm(editingData);
    
    // Ако НЕ редактираме стаж/запис и по подразбиране сме в high-volume режим:
    if (!editingData && regType === 'high-volume') {
      return {
        ...initialMapped,
        // Данни за собственика от HIGH_VOLUME_DEFAULTS
        ownerName: HIGH_VOLUME_DEFAULTS.ownerName,
        ownerPhone: HIGH_VOLUME_DEFAULTS.ownerPhone,
        ownerAddress: HIGH_VOLUME_DEFAULTS.ownerAddress,
        ownerEgn: HIGH_VOLUME_DEFAULTS.ownerEgn,

        // Геолокация (Румъния / Питеаска)
        recordCity: HIGH_VOLUME_DEFAULTS.recordCity,
        address: HIGH_VOLUME_DEFAULTS.address,
        zonaNumber: HIGH_VOLUME_DEFAULTS.zonaNumber,

        // Данни за животното
        ageValue: HIGH_VOLUME_DEFAULTS.ageValue,
        ageUnit: HIGH_VOLUME_DEFAULTS.ageUnit,
        birthDate: HIGH_VOLUME_DEFAULTS.birthDate,
        origin: HIGH_VOLUME_DEFAULTS.origin,
        livingCondition: HIGH_VOLUME_DEFAULTS.livingCondition,
        
        // Медицински детайли
        castratedAt: HIGH_VOLUME_DEFAULTS.castratedAt,
        status: HIGH_VOLUME_DEFAULTS.status,
        isAlreadyCastrated: HIGH_VOLUME_DEFAULTS.isAlreadyCastrated,
        
        // Базови стойности, които да не са празни
        gender: 'female', 
        species: 'cat',
        inductionDose: "0.11",
        reproductiveStatus: "none_visible"
      };
    }
    
    return initialMapped;
  });
  const [mapUrl, setMapUrl]     = useState('AIzaSyCSyjPTq09LYc7lcBxotOnv-KBTiEfNbOI');

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

  // Автоматично намиране на пълен профил на собственик по телефонен номер
  useEffect(() => {
    // Търсим само ако има поне 6 цифри и името в момента е ПРАЗНО 
    // (това е важно, за да не презаписваме, ако потребителят пише в момента)
    if (formData.ownerPhone && formData.ownerPhone.length >= 6 && !formData.ownerName) {
      const timer = setTimeout(async () => {
        try {
          const { data } = await supabase
            .from('td_owners')
            .select('name, egn, address') // Вземаме всичко налично
            .eq('phone', formData.ownerPhone)
            .maybeSingle();

          if (data && data.name) {
            // Попълваме името
            handleInputChange("ownerName", data.name);
            
            // Ако има ЕГН и адрес, попълваме и тях автоматично
            if (data.egn) handleInputChange("ownerEgn", data.egn);
            if (data.address) handleInputChange("ownerAddress", data.address);
          }
        } catch (err) {
          console.error("Грешка при търсене на собственик:", err);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [formData.ownerPhone, formData.ownerName]); // Следим и двете

useEffect(() => {
  // Ако сме в режим на редактиране и вече имаме дата, не искаме да я презаписваме автоматично
  if (isEditing && formData.birthDate) return;

  if (formData.ageValue) {
    const autoDate = calculateBirthDate(formData.ageValue, formData.ageUnit || "months");
    
    // Проверяваме дали новата дата е различна, за да не влизаме в безкраен цикъл
    if (autoDate !== formData.birthDate) {
      setFormData(prev => ({
        ...prev,
        birthDate: autoDate
      }));
    }
  }
}, [formData.ageValue, formData.ageUnit]); // Изпълнява се само при промяна на тези две полета

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

  const handleRegTypeChange = (type) => {
    setRegType(type);
    
    if (type === 'high-volume') {
      setFormData(prev => ({
        ...prev,
        // Собственик
        ownerName: HIGH_VOLUME_DEFAULTS.ownerName,
        ownerPhone: HIGH_VOLUME_DEFAULTS.ownerPhone,
        ownerAddress: HIGH_VOLUME_DEFAULTS.ownerAddress,
        ownerEgn: HIGH_VOLUME_DEFAULTS.ownerEgn,

        // Локация
        recordCity: HIGH_VOLUME_DEFAULTS.recordCity,
        address: HIGH_VOLUME_DEFAULTS.address,
        zonaNumber: HIGH_VOLUME_DEFAULTS.zonaNumber,

        // Основни данни
        ageValue: HIGH_VOLUME_DEFAULTS.ageValue,
        ageUnit: HIGH_VOLUME_DEFAULTS.ageUnit,
        birthDate: HIGH_VOLUME_DEFAULTS.birthDate,
        origin: HIGH_VOLUME_DEFAULTS.origin,
        livingCondition: HIGH_VOLUME_DEFAULTS.livingCondition,

        // Оперативни данни
        castratedAt: HIGH_VOLUME_DEFAULTS.castratedAt,
        status: HIGH_VOLUME_DEFAULTS.status,
        isAlreadyCastrated: HIGH_VOLUME_DEFAULTS.isAlreadyCastrated,

        // Запазваме бързия избор на потребителя, ако вече е цъкнал нещо
        gender: prev.gender || 'female',
        species: prev.species || 'cat',
        
        // Автоматично изчисляване на индукционната доза веднага при превключване
        inductionDose: prev.gender === 'male' ? "0.12" : "0.11",
        reproductiveStatus: prev.reproductiveStatus || "none_visible"
      }));

      // Изчистваме грешките, за да няма червени полета
      setErrors({});
    }
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


  const [errors               , setErrors               ] = useState({});
  const [isValidatingAddress  , setIsValidatingAddress  ] = useState(false);
  const [isSubmitting         , setIsSubmitting         ] = useState(false);
  const [showSuccessModal     , setShowSuccessModal     ] = useState(false);
  const [registeredCatData    , setRegisteredCatData    ] = useState(null);

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

  const calculateBirthDate = (value, unit) => {
    if (!value || isNaN(value)) return "";
    const date = new Date();
    if (unit === "months") {
      date.setMonth(date.getMonth() - parseInt(value));
    } else {
      date.setFullYear(date.getFullYear() - parseInt(value));
    }
    return date.toISOString().split('T')[0]; // Връща YYYY-MM-DD
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

  const validateForm = () => {
    const newErrors = {};

    // 1. ПОЛ - Изисква се ВИНАГИ (и в High-Volume, и в стандартен режим)
    if (!formData?.gender) {
      newErrors.gender = "Изберете пол";
    }

    // 2. ВЪЗРАСТ И АДРЕС - Изискват се САМО ако НЕ сме в бързия High-Volume режим
    if (regType !== 'high-volume') {
      
      // Проверка за възраст
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

      // Проверка за адрес
      if (!formData?.address?.trim()) {
        newErrors.address = "Въведете адрес";
      }
    }

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
      navigate('/schedule');
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

  const sectionRefs = {
    owner: React.useRef(null),
    basic: React.useRef(null),
    spicy: React.useRef(null),
    location: React.useRef(null),
    status: React.useRef(null),
    anesthesia: React.useRef(null)
  };

  const scrollToSection = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <Header />
      <MobileDock 
        scrollToSection={scrollToSection} 
        sectionRefs={sectionRefs}
      />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">

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

          {/* КОНТРОЛЕН ПАНЕЛ ЗА ТИП РЕГИСТРАЦИЯ */}
          <div className="flex flex-wrap gap-3 mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => handleRegTypeChange('neutering')}
              className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${regType === 'neutering' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-600 border'}`}
            >
              🐈 ЖВ за Кастрация
            </button>

            <button
              type="button"
              onClick={() => navigate('/treatment-registry', { state: { openCreate: true } })}
              className="flex-1 py-3 px-4 rounded-lg font-bold bg-white text-slate-600 border hover:border-violet-400 hover:text-violet-600 transition-all"
            >
              🏥 ЖВ за Лечение
            </button>

            <button
              type="button"
              onClick={() => handleRegTypeChange('prevention')}
              className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${regType === 'prevention' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-600 border'}`}
            >
              🛡️ ЖВ за Профилактика
            </button>

            {/* НОВИЯТ БУТОН ЗА HIGH-VOLUME */}
            <button
              type="button"
              onClick={() => handleRegTypeChange('high-volume')}
              className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${regType === 'high-volume' ? 'bg-amber-600 text-white shadow-lg animate-pulse' : 'bg-white text-amber-600 border border-amber-200 hover:bg-amber-50'}`}
            >
              ⚡ High-Volume (Бърз)
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">

              {regType === 'high-volume' ? (
              /* ==================================================================== */
              /* РЕЖИМ HIGH-VOLUME: Показва САМО нужните компоненти на един екран    */
              /* ==================================================================== */
              <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">
                <AnimalBasicSection 
                  formData={formData} 
                  handleInputChange={handleInputChange} 
                  errors={errors}
                  isHighVolume={true}
                />

                <div ref={sectionRefs.anesthesia}>
                  <AnesthesiaSection 
                    formData={formData} 
                    handleInputChange={handleInputChange} 
                    errors={errors}
                    isHighVolume={true}
                  />
                </div>

                {/* Бутони за бързо записване / изчистване директно под анестезията */}
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
                </div>
              </div>
            ) : (
              /* ==================================================================== */
              /* СТАНДАРТЕН РЕЖИМ: Оригиналната ти двуколона структура с всички секции*/
              /* ==================================================================== */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-6 md:space-y-8" ref={sectionRefs.owner}>
                <OwnerSection 
                  formData={formData} 
                  handleInputChange={handleInputChange}
                  errors={errors} 
                  isEditing={isEditing}
                />
                
                
                <div ref={sectionRefs.basic}>
                  <AnimalBasicSection 
                    formData={formData} 
                    handleInputChange={handleInputChange} 
                    errors={errors} 
                  />
                </div>

                {/* Секция Идентификация - само за Профилактика */}
                {regType === 'prevention' && (
                  <FormSection title="Идентификация и Документи" className="bg-blue-50/50 rounded-[20px] p-3 border border-blue-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* МИКРОЧИП */}
                      <div className="space-y-3 p-4 bg-white rounded-xl border border-blue-100 shadow-sm">
                        <h4 className="font-bold text-blue-700 flex items-center gap-2">
                          <Icon name="Cpu" size={18} /> Микрочип
                        </h4>
                        <Input 
                          label="Номер на чип" 
                          placeholder="9000..." 
                          value={formData.chipNumber}
                          onChange={(e) => handleInputChange("chipNumber", e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input 
                            label="Дата от" type="date" 
                            value={formData.chipDateFrom}
                            onChange={(e) => handleInputChange("chipDateFrom", e.target.value)}
                          />
                          <Input 
                            label="Дата до" type="date" 
                            value={formData.chipDateTo}
                            onChange={(e) => handleInputChange("chipDateTo", e.target.value)}
                          />
                        </div>
                        <Input 
                          label="Ветеринарен лекар" 
                          placeholder="име на лекар..." 
                          value={formData.chipVet}
                          onChange={(e) => handleInputChange("chipVet", e.target.value)}
                        />
                      </div>

                      {/* ПАСПОРТ */}
                      <div className="space-y-3 p-4 bg-white rounded-xl border border-blue-100 shadow-sm">
                        <h4 className="font-bold text-blue-700 flex items-center gap-2">
                          <Icon name="FileText" size={18} /> Официален паспорт
                        </h4>
                        <Input 
                          label="Номер на паспорт" 
                          placeholder="BG..." 
                          value={formData.passportNumber}
                          onChange={(e) => handleInputChange("passportNumber", e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input 
                            label="Дата от" type="date" 
                            value={formData.passportDateFrom}
                            onChange={(e) => handleInputChange("passportDateFrom", e.target.value)}
                          />
                          <Input 
                            label="Дата до" type="date" 
                            value={formData.passportDateTo}
                            onChange={(e) => handleInputChange("passportDateTo", e.target.value)}
                          />
                        </div>
                        <Input 
                          label="Ветеринарен лекар" 
                          placeholder="име на лекар..." 
                          value={formData.passportVet}
                          onChange={(e) => handleInputChange("passportVet", e.target.value)}
                        />
                      </div>
                      
                    </div>
                  </FormSection>
                )}

                <TemperamentSection 
                  formData={formData} 
                  handleInputChange={handleInputChange} 
                  errors={errors} 
                />
                
                <div ref={sectionRefs.location}>
                  <LocationSection 
                    getCoordinates={getCoordinates}
                    findDistrict={findDistrict}
                    formData={formData} 
                    handleInputChange={handleInputChange} 
                    errors={errors} 
                    setFormData={setFormData}
                    setIsValidatingAddress={setIsValidatingAddress}
                    onCheckLocation={onCheckLocation}
                  />
                </div>

                <div ref={sectionRefs.status}>
                  <StatusSection 
                    formData={formData} 
                    handleInputChange={handleInputChange} 
                    errors={errors} 
                  />
                </div>


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
                
                {(regType === 'neutering' || regType === 'high-volume') && (
                 <>
                  <AnesthesiaSectionRaw 
                    formData={formData} 
                    handleInputChange={handleInputChange} 
                    errors={errors} 
                  />

                <div ref={sectionRefs.anesthesia}>
                  <AnesthesiaSection 
                    formData={formData} 
                    handleInputChange={handleInputChange} 
                    errors={errors} 
                  />
                </div>
                
                  <ComplicationSection 
                    formData={formData} 
                    handleInputChange={handleInputChange} 
                    errors={errors} 
                  />
                  </>
                )}

                {/* <FormSection title="Валидиране на протокола">
                  <SignatureSection 
                    // Използваме съществуващата функция за промяна на данни
                    onSaveSignature={(data) => handleInputChange("signature", data)} 
                  />
                  {formData.signature && (
                    <p className="text-xs text-green-600 mt-2">✓ Подписът е приет дигитално</p>
                  )}
                </FormSection> */}

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
          )}
          </form>
        </div>      
      </div>

      <InformedConsent
        data={formData} 
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