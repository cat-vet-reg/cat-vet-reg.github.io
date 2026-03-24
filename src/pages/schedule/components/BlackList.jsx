import React, { useEffect, useState } from 'react';
import supabase from '../../../utils/supabase';
import Icon from '../../../components/AppIcon';

const Blacklist = () => {
    const [blacklist, setBlacklist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlacklist();
    }, []);

    const fetchBlacklist = async () => {
        try {
            setLoading(true);
            // Взимаме всички записи със статус missed
            const { data, error } = await supabase
                .from('td_records')
                .select('data, castrated_at')
                .filter('data->>status', 'eq', 'missed');

            if (error) throw error;

            // Групираме по телефонен номер, за да не се повтарят имената
            const uniqueBlacklist = {};
            data.forEach(record => {
                const phone = record.data?.ownerPhone || record.data?.phone;
                if (!phone) return;

                if (!uniqueBlacklist[phone]) {
                    uniqueBlacklist[phone] = {
                        name: record.data?.ownerName || "Анонимен",
                        phone: phone,
                        missedCount: 1,
                        lastMissed: record.castrated_at
                    };
                } else {
                    uniqueBlacklist[phone].missedCount += 1;
                }
            });

            setBlacklist(Object.values(uniqueBlacklist));
        } catch (err) {
            console.error("Грешка при зареждане на черния списък:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-4 text-center text-sm">Зареждане на черен списък...</div>;

    return (
        <div className="bg-card rounded-xl border border-destructive/30 overflow-hidden shadow-sm">
            <div className="bg-destructive/10 p-4 border-b border-destructive/20 flex items-center justify-between">
                <h3 className="text-destructive font-bold flex items-center gap-2">
                    <Icon name="Skull" size={20} /> Черен списък (Пропуснати часове)
                </h3>
                <span className="bg-destructive text-white text-xs px-2 py-1 rounded-full font-bold">
                    {blacklist.length} души
                </span>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto">
                {blacklist.length === 0 ? (
                    <p className="p-6 text-center text-muted-foreground text-sm italic">Няма регистрирани нарушители.</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-muted text-xs sticky top-0">
                            <tr>
                                <th className="p-2 text-left">Име</th>
                                <th className="p-2 text-left">Телефон</th>
                                <th className="p-2 text-center">Пропуснати</th>
                            </tr>
                        </thead>
                        <tbody>
                            {blacklist.map((owner, idx) => (
                                <tr key={idx} className="border-b border-border hover:bg-destructive/5 transition-colors">
                                    <td className="p-2 font-medium">{owner.name}</td>
                                    <td className="p-2 font-mono text-xs">{owner.phone}</td>
                                    <td className="p-2 text-center">
                                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                                            {owner.missedCount}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Blacklist;