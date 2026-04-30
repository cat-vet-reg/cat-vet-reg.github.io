import React, {useState, useEffect} from 'react';
import Input from "../../../components/ui/Input";
import FormSection from "./FormSection";
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
          } from "../../../constants/formOptions";

import Select                   from "../../../components/ui/Select";
import { cityOptions          } from "../../../constants/city_options";
import If                                   from "components/If";
import Autocomplete                         from "react-google-autocomplete";
import { Checkbox } from 'components/ui/Checkbox';

const LocationSection = ({ getCoordinates, findDistrict, address, city, formData, handleInputChange, errors, setIsValidatingAddress, setFormData, onCheckLocation }) => {
  const [mapUrl, setMapUrl]     = useState('AIzaSyCSyjPTq09LYc7lcBxotOnv-KBTiEfNbOI');
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&components=locality:${encodeURIComponent(city)}|country:BG&key=${mapUrl}`;

  useEffect(() => {
    fetch(`https://mihail-petrov.me/apimap/index.php`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setMapUrl(data.mapUrl))
      .catch(() => console.log("Using default API key"));
  }, []); // Празен масив = изпълнява се само при "Mount"


  // Логика за чекбоксовете
  const toggleLivingCondition = (value) => {
    const current = formData.livingCondition || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    handleInputChange("livingCondition", updated);
  };

  return (
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
  );
};

export default LocationSection;