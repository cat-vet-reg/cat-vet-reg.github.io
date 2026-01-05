import React from 'react';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const FilterPanel = ({ 
  filters, 
  onFilterChange, 
  onClearFilters,
  genderOptions,
  colorOptions,
  locationOptions 
}) => {
  return (
    <div className="bg-card rounded-lg p-4 md:p-6 shadow-warm mb-4 md:mb-6">
      <div className="flex flex-col lg:flex-row lg:items-end gap-4">
        <div className="flex-1">
          <Input
            type="search"
<<<<<<< HEAD
            label="Търси"
            placeholder="Търси по животно, собственик или локация..."
=======
            label="Search"
            placeholder="Search by cat name, owner, or location..."
>>>>>>> 5bf2240c40b1ffe00401e90ffe8061c33962b09d
            value={filters?.search}
            onChange={(e) => onFilterChange('search', e?.target?.value)}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
          <Select
<<<<<<< HEAD
            label="Пол"
            placeholder="Избери пол"
=======
            label="Gender"
            placeholder="All Genders"
>>>>>>> 5bf2240c40b1ffe00401e90ffe8061c33962b09d
            options={genderOptions}
            value={filters?.gender}
            onChange={(value) => onFilterChange('gender', value)}
            clearable
          />

          <Select
<<<<<<< HEAD
            label="Цвят"
            placeholder="Избери цвят"
=======
            label="Color"
            placeholder="All Colors"
>>>>>>> 5bf2240c40b1ffe00401e90ffe8061c33962b09d
            options={colorOptions}
            value={filters?.color}
            onChange={(value) => onFilterChange('color', value)}
            searchable
            clearable
          />

          <Select
<<<<<<< HEAD
            label="Локация"
            placeholder="Избери локация"
=======
            label="Location"
            placeholder="All Locations"
>>>>>>> 5bf2240c40b1ffe00401e90ffe8061c33962b09d
            options={locationOptions}
            value={filters?.location}
            onChange={(value) => onFilterChange('location', value)}
            searchable
            clearable
          />
        </div>

        <Button
          variant="outline"
          onClick={onClearFilters}
          iconName="X"
          iconPosition="left"
          className="lg:mb-0"
        >
<<<<<<< HEAD
          Изчисти филтрите
=======
          Clear Filters
>>>>>>> 5bf2240c40b1ffe00401e90ffe8061c33962b09d
        </Button>
      </div>
    </div>
  );
};

export default FilterPanel;