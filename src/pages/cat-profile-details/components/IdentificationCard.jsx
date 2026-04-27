import React, { useState, useEffect } from 'react';
import supabase from '../../../utils/supabase';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const IdentificationCard = ({ identification }) => {
  if (!identification) return null;

  return (
    <div className="bg-white rounded-[30px] p-6 shadow-sm border border-gray-100 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
          <Icon name="IdCard" size={24} />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Идентификация</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Микрочип */}
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-2">Микрочип</p>
          <p className="text-lg font-bold text-gray-900">{identification.chip_number || 'Няма номер'}</p>
          <div className="mt-2 text-sm text-gray-600">
            <div><span className="opacity-70">От:</span> {identification.chip_date_from}</div>
            <div><span className="opacity-70">Лекар:</span> {identification.chip_vet}</div>
          </div>
        </div>

        {/* Паспорт */}
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-2">Официален паспорт</p>
          <p className="text-lg font-bold text-gray-900">{identification.passport_number || 'Няма номер'}</p>
          <div className="mt-2 text-sm text-gray-600">
            <div><span className="opacity-70">От:</span> {identification.passport_date_from}</div>
            <div><span className="opacity-70">Лекар:</span> {identification.passport_vet}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdentificationCard;