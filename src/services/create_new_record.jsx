import supabase from 'utils/supabase';

export async function $apiCreateNewRecord(formData) {

    // check if the owner already exist into the system
    const ownerId = await getOwnerIdByPhone(formData?.ownerPhone)
    
    if(ownerId) {
        return await recordAnimal(formData, ownerId);
    }

    const ownerData = await recordOwner(formData);
    return await recordAnimal(formData, ownerData.data[0].id);
}

/**ss
 * @author Mihail Petrov
 * @param {*} formData 
 * @returns 
 */
async function recordAnimal(formData, ownerId) {
 
    console.log("@@@@@")
    console.log(formData);
    console.log("@@@@@")

    const tdRecordsResponse =  await supabase.from('td_records').insert({
        name             : formData?.recordName,
        notes            : formData?.recordNotes,
        gender           : formData?.gender,
        
        weight           : formData?.weight,
        age_value        : formData.ageValue,
        age_unit         : formData.ageUnit,
        color            : formData.color,

        location_address : formData?.address,
        location_city    : formData?.recordCity,

        living_condition : formData?.livingCondition,
        map_coordinates  : formData?.coords,

        owner_id : ownerId
    }).select();

    // upload file 
    const {data, error} = await supabase.storage
                            .from('protocol_images')
                            .upload(`records/${tdRecordsResponse.data[0]?.id}/avatar.png`, formData.image);
    
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