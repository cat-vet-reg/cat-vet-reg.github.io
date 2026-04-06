import supabase from "../../../utils/supabase";

export const defaultFormData = {
  ownerName       : "",
  ownerPhone      : "",
  donation        : "N",
  
  // Данни на КТ
  recordName      : "",
  species         : "cat",
  gender          : "female",
  hasEarTag       : "N",
  earTagNumber    : "",
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
  zonaNumber      : "",
  livingCondition : [],
  coords          : null,
  
  breed           : "european",
  outdoorAccess   : "Y",
  origin          : "street",
  generalCondition: "good",
  discoverySource : "friends",
  
  castratedAt     : null,
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
  staffSurgeon            : "dr_taneva",
  staffReleased           : "",
  earStatus               : "",
  parasites               : "none",
  reproductiveStatus      : "none_visible",
  
  imagePreview            : "",
  signature               : ""
};

//mapRecordToForm подготвя данните така, че Формата (Input) да ги разбере. Тя трябва да попълни всеки checkbox, input и select точно с очакваните стойности.
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
    
    ownerName       : record.owner_name || "",
    ownerPhone      : record.owner_phone || "",
    donation        : record.data?.donation || "",

    id              : record.id,
    recordName      : record.name || "",
    species         : record.species || "cat",
    gender          : record.gender || "",
    hasEarTag       : record.data?.hasEarTag || "N",
    earTagNumber    : record.data?.earTagNumber || "",
    weight          : record.data?.weight || "",
    bcsScore        : record.data?.bcsScore || "5",
    
    ageValue        : record.data?.age_value || "",
    ageUnit         : record.data?.age_unit || "months",
    color           : record.data?.color || "",
    customColor     : record.data?.customColor || "",
    recordNotes     : record.data?.notes || "",
    recordCity      : record.location_city || "",
    address         : record.location_address || "",
    zonaNumber      : record.map_coordinates?.zona_number || "",
    livingCondition : record.living_condition || [],
    coords          : foundCoords,

    temperament     : record.data?.temperament || "mild",
    origin          : record.data?.origin || "street",
    breed           : record.data?.breed || "european",
    outdoorAccess   : record.data?.outdoorAccess || "Y",
    generalCondition: record.data?.generalCondition || "good",
    discoverySource : record.data?.discoverySource || "friends",

    imagePreview    : data?.publicUrl || "",
    signature       : record.data?.signature || "",
    
    castratedAt             : record.castrated_at || null,
    isAlreadyCastrated      : record.data?.isAlreadyCastrated || record.is_already_castrated || "N",

    hasComplications        : record.data?.has_complications || record.has_complications || "N",
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
    recoveryTime        : record.data?.recoveryTime           || "",

    status              : record.data?.status || record.status || "recorded",
    staffReceived       : record.data?.staffReceived           || "",
    staffSurgeon        : record.data?.staffSurgeon  || record.staff_surgeon  || "",
    staffReleased       : record.data?.staffReleased           || "",
    earStatus           : record.data?.earStatus               || "marked",
    parasites           : record.data?.parasites               || "none",
    reproductiveStatus  : record.data?.reproductiveStatus  || record.reproductiveStatus  || "none_visible"
  };
};

export const defaultRecordStructure = {
    id: null,
    recordName: "Няма име",
    species: "cat",
    gender: "unknown",
    owner: {
        name: "Няма собственик",
        phone: "Няма телефон",
    },
    status: "recorded",
    location: {
        address: "",
        city: "",
        coords: null
    },
    medical: {
        latestAnamnesis: "Няма записи",
        latestTreatment: "Няма записи",
        diagnoses: "-",
        hasComplications: "N"
    },
    // ... всички останали полета от defaultFormData
};

//mapDbToUi подготвя данните за Списъка (Read-only). Тук не ни трябват 50 полета, а само тези, по които филтрираме и сортираме.
export const mapDbToUi = (record) => {
  if (!record) return {};

  return {
    // 1. Вземаме всичко от топ нивото на записа
    ...record, 
    
    // 2. Уеднаквяваме имената към camelCase за твоя React код
    id              : record.id,
    recordName      : record.name || `Животно №${record.id}`,
    ownerName       : record.owner_name || record.owner?.name || "Няма име",
    ownerPhone      : record.owner_phone || record.owner?.phone || "Няма телефон",
    castratedAt     : record.castrated_at ? record.castrated_at : null, 
    status          : record.status || "recorded",
    staffReceived   : record.staffReceived || "",
    staffSurgeon    : record.staff_surgeon || "",
    staffReleased   : record.staffReleased || "",
    
    // 3. Вадим усложненията (гледаме директно топ нивото, както се вижда в записа ти)
    hasComplications: record.has_complications || "N",
    selectedComplications: record.selected_complications || [],
    
    // 4. Подсигуряваме координатите
    coords: record.map_coordinates || null
  };
};