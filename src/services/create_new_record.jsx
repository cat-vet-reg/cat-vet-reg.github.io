import supabase from 'utils/supabase';

export async function $apiCreateNewRecord(formData) {

    console.log("@@@@@@@@@@@@@@")
    console.log(formData);
    console.log("@@@@@@@@@@@@@@")

    // check if the owner already exist into the system
    const ownerId = await getOwnerIdByPhone(formData?.ownerPhone)

    if(ownerId) {
        return await recordAnimal(formData, ownerId);
    }

    const ownerData = await recordOwner(formData);
    return await recordAnimal(formData, ownerData);
}

/**
 * @author Mihail Petrov
 * @param {*} formData 
 * @returns 
 */
async function recordAnimal(formData, ownerId) {
 
    return await supabase.from('td_records').insert({
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

        owner_id : ownerId
    });
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
    });
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