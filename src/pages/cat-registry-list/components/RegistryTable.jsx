import React        from 'react';
import Icon         from '../../../components/AppIcon';
import Button       from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

import {convertDate} from '../../../utils/date'

  const colorOptions = [
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
  ];

  const colorStyles = {
    tabby: 'repeating-linear-gradient(45deg, #8B4513, #8B4513 2px, #D2B48C 2px, #D2B48C 4px)',
    calico: 'conic-gradient(#FF8C42 0deg 120deg, #1A1A1A 120deg 240deg, #FFFFFF 240deg)',
    tortoiseshell: 'repeating-radial-gradient(circle, #1A1A1A, #FF8C42 5px)',
    tuxedo: 'linear-gradient(to right, #1A1A1A 50%, #FFFFFF 50%)',
    orange_white: 'linear-gradient(to right, #FF8C42 50%, #FFFFFF 50%)',
    orange: '#ef8f09ff',
    black: '#1A1A1A',
    white: '#FFFFFF',
    orange: '#FF8C42',
    gray: '#808080',
    brown: '#8B4513',
    cinnamon: '#D2691E',
    fawn: '#E5AA70',
  };

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
  const getSortIcon = (column) => {
    if (sortConfig?.column !== column) return 'ChevronsUpDown';
    return sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown';
  };

  const handleSort = (column) => {
    const direction = 
      sortConfig?.column === column && sortConfig?.direction === 'asc' ?'desc' :'asc';
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
                  indeterminate={selectedCats?.length > 0 && selectedCats?.length < cats?.length}
                  onChange={(e) => onSelectAll(e?.target?.checked)}
                />
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2 font-semibold text-sm text-foreground hover:text-primary transition-smooth"
                >
                  Име
                  <Icon name={getSortIcon('name')} size={16} />
                </button>
              </th>
              {/* <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('gender')}
                  className="flex items-center gap-2 font-semibold text-sm text-foreground hover:text-primary transition-smooth"
                >
                  Пол
                  <Icon name={getSortIcon('gender')} size={16} />
                </button>
              </th> */}
              <th className="hidden md:table-cell px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('color')}
                  className="flex items-center gap-2 font-semibold text-sm text-foreground hover:text-primary transition-smooth"
                >
                  Цвят
                  <Icon name={getSortIcon('color')} size={16} />
                </button>
              </th>
              <th className="hidden md:table-cell px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('weight')}
                  className="flex items-center gap-2 font-semibold text-sm text-foreground hover:text-primary transition-smooth"
                >
                  Тегло
                  <Icon name={getSortIcon('weight')} size={16} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('ownerName')}
                  className="flex items-center gap-2 font-semibold text-sm text-foreground hover:text-primary transition-smooth"
                >
                  Собственик
                  <Icon name={getSortIcon('ownerName')} size={16} />
                </button>
              </th>

              <th className="hidden md:table-cell px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('ownerName')}
                  className="flex items-center gap-2 font-semibold text-sm text-foreground hover:text-primary transition-smooth"
                >
                  Телефон
                  <Icon name={getSortIcon('ownerName')} size={16} />
                </button>
              </th>

              <th className="hidden md:table-cell px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('registrationDate')}
                  className="flex items-center gap-2 font-semibold text-sm text-foreground hover:text-primary transition-smooth"
                >
                  Регистрирана на
                  <Icon name={getSortIcon('registrationDate')} size={16} />
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <span className="font-semibold text-sm text-foreground">Действия</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {cats?.map((cat) => (
              <tr 
                key={cat?.id} 
                className="hover:bg-muted/50 transition-smooth"
              >

                <td className="hidden md:table-cell px-4 py-3">
                  <Checkbox
                    checked={selectedCats?.includes(cat?.id)}
                    onChange={() => onSelectCat(cat?.id)}
                  />
                </td>

                <td className="px-4 py-3">
                  
                  <div className="flex items-center gap-2">
                    <Icon 
                      name={cat?.gender === 'male' ? 'Mars' : 'Venus'} 
                      size={16} 
                      color={cat?.gender === 'male' ? 'var(--color-primary)' : 'var(--color-secondary)'} 
                    />
                    <span className="font-medium text-foreground">{cat?.name}</span>
                  </div>
                </td>

                <td className="hidden md:table-cell px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border border-border"
                      // Тук можеш да добавиш логика за автоматичен цвят, ако имаш colorHex в базата
                      style={{ background: colorStyles[cat?.color] || '#ccc' }} 
                    />
                    <span className="text-sm text-muted-foreground">
                      {/* ТУК Е ПРОМЯНАТА: */}
                      {colorOptions.find(opt => opt.value === cat?.color)?.label || cat?.color}
                    </span>
                  </div>
                </td>
                <td className="hidden md:table-cell px-4 py-3">
                  <span className="text-sm text-muted-foreground data-text">{cat?.weight} кг</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-muted-foreground">{cat?.owner_name}</span>
                </td>
                <td className="hidden md:table-cell px-4 py-3">
                  <span className="text-sm text-muted-foreground">{cat?.owner_phone}</span>
                </td>                
                <td className="hidden md:table-cell px-4 py-3">
                  <span className="text-sm text-muted-foreground data-text">{convertDate(cat?.created_at)}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      iconName="Eye"
                      onClick={() => onViewDetails(cat?.id)}
                      aria-label={`View details for ${cat?.name}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      iconName="Edit"
                      onClick={() => onEdit(cat)}
                      aria-label={`Edit ${cat?.name}`}
                    />
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