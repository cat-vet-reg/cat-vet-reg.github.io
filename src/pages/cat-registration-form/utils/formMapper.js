import supabase from "../../../utils/supabase";

export const defaultFormData = {
  ownerName       : "",
  ownerPhone      : "",
  donation        : "N",
  
  // Данни на КТ
  recordName      : "",
  gender          : "female",
  species         : "cat",
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
  staffSurgeon            : "dr_taneva",
  staffReleased           : "",
  earStatus               : "",
  parasites               : "none",
  reproductiveStatus      : "none_visible",
  
  imagePreview            : "",
  signature               : ""
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

    id              : record.id,
    recordName      : record.name || "",
    gender          : record.gender || "",
    species         : record.species || record.data?.species || "cat",
    hasEarTag       : record.data?.hasEarTag || "N",
    earTagNumber    : record.data?.earTagNumber || record.ear_tag_number || "",
    weight          : record.weight || "",
    bcsScore        : record.data?.bcsScore || "5",
    
    ageValue        : record.age_value || "",
    ageUnit         : record.age_unit || "months",
    color           : record.color || "",
    customColor     : record.data?.customColor || "",
    recordNotes     : record.notes || "",
    recordCity      : record.location_city || "",
    address         : record.location_address || "",
    zonaNumber      : record.zona_number || "",
    livingCondition : record.living_condition || [],
    coords          : foundCoords,

    temperament     : record.data?.temperament || record.temperament || "mild",
    origin          : record.data?.origin || "street",
    breed           : record.data?.breed || "european",
    outdoorAccess   : record.data?.outdoorAccess || "Y",
    generalCondition: record.data?.generalCondition || "good",
    discoverySource : record.data?.discoverySource || "friends",

    imagePreview    : data?.publicUrl || "",
    signature       : record.data?.signature || "",
    
    castratedAt             : record.castrated_at || "",
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

export const mapDbToUi = (record) => {
  if (!record) return {};

  // Извличане на координати (поддържаме всички възможни формати от DB)
  const coords = record.map_coordinates || record.coordinates || null;
  
  // Медицинска логика за лечебния регистър
  const allProtocols = record.td_protocols || [];
  const lastProtocol = allProtocols[allProtocols.length - 1]?.data;
  const uniqueDiagnoses = [...new Set(allProtocols.map(p => p.data?.diagnosis).filter(Boolean))];

  return {
    ...record, // Пазим оригинала
    // Уеднаквени полета за UI:
    id              : record.id,
    recordName      : record.name || record.recordName || `Животно №${record.id}`,
    ownerName       : record.owner?.name || record.owner_name || record.data?.ownerName || "Няма име",
    ownerPhone      : record.owner?.phone || record.owner_phone || record.data?.ownerPhone || "Няма телефон",
    species         : record.species || record.data?.species || "cat",
    gender          : record.gender || record.data?.gender || "female",
    status          : record.status || record.data?.status || "recorded",
    color           : record.color || record.data?.color || "",
    castratedAt     : record.castrated_at || "",
    address         : record.location_address || record.address || "",
    hasComplications: record.has_complications || record.data?.has_complications || "N",
    
    // Медицински полета (за TreatmentRegistry)
    latestAnamnesis : lastProtocol?.anamnesis || "Няма вписана анамнеза",
    latestTreatment : lastProtocol?.treatment || "Няма вписано лечение",
    diagnoses       : uniqueDiagnoses.length > 0 ? uniqueDiagnoses.join(", ") : "-",
    
    coords: coords
  };
};