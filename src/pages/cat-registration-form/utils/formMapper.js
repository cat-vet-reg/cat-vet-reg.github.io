import supabase from "../../../utils/supabase";

export const defaultFormData = {
    ownerName       : "",
    ownerPhone      : "",
    donation        : "",
    
    // Данни на КТ
    recordName      : "",
    gender          : "",
    weight          : "",
    bcsScore        : "5",
    temperament     : "mild",
    ageValue        : "",
    ageUnit         : "months",
    color           : "",
    customColor     : "",
    recordNotes     : "",
    recordCity      : "",
    address         : "",
    livingCondition : [], // Changed to array for better compatibility
    coords          : null,
    
    breed           : "european",
    outdoorAccess   : "Y",
    origin          : "street",
    generalCondition: "good",
    discoverySource : "friends",
    
    castratedAt     : "",
    isAlreadyCastrated: "N",
    
    // Усложнения
    hasComplications        : "N",
    selectedComplications   : [],
    recordComplications     : "",
    
    // Анестезиология
    inductionDose           : "",
    timeToSleep             : "",
    hasInductionAdd         : false,
    inductionAddAmount      : "",
    propofolUsed            : false,
    propofolTotalMl         : "",
    propofolFirstMin        : "",
    surgeryDuration         : "",
    
    // Сегашен статус
    status                  : "recorded",
    staffReceived           : "",
    staffSurgeon            : "",
    staffReleased           : "",
    earStatus               : "",
    parasites               : "none",
    reproductiveStatus      : "none_visible",
    
    imagePreview            : ""
};

/**
 * Maps a database record to the form data structure.
 * @param {Object} record - The database record object.
 * @returns {Object} Populated form data.
 */
export const mapRecordToForm = (record) => {
    if (!record) return { ...defaultFormData };

    // Coordinates logic
    const lat = record.latitude || record.map_coordinates?.lat || record.coordinates?.lat;
    const lng = record.longitude || record.map_coordinates?.lng || record.coordinates?.lng;
    const foundCoords = (lat && lng) ? { lat: Number(lat), lng: Number(lng) } : null;

    // Image URL logic
    const { data } = supabase
        .storage
        .from('protocol_images')
        .getPublicUrl(`records/${record.id}/avatar.png`);

    // Prioritize `data` field but fallback to top-level properties or defaults
    return {
        ...defaultFormData,
        
        ownerName       : record.owner?.name || record.owner_name || "",
        ownerPhone      : record.owner?.phone || record.owner_phone || "",
        donation        : record.data?.donation || "",

        recordName      : record.name || "",
        gender          : record.gender || "",
        weight          : record.weight || "",
        bcsScore        : record.data?.bcsScore || "5",
        
        ageValue        : record.age_value || "",
        ageUnit         : record.age_unit || "months",
        color           : record.color || "",
        recordNotes     : record.notes || "",
        recordCity      : record.location_city || "",
        address         : record.location_address || "",
        livingCondition : record.living_condition || [],
        coords          : foundCoords,

        temperament     : record.data?.temperament || record.temperament || "mild",
        origin          : record.data?.origin || "street",
        breed           : record.data?.breed || "european",
        outdoorAccess   : record.data?.outdoorAccess || "Y",
        generalCondition: record.data?.generalCondition || "good",
        discoverySource : record.data?.discoverySource || "friends",

        imagePreview    : data?.publicUrl || "",

        castratedAt         : record.castrated_at || "",
        isAlreadyCastrated  : record.data?.isAlreadyCastrated || record.is_already_castrated || "N",

        hasComplications    : record.data?.has_complications || record.has_complications || "N",
        selectedComplications   : record.data?.selectedComplications|| [],
        recordComplications     : record.record_complications       || "",

        inductionDose       : record.data?.inductionDose          || "",
        timeToSleep         : record.data?.timeToSleep            || "",
        hasInductionAdd     : record.data?.hasInductionAdd        || false,
        inductionAddAmount  : record.data?.inductionAddAmount     || "",
        propofolUsed        : record.data?.propofolUsed           || false,
        propofolTotalMl     : record.data?.propofolTotalMl        || "",
        propofolFirstMin    : record.data?.propofolFirstMin       || "",
        surgeryDuration     : record.data?.surgeryDuration        || "",

        status              : record.data?.status || record.status || "recorded",
        staffReceived       : record.data?.staffReceived          || "",
        staffSurgeon        : record.data?.staffSurgeon           || "",
        staffReleased       : record.data?.staffReleased          || "",
        earStatus           : record.data?.earStatus              || "marked",
        parasites           : record.data?.parasites              || "none",
        reproductiveStatus  : record.data?.reproductiveStatus     || "none_visible",
        
        customColor: record.data?.customColor || ""
    };
};
