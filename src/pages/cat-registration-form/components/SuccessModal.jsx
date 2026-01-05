import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SuccessModal = ({ isOpen, onClose, catData }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleViewRegistry = () => {
    navigate('/cat-registry-list');
  };

  const handleViewMap = () => {
    navigate('/interactive-cat-map');
  };

  const handleRegisterAnother = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card rounded-lg shadow-warm-xl max-w-md w-full p-6 md:p-8 space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-success/10 rounded-full">
            <Icon name="CheckCircle2" size={40} className="text-success" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground">
              Успешна регистрация
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Котката е заведена в регистъра.
            </p>
          </div>

          {catData && (
            <div className="w-full bg-muted/50 rounded-md p-4 space-y-2 text-left">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Gender:</span>
                <span className="font-medium text-foreground capitalize">{catData?.gender}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Weight:</span>
                <span className="font-medium text-foreground">{catData?.weight} kg</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Color:</span>
                <span className="font-medium text-foreground capitalize">{catData?.color}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Owner:</span>
                <span className="font-medium text-foreground">{catData?.ownerName}</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          
          <Button
            variant="primary"
            fullWidth
            iconPosition="left"
            onClick={handleRegisterAnother}
          >
            Затвори
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;