import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MedicalSection = ({ title, icon, data, nextDate, onAdd }) => (
  <div className="mb-8 last:mb-0">
    <div className="flex items-center justify-between mb-3 border-b border-border/60 pb-2">
      <div className="flex items-center gap-2">
        <Icon name={icon} size={18} className="text-primary" />
        <h3 className="font-bold text-foreground uppercase tracking-tight text-sm">{title}</h3>
      </div>
      {nextDate && (
        <span className="text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold shadow-sm">
          Следваща: {new Date(nextDate).toLocaleDateString('bg-BG')}
        </span>
      )}
      <button 
        onClick={onAdd}
        className="text-primary hover:bg-primary/10 p-1 rounded-md transition-colors"
      >
        <Icon name="Plus" size={16} />
      </button>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="text-muted-foreground font-semibold">
          <tr>
            <th className="pb-2 font-medium">Дата</th>
            <th className="pb-2 font-medium">Продукт/Ваксина</th>
            <th className="pb-2 font-medium text-right">Лекар</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {data.length > 0 ? data.map((item, idx) => (
            <tr key={idx} className="hover:bg-muted/30 transition-colors">
              <td className="py-2 text-foreground font-medium">
                {new Date(item.administered_at).toLocaleDateString('bg-BG')}
              </td>
              <td className="py-2 text-slate-600 italic">
                {item.product_name} {item.category ? `(${item.category})` : ''}
              </td>
              <td className="py-2 text-right font-bold text-primary/80">
                {item.created_by_name || '—'} 
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="3" className="py-4 text-center text-muted-foreground italic">Няма вписани данни</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const MedicalTreatmentCard = ({ treatments = [], onAdd }) => {
  // Филтрираме данните по типове
  const vaccines = treatments.filter(t => t.type === 'vaccine');
  const external = treatments.filter(t => t.type === 'parasite' && t.category === 'external');
  const internal = treatments.filter(t => t.type === 'parasite' && t.category === 'internal');

  // Вземаме последната дата за следващо посещение (най-скорошната в бъдещето)
  const getNextDate = (list) => {
    const dates = list.map(t => t.next_due_date).filter(Boolean);
    return dates.length > 0 ? dates.sort().reverse()[0] : null;
  };

  return (
    <div className="bg-card rounded-xl shadow-warm p-6 mt-6 border border-border/40">
      <div className="flex items-center gap-3 mb-8 border-b border-primary/10 pb-4">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon name="ClipboardPlus" size={22} className="text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">Здравен Картон</h2>
      </div>

      <div className="space-y-2">
        <MedicalSection 
          title="Ваксинация" 
          icon="ShieldCheck" 
          data={vaccines} 
          nextDate={getNextDate(vaccines)}
          onAdd={() => onAdd('vaccine')} 
        />
        
        <MedicalSection 
          title="Външно обезпаразитяване" 
          icon="Bug" 
          data={external} 
          nextDate={getNextDate(external)}
          onAdd={() => onAdd('parasite', 'external')} 
        />

        <MedicalSection 
          title="Вътрешно обезпаразитяване" 
          icon="Biohazard" 
          data={internal} 
          nextDate={getNextDate(internal)}
          onAdd={() => onAdd('parasite', 'internal')} 
        />
      </div>
    </div>
  );
};

export default MedicalTreatmentCard;