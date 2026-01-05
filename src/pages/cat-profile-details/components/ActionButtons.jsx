import React, { useState } from 'react';
import Button from '../../../components/ui/Button';

const ActionButtons = ({ onEdit, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className="bg-card rounded-xl shadow-warm p-4 md:p-6 lg:p-8">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-heading font-semibold text-foreground mb-4 md:mb-6">
          Действия
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <Button
            variant="default"
            iconName="Edit"
            iconPosition="left"
            onClick={onEdit}
            fullWidth
          >
            Редактирай
          </Button>
          
          <Button
            variant="outline"
            iconName="MapPin"
            iconPosition="left"
            onClick={() => window.location.href = '/interactive-cat-map'}
            fullWidth
          >
            Виж на картата
          </Button>
          
          <Button
            variant="destructive"
            iconName="Trash2"
            iconPosition="left"
            onClick={handleDeleteClick}
            fullWidth
          >
            Изтрий
          </Button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card rounded-xl shadow-warm-xl p-4 md:p-6 lg:p-8 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-destructive/10 rounded-lg">
                <svg className="w-6 h-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-heading font-semibold text-foreground">
                Confirm Deletion
              </h3>
            </div>
            
            <p className="text-sm md:text-base text-muted-foreground mb-6">
              Сигурен ли си, че искаш да изтриеш тази регистрация на котка? След това не може да се възстанови и цялата информация ще бъде загубена.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                fullWidth
              >
                Изтрий завинаги
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ActionButtons;