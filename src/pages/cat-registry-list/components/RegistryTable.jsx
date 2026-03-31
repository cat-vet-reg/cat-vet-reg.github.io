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
                { id: 'weight', label: 'Тегло', hideMobile: true },
                { id: 'ownerName', label: 'Собственик' },
                { id: 'ownerPhone', label: 'Телефон', hideMobile: true },
                { id: 'castratedAt', label: 'Кастрирана на', hideMobile: true },
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
              <tr key={cat.id} className="hover:bg-muted/50 transition-smooth">
                <td className="hidden md:table-cell px-4 py-3">
                  <Checkbox
                    checked={selectedCats?.includes(cat.id)}
                    onChange={() => onSelectCat(cat.id)}
                  />
                </td>

                <td className="px-4 py-3 font-medium text-foreground">{cat.id}</td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Icon 
                      name={cat.gender === 'male' ? 'Mars' : 'Venus'} 
                      size={16} 
                      color={cat.gender === 'male' ? 'var(--color-primary)' : 'var(--color-secondary)'} 
                    />
                    <span className="font-medium text-foreground">{cat.recordName}</span>
                  </div>
                </td>

                <td className="hidden md:table-cell px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ background: colorStyles[cat.color] || '#ccc' }} 
                    />
                    <span className="text-sm text-muted-foreground">
                      {colorOptions.find(opt => opt.value === cat.color)?.label || cat.color}
                    </span>
                  </div>
                </td>

                <td className="hidden md:table-cell px-4 py-3 text-sm text-muted-foreground">
                  {cat.weight ? `${cat.weight} кг` : '—'}
                </td>

                <td className="px-4 py-3 text-sm text-muted-foreground">{cat.ownerName}</td>
                
                <td className="hidden md:table-cell px-4 py-3 text-sm text-muted-foreground">
                  {cat.ownerPhone}
                </td>

                <td className="hidden md:table-cell px-4 py-3 text-sm text-muted-foreground data-text">
                  {convertDate(cat.castratedAt)}
                </td>

                <td className="px-4 py-3 text-center">
                  {cat.hasComplications === 'Y' ? (
                    <div className="flex items-center justify-center text-destructive" title="Настъпило усложнение">
                      <AlertTriangle size={20} strokeWidth={2.5} />
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