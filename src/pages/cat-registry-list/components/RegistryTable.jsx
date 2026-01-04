import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

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
    <div className="bg-card rounded-lg shadow-warm overflow-hidden">
      <div className="overflow-x-auto scrollbar-custom">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left">
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
                  Cat Name
                  <Icon name={getSortIcon('name')} size={16} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('gender')}
                  className="flex items-center gap-2 font-semibold text-sm text-foreground hover:text-primary transition-smooth"
                >
                  Gender
                  <Icon name={getSortIcon('gender')} size={16} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('color')}
                  className="flex items-center gap-2 font-semibold text-sm text-foreground hover:text-primary transition-smooth"
                >
                  Color
                  <Icon name={getSortIcon('color')} size={16} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('weight')}
                  className="flex items-center gap-2 font-semibold text-sm text-foreground hover:text-primary transition-smooth"
                >
                  Weight
                  <Icon name={getSortIcon('weight')} size={16} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="font-semibold text-sm text-foreground">Found Location</span>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('ownerName')}
                  className="flex items-center gap-2 font-semibold text-sm text-foreground hover:text-primary transition-smooth"
                >
                  Owner Name
                  <Icon name={getSortIcon('ownerName')} size={16} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('registrationDate')}
                  className="flex items-center gap-2 font-semibold text-sm text-foreground hover:text-primary transition-smooth"
                >
                  Registration Date
                  <Icon name={getSortIcon('registrationDate')} size={16} />
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <span className="font-semibold text-sm text-foreground">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {cats?.map((cat) => (
              <tr 
                key={cat?.id} 
                className="hover:bg-muted/50 transition-smooth"
              >
                <td className="px-4 py-3">
                  <Checkbox
                    checked={selectedCats?.includes(cat?.id)}
                    onChange={() => onSelectCat(cat?.id)}
                  />
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium text-foreground">{cat?.name}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Icon 
                      name={cat?.gender === 'Male' ? 'Mars' : 'Venus'} 
                      size={16} 
                      color={cat?.gender === 'Male' ? 'var(--color-primary)' : 'var(--color-secondary)'} 
                    />
                    <span className="text-sm text-muted-foreground">{cat?.gender}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: cat?.colorHex }}
                    />
                    <span className="text-sm text-muted-foreground">{cat?.color}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-muted-foreground data-text">{cat?.weight} kg</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-muted-foreground line-clamp-2">{cat?.foundLocation}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-muted-foreground">{cat?.ownerName}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-muted-foreground data-text">{cat?.registrationDate}</span>
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
                      onClick={() => onEdit(cat?.id)}
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