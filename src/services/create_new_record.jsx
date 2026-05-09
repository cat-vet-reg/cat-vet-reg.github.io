import supabase from 'utils/supabase';

const parseNum = (val) => (val !== "" && val !== null && val !== undefined) ? Number(val) : null;

/**
 * 1. Подготвяме JSON обектите, като махаме излишните данни от основната таблица.
 * Подготвя обектите DATA и MEDICAL_DETAILS
 */
function prepareJsonFields(formData) {
    const customDataField = {
        donation          : formData.donation || "N",
        // Тези вече ще живеят САМО тук:
        age_value         : parseNum(formData.ageValue),
        age_unit          : formData.ageUnit || "months",
        birth_date        : formData.birthDate || null,
        weight            : parseNum(formData.weight),
        color             : formData.color || "",
        custom_color      : formData.customColor || "",
        has_ear_tag       : formData.hasEarTag || "N",
        ear_tag_number    : formData.earTagNumber || "",
        bcs_score         : formData.bcsScore || "5",
        temperament       : formData.temperament || "mild",
        notes             : formData.recordNotes || "",
        breed             : formData.breed || "european",
        outdoor_access    : formData.outdoorAccess || "Y",
        origin            : formData.origin || "street",
        general_condition : formData.generalCondition || "good",
        discovery_source  : formData.discoverySource || "friends",
        image_preview     : formData.imagePreview || "",
        signature         : formData.signature || ""
    };

    const medicalDetailsField = {
        is_already_castrated   : formData.isAlreadyCastrated || "N",
        induction_dose         : parseNum(formData.inductionDose),
        time_to_sleep          : formData.timeToSleep || "",
        has_induction_add      : Boolean(formData.hasInductionAdd),
        induction_add_amount   : parseNum(formData.inductionAddAmount),
        propofol_used          : Boolean(formData.propofolUsed),
        propofol_total_ml      : parseNum(formData.propofolTotalMl),
        propofol_first_min     : parseNum(formData.propofolFirstMin),
        surgery_duration       : formData.surgeryDuration || "",
        recovery_time          : formData.recoveryTime || "",
        staff_received         : formData.staffReceived || "",
        staff_released         : formData.staffReleased || "",
        ear_status             : formData.earStatus || "marked",
        parasites              : formData.parasites || "none",
        reproductive_status    : formData.reproductiveStatus || "none_visible"
    };

    // Почистваме map_coordinates да НЕ съдържа address, но да съдържа zona_number
    const mapCoordinatesField = {
        lat: formData.coords?.lat || null,
        lng: formData.coords?.lng || null,
        zona_number: parseNum(formData.zonaNumber)
    };

    return { customDataField, medicalDetailsField, mapCoordinatesField };
}

async function recordAnimal(formData, ownerId) {
    const { customDataField, medicalDetailsField, mapCoordinatesField } = prepareJsonFields(formData);

    const tdRecordsResponse = await supabase.from('td_records').insert({
        name                    : formData.recordName,
        species                 : formData.species || 'cat',
        gender                  : formData.gender,
        status                  : formData.status || 'recorded',
        castrated_at            : formData.castratedAt,
        staff_surgeon           : formData.staffSurgeon || "dr_dimitrova",
        location_city           : formData.recordCity,
        zona_number             : parseNum(formData.zonaNumber),
        map_coordinates         : mapCoordinatesField,
        location_address        : formData.address,
        owner_id                : ownerId,
        owner_name              : formData.ownerName,
        owner_phone             : formData.ownerPhone,
        living_condition        : formData.livingCondition ? Array.from(formData.livingCondition) : [],
        has_complications       : formData.hasComplications || "N",
        selected_complications  : formData.selectedComplications || [],
        record_complications    : formData.recordComplications || "",
        
        // ВАЖНО: Тук НЕ изброяваме weight, color и т.н., защото те влизат в 'data'
        data                    : customDataField,
        medical_details         : medicalDetailsField
    }).select();

    if (tdRecordsResponse.error || !tdRecordsResponse.data) {
        throw new Error(tdRecordsResponse.error?.message || "Грешка при запис");
    }

    const newCat = tdRecordsResponse.data[0];

    // Автоматично именуване
    if (!formData.recordName || formData.recordName.trim() === '') {
        const speciesLabel = (formData.species || 'cat') === 'cat' ? 'Котка' : 'Куче';
        const autoName = `${speciesLabel} №${newCat.id}`;
        await supabase.from('td_records').update({ name: autoName }).eq('id', newCat.id);
        newCat.name = autoName;
    }

     // Обработка на снимка, ако има
    if (formData.image) {
        await supabase.storage
            .from('protocol_images')
            .upload(`records/${newCat.id}/avatar.png`, formData.image);
    }

    return tdRecordsResponse;
}

export async function $apiCreateNewRecord(formData, isEditing = false, catId = null) {
    // 1. Първо оправяме собственика
    const ownerData = await recordOwner(formData);
    const finalOwnerId = ownerData.data[0].id;

    // 2. Подготвяме чистите данни
    const { customDataField, medicalDetailsField, mapCoordinatesField } = prepareJsonFields(formData);

    const recordPayload = {
        name                    : formData.recordName,
        species                 : formData.species || 'cat',
        gender                  : formData.gender,
        status                  : formData.status || 'recorded',
        castrated_at            : formData.castratedAt || null,
        staff_surgeon           : formData.staffSurgeon,
        location_city           : formData.recordCity,
        location_address        : formData.address,
        owner_id                : finalOwnerId,
        owner_name              : formData.ownerName,
        owner_phone             : formData.ownerPhone,
        map_coordinates         : mapCoordinatesField,
        living_condition        : formData.livingCondition ? Array.from(formData.livingCondition) : [],
        has_complications       : formData.hasComplications || "N",
        selected_complications  : formData.selectedComplications || [],
        record_complications    : formData.recordComplications,
        data                    : customDataField, 
        medical_details         : medicalDetailsField
    };

    let savedCat;

    if (isEditing && catId) {
        const { data, error } = await supabase
            .from('td_records')
            .upsert({ id: catId, ...recordPayload })
            .select();
        if (error) throw error;
        savedCat = data[0];
    } else {
        const response = await recordAnimal(formData, finalOwnerId);
        savedCat = response.data[0];
    }

    // 3. НОВО: Записваме идентификацията, ако типът е Профилактика или има попълнени данни
    if (formData.regType === 'prevention' || formData.chipNumber || formData.passportNumber) {
        await recordIdentification(savedCat.id, formData);
    }

    return savedCat;
  }

// Помощни функции за собственик...
async function recordOwner(formData) {
    if (!formData?.ownerPhone) throw new Error("Телефонният номер е задължителен.");

    const cleanOwnerData = {
        name    : formData.ownerName,
        phone   : formData.ownerPhone
    };

    // Добавяме ЕГН и Адрес само ако са попълнени във формата
    if (formData.ownerEgn) cleanOwnerData.egn = formData.ownerEgn;
    if (formData.ownerAddress) cleanOwnerData.address = formData.ownerAddress;

    const { data, error } = await supabase
        .from('td_owners')
        .upsert(cleanOwnerData, { onConflict: 'phone' })
        .select();

    if (error) throw error;
    return { data };
}


async function recordIdentification(recordId, formData) {
    const identificationData = {
        record_id: recordId,
        // Микрочип
        chip_number: formData.chipNumber || null,
        chip_date_from: formData.chipDateFrom || null,
        chip_date_to: formData.chipDateTo || null,
        chip_vet: formData.chipVet || null,
        // Паспорт
        passport_number: formData.passportNumber || null,
        passport_date_from: formData.passportDateFrom || null,
        passport_date_to: formData.passportDateTo || null,
        passport_vet: formData.passportVet || null
    };

    // Използваме upsert по record_id, за да не създаваме дубликати при редактиране
    const { error } = await supabase
        .from('td_identifications')
        .upsert(identificationData, { onConflict: 'record_id' });

    if (error) throw error;
}


/**
 * ФУНКЦИЯ ЗА ЗАРЕЖДАНЕ (Използвана в Dashboard, Registry и Map)
 * Синхронизирана с твоите UI компоненти
 */
export async function $apiGetCats() {
    // 1. Вземаме котките
    const records = await supabase.from('td_records').select('*');
    
    // 2. Вземаме ВСИЧКИ идентификации директно (за тест)
    const idens = await supabase.from('td_identifications').select('*');

    const { data, error } = await supabase
        .from('td_records')
        .select(`
            *,
            owner:td_owners(name, phone, egn, address),
            td_protocols (*),
            td_medical_treatments!fk_animal (*)
        `)
        .order('created_at', { ascending: false }); // Винаги най-новите отгоре

    if (error) {
        console.error("Грешка при вземане на котките:", error);
        return { data: [] };
    }

    // 2. Вземаме ВСИЧКИ идентификации с отделна заявка
    const { data: allIdens, error: idError } = await supabase
        .from('td_identifications')
        .select('*');

    if (idError) console.error("Грешка идентификации:", idError);

    // Форматираме данните, така че компонентите ти да не забележат разликата в имената на колоните
    const formattedData = data.map(cat => {
        // Намираме идентификацията за тази конкретна котка
        const myIden = allIdens?.find(i => i.record_id === cat.id);
        
        return {
        ...cat,
        owner_name    : cat.owner?.name || cat.owner_name,
        owner_phone   : cat.owner?.phone || cat.owner_phone,
        owner_egn     : cat.owner?.egn || "",
        owner_address : cat.owner?.address || "",
        address       : cat.location_address, // Map-ваме го обратно за компоненти, които ползват .address
        td_protocols  : cat.td_protocols || [],
        td_medical_treatments: cat.td_medical_treatments || [],
        td_identifications: myIden ? [myIden] : []
        };
    });

    return { data: formattedData };
}

export async function $apiDeleteRecord(id) {
  const { error } = await supabase
    .from('td_records')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Грешка при изтриване:", error);
    throw error;
  }

  return true;
}