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

  const colorOptions = [
    { value: 'black', label: 'Black' },
    { value: 'white', label: 'White' },
    { value: 'orange', label: 'Orange' },
    { value: 'gray', label: 'Gray' },
    { value: 'brown', label: 'Brown' },
    { value: 'calico', label: 'Calico' },
    { value: 'tabby', label: 'Tabby' },
    { value: 'tuxedo', label: 'Tuxedo' },
    { value: 'custom', label: 'Custom Color' }
  ];

  const breadcrumbItems = [
    { label: 'Dashboard'    , path: '/dashboard-overview' },
    { label: 'Register Cat' , path: '/cat-registration-form' }
  ];

  const mockGeocodeAddress = (address) => {
    const mockLocations = {
      'default': { lat: 40.7128, lng: -74.0060 }
    };
    return mockLocations?.['default'];
  };

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

    if (field === 'address' && value?.length > 10) {
      setIsValidatingAddress(true);
      setTimeout(() => {
        const coords = mockGeocodeAddress(value);
        setCoordinates(coords);
        setIsValidatingAddress(false);
      }, 1500);
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
      newErrors.gender = 'Please select a gender';
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

    setTimeout(() => {
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
    return (formData?.gender &&
    formData?.weight &&
    parseFloat(formData?.weight) > 0 &&
    formData?.color &&
    (formData?.color !== 'custom' || formData?.customColor?.trim()) &&
    formData?.address?.trim()?.length >= 10 &&
    formData?.ownerName?.trim()?.length >= 2 && /^\+?[\d\s\-()]{10,}$/?.test(formData?.ownerPhone));
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
                  title="Основна информация"
                >
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
                    options={genderOptions}
                    value={formData?.city}
                    onChange={(value) => handleInputChange('city', value)}
                    error={errors?.city}
                  />


                  <Input
                    label="Адрес"
                    type="text"
                    placeholder="Въведете пълния адрес на животното"
                    required
                    value={formData?.address}
                    onChange={(e) => handleInputChange('address', e?.target?.value)}
                    error={errors?.address}
                    description="Информацията е необходима за картата, така че подробности като номер на сградата или улицата са важни"
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
        label="Register Cat"
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