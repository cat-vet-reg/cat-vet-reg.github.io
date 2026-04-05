import React, { useEffect, useState } from 'react';
import supabase from '../../../utils/supabase';
import Icon from '../../../components/AppIcon';

const Blacklist = () => {
    const [blacklist, setBlacklist] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Състояние за новия запис
    const [newEntry, setNewEntry] = useState({ phone: '', name: '', reason: '' });
    const [issubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchBlacklist();
    }, []);

    const fetchBlacklist = async () => {
        try {
            setLoading(true);
            const { data: flaggedOwners } = await supabase
                .from('td_owners')
                .select('name, phone, blacklist_reason')
                .not('blacklist_reason', 'is', null);

            const { data: missedRecords } = await supabase
                .from('td_records')
                .select('data')
                .filter('data->>status', 'eq', 'missed');

            const combined = {};

            flaggedOwners?.forEach(owner => {
                combined[owner.phone] = {
                    name: owner.name,
                    phone: owner.phone,
                    reason: owner.blacklist_reason,
                    missedCount: 0,
                    type: 'manual'
                };
            });

            missedRecords?.forEach(record => {
                const phone = record.data?.ownerPhone || record.data?.phone;
                if (!phone) return;

                if (!combined[phone]) {
                    combined[phone] = {
                        name: record.data?.ownerName || "Анонимен",
                        phone: phone,
                        reason: "Пропуснати часове",
                        missedCount: 1,
                        type: 'auto'
                    };
                } else {
                    combined[phone].missedCount += 1;
                    if (combined[phone].type === 'manual') {
                        combined[phone].reason = `${combined[phone].reason} (+ ${combined[phone].missedCount} пропуска)`;
                    }
                }
            });

            setBlacklist(Object.values(combined));
        } catch (err) {
            console.error("Грешка:", err);
        } finally {
            setLoading(false);
        }
    };

    // Функция за ръчно добавяне
    const handleAddManual = async (e) => {
        e.preventDefault();
        if (!newEntry.phone || !newEntry.reason) return alert("Телефон и причина са задължителни!");

        setIsSubmitting(true);
        try {
            // Използваме upsert за td_owners
            // onConflict: 'phone' казва на Supabase: "Ако телефонът съществува, обнови записа. Ако не - създай нов."
            const { error } = await supabase
                .from('td_owners')
                .upsert({ 
                    phone: newEntry.phone, 
                    name: newEntry.name || "Ръчно добавен", 
                    blacklist_reason: newEntry.reason 
                }, { onConflict: 'phone' });

            if (error) throw error;

            setNewEntry({ phone: '', name: '', reason: '' });
            fetchBlacklist(); // Презареждаме списъка
        } catch (err) {
            alert("Грешка при запис: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="p-4 text-center text-sm">Зареждане на черен списък...</div>;

    return (
        <div className="space-y-4">
            {/* ФОРМА ЗА БЪРЗО ДОБАВЯНЕ */}
            <form onSubmit={handleAddManual} className="bg-card p-4 rounded-xl border border-border shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold opacity-50">Телефон</label>
                    <input 
                        className="p-2 text-sm rounded border bg-background border-border"
                        placeholder="0888..."
                        value={newEntry.phone}
                        onChange={e => setNewEntry({...newEntry, phone: e.target.value})}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold opacity-50">Име (опционално)</label>
                    <input 
                        className="p-2 text-sm rounded border bg-background border-border"
                        placeholder="Име на клиента"
                        value={newEntry.name}
                        onChange={e => setNewEntry({...newEntry, name: e.target.value})}
                    />
                </div>
                <div className="flex flex-col gap-1 md:col-span-1">
                    <label className="text-[10px] uppercase font-bold opacity-50">Причина</label>
                    <input 
                        className="p-2 text-sm rounded border bg-background border-border"
                        placeholder="Защо влиза в списъка?"
                        value={newEntry.reason}
                        onChange={e => setNewEntry({...newEntry, reason: e.target.value})}
                    />
                </div>
                <button 
                    disabled={issubmitting}
                    className="bg-destructive text-white p-2 rounded font-bold text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <Icon name="UserPlus" size={16} /> {issubmitting ? 'Запис...' : 'Добави'}
                </button>
            </form>

            {/* ТАБЛИЦА (Твоят код с малки корекции) */}
            <div className="bg-card rounded-xl border border-destructive/30 overflow-hidden shadow-sm">
                <div className="bg-destructive/10 p-4 border-b border-destructive/20 flex items-center justify-between">
                    <h3 className="text-destructive font-bold flex items-center gap-2">
                        <Icon name="Skull" size={20} /> Черен списък
                    </h3>
                    <span className="bg-destructive text-white text-xs px-2 py-1 rounded-full font-bold">
                        {blacklist.length} души
                    </span>
                </div>
                
                <div className="max-h-[400px] overflow-y-auto">
                    {/* ... (тук остава твоята таблица) ... */}
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted sticky top-0">
                            <tr>
                                <th className="p-6">Клиент</th>
                                <th className="p-6">Причина</th>
                                <th className="p-6 text-center">Пропуски</th>
                            </tr>
                        </thead>
                        <tbody>
                            {blacklist.map((owner, idx) => (
                                <tr key={idx} className="border-b border-border hover:bg-destructive/5 transition-colors">
                                    <td className="p-3">
                                        <div className="font-bold">{owner.name}</div>
                                        <div className="text-xs opacity-60">{owner.phone}</div>
                                    </td>
                                    <td className="p-3 text-xs italic opacity-80">{owner.reason}</td>
                                    <td className="p-3 text-center">
                                        {owner.missedCount > 0 && (
                                            <span className="bg-destructive text-white px-2 py-0.5 rounded-full text-[10px] font-black">
                                                {owner.missedCount}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Blacklist;