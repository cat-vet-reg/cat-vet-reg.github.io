import supabase from 'utils/supabase';

/**ss
 * @author Mihail Petrov
 * @param {*} formData 
 * @returns 
 */
async function recordAnimal(formData, ownerId) {
    
    const dataToSave = { 
        ...formData, 
        status: formData.status || 'registered'
    };

    // 1. Първо създаваме записа
    const tdRecordsResponse = await supabase.from('td_records').insert({
        name                    : formData?.recordName,
        notes                   : formData?.recordNotes,
        gender                  : formData?.gender,
        weight                  : formData.weight ? Number(formData.weight)     : null,
        age_value               : formData.ageValue ? Number(formData.ageValue)     : null,
        age_unit                : formData.ageUnit,
        color                   : formData.color,
        location_address        : formData?.address,
        location_city           : formData?.recordCity,
        living_condition        : formData.livingCondition ? Array.from(formData.livingCondition) : [],
        map_coordinates         : formData?.coords,
        owner_id                : ownerId,
        has_complications       : formData.hasComplications,
        record_complications    : formData.recordComplications,
        castrated_at            : formData?.castratedAt,

        data: dataToSave
    }).select();

    // ПРОВЕРКА: Ако има грешка, не продължавай надолу
    if (tdRecordsResponse.error || !tdRecordsResponse.data) {
        console.error("Supabase Insert Error:", tdRecordsResponse.error);
        throw new Error(tdRecordsResponse.error?.message || "Грешка при създаване на записа");
    }

    const newCat = tdRecordsResponse.data[0];

    // 2. АКО потребителят НЕ е въвел име, обновяваме с "Котка №ID"
    // if (!formData?.recordName?.trim()) {
    //     await supabase
    //         .from('td_records')
    //         .update({ name: `Котка №${newCat.id}` })
    //         .eq('id', newCat.id);
        
    //     // Обновяваме обекта в паметта, за да може SuccessModal да го види веднага
    //     newCat.name = `Котка №${newCat.id}`;
    // }

    // 2. АКО потребителят НЕ е въвел име, обновяваме спрямо вида на животното
    if (!formData?.recordName || formData.recordName.trim() === '') {
        // 1. Проверяваме вида, като добавяме fallback (ако няма species, приемаме 'cat')
        const species = formData?.species || 'cat'; 
        const speciesLabel = species === 'cat' ? 'Котка' : 'Куче';
        
        const autoName = `${speciesLabel} №${newCat.id}`;

        // 2. Използваме .select() при ъпдейта, за да сме сигурни, че данните се връщат
        const { data: updatedData, error: updateError } = await supabase
            .from('td_records')
            .update({ name: autoName })
            .eq('id', newCat.id)
            .select();

        if (updateError) {
            console.error("Грешка при автоматично именуване:", updateError);
        } else if (updatedData && updatedData.length > 0) {
            // 3. Обновяваме референцията, която функцията ще върне
            newCat.name = autoName;
            // Важно: Тъй като връщаш целия tdRecordsResponse накрая, 
            // трябва да обновиш данните и в неговия обект
            tdRecordsResponse.data[0].name = autoName;
        }
    }

    // 3. Качване на снимката
    if (formData.image) {
        await supabase.storage
            .from('protocol_images')
            .upload(`records/${newCat.id}/avatar.png`, formData.image);
    }
    
    return tdRecordsResponse;
}

/**
 * 
 * @param {*} formData 
 * @returns 
 */
// async function recordOwner(formData) {
 
//     return await supabase.from('td_owners').insert({
//         name              : formData?.ownerName,
//         phone             : formData?.ownerPhone,
//     }).select();
// }
async function recordOwner(formData) {
    // Използваме upsert с опция onConflict: 'phone'
    // Така ако телефонът съществува, автоматично ще обнови името
    return await supabase.from('td_owners').upsert({
        name: formData?.ownerName,
        phone: formData?.ownerPhone,
    }, { onConflict: 'phone' }).select();
}

/**
 * 
 * @param {*} ownerPhone 
 * @returns 
 */
async function getOwnerIdByPhone(ownerPhone) {

    const {error, data} = await supabase.from('td_owners')
                                    .select('*')
                                    .eq('phone', ownerPhone);

    if(error) {
        return null;
    }

    if(data.length == 0) {
        return null;
    }

    return data[0].id;
}

/**
 * 
 * @param {*} formData 
 * @param {*} isEditing 
 * @param {*} catId 
 * @returns 
 */
export async function $apiCreateNewRecord(
    formData, 
    isEditing   = false, 
    catId       = null
) {
    const ownerData = await recordOwner(formData);
    
    if (!ownerData?.data || ownerData.data.length === 0) {
        throw new Error("Неуспешно обработване на данните за собственика.");
    }

    const finalOwnerId = ownerData.data[0].id;

    // 3. Сега вече имаме ID (старо или ново) и записваме/обновяваме жв
    if (isEditing && catId) {

        return await supabase
            .from('td_records')
            .upsert({
                id : catId,
                name                : formData?.recordName,
                notes               : formData?.recordNotes,
                gender              : formData?.gender,
                weight              : formData.weight   ? Number(formData.weight) : null,
                age_value           : formData.ageValue ? Number(formData.ageValue) : null,
                age_unit            : formData.ageUnit,
                color               : formData.color,
                location_address    : formData?.address,
                location_city       : formData?.recordCity,
                living_condition    : formData.livingCondition ? Array.from(formData.livingCondition) : [],
                map_coordinates     : formData?.coords,
                owner_id            : finalOwnerId,

                has_complications   : formData?.hasComplications,
                record_complications: formData.recordComplications,
                castrated_at        : formData?.castratedAt,
                data                : formData
            });
    } 

    return await recordAnimal(formData, finalOwnerId);
}

/**
 * 
 * @returns 
 */
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