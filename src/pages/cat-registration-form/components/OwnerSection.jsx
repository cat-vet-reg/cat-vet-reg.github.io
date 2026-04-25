import React from 'react';
import Input from "../../../components/ui/Input";
import FormSection from "./FormSection";

const OwnerSection = ({ formData, handleInputChange, errors, isEditing }) => {
  return (
    <FormSection title="Лице за контакти / Собственик" className="bg-[#e64072]/20 rounded-[20px] p-3">
      <div className="flex justify-between items-center mb-4">
        {isEditing && (
          <button
            type="button"
            onClick={() => {
              handleInputChange("ownerName", "");
              handleInputChange("ownerPhone", "");
              // Важно: не променяме isEditing тук, за да не загубим ID-то на записа в td_records
            }}
            className="text-xs bg-white/50 hover:bg-white px-2 py-1 rounded border border-pink-300 transition-all"
          >
            🔄 Смени човека
          </button>
        )}
      </div>
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
  );
};

export default OwnerSection;