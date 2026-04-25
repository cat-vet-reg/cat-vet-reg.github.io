import React, { useState, useEffect } from "react";
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
import { Checkbox }             from "../../../components/ui/Checkbox";

const AnesthesiaSectionRaw = ({ formData, handleInputChange, errors }) => {

  return (
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
  );
};

export default AnesthesiaSectionRaw;