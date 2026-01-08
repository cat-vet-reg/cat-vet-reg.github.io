import React, { useState }      from 'react';
import Header                   from '../../components/ui/Header';
import Breadcrumb               from '../../components/ui/Breadcrumb';
import FloatingActionButton     from '../../components/ui/FloatingActionButton';
import Input                    from '../../components/ui/Input';
import Select                   from '../../components/ui/Select';
import Button                   from '../../components/ui/Button';
import { Checkbox }             from '../../components/ui/Checkbox';
import FormSection              from './components/FormSection';
import MapPreview               from './components/MapPreview';
import SuccessModal             from './components/SuccessModal';
import { cityOptions }          from './components/city_options';

import { getCoordinates }       from '../../utils/geocoding';
import { $apiCreateNewRecord }  from '../../services/create_new_record'

const CatRegistrationForm = () => {

  const [formData, setFormData] = useState({
    recordName      : '',
    recordCity      : '',
    gender          : '',
    weight          : '',
    ageValue        : '',
    ageUnit         : 'months',
    recordNotes     : '',
    color           : '',
    customColor     : '',
    address         : '',
    ownerName       : '',
    ownerPhone      : '',
    livingCondition : '',
    image           : null,
    imagePreview    : ''
  });

  const [errors, setErrors]                           = useState({});
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [coordinates, setCoordinates]                 = useState(null);
  const [isSubmitting, setIsSubmitting]               = useState(false);
  const [showSuccessModal, setShowSuccessModal]       = useState(false);
  const [registeredCatData, setRegisteredCatData]     = useState(null);

  const [livingConditions, setLivingConditions]       = useState(new Set());


  // const sss = new Set();

  const genderOptions = [
    { value: 'male', label: 'Мъжки' },
    { value: 'female', label: 'Женски' }
  ];


  const colorOptions = [
    // Patterns
    { value: 'tabby'        , label: 'Таби (тигрова)' },

    // Bi-color & multi-color
    { value: 'calico'       , label: 'Калико (трицветна)' },
    { value: 'tortoiseshell', label: 'Костенуркова' },
    { value: 'tuxedo'       , label: 'Черно-бяла' },
    { value: 'orange_white' , label: 'Рижо-бяла' },

    // Solid colors
    { value: 'orange'       , label: 'Рижа' },
    { value: 'black'        , label: 'Черна' },
    { value: 'white'        , label: 'Бяла' },
    { value: 'gray'         , label: 'Сива (Синя)' },
    { value: 'brown'        , label: 'Кафява' },
    { value: 'cinnamon'     , label: 'Светлокафява' },
    { value: 'fawn'         , label: 'Бежова' },
  ];

  const ageUnitOptions = [
    { value: 'months', label: 'Месеца' },
    { value: 'years', label: 'Години' }
  ];


  const breadcrumbItems = [
    { label: 'Табло', path: '/dashboard-overview' },
    { label: 'Регистрирай котка', path: '/cat-registration-form' }
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Проверка дали е картинка
      if (!file.type.startsWith('image/')) {
        alert("Моля, изберете валиден графичен файл.");
        return;
      }

      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file) // Създава временен линк за преглед
      }));
    }
  };

// В CatRegistrationForm (index.jsx)

const handleInputChange = (field, value) => {
  setFormData(prev => ({
    ...prev,
    [field]: value
  }));

  // ... (кода за изчистване на грешки)
  if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

  // 1. Вземаме актуалните стойности
  const currentCityValue = field === 'recordCity' ? value : formData?.recordCity;
  const currentAddress = field === 'address' ? value : formData?.address;

  // 2. Намираме името на града на кирилица от cityOptions
  // Това е важно, защото Nominatim не разбира "plovdiv", но разбира "гр. Пловдив"
  const cityObject = cityOptions.find(opt => opt.value === currentCityValue);
  const cityLabel = cityObject ? cityObject.label : "";

  // 3. Условие за стартиране на търсенето
  if (currentAddress?.length > 5 && cityLabel) {
    setIsValidatingAddress(true);

    const timer = setTimeout(async () => {
      // Подаваме истинското име на града и адреса
      const coords = await getCoordinates(cityLabel, currentAddress);
      
      if (coords) {
        setCoordinates(coords);
      }
      setIsValidatingAddress(false);
    }, 1000);

  }
};

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.gender) {
      newErrors.gender = 'Изберете пол';
    }

    // if (!formData?.weight) {
    //   newErrors.weight = 'Теглото е задължително';
    // } else if (parseFloat(formData?.weight) <= 0) {
    //   newErrors.weight = 'Теглото трябва да е по-голямо от 0';
    // } else if (parseFloat(formData?.weight) > 50) {
    //   newErrors.weight = 'Тегло';
    // }

    if (!formData?.ageValue) {
      newErrors.ageValue = 'Въведете възраст';
    } else if (parseInt(formData.ageValue) <= 0) {
      newErrors.ageValue = 'Възрастта трябва да е положително число';
    } else if (
      formData.ageUnit === 'months' && parseInt(formData.ageValue) > 24
    ) {
      newErrors.ageValue = 'Невалидна възраст в месеци';
    }

    if (!formData?.color) {
      newErrors.color = 'Изберете цвят';
    }

    if (formData?.color === 'custom' && !formData?.customColor?.trim()) {
      newErrors.customColor = 'Въведете цвят';
    }

    if (!formData?.address?.trim()) {
      newErrors.address = 'Въведете адрес';
    }

    if (!formData?.recordCity) {
      newErrors.recordCity = 'Изберете населено място';
    } 

    // if (!formData?.ownerName?.trim()) {
    //   newErrors.ownerName = 'Въведете име на собственик';
    // }

    // if (!formData?.ownerPhone?.trim()) {
    //   newErrors.ownerPhone = 'Въведете телефон за контакт';
    // }
    // else if (!/^\+?[\d\s\-()]{10,}$/?.test(formData?.ownerPhone)) {
    //   newErrors.ownerPhone = 'Please enter a valid phone number';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(async () => {

      const finalColor = formData?.color === 'custom' ? formData?.customColor : formData?.color;

      setRegisteredCatData({
        gender        : formData?.gender,
        weight        : formData?.weight,
        ageValue      : formData.ageValue,
        ageUnit       : formData.ageUnit,
        color         : finalColor,
        address       : formData?.address,
        ownerName     : formData?.ownerName,
        ownerPhone    : formData?.ownerPhone,
        coordinates   : coordinates,
        registeredAt  : new Date()?.toISOString()
      });
      
      setIsSubmitting(false);
      setShowSuccessModal(true);

      // ***
      await $apiCreateNewRecord(formData);
    }, 2000);
  };

  const handleSuccessModalClose = (state) => {

    setShowSuccessModal(false);

    if(state == 'close') {
      setFormData({
        recordName  : '',
        gender      : '',
        weight      : '',
        ageValue    : '',
        ageUnit     : 'months',
        color       : '',
        customColor : '',
        address     : '',
        ownerName   : '',
        ownerPhone  : '',
        recordNotes : ''
      });

      setLivingConditions(new Set());
    }

    if(state == 'same_owner') {
      setFormData({
        recordName  : '',
        gender      : '',
        weight      : '',
        ageValue    : '',
        ageUnit     : 'months',
        color       : '',
        customColor : '',
        address     : '',
        recordNotes : ''
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

    setLivingConditions(prev => {

      const abc = new Set(prev);

      if(abc.has(id)) {
        abc.delete(id);
      }
      else {
        abc.add(id)
      }

      handleInputChange('livingCondition', Array.from(abc));

      return abc;
    });
    
    // sss.add(id);

    // handleInputChange('livingCondition', Array.from(livingConditions));
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <Breadcrumb items={breadcrumbItems} />

          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-2">
              Регистрация на котка
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Полетата от формата са опционални и ще ни помогнат за по-пълен регистър на животните.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-6 md:space-y-8">
              
                <FormSection
                  title="Лице за контакти / Собственик"
                >
                  <Input
                    label="Име"
                    type="text"
                    placeholder="Име и фамилия:"
                    required
                    value={formData?.ownerName}
                    onChange={(e) => handleInputChange('ownerName', e?.target?.value)}
                    error={errors?.ownerName}
                  />

                  <Input
                    label="Номер за кореспонденция"
                    type="tel"
                    placeholder="Телефонен номер:"
                    required
                    value={formData?.ownerPhone}
                    onChange={(e) => handleInputChange('ownerPhone', e?.target?.value)}
                    error={errors?.ownerPhone}
                  />
                </FormSection>
                
                <FormSection
                  title="Основна информация">

                  <Input
                    label="Име на животното"
                    type="text"
                    placeholder="Как лицето за контакт нарича животното"
                    value={formData?.recordName}
                    onChange={(e) => handleInputChange('recordName', e?.target?.value)}
                    error={errors?.recordName}
                  />

                  <Select
                    label="Пол"
                    placeholder="Мъжки / Женски"
                    required
                    options={genderOptions}
                    value={formData?.gender}
                    onChange={(value) => handleInputChange('gender', value)}
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
                    onChange={(e) => handleInputChange('weight', e?.target?.value)}
                    error={errors?.weight}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Възраст"
                      type="number"
                      placeholder="Напр. 4"
                      required
                      min="1"
                      max={formData.ageUnit === 'months' ? 24 : 30}
                      step="1"
                      value={formData.ageValue}
                      onChange={(e) => handleInputChange('ageValue', e.target.value)}
                      error={errors?.ageValue}
                    />

                    <Select
                      label="Единица"
                      options={ageUnitOptions}
                      value={formData.ageUnit}
                      onChange={(value) => handleInputChange('ageUnit', value)}
                    />
                  </div>

                  <Select
                    label="Цвят на козината"
                    placeholder="Изберете цвят"
                    required
                    options={colorOptions}
                    value={formData?.color}
                    onChange={(value) => handleInputChange('color', value)}
                    error={errors?.color}
                  />

                <Input
                    label="Бележки"
                    type="text"
                    placeholder="Открити заболявания, усложнения и др..."
                    value={formData?.recordNotes}
                    onChange={(e) => handleInputChange('recordNotes', e?.target?.value)}
                    error={errors?.recordNotes}
                  />

                  {formData?.color === 'custom' && (
                    <Input
                      label="Custom Color"
                      type="text"
                      placeholder="Describe the cat's color"
                      required
                      value={formData?.customColor}
                      onChange={(e) => handleInputChange('customColor', e?.target?.value)}
                      error={errors?.customColor}
                      description="Provide a detailed description of the cat's color"
                    />
                  )}
                </FormSection>

                <FormSection
                  title="Къде е намерено / отглеждано животното"
                >

                  <Select
                    label="Град / село"
                    placeholder="Започнете да пишете град или село..."
                    required
                    searchable
                    options={cityOptions}
                    value={formData?.recordCity}
                    onChange={(value) => handleInputChange('recordCity', value)}
                    error={errors?.recordCity}
                  />


                  <Input
                    label="Адрес"
                    type="text"
                    placeholder="Въведете пълния адрес на животното"
                    required
                    value={formData?.address}
                    onChange={(e) => handleInputChange('address', e?.target?.value)}
                    error={errors?.address}
                    description="Информацията е необходима за картата, така че подробности като номер на сградата или улицата са важни. Формат: 'ул. Име 12'"
                  />

                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block text-foreground">Къде живее</label>

                <Checkbox 
                  label="на улицата" 
                  onChange={(e) => onCheckLocation('street')}
                  checked={livingConditions.has('street')}
                  />
                <Checkbox 
                  label="на двора"   
                  onChange={(e) => onCheckLocation('outdoor')}
                  checked={livingConditions.has('outdoor')}
                  />
                <Checkbox 
                  label="в дома"     
                  onChange={(e) => onCheckLocation('indoor')}
                  checked={livingConditions.has('indoor')}/>

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
            <svg className="w-8 h-8 mb-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold">Кликни за качване</span> или влачи снимка
            </p>
            <p className="text-xs text-muted-foreground">PNG, JPG или WebP</p>
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
        onClick={() => setFormData(prev => ({ ...prev, image: null, imagePreview: '' }))}
      >
        Премахни снимката
      </Button>
    )}
  </div>
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
                    {isSubmitting ? 'Регистрираме...' : 'Регистрирай котката'}
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
              </div>
            </div>
          </form>
        </div>
      </div>
      <FloatingActionButton
        onClick={handleSubmit}
        label="Регистрирай котка"
      />
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        catData={registeredCatData}
      />
    </>
  );
};

export default CatRegistrationForm;