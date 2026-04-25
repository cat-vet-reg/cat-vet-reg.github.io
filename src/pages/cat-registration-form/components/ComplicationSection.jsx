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

const ComplicationSection = ({ formData, handleInputChange, errors }) => {

  return (
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
  );
};

export default ComplicationSection;