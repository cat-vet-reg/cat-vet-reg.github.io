import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SuccessModal = ({ isOpen, onClose, catData }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleRegisterAnother = () => {
    onClose('close');
  };

  const handleRegisterAnotherOnTheSame = () => {
    onClose('same_owner');
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
                <span className="text-muted-foreground">Пол:</span>
                <span className="font-medium text-foreground capitalize">
                  {catData?.gender === 'male' ? 'Мъжки' : 
                  catData?.gender === 'female' ? 'Женски' : 'Неизвестен'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Тегло:</span>
                <span className="font-medium text-foreground">{catData?.weight} кг</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Цвят:</span>
                <span className="font-medium text-foreground capitalize">
                      { catData?.color === 'tabby'        ? 'Таби (тигрова)' :
                        catData?.color === 'tabby_white'  ? 'Таби-бяла (бяла с тигрово)' :
                        catData?.color === 'calico'       ? 'Калико (трицветна)' :
                        catData?.color === 'tortoiseshell'? 'Костенуркова' :
                        catData?.color === 'tuxedo'       ? 'Черно-бяла' :
                        catData?.color === 'orange_white' ? 'Рижо-бяла' :
                        catData?.color === 'orange'       ? 'Рижа' :
                        catData?.color === 'black'        ? 'Черна' :
                        catData?.color === 'white'        ? 'Бяла' :
                        catData?.color === 'gray'         ? 'Сива (Синя)' :
                        catData?.color === 'brown'        ? 'Кафява' :
                        catData?.color === 'cinnamon'     ? 'Светлокафява' :
                        catData?.color === 'fawn'         ? 'Бежова' : 'неизвестен'
                      }
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Собственик:</span>
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
            onClick={handleRegisterAnotherOnTheSame}
          >
            Регистрирай ново животно на същия собственик
          </Button>

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