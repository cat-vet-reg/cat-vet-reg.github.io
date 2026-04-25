import React, { useState, useEffect } from "react";
import { useLocation, useNavigate   } from "react-router-dom";

import Header                   from "../../components/ui/Header";
import FloatingActionButton     from "../../components/ui/FloatingActionButton";
import Input                    from "../../components/ui/Input";
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

const CatRegistrationForm = () => {

const navigate = useNavigate();
  const location = useLocation(); 

  // Вземаме данните от навигацията
  const editingData = location.state?.catData;
  const [isEditing, setIsEditing] = useState(!!location.state?.isEditing);
  const [formData, setFormData] = useState(() => mapRecordToForm(editingData));

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
    // Вече позволяваме търсене дори при редакция, ако името е празно
    if (formData.ownerPhone && formData.ownerPhone.length >= 6) {
      const timer = setTimeout(async () => {
        try {
          const { data } = await supabase
            .from('td_owners')
            .select('name')
            .eq('phone', formData.ownerPhone)
            .maybeSingle();

          // Ако намерим човек в базата с този телефон, автоматично попълваме името му
          if (data && data.name && !formData.ownerName) {
            handleInputChange("ownerName", data.name);
          }
        } catch (err) {
          console.error(err);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [formData.ownerPhone]); // Махаме isEditing от условията


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

    if (!formData?.address?.trim()) {
      newErrors.address = "Въведете адрес";
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

          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-6 md:space-y-8" ref={sectionRefs.owner}>
                <OwnerSection 
                  formData={formData} 
                  handleInputChange={handleInputChange} 
                />
                
                <div ref={sectionRefs.basic}>
                  <AnimalBasicSection 
                    formData={formData} 
                    handleInputChange={handleInputChange} 
                    errors={errors} 
                  />
                </div>

                  <TemperamentSection 
                    formData={formData} 
                    handleInputChange={handleInputChange} 
                    errors={errors} 
                  />
                
                <div ref={sectionRefs.location}>
                  <LocationSection 
                    formData={formData} 
                    handleInputChange={handleInputChange} 
                    errors={errors} 
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