import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

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
import { cityOptions          } from "./components/city_options";

import { getCoordinates       } from "../../utils/geocoding";
import { $apiCreateNewRecord  } from "../../services/create_new_record";

import supabase from "utils/supabase";

const CatRegistrationForm = () => {

  const location = useLocation(); 

  // Вземаме данните, ако идваме от бутона "Редактирай"
  const editingData = location.state?.catData;
  const isEditing = !!location.state?.isEditing;

  const [formData, setFormData] = useState({
    ownerName             : editingData?.owner?.name || "",
    ownerPhone            : editingData?.owner?.phone || "",
    donation              : editingData?.donation || "N",

    // Данни на КТ
    recordName            : editingData?.name || "",
    gender                : editingData?.gender || "",
    weight                : editingData?.weight || "",
    ageValue              : editingData?.age_value || "",
    ageUnit               : editingData?.age_unit || "months",
    color                 : editingData?.color || "",
    recordNotes           : editingData?.notes || "",
    recordCity            : editingData?.location_city || "",
    address               : editingData?.location_address || "",
    livingCondition       : editingData?.living_condition || "",
    coords                : editingData?.map_coordinates || null,
    
    castratedAt           : editingData?.castrated_at,
    isAlreadyCastrated    : editingData?.is_already_castrated || "N",

    // Усложнения
    hasComplications      : editingData?.has_complications || "N",
    selectedComplications : editingData?.selected_complications || [],
    recordComplications   : editingData?.record_complications || "",

    // Анестезиология
    inductionDose         : editingData?.induction_dose || "",
    timeToSleep           : editingData?.time_to_sleep || "",
    hasInductionAdd       : editingData?.has_induction_add || false,
    inductionAddAmount    : editingData?.induction_add_amount || "",
    propofolUsed          : editingData?.propofol_used || false,
    propofolTotalMl       : editingData?.propofol_total_ml || "",
    propofolFirstMin      : editingData?.propofol_first_min || "",
    surgeryDuration       : editingData?.surgery_duration || "",

    // Сегашен статус, репродуктивен статус
    status                : editingData?.status || "received",
    staffReceived         : editingData?.staff_received || "",
    staffSurgeon          : editingData?.staff_surgeon || "",
    staffReleased         : editingData?.staff_released || "",
    earStatus             : editingData?.ear_status || "marked",
    parasites             : editingData?.parasites || "none",
    reproductiveStatus    : editingData?.reproductive_status || "none_visible"
  });

useEffect(() => {
  
  if (editingData) {

    const { data } = supabase
      .storage
      .from('protocol_images')
      .getPublicUrl(`records/${editingData.id}/avatar.png`)
    
    const lat = editingData.latitude || editingData.map_coordinates?.lat || editingData.coordinates?.lat;
    const lng = editingData.longitude || editingData.map_coordinates?.lng || editingData.coordinates?.lng;
    
    const foundCoords = (lat && lng) ? { lat: Number(lat), lng: Number(lng) } : null;

    const existingImageUrl = editingData.image_url || editingData.photo_url || "";
    
    const savedConditions = editingData.living_condition || [];
    if (Array.isArray(savedConditions)) {
      setLivingConditions(new Set(savedConditions));
    }

    setFormData({
      ownerName           : editingData.owner?.name || editingData.owner_name || "",
      ownerPhone          : editingData.owner?.phone || editingData.owner_phone || "",
      donation            : editingData.donation || "",
      
      recordName          : editingData.name || "",
      gender              : editingData.gender || "",
      weight              : editingData.weight || "",
      ageValue            : editingData.age_value || "",
      ageUnit             : editingData.age_unit || "months",
      color               : editingData.color || "",
      recordNotes         : editingData.notes || "",
      recordCity          : editingData.location_city || "",
      address             : editingData.location_address || "",
      livingCondition     : editingData.living_condition || "",
      coords              : foundCoords,

      imagePreview        : data.publicUrl || "",
      
      castratedAt         : editingData?.castrated_at || "",
      isAlreadyCastrated  : editingData?.is_already_castrated || "N",
    
      hasComplications      : editingData?.has_complications || "N",
      selectedComplications : editingData?.selected_complications || [],
      recordComplications   : editingData?.record_complications || "",
    
    // Сегашен статус, репродуктивен статус
      status              : editingData?.status || "received",
      staffReceived       : editingData?.staff_received || "",
      staffSurgeon        : editingData?.staff_surgeon || "",
      staffReleased       : editingData?.staff_released || "",
      earStatus           : editingData?.ear_status || "marked",
      parasites           : editingData?.parasites || "none",
      reproductiveStatus  : editingData?.reproductive_status || "none_visible",
      
      // Анестезиология
      inductionDose       : editingData?.induction_dose || "",
      timeToSleep         : editingData?.time_to_sleep || "",
      hasInductionAdd     : editingData?.has_induction_add || false,
      inductionAddAmount  : editingData?.induction_add_amount || "",
      propofolUsed        : editingData?.propofol_used || false,
      propofolTotalMl     : editingData?.propofol_total_ml || "",
      propofolFirstMin    : editingData?.propofol_first_min || "",
      surgeryDuration     : editingData?.surgery_duration || ""
    
    });
    
    console.log("Данни за редактиране:", editingData);
    if (foundCoords) {
      setCoordinates(foundCoords);
    }
  }
}, [editingData]);

useEffect(() => {
  // Проверяваме дали сме в режим на нова регистрация (няма редактиране) 
  // ИЛИ ако полето за доза е празно в момента.
  // Така не прецакваме старите записи при отваряне за преглед.
  if (!isEditing || !formData.inductionDose) {
    if (formData.gender === "female") {
      handleInputChange("inductionDose", "0.11");
    } else if (formData.gender === "male") {
      handleInputChange("inductionDose", "0.12");
    }
  }
  if (formData.gender === "female") {
     handleInputChange("reproductiveStatus", "none_visible");
  } else if (formData.gender === "male") {
     handleInputChange("reproductiveStatus", ""); // Или стойност по подразбиране за мъжки
  }
}, [formData.gender]);

  const [coordinates, setCoordinates] = useState(editingData?.map_coordinates || null);

  const [errors               , setErrors               ] = useState({});
  const [isValidatingAddress  , setIsValidatingAddress  ] = useState(false);
  const [isSubmitting         , setIsSubmitting         ] = useState(false);
  const [showSuccessModal     , setShowSuccessModal     ] = useState(false);
  const [registeredCatData    , setRegisteredCatData    ] = useState(null);
  const [livingConditions     , setLivingConditions     ] = useState(new Set());

  const genderOptions = [
    { value: "male"   , label: "Мъжки" },
    { value: "female" , label: "Женски" },
  ];

  const colorOptions = [
    // Patterns
    { value: "tabby", label: "Таби (тигрова)" },

    // Bi-color & multi-color
    { value: 'tabby_white'  , label: 'Таби-бяла (бяла с тигрово)' },
    { value: 'calico'       , label: 'Калико (трицветна)' },
    { value: 'tortoiseshell', label: 'Костенуркова' },
    { value: 'tuxedo'       , label: 'Черно-бяла' },
    { value: 'orange_white' , label: 'Рижо-бяла' },

    // Solid colors
    { value: 'orange'   , label: 'Рижа' },
    { value: 'black'    , label: 'Черна' },
    { value: 'white'    , label: 'Бяла' },
    { value: 'gray'     , label: 'Сива (Синя)' },
    { value: 'brown'    , label: 'Кафява' },
    { value: 'cinnamon' , label: 'Светлокафява' },
    { value: 'fawn'     , label: 'Бежова' },
  ];

  const ageUnitOptions = [
    { value: "months" , label: "Месеца" },
    { value: "years"  , label: "Години" },
  ];

  const breadcrumbItems = [
    { label: "Табло"              , path: "/dashboard-overview" },
    { label: "Регистрирай котка"  , path: "/cat-registration-form" },
  ];

  const complicationOptions = {
    female: [
      { id: "intra_hem"           , label: "Интраоперативна хеморагия" },
      { id: "ureter_trauma"       , label: "Ятрогенна травма на уретерите" },
      { id: "post_hem"            , label: "Постоперативна хеморагия / Хемоабдомен" },
      { id: "dehiscence"          , label: "Отваряне на раната (Dehiscence)" },
      { id: "infection"           , label: "Инфекция на оперативната рана" },
      { id: "stump_granuloma"     , label: "Синусни канали/ Грануломи на чукана (Sinus Tracts / Stump Granulomas)" },
      { id: "remnant_syndrome"    , label: "Синдром на остатъчния яйчник" },
      { id: "mammary_hyperplasia" , label: "Хиперплазия на млечните жлези" },
      { id: "mammary_hyperplasia" , label: "Хиперплазия на млечните жлези" },
    ],
    male: [
      { id: "scrotal_swelling"    , label: "Подуване/контузия/хеморагия на скротума" },
      { id: "abd_hem"             , label: "Абдоминална хеморагия" },
      { id: "urethra_prostate"    , label: "Ятрогенна травма на уретрата/простатата" },
    ],
    general: [
      { id: "lung_edema"          , label: "Белодробен оток" },
      { id: "anesthesia_reac"     , label: "Алергична реакция към упойка" }
    ]
  };

  const staffOptions = [
    { value: "dr_taneva"        , label: "д-р Танева" },
    { value: "dr_dimitrova"     , label: "д-р Димитрова" },
    { value: "yana"             , label: "Яна Янкова" },
  ];

  const reproductiveOptions = {
    female: [
      { value: "baby"             , label: "Бебешка матка" },
      { value: "heat"             , label: "Разгонена" },
      { value: "early_pregnancy"  , label: "Начална бременност" },
      { value: "late_pregnancy"   , label: "Напреднала бременност" },
      { value: "post_pregnancy"   , label: "След бременност (кърмеща/родила)" },
      { value: "none_visible"     , label: "Няма следи от бременност" },
      { value: "mucometra"        , label: "Мукометра" },
      { value: "pyometra"         , label: "Пиометра" },
      { value: "ovarian_cyst"     , label: "Киста на яйчника" },
    ],
    male: [
      { value: "unilateral_cryptorchidism"  , label: "Едностранен крипторхизъм" },
      { value: "bilateral_cryptorchidism"   , label: "Двустранен крипторхизъм" },
      { value: "monorchidism"               , label: "Монорхидизъм" }
    ]
  };

  const parasiteOptions = [
    { id: 'fleas' , label: 'Бълхи' },
    { id: 'ticks' , label: 'Кърлежи' },
    { id: 'worms' , label: 'Глисти' },
    { id: 'none'  , label: 'Няма видими' },
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

  // В CatRegistrationForm (index.jsx)
  const handleInputChange = (field, value) => {

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // ... (кода за изчистване на грешки)
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // 1. Вземаме актуалните стойности
    const currentCityValue =
      field === "recordCity" ? value : formData?.recordCity;
    const currentAddress = field === "address" ? value : formData?.address;

    // 2. Намираме името на града на кирилица от cityOptions
    // Това е важно, защото Nominatim не разбира "plovdiv", но разбира "гр. Пловдив"
    const cityObject = cityOptions.find(
      (opt) => opt.value === currentCityValue,
    );
    const cityLabel = cityObject ? cityObject.label : "";

    // 3. Условие за стартиране на търсенето
    if (currentAddress?.length > 5 && cityLabel) {
      setIsValidatingAddress(true);

      const timer = setTimeout(async () => {
        // Подаваме истинското име на града и адреса
        const coords = await getCoordinates(cityLabel, currentAddress);

        if (coords) {

          setCoordinates(coords);

          setFormData((prev) => ({
            ...prev,
            coords: coords
          }));


        }
        setIsValidatingAddress(false);
      }, 1000);
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

    if (!formData?.color) {
      newErrors.color = "Изберете цвят";
    }

    if (formData?.color === "custom" && !formData?.customColor?.trim()) {
      newErrors.customColor = "Въведете цвят";
    }

    if (!formData?.address?.trim()) {
      newErrors.address = "Въведете адрес";
    }

    if (!formData?.recordCity) {
      newErrors.recordCity = "Изберете населено място";
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

const handleSubmit = (e) => {
  e?.preventDefault();
  if (!validateForm()) return;

  setIsSubmitting(true);

  // Важно: Подаваме formData, isEditing и ID-то на котката
  $apiCreateNewRecord(formData, isEditing, editingData?.id)
    .then(() => {
      setRegisteredCatData({
        ...formData,
        registeredAt: new Date()?.toISOString(),
      });
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

      setFormData({
        recordName  : "",
        gender      : "",
        weight      : "",
        ageValue    : "",
        ageUnit     : "months",
        color       : "",
        customColor : "",
        address     : "",
        ownerName   : "",
        ownerPhone  : "",
        donation    : "N",
        recordNotes : "",
      });

      setLivingConditions(new Set());
    }

    if (state == "same_owner") {
      setFormData({
        recordName: "",
        gender: "",
        weight: "",
        ageValue: "",
        ageUnit: "months",
        color: "",
        customColor: "",
        address: "",
        recordNotes: "",
      });

      setLivingConditions(new Set());
    }

    setCoordinates(null);
    setRegisteredCatData(null);
  };

  const isFormValid = () => {
    return true;
    // return (formData?.gender &&
    // formData?.weight &&
    // parseFloat(formData?.weight) > 0 &&
    // formData?.color &&
    // (formData?.color !== 'custom' || formData?.customColor?.trim()) &&
    // formData?.address?.trim()?.length >= 10 &&
    // formData?.ownerName?.trim()?.length >= 2 && /^\+?[\d\s\-()]{10,}$/?.test(formData?.ownerPhone));
  };

  const onCheckLocation = (id) => {

    setLivingConditions((prev) => {
      const abc = new Set(prev);

      if (abc.has(id)) {
        abc.delete(id);
      } else {
        abc.add(id);
      }

      handleInputChange("livingCondition", Array.from(abc));

      return abc;
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
                <FormSection title="Лице за контакти / Собственик">
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

                  <Select
                    label="Пол"
                    placeholder="Мъжки / Женски"
                    required
                    options={genderOptions}
                    value={formData?.gender}
                    onChange={(value) => handleInputChange("gender", value)}
                    error={errors?.gender}
                  />

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

                  <div className="grid grid-cols-2 gap-4">
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
                    label="Цвят на козината"
                    placeholder="Изберете цвят"
                    required
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

                <FormSection title="Къде е намерено / отглеждано животното">
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

                  <Input
                    label="Адрес"
                    type="text"
                    placeholder="Въведете пълния адрес на животното"
                    required
                    value={formData?.address}
                    onChange={(e) =>
                      handleInputChange("address", e?.target?.value)
                    }
                    error={errors?.address}
                    description="Информацията е необходима за картата, така че подробности като номер на сградата или улицата са важни. Формат: 'ул. Име 12'"
                  />

                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block text-foreground">
                    Къде живее
                  </label>

                  <Checkbox
                    label="на улицата"
                    onChange={(e) => onCheckLocation("street")}
                    checked={livingConditions.has("street")}
                  />
                  <Checkbox
                    label="на двора"
                    onChange={(e) => onCheckLocation("outdoor")}
                    checked={livingConditions.has("outdoor")}
                  />
                  <Checkbox
                    label="в дома"
                    onChange={(e) => onCheckLocation("indoor")}
                    checked={livingConditions.has("indoor")}
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
                    Котката беше ли вече кастрирана?
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
                      label="След колко минути заспа котката?"
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
                </FormSection>

                <FormSection title="Сегашен статус и отчетност">
                  {/* СТАТУС В РЕАЛНО ВРЕМЕ */}
                  <div className="mb-6">
                    <label className="text-sm font-medium mb-3 block text-foreground">Статус на животното</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'received'  , label: 'Прието'         , color: 'bg-slate-100 text-slate-700' },
                        { id: 'prep'      , label: 'Подготовка'     , color: 'bg-blue-100 text-blue-700' },
                        { id: 'surgery'   , label: 'В операция'     , color: 'bg-red-100 text-red-700' },
                        { id: 'recovery'  , label: 'Възстановяване' , color: 'bg-amber-100 text-amber-700' },
                        { id: 'released'  , label: 'Върнато'        , color: 'bg-green-100 text-green-700' }
                      ].map((s) => (
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
                    {isSubmitting ? "Регистрираме..." : "Регистрирай котката"}
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

              <div className="lg:sticky lg:top-24 lg:self-start">
                <FormSection
                  title="Карта на адреса"
                  description="Каква е локацията на животното"
                >
                  <MapPreview
                    address={formData?.address}
                    coordinates={coordinates}
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
      <FloatingActionButton onClick={handleSubmit} label="Регистрирай котка" />
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        catData={registeredCatData}
      />
    </>
  );
};

export default CatRegistrationForm;
