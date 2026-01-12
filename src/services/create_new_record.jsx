import supabase from 'utils/supabase';

// export async function $apiCreateNewRecord(formData) {

//     // check if the owner already exist into the system
//     const ownerId = await getOwnerIdByPhone(formData?.ownerPhone)
    
//     if(ownerId) {
//         return await recordAnimal(formData, ownerId);
//     }

//     const ownerData = await recordOwner(formData);
//     return await recordAnimal(formData, ownerData.data[0].id);
// }

export async function $apiCreateNewRecord(formData, isEditing = false, catId = null) {
    // 1. Първо търсим дали вече има такъв собственик по телефона
    let finalOwnerId = await getOwnerIdByPhone(formData?.ownerPhone);

    // 2. Само ако НЕ открием такъв, създаваме нов
    if (!finalOwnerId) {
        const ownerData = await recordOwner(formData);
        
        if (ownerData?.data && ownerData.data.length > 0) {
            finalOwnerId = ownerData.data[0].id;
        } else {
            throw new Error("Неуспешно създаване на собственик.");
        }
    }

    // 3. Сега вече имаме ID (старо или ново) и записваме/обновяваме котката
    if (isEditing && catId) {
        return await supabase
            .from('td_records')
            .update({
                        name             : formData?.recordName, // записваме каквото е въвел потребителя
                    notes            : formData?.recordNotes,
                    gender           : formData?.gender,
                    weight: formData.weight ? Number(formData.weight) : null,
                    age_value: formData.ageValue ? Number(formData.ageValue) : null,
                    age_unit         : formData.ageUnit,
                    color            : formData.color,
                    location_address : formData?.address,
                    location_city    : formData?.recordCity,
                    living_condition: formData.livingCondition ? Array.from(formData.livingCondition) : [],
                    map_coordinates  : formData?.coords,
                owner_id: finalOwnerId
            })
            .eq('id', catId);
    } else {
        return await recordAnimal(formData, finalOwnerId);
    }
}

/**ss
 * @author Mihail Petrov
 * @param {*} formData 
 * @returns 
 */
async function recordAnimal(formData, ownerId) {
    // 1. Първо създаваме записа
    const tdRecordsResponse = await supabase.from('td_records').insert({
        name             : formData?.recordName, // записваме каквото е въвел потребителя
        notes            : formData?.recordNotes,
        gender           : formData?.gender,
        weight: formData.weight ? Number(formData.weight) : null,
        age_value: formData.ageValue ? Number(formData.ageValue) : null,
        age_unit         : formData.ageUnit,
        color            : formData.color,
        location_address : formData?.address,
        location_city    : formData?.recordCity,
        living_condition: formData.livingCondition ? Array.from(formData.livingCondition) : [],
        map_coordinates  : formData?.coords,
        owner_id         : ownerId
    }).select();

    // ПРОВЕРКА: Ако има грешка, не продължавай надолу
    if (tdRecordsResponse.error || !tdRecordsResponse.data) {
        console.error("Supabase Insert Error:", tdRecordsResponse.error);
        throw new Error(tdRecordsResponse.error?.message || "Грешка при създаване на записа");
    }

    const newCat = tdRecordsResponse.data[0];

    // 2. АКО потребителят НЕ е въвел име, обновяваме с "Котка №ID"
    if (!formData?.recordName?.trim()) {
        await supabase
            .from('td_records')
            .update({ name: `Котка №${newCat.id}` })
            .eq('id', newCat.id);
        
        // Обновяваме обекта в паметта, за да може SuccessModal да го види веднага
        newCat.name = `Котка №${newCat.id}`;
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
async function recordOwner(formData) {
 
    return await supabase.from('td_owners').insert({
        name              : formData?.ownerName,
        phone             : formData?.ownerPhone,
    }).select();
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


export async function $apiGetCats() {
    // Вземаме данните от td_records и автоматично закачаме информацията за собственика от td_owners
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

    // Тъй като Supabase връща собственика като обект, 
    // "разгръщаме" го малко, за да е по-лесно за ползване
    const formattedData = data.map(cat => ({
        ...cat,
        owner_name: cat.owner?.name,
        owner_phone: cat.owner?.phone,
        address: cat.location_address // Уеднаквяваме името на полето
    }));

    return { data: formattedData };
}