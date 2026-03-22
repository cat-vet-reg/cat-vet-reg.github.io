import supabase from "../../../utils/supabase";

export const defaultFormData = { //когато създавам нова регистрация    
    // // Директни колони (Top-level)
    id                    : null,
    recordName            : "",
    species               : "cat",
    gender                : "female",
    status                : "recorded",
    castratedAt           : "",
    staffSurgeon          : "",
    locationCity          : "",
    locationAddress       : "",
    
    ownerId               : null,
    ownerName             : "",
    ownerPhone            : "",
    
    livingCondition       : [],

    hasComplications      : "N",
    selectedComplications : [],
    recordComplications   : "",

    // Отиващи в JSONB колоната "data"
    donation              : "N",
    ageValue              : 0,
    ageUnit               : "months",
    color                 : "",
    customColor           : "",

    hasEarTag             : "N",
    earTagNumber          : "",

    weight                : "",
    bcsScore              : "5",
    temperament           : "mild",
    recordNotes           : "",
    
    breed                 : "european",
    outdoorAccess         : "Y",
    origin                : "street",
    generalCondition      : "good",
    discoverySource       : "friends",
    imagePreview          : "",
    signature             : "",

    // Тези отиват в JSONB колоната "medical_details"
    isAlreadyCastrated    : "N",
    inductionDose         : 0,
    timeToSleep           : "",
    hasInductionAdd       : false,
    inductionAddAmount    : "",
    propofolUsed          : false,
    propofolTotalMl       : "",
    propofolFirstMin      : "",
    surgeryDuration       : "",
    recoveryTime          : "",
    staffReceived         : "",
    staffReleased         : "",
    earStatus             : "marked",
    parasites             : "none",
    reproductiveStatus    : "none_visible",

    // Координати (Обект)
    coords                : null,
    zonaNumber            : ""
};

/**
 * Maps a database record to the form data structure.
 * @param {Object} record - The database record object.
 * @returns {Object} Populated form data.
 */
export const mapRecordToForm = (record) => { //Превръща данни от DB -> Форма
    if (!record) return { ...defaultFormData };

    // Логика за публичното URL на изображението
    const { data: storageData } = supabase
        .storage
        .from('protocol_images')
        .getPublicUrl(`records/${record.id}/avatar.png`);

    return {
        ...defaultFormData,
        
        // От директни колони
        id                    : record.id,
        recordName            : record.name || "",
        species               : record.species || "cat",
        gender                : record.gender || "female",
        status                : record.status || "recorded",
        castratedAt           : record.castrated_at || "",
        staffSurgeon          : record.staff_surgeon || "",
        locationCity          : record.location_city || "",
        locationAddress       : record.location_address || "",
        ownerId               : record.owner_id || null,
        ownerName             : record.owner_name || "",
        ownerPhone            : record.owner_phone || "",
        hasComplications      : record.has_complications || "N",
        livingCondition       : record.living_condition || [],
        selectedComplications : record.selected_complications || [],
        recordComplications   : record.record_complications || "",

        // От JSONB обекта "data" (превръщаме snake_case обратно в camelCase за фронтенда)
        donation          : record.data?.donation || "N",
        ageValue          : Number(record.data?.age_value) || 0,
        ageUnit           : record.data?.age_unit || "years",
        color             : record.data?.color || "",
        customColor       : record.data?.custom_color || "",
        hasEarTag         : record.data?.has_ear_tag || "N",
        earTagNumber      : record.data?.ear_tag_number || "",
        weight            : record.data?.weight || "",
        bcsScore          : record.data?.bcs_score || "5",
        temperament       : record.data?.temperament || "mild",
        recordNotes       : record.data?.notes || "",
        breed             : record.data?.breed || "european",
        outdoorAccess     : record.data?.outdoor_access || "Y",
        origin            : record.data?.origin || "street",
        generalCondition  : record.data?.general_condition || "good",
        discoverySource   : record.data?.discovery_source || "friends",
        imagePreview      : storageData?.publicUrl || "",
        signature         : record.data?.signature || "",

        // От JSONB обекта "medical_details"
        isAlreadyCastrated: record.medical_details?.is_already_castrated || "N",
        inductionDose     : Number(record.medical_details?.induction_dose) || 0,
        timeToSleep       : record.medical_details?.time_to_sleep || "",
        hasInductionAdd   : record.medical_details?.has_induction_add || false,
        inductionAddAmount: record.medical_details?.induction_add_amount || "",
        propofolUsed      : record.medical_details?.propofol_used || false,
        propofolTotalMl   : record.medical_details?.propofol_total_ml || "",
        propofolFirstMin  : record.medical_details?.propofol_first_min || "",
        surgeryDuration   : record.medical_details?.surgery_duration || "",
        recoveryTime      : record.medical_details?.recovery_time || "",
        staffReceived     : record.medical_details?.staff_received || "",
        staffReleased     : record.medical_details?.staff_released || "",
        earStatus         : record.medical_details?.ear_status || "marked",
        parasites         : record.medical_details?.parasites || "none",
        reproductiveStatus: record.medical_details?.reproductive_status || "none_visible",

        // Координати от map_coordinates
        coords      : record.map_coordinates ? { 
            lat     : Number(record.map_coordinates.lat), 
            lng     : Number(record.map_coordinates.lng) 
        } : null,
        zonaNumber  : record.map_coordinates?.zona_number || ""
    };
};

/**
 * МАПЪР: Превръща данни от Форма -> DB (за запис)
 * @param {Object} formData - Данните от React състоянието
 * @returns {Object} Обект, готов за .insert() или .update() в Supabase
 */
export const mapFormToRecord = (formData) => {
    return {
        // 1. Директни колони (Top-level)
        name              : formData.recordName,
        species           : formData.species,
        gender            : formData.gender,
        status            : formData.status || 'recorded',
        castrated_at      : formData.castratedAt || null,
        staff_surgeon     : formData.staffSurgeon,
        location_city     : formData.locationCity,
        location_address  : formData.locationAddress,
        owner_id          : formData.ownerId,
        owner_name        : formData.ownerName,
        owner_phone       : formData.ownerPhone,
        living_condition        : formData.livingCondition,
        has_complications       : formData.hasComplications,
        selected_complications  : formData.selectedComplications,
        record_complications    : formData.recordComplications,

        // 2. Пакетиране в JSONB колоната "data"
        data: {
            donation          : formData.donation,
            age_value         : Number(formData.ageValue),
            age_unit          : formData.ageUnit,
            color             : formData.color,
            custom_color      : formData.customColor,
            has_ear_tag       : formData.hasEarTag,
            ear_tag_number    : formData.earTagNumber,
            weight            : formData.weight,
            bcs_score         : formData.bcsScore,
            temperament       : formData.temperament,
            notes             : formData.recordNotes,
            breed             : formData.breed,
            outdoor_access    : formData.outdoorAccess,
            origin            : formData.origin,
            general_condition : formData.generalCondition,
            discovery_source  : formData.discoverySource,
            signature         : formData.signature
        },

        // 3. Пакетиране в JSONB колоната "medical_details"
        medical_details: {
            is_already_castrated: formData.isAlreadyCastrated,
            induction_dose      : Number(formData.inductionDose),
            time_to_sleep       : formData.timeToSleep,
            has_induction_add   : formData.hasInductionAdd,
            induction_add_amount: formData.inductionAddAmount,
            propofol_used       : formData.propofolUsed,
            propofol_total_ml   : formData.propofolTotalMl,
            propofol_first_min  : formData.propofolFirstMin,
            surgery_duration    : formData.surgeryDuration,
            recovery_time       : formData.recoveryTime,
            staff_received      : formData.staffReceived,
            staff_released      : formData.staffReleased,
            ear_status          : formData.earStatus,
            parasites           : formData.parasites,
            reproductive_status : formData.reproductiveStatus
        },

        // 4. Координати
        map_coordinates : formData.coords ? {
            lat         : formData.coords.lat,
            lng         : formData.coords.lng,
            zona_number : formData.zonaNumber
        } : null
    };
};
