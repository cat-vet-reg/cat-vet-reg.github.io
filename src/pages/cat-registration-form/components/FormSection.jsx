import React from 'react';

const FormSection = ({ title, description, children, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-1">
        <h3 className="text-lg md:text-xl font-semibold text-foreground">
          {title}
        </h3>
        {description && (
          <p className="text-sm md:text-base text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default FormSection;