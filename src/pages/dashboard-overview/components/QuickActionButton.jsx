import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const QuickActionButton = ({ title, description, icon, iconColor, path }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(path);
  };

  return (
    <button
      onClick={handleClick}
      className="bg-card rounded-lg p-4 md:p-6 shadow-warm hover:shadow-warm-md transition-smooth text-left w-full group"
    >
      <div className="flex items-start gap-3 md:gap-4">
        <div 
          className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-lg flex-shrink-0 group-hover:scale-110 transition-smooth"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <Icon name={icon} size={24} color={iconColor} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-base md:text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-smooth">
            {title}
          </h4>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>
        
        <Icon 
          name="ChevronRight" 
          size={20} 
          className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-smooth flex-shrink-0" 
        />
      </div>
    </button>
  );
};

export default QuickActionButton;