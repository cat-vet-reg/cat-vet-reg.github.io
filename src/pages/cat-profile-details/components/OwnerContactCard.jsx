import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const OwnerContactCard = ({ owner }) => {
  const handleCall = () => {
    window.location.href = `tel:${owner?.phone}`;
  };

  const handleEmail = () => {
    window.location.href = `mailto:${owner?.email}`;
  };

  return (
    <div className="bg-card rounded-xl shadow-warm p-4 md:p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg">
          <Icon name="UserCircle" size={20} color="var(--color-primary)" className="md:w-6 md:h-6" />
        </div>
        <h2 className="text-xl md:text-2xl lg:text-3xl font-heading font-semibold text-foreground">
<<<<<<< HEAD
          Контакти на собственика
=======
          Owner Contact
>>>>>>> 5bf2240c40b1ffe00401e90ffe8061c33962b09d
        </h2>
      </div>
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-lg bg-muted/30">
          <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg bg-background flex items-center justify-center text-primary">
            <Icon name="User" size={20} className="md:w-6 md:h-6" />
          </div>
          <div className="flex-1 min-w-0">
<<<<<<< HEAD
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Име на собственика</p>
=======
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Owner Name</p>
>>>>>>> 5bf2240c40b1ffe00401e90ffe8061c33962b09d
            <p className="text-sm md:text-base lg:text-lg font-medium text-foreground break-words">
              {owner?.name}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-lg bg-muted/30">
          <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg bg-background flex items-center justify-center text-success">
            <Icon name="Phone" size={20} className="md:w-6 md:h-6" />
          </div>
          <div className="flex-1 min-w-0">
<<<<<<< HEAD
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Телефонен номер</p>
=======
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Phone Number</p>
>>>>>>> 5bf2240c40b1ffe00401e90ffe8061c33962b09d
            <p className="text-sm md:text-base lg:text-lg font-medium text-foreground font-mono data-text whitespace-nowrap">
              {owner?.phone}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-lg bg-muted/30">
          <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg bg-background flex items-center justify-center text-secondary">
            <Icon name="Mail" size={20} className="md:w-6 md:h-6" />
          </div>
          <div className="flex-1 min-w-0">
<<<<<<< HEAD
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Имейл адрес</p>
=======
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Email Address</p>
>>>>>>> 5bf2240c40b1ffe00401e90ffe8061c33962b09d
            <p className="text-sm md:text-base lg:text-lg font-medium text-foreground break-words">
              {owner?.email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 pt-2">
          <Button
            variant="default"
            iconName="Phone"
            iconPosition="left"
            onClick={handleCall}
            fullWidth
          >
<<<<<<< HEAD
            Обади се
=======
            Call Owner
>>>>>>> 5bf2240c40b1ffe00401e90ffe8061c33962b09d
          </Button>
          <Button
            variant="outline"
            iconName="Mail"
            iconPosition="left"
            onClick={handleEmail}
            fullWidth
          >
<<<<<<< HEAD
            Изпрати имейл
=======
            Send Email
>>>>>>> 5bf2240c40b1ffe00401e90ffe8061c33962b09d
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OwnerContactCard;