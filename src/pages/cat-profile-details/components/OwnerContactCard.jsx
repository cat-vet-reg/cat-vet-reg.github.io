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
    <div className="bg-card rounded-xl shadow-sm border border-border p-4">
      {/* Малко хедърче */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
        <Icon name="UserCircle" size={16} className="text-primary" />
        <h2 className="text-xs font-heading font-bold text-foreground uppercase tracking-wider">
          Лице за контакт
        </h2>
      </div>

      <div className="space-y-2">
        {/* ИМЕ - Компактен ред */}
        <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/20 border border-transparent">
          <div className="flex-shrink-0 w-8 h-8 rounded bg-background flex items-center justify-center text-muted-foreground border border-border/50">
            <Icon name="User" size={14} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground leading-none mb-0.5 uppercase font-medium">Собственик</p>
            <p className="text-sm font-bold text-foreground truncate">
              {owner?.name || "Неизвестен"}
            </p>
          </div>
        </div>

        {/* ТЕЛЕФОН - Интерактивен ред */}
        <button 
          onClick={handleCall}
          className="w-full flex items-center gap-3 p-2 rounded-lg bg-success/5 border border-success/10 hover:bg-success/10 transition-colors group text-left"
        >
          <div className="flex-shrink-0 w-8 h-8 rounded bg-success/10 flex items-center justify-center text-success group-hover:scale-110 transition-transform">
            <Icon name="Phone" size={14} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-success/70 leading-none mb-0.5 uppercase font-medium">Телефон</p>
            <p className="text-sm font-mono font-bold text-foreground tracking-tight">
              {owner?.phone || "—"}
            </p>
          </div>
          <Icon name="ExternalLink" size={12} className="ml-auto text-success/40 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </div>
  );
};

export default OwnerContactCard;