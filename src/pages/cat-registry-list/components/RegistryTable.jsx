import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import { AlertTriangle } from "lucide-react";
import { convertDate } from '../../../utils/date';
import { 
  colorOptions, 
  colorStyles, 
  staffOptions, 
  complicationOptions 
} from "../../../constants/formOptions";
import { breedOptions   } from "../../../constants/breed_options";
import { cityOptions    } from "../../../constants/city_options";
import { statusOptions } from "../../../constants/formOptions";

const RegistryTable = ({ 
  cats, 
  isClinicalView, // Важно: приемаме го от родителя
  currentPage, // Приемаме го
  pageSize,
  selectedCats,
  onSelectCat, 
  onSelectAll, 
  onSort, 
  sortConfig,
  onViewDetails,
  onEdit 
}) => {
  
  const getSortIcon = (column) => {
    if (sortConfig?.column !== column) return 'ChevronsUpDown';
    return sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown';
  };

  const handleSort = (column) => {
    const direction = sortConfig?.column === column && sortConfig?.direction === 'asc' ? 'desc' : 'asc';
    onSort(column, direction);
  };

  // Помощна функция за намиране на име на хирург
  const getStaffLabel = (id) => staffOptions.find(opt => opt.value === id)?.label || id || '—';

  // Помощна функция за намиране на обекта на статуса
  const getStatusInfo = (statusId) => {
    return statusOptions.find(opt => opt.id === statusId) || { 
      label: statusId, 
      color: 'bg-slate-100 text-slate-700' 
    };
  };

  // 1. РЕЖИМ АМБУЛАТОРЕН ДНЕВНИК
  if (isClinicalView) {
    return (
      <div className="bg-card rounded-lg shadow-warm overflow-hidden border">
        <div className="overflow-x-auto scrollbar-custom">
          <table className="w-full border-collapse">
            <thead className="bg-muted/50">
              <tr>
                {[
                  { id: 'seq'     , label: '№' },
                  { id: 'id'      , label: 'Амб. №' },
                  { id: 'date'    , label: 'Дата' },
                  { id: 'owner'   , label: 'Собственик (име, адрес)' },
                  { id: 'animal'  , label: 'Пациент (вид, пол, възраст)' },
                  { id: 'identification', label: 'Идентификация' },
                  { id: 'clinical_signs', label: 'Клинични данни' },
                  { id: 'diagnostics'   , label: 'Диагностични изследвания' },
                  { id: 'diagnosis'     , label: 'Диагноза' },           
                  { id: 'treatment'     , label: 'Лечение' },
                  { id: 'outcome'       , label: 'Изход от болестта' }
                ].map(col => (
                  <th key={col.id} className="px-3 py-4 text-[10px] font-bold uppercase text-left border-b border-border text-muted-foreground tracking-wider">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {cats?.map((cat, index) => {
              const globalIndex = ((currentPage - 1) * pageSize) + index + 1;
              
              // АКО сме в клиничен изглед, ползваме готовия identificationInfo
              // АКО НЕ - смятаме го както досега
              const idLabel = cat.identificationInfo || (() => {
                  const iden = cat.td_identifications && cat.td_identifications[0];
                  const earStatus = cat.medical_details?.ear_status === 'marked' ? 'маркирано ухо' : '';
                  const earTag = cat.data?.ear_tag_number ? `марка № ${cat.data.ear_tag_number}` : '';
                  const chip = iden?.chip_number ? `чип № ${iden.chip_number}` : '';
                  const passport = iden?.passport_number ? `пасп. № ${iden.passport_number}` : '';
                  return [earStatus, earTag, chip, passport].filter(Boolean).join(' / ') || '—';
              })();

              return (
                <tr key={cat.uId || cat.id} className="hover:bg-slate-50/80 transition-colors align-top">
                  <td className="px-3 py-4 text-[11px] text-muted-foreground/60 font-medium">{globalIndex}</td>
                  <td className="px-3 py-4 text-[11px] font-mono text-primary font-bold">{cat.id}</td>
                  <td className="px-3 py-4 text-[11px] whitespace-nowrap">
                    {cat.displayDate ? convertDate(cat.displayDate) : "—"}
                  </td>

                  {/* Собственик */}
                  <td className="px-3 py-4 text-[11px] max-w-[200px]">
                    <div className="font-bold text-slate-900 leading-tight">{cat.ownerName}</div>
                    <div className="text-muted-foreground mt-1 leading-normal italic">
                      {cityOptions.find(opt => opt.value === cat?.location_city)?.label || cat?.location_city || '-'}
                    </div>
                  </td>

                  {/* Животно */}
                  <td className="px-3 py-4 text-[11px]">
                    <div className="flex items-center gap-1 font-bold text-slate-700">
                      {cat.species === 'dog' ? 'Куче' : 'Котка'}, {cat.gender === 'male' ? 'Мъжки' : 'Женски'}
                    </div>
                    <div className="text-muted-foreground">
                        {cat.data?.age_value || '—'} {cat.data?.age_unit === 'years' ? 'год.' : 'мес.'}
                    </div>
                    <div className="text-[10px] text-muted-foreground/70">
                      {breedOptions.find(opt => opt.value === cat?.data?.breed)?.label || cat?.data?.breed || 'Неизвестна порода'}
                    </div>
                  </td>

                  {/* Идентификация */}
                  <td className="px-3 py-4 text-[11px] font-medium text-slate-600 italic">
                    {idLabel}
                  </td>

                  {/* Клинични данни - идват от обработения cat обект */}
                  <td className="px-3 py-4 text-[11px] text-slate-600 leading-relaxed max-w-[220px]">
                    {cat.clinicalData || "Без особености"}
                  </td>

                  {/* Диагностични изследвания */}
                  <td className="px-3 py-4 text-[11px] text-slate-500 italic max-w-[150px]">
                    {cat.examination || "не са извършени"}
                  </td>

                  {/* Диагноза */}
                  <td className="px-3 py-4 text-[11px]">
                    <span className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold border border-slate-200">
                      {cat.diagnosis || "Sanus"}
                    </span>
                  </td>

                  {/* Лечение */}
                  <td className="px-3 py-4 text-[11px] leading-relaxed max-w-[280px]">
                    <div className="text-slate-800 font-medium">{cat.treatment || "Ovariohysterectomy / Orchiectomy"}</div>
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                        <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase">
                           {getStaffLabel(cat.staffSurgeon)}
                        </span>
                    </div>
                  </td>

                  {/* Изход от болестта */}
                  <td className="px-3 py-4 text-[11px] font-medium text-slate-600 italic">
                    {cat.outcome || "Оздравяло"}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 2. ОРИГИНАЛНАТА ТАБЛИЦА (както беше преди)
  return (
    <div className="bg-card rounded-lg shadow-warm">
      <div className="overflow-x-auto scrollbar-custom">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="hidden md:table-cell px-4 py-3 text-left">
                <Checkbox
                  checked={selectedCats?.length === cats?.length && cats?.length > 0}
                  onChange={(e) => onSelectAll(e?.target?.checked)}
                />
              </th>

              {[
                { id: 'id', label: '#' },
                { id: 'recordName', label: 'Име' },
                { id: 'color', label: 'Цвят', hideMobile: true },
                { id: 'ownerName', label: 'Собственик' },
                { id: 'castratedAt', label: 'Кастрирана на', hideMobile: true },
                { id: 'staffSurgeon', label: 'Хирург', hideMobile: true },
                { id: 'status', label: 'Статус' }
              ].map(col => (
                <th key={col.id} className={`${col.hideMobile ? 'hidden md:table-cell' : ''} px-4 py-3 text-left`}>
                  <button
                    onClick={() => handleSort(col.id)}
                    className="flex items-center gap-2 font-semibold text-sm text-foreground hover:text-primary transition-smooth"
                  >
                    {col.label}
                    <Icon name={getSortIcon(col.id)} size={16} />
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 text-right font-semibold text-sm text-foreground">Действия</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {cats?.map((cat) => (
              <tr key={cat.uId || cat.id} className={`
                hover:bg-muted/50 transition-smooth
                ${cat.ownerBlacklistReason ? 'bg-red-50/30' : ''}`}>
                
                <td className="hidden md:table-cell px-4 py-3">
                  <Checkbox
                    checked={selectedCats?.includes(cat.id)}
                    onChange={() => onSelectCat(cat.id)}
                  />
                </td>

                <td className="px-4 py-3">
                  <span className="text-[11px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground border border-border/50">
                    {cat.id}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Icon name={cat.species === 'dog' ? 'Dog' : 'Cat'} size={16} className="text-foreground/60" />
                    <Icon 
                      name={cat.gender === 'male' ? 'Mars' : 'Venus'} 
                      size={14} 
                      color={cat.gender === 'male' ? 'var(--color-primary)' : 'var(--color-secondary)'} 
                    />
                    <span className="text-muted-foreground">
                      {cat.recordName?.startsWith('Котка №') ? "" : cat.recordName}
                    </span>

                  {/* Удивителна за усложнения точно до името */}
                  {cat.hasComplications === 'Y' && (
                    <div className="relative group ml-1">
                      <AlertTriangle size={14} className="text-destructive cursor-help" strokeWidth={3} />
                      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50 w-48 p-2 bg-white text-slate-900 text-[10px] rounded shadow-xl border border-destructive/20">
                        <ul className="space-y-1">
                          {cat.selectedComplications?.map((compId, idx) => {
                            const all = [...complicationOptions.female, ...complicationOptions.male, ...complicationOptions.general];
                            return <li key={idx}>• {all.find(o => o.id === compId)?.label || compId}</li>;
                          })}
                        </ul>
                      </div>
                    </div>
                  )}
                  </div>
                </td>

                <td className="hidden md:table-cell px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ background: colorStyles[cat.data?.color] || '#ccc' }} 
                    />
                    <span className="text-sm text-muted-foreground">
                      {colorOptions.find(opt => opt.value === cat.data?.color)?.label || cat.data?.color}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className={`text-sm font-bold ${cat.ownerBlacklistReason ? 'text-destructive' : 'text-foreground'}`}>
                      {cat.ownerName}
                    </span>
                    <span className="text-xs text-muted-foreground">{cat.ownerPhone}</span>
                  </div>
                </td>

              <td className="hidden md:table-cell px-4 py-3 text-sm text-muted-foreground">
                {cat.castratedAt ? convertDate(cat.castratedAt) : "—"}
              </td>

                <td className="px-4 py-3 text-sm font-medium text-primary">
                  {staffOptions.find(opt => opt.value === cat.staffSurgeon)?.label || cat.staffSurgeon || '—'}
                </td>

<td className="px-4 py-3 text-sm">
  {(() => {
    const status = getStatusInfo(cat.status);
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border border-black/5 whitespace-nowrap ${status.color}`}>
        {status.label}
      </span>
    );
  })()}
</td>

                {/* <td className="px-4 py-3 text-center relative group">
                  {cat.hasComplications === 'Y' ? (
                    <div className="flex items-center justify-center text-destructive cursor-help">
                      <AlertTriangle size={20} strokeWidth={2.5} />
                      <div className="absolute bottom-full mb-2 hidden group-hover:block z-50 w-64 p-3 bg-white text-slate-900 text-xs rounded-lg shadow-xl border border-destructive/20">
                        <ul className="space-y-1.5 text-left">
                          {cat.selectedComplications?.map((compId, idx) => {
                            const all = [...complicationOptions.female, ...complicationOptions.male, ...complicationOptions.general];
                            return <li key={idx}>• {all.find(o => o.id === compId)?.label || compId}</li>;
                          })}
                        </ul>
                      </div>
                    </div>
                  ) : <span className="text-muted-foreground/20">—</span>}
                </td> */}

                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" iconName="Eye" onClick={() => onViewDetails(cat.id)} />
                    <Button variant="ghost" size="icon" iconName="Edit" onClick={() => onEdit(cat)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegistryTable;