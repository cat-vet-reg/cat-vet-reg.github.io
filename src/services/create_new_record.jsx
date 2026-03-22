import supabase from 'utils/supabase';
import { mapFormToRecord } from "../pages/cat-registration-form/utils/formMapper";

/**ss
 * @author Mihail Petrov
 * @param {*} formData 
 * @returns 
 */
async function recordAnimalWithMapper(mappedData, imageFile) {
    // 1. Първо създаваме записа
    const response = await supabase
        .from('td_records')
        .insert(mappedData)
        .select();

    if (response.error || !response.data) {
        console.error("Supabase Insert Error:", response.error);
        throw new Error(response.error?.message || "Грешка при създаване на записа");
    }

    const newCat = response.data[0];

    // 2. АВТОМАТИЧНО ИМЕНУВАНЕ
    if (!mappedData.name || mappedData.name.trim() === '') {
        const speciesLabel = mappedData.species === 'dog' ? 'Куче' : 'Котка';
        const autoName = `${speciesLabel} №${newCat.id}`;

        const { data: updatedData } = await supabase
            .from('td_records')
            .update({ name: autoName })
            .eq('id', newCat.id)
            .select();
        
        if (updatedData) {
            newCat.name = autoName;
            response.data[0].name = autoName;
        }
    }

    // 3. КАЧВАНЕ НА СНИМКА
    if (imageFile) {
        const { error: uploadError } = await supabase.storage
            .from('protocol_images')
            .upload(`records/${newCat.id}/avatar.png`, imageFile, {
                upsert: true // Позволява презаписване ако съществува
            });
        
        if (uploadError) console.error("Грешка при качване на снимка:", uploadError);
    }
    
    return response; // Връщаме целия обект, за да не чупим фронтенда
}

async function recordOwner(formData) {
    return await supabase.from('td_owners').upsert({
        name: formData?.ownerName,
        phone: formData?.ownerPhone,
    }, { onConflict: 'phone' }).select();
}

export async function $apiCreateNewRecord(
    formData, 
    isEditing = false, 
    catId = null
) {
    // 1. Обработка на собственика
    const ownerData = await recordOwner(formData);
    
    if (!ownerData?.data || ownerData.data.length === 0) {
        throw new Error("Неуспешно обработване на данните за собственика.");
    }

    const finalOwnerId = ownerData.data[0].id;

    // 2. Подготовка на данните чрез мапъра
    const mappedData = mapFormToRecord(formData);
    mappedData.owner_id = finalOwnerId;

    // 3. ЗАПИС ИЛИ ОБНОВЯВАНЕ
    if (isEditing && catId) {
        const response = await supabase
            .from('td_records')
            .update(mappedData)
            .eq('id', catId)
            .select();

        // Ако редактираме и има нова снимка
        if (!response.error && formData.image) {
            await supabase.storage
                .from('protocol_images')
                .upload(`records/${catId}/avatar.png`, formData.image, { upsert: true });
        }

        return response;
    } else {
        // При нов запис подаваме mappedData И файла със снимката
        return await recordAnimalWithMapper(mappedData, formData.image);
    }
}

export async function $apiGetCats() {
    
    const { data, error } = await supabase
        .from('td_records')
        .select(`
            *,
            owner:td_owners(name, phone)
        `);

    if (error) {
        console.error("Грешка при вземане на котките:", error);
        return { data: [] };
    }

    const formattedData = data.map(cat => ({
        ...cat,
        owner_name: cat.owner?.name,
        owner_phone: cat.owner?.phone,
        address: cat.location_address
    }));

    return { data: formattedData };
}

// ЗА РЕГИСТЪРА - Скрива записаните часове
export async function $apiGetRegistryOnly() {
    const { data, error } = await supabase
        .from('td_records')
        .select(`*, owner:td_owners(name, phone)`)
        // Филтърът: Дай ми тези, при които статусът НЕ Е 'recorded'
        // Използваме 'is.null', за да хванем всички твои стари записи (като №147)
        .not('data->>status', 'in', '("recorded","missed")')
        .order('castrated_at', { ascending: false });

    if (error) {
        console.error("Грешка при зареждане:", error);
        return { data: [] };
    }

    // Форматирането за таблицата
    const formattedData = data.map(cat => ({
        ...cat,
        owner_name: cat?.owner?.name || cat?.owner_name || "—",
        owner_phone: cat?.owner?.phone || cat?.owner_phone || "—",
    }));

    return { data: formattedData };
}