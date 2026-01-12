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

export async function $apiCreateNewRecord(
    formData, 
    isEditing   = false, 
    catId       = null
) {
    const ownerId = await getOwnerIdByPhone(formData?.ownerPhone);
    let finalOwnerId = ownerId;

    if(!ownerId) {
        const ownerData = await recordOwner(formData);
        finalOwnerId = ownerData.data[0].id;
    }

    if (isEditing && catId) {
        // РЕДАКЦИЯ: Използваме .update() вместо .insert()
        return await supabase
            .from('td_records')
            .update({
                name                : formData.recordName,
                notes               : formData.recordNotes,
                gender              : formData.gender,
                weight              : formData.weight,
                age_value           : formData.ageValue,
                age_unit            : formData.ageUnit,
                color               : formData.color,
                location_address    : formData.address,
                location_city       : formData.recordCity,
                living_condition    : formData.livingCondition,
                map_coordinates     : formData.coords,
                owner_id            : finalOwnerId
            })
            .eq('id', catId);
    } else {
        // НОВ ЗАПИС: Твоята стара логика
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
        name                    : formData?.recordName,
        notes                   : formData?.recordNotes,
        gender                  : formData?.gender,
        weight                  : formData?.weight,
        age_value               : formData.ageValue,
        age_unit                : formData.ageUnit,
        color                   : formData.color,
        location_address        : formData?.address,
        location_city           : formData?.recordCity,
        living_condition        : formData?.livingCondition,
        map_coordinates         : formData?.coords,
        owner_id                : ownerId,
        
        has_complications       : formData.hasComplications,
        record_complications    : formData.recordComplications
    }).select();

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