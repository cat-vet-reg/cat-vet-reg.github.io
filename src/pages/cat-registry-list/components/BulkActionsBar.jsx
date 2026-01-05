import React from 'react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const BulkActionsBar = ({ selectedCount, onExport, onDelete, onClearSelection }) => {
  const bulkActionOptions = [
<<<<<<< HEAD
    { value: 'export', label: 'Експортирай избраните' },
    { value: 'delete', label: 'Изтрий избраните' }
=======
    { value: 'export', label: 'Export Selected' },
    { value: 'delete', label: 'Delete Selected' }
>>>>>>> 5bf2240c40b1ffe00401e90ffe8061c33962b09d
  ];

  const handleBulkAction = (value) => {
    if (value === 'export') {
      onExport();
    } else if (value === 'delete') {
      onDelete();
    }
  };

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1100] bg-primary text-primary-foreground rounded-lg shadow-warm-xl px-4 md:px-6 py-3 flex items-center gap-4 animate-in slide-in-from-bottom-4">
      <span className="font-medium text-sm md:text-base whitespace-nowrap">
<<<<<<< HEAD
        {selectedCount} {selectedCount === 1 ? 'cat' : 'cats'} избрани
=======
        {selectedCount} {selectedCount === 1 ? 'cat' : 'cats'} selected
>>>>>>> 5bf2240c40b1ffe00401e90ffe8061c33962b09d
      </span>

      <div className="hidden md:flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          iconName="Download"
          iconPosition="left"
          onClick={onExport}
        >
<<<<<<< HEAD
          Експортирай
=======
          Export
>>>>>>> 5bf2240c40b1ffe00401e90ffe8061c33962b09d
        </Button>
        <Button
          variant="destructive"
          size="sm"
          iconName="Trash2"
          iconPosition="left"
          onClick={onDelete}
        >
<<<<<<< HEAD
          Изтрий
=======
          Delete
>>>>>>> 5bf2240c40b1ffe00401e90ffe8061c33962b09d
        </Button>
      </div>

      <div className="md:hidden">
        <Select
          options={bulkActionOptions}
          value=""
          onChange={handleBulkAction}
<<<<<<< HEAD
          placeholder="Действия"
=======
          placeholder="Actions"
>>>>>>> 5bf2240c40b1ffe00401e90ffe8061c33962b09d
        />
      </div>

      <Button
        variant="ghost"
        size="icon"
        iconName="X"
        onClick={onClearSelection}
        className="text-primary-foreground hover:bg-primary-foreground/20"
<<<<<<< HEAD
        aria-label="Изчисти избраните"
=======
        aria-label="Clear selection"
>>>>>>> 5bf2240c40b1ffe00401e90ffe8061c33962b09d
      />
    </div>
  );
};

export default BulkActionsBar;