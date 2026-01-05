import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import FormSection from './components/FormSection';
import MapPreview from './components/MapPreview';
import SuccessModal from './components/SuccessModal';

import supabase from 'utils/supabase';
import { getCoordinates } from '../../utils/geocoding';

const CatRegistrationForm = () => {
  const [formData, setFormData] = useState({
    gender: '',
    weight: '',
    color: '',
    customColor: '',
    address: '',
    ownerName: '',
    ownerPhone: ''
  });

  const [errors, setErrors] = useState({});
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredCatData, setRegisteredCatData] = useState(null);

  const genderOptions = [
    { value: 'male', label: 'Мъжки' },
    { value: 'female', label: 'Женски' }
  ];


  const cityOptions = [
    { value: 'Plovdiv', label: 'Пловдив' },
    { value: 'Asenovgrad', label: 'Асеновград' },
    { value: 'Pazardzik', label: 'Пазарджик' }
  ];

  const colorOptions = [
<<<<<<< HEAD
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
=======
    { value: 'black', label: 'Черна' },
    { value: 'white', label: 'Бяла' },
    { value: 'orange', label: 'Рижа' },
    { value: 'gray', label: 'Сива' },
    { value: 'brown', label: 'Кафява' },
    { value: 'calico', label: 'Калико' },
    { value: 'tabby', label: 'Таби' },
    { value: 'tuxedo', label: 'Tuxedo' },
    { value: 'custom', label: 'Нещо друго' }
>>>>>>> 5bf2240c40b1ffe00401e90ffe8061c33962b09d
  ];

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard-overview' },
<<<<<<< HEAD
    { label: 'Регистрирай котка', path: '/cat-registration-form' }
=======
    { label: 'Register Cat', path: '/cat-registration-form' }
>>>>>>> 5bf2240c40b1ffe00401e90ffe8061c33962b09d
  ];



  const handleInputChange = (field, value) => {

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    const shouldGeocode =
      (field === 'address' && value?.length > 5) ||
      (field === 'recordCity' && formData?.address?.length > 5);

    if (shouldGeocode) {
      setIsValidatingAddress(true);

      // Clear existing timeout if you want strictly debounce (optional but good)
      // For now keeping simple structure matching previous code style
      const cityToUse = field === 'recordCity' ? value : formData?.recordCity;
      const addressToUse = field === 'address' ? value : formData?.address;

      // Debounce the API call slightly
      const timer = setTimeout(async () => {
        const coords = await getCoordinates(cityToUse, addressToUse);
        if (coords) {
          setCoordinates(coords);
        }
        setIsValidatingAddress(false);
      }, 1000);

      // Cleanup function not easily available here without a ref for the timer, 
      // but simplistic approach works for this context.
    }

    if (field === 'color' && value !== 'custom') {
      setFormData(prev => ({
        ...prev,
        customColor: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.gender) {
      newErrors.gender = 'Изберете пол';
    }

    if (!formData?.weight) {
      newErrors.weight = 'Теглото е задължително';
    } else if (parseFloat(formData?.weight) <= 0) {
      newErrors.weight = 'Теглото трябва да е по-голямо от 0';
    } else if (parseFloat(formData?.weight) > 50) {
      newErrors.weight = 'Тегло';
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

    if (!formData?.ownerName?.trim()) {
      newErrors.ownerName = 'Въведете име на собственик';
    }

    if (!formData?.ownerPhone?.trim()) {
      newErrors.ownerPhone = 'Въведете телефон за контакт';
    }
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

      const catData = {
        gender: formData?.gender,
        weight: formData?.weight,
        color: finalColor,
        address: formData?.address,
        ownerName: formData?.ownerName,
        ownerPhone: formData?.ownerPhone,
        coordinates: coordinates,
        registeredAt: new Date()?.toISOString()
      };

      setRegisteredCatData(catData);
      setIsSubmitting(false);
      setShowSuccessModal(true);

      await supabase.from('td_records').insert({
        record_name: formData?.recordName,
        record_gender: formData?.gender,
        owner_name: formData?.ownerName,
        owner_phone: formData?.ownerPhone,
        record_weight: formData?.weight,
        record_color: finalColor,
        record_location_address: formData?.address,
        record_location_city: formData?.recordCity
      });

    }, 2000);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setFormData({
      gender: '',
      weight: '',
      color: '',
      customColor: '',
      address: '',
      ownerName: '',
      ownerPhone: ''
    });
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
                    label="Тегло в килограми"
                    type="number"
                    placeholder="Въведете теглото"
                    required
                    min="0.1"
                    max="50"
                    step="0.1"
                    value={formData?.weight}
                    onChange={(e) => handleInputChange('weight', e?.target?.value)}
                    error={errors?.weight}
                  />

                  <Select
                    label="Цвят на козината"
                    placeholder="Изберете цвят"
                    required
                    options={colorOptions}
                    value={formData?.color}
                    onChange={(value) => handleInputChange('color', value)}
                    error={errors?.color}
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
                    label="Град"
                    placeholder="В кой град (или околностите), е намерено животното"
                    required
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
                    error={errors?.recordAddress}
                    description="Информацията е необходима за картата, така че подробности като номер на сградата или улицата са важни. Формат: 'ул. Име 12'"
                  />
                </FormSection>

                <FormSection
                  title="Лице за контакти / Собственик"
                >
                  <Input
                    label="Име"
                    type="text"
                    placeholder="Име и фамилия на лицето за контакт"
                    required
                    value={formData?.ownerName}
                    onChange={(e) => handleInputChange('ownerName', e?.target?.value)}
                    error={errors?.ownerName}
                  />

                  <Input
                    label="Номер за кореспонденция"
                    type="tel"
                    placeholder="Телефонен номер на лицето за контакт"
                    required
                    value={formData?.ownerPhone}
                    onChange={(e) => handleInputChange('ownerPhone', e?.target?.value)}
                    error={errors?.ownerPhone}
                  />
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
<<<<<<< HEAD
        label="Регистрирай котка"
=======
        label="Register Cat"
>>>>>>> 5bf2240c40b1ffe00401e90ffe8061c33962b09d
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