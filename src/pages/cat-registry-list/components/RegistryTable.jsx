import React              from 'react';
import Icon               from '../../../components/AppIcon';
import Button             from '../../../components/ui/Button';
import { Checkbox }       from '../../../components/ui/Checkbox';
import { AlertTriangle }  from "lucide-react";
import {convertDate}      from '../../../utils/date'
import {  genderOptions, 
          spicyOptions,
          bcsScores,
          getBcsDescription,
          ageUnitOptions, 
          colorOptions,
          colorStyles,
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

const RegistryTable = ({ 
  cats, 
  selectedCats,
  onSelectCat, 
  onSelectAll, 
  onSort, 
  sortConfig,
  onViewDetails,
  onEdit 
}) => {
  
  // Помощна функция за иконата за сортиране
  const getSortIcon = (column) => {
    if (sortConfig?.column !== column) return 'ChevronsUpDown';
    return sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown';
  };

  const handleSort = (column) => {
    const direction = sortConfig?.column === column && sortConfig?.direction === 'asc' ? 'desc' : 'asc';
    onSort(column, direction);
  };

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

              {/* Колонките използват новите ключове от мапера */}
              {[
                { id: 'id', label: '#' },
                { id: 'recordName', label: 'Име' },
                { id: 'color', label: 'Цвят', hideMobile: true },
                // { id: 'weight', label: 'Тегло', hideMobile: true },
                { id: 'ownerName', label: 'Собственик' },
                // { id: 'ownerPhone', label: 'Телефон', hideMobile: true },
                { id: 'castratedAt', label: 'Кастрирана на', hideMobile: true },
                { id: 'staffSurgeon', label: 'Хирург',  hideMobile: true },
                { id: 'hasComplications', label: 'Усложнения' }
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
              <tr key={cat.id} className={`
                hover:bg-muted/50 transition-smooth
                ${cat.ownerBlacklistReason ? 'bg-red-50/30' : ''}`}>
                <td className="hidden md:table-cell px-4 py-3">
                  <Checkbox
                    checked={selectedCats?.includes(cat.id)}
                    onChange={() => onSelectCat(cat.id)}
                  />
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {/* ID като дискретен етикет */}
                    <span className="text-[11px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground border border-border/50">
                      {cat.id}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <Icon 
                          name={cat.species === 'dog' ? 'Dog' : 'Cat'} 
                          size={16} 
                          className="text-foreground/60"
                        />
                        <Icon 
                          name={cat.gender === 'male' ? 'Mars' : 'Venus'} 
                          size={14} 
                          color={cat.gender === 'male' ? 'var(--color-primary)' : 'var(--color-secondary)'} 
                        />
                        {/* Името - водещ елемент */}
                        <span className="text-muted-foreground">
                          {cat.recordName?.startsWith('Котка №') ? (
                            <span className="text-muted-foreground/30 font-normal italic"></span>
                          ) : (
                            cat.recordName
                          )}
                        </span>
                      </div>
                    </div>
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

                {/* <td className="hidden md:table-cell px-4 py-3 text-sm text-muted-foreground">
                  {cat.weight ? `${cat.weight} кг` : '—'}
                </td> */}

                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className={`text-sm font-bold ${cat.ownerBlacklistReason ? 'text-destructive' : 'text-foreground'}`}>
                      {cat.ownerName}
                    </span>
                    <span className="text-xs text-muted-foreground">{cat.ownerPhone}</span>
                  </div>
                </td>

                <td className="hidden md:table-cell px-4 py-3 text-sm text-muted-foreground data-text">
                  {convertDate(cat.castratedAt)}
                </td>

                <td className="px-4 py-3">
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-primary">
                      {staffOptions.find(opt => opt.value === cat.staffSurgeon)?.label || cat.staffSurgeon || '—'}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-3 text-center relative group">
                  {cat.hasComplications === 'Y' ? (
                    <div className="flex items-center justify-center text-destructive cursor-help">
                      <AlertTriangle size={20} strokeWidth={2.5} />
                      
                      <div className="absolute bottom-full mb-2 hidden group-hover:block z-50 w-64 p-3 bg-white text-slate-900 text-xs rounded-lg shadow-xl border border-destructive/20 pointer-events-none">
                        <ul className="space-y-1.5">
                          {cat.selectedComplications && cat.selectedComplications.length > 0 ? (
                            cat.selectedComplications.map((compId, index) => {
                              // Събираме всички опции в един общ масив за търсене
                              const allOptions = [
                                ...complicationOptions.female,
                                ...complicationOptions.male,
                                ...complicationOptions.general
                              ];
                              const label = allOptions.find(opt => opt.id === compId)?.label || compId;
                              
                              return (
                                <li key={index} className="flex items-start gap-1.5 leading-tight">
                                  <span className="text-destructive mt-0.5">•</span>
                                  <span>{label}</span>
                                </li>
                              );
                            })
                          ) : (
                            <li className="italic text-muted-foreground text-center">Няма детайли</li>
                          )}
                        </ul>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white"></div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground/20">—</span>
                  )}
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
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