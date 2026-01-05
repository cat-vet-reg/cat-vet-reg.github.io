import React from 'react';
import Icon from '../AppIcon';

const FloatingActionButton = ({ onClick, label = 'Register Cat' }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-[1200] flex items-center justify-center w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-warm-lg hover:shadow-warm-xl hover:-translate-y-1 active:scale-97 transition-smooth lg:hidden"
      aria-label={label}
    >
      <Icon name="Plus" size={24} />
    </button>
  );
};

export default FloatingActionButton;