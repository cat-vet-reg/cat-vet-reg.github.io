/**
 * Fetches coordinates (latitude and longitude) for a given address and city
 * using the Photon (OpenStreetMap) geocoding service.
 *
 * @param {string} city - The city name
 * @param {string} address - The street address
 * @returns {Promise<{lat: number, lng: number} | null>}
 */
/**
 * utils/geocoding.js
 */
export const getCoordinates = async (city, address) => {
  if (!city) return null;

  // 1. Почистване на града от (област...) и префикси
  const cleanCity = city
    .split('(')[0] // Махаме всичко след скобата
    .replace(/\b(гр\.?|град|с\.?|село)\b/gi, '')
    .trim();

  // 2. Почистване на адреса
  const cleanAddress = address
    ? address.replace(/\b(ул\.?|улица|бул\.?|булевард)\b/gi, '').trim()
    : '';

  try {
    // СТЪПКА А: Намираме координатите на самия град (център)
    // Това ни гарантира, че знаем къде в България се намираме
    const cityUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanCity + ', Bulgaria')}&limit=1`;
    const cityRes = await fetch(cityUrl);
    const cityData = await cityRes.json();
    
    if (!cityData.features || cityData.features.length === 0) return null;
    
    const [cityLng, cityLat] = cityData.features[0].geometry.coordinates;

    // Ако потребителят не е въвел адрес още, връщаме центъра на града
    if (!cleanAddress || cleanAddress.length < 3) {
      return { lat: cityLat, lng: cityLng };
    }

    // СТЪПКА Б: Търсим точния адрес, като ограничаваме резултатите около града
    // Използваме &lon= и &lat= за приоритет (bias)
    const addressUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
      cleanAddress
    )}&lon=${cityLng}&lat=${cityLat}&limit=1`;

    const response = await fetch(addressUrl, {
      headers: { 'User-Agent': 'CatRegistryApp/1.0' }
    });

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const feat = data.features[0];
      const [lng, lat] = feat.geometry.coordinates;
      
      // Проверка: Ако Photon намери резултат в Германия или друг град, 
      // а разстоянието е твърде голямо, по-добре върни центъра на града.
      // (Опростена проверка за държава)
      if (feat.properties.country !== 'Bulgaria' && feat.properties.countrycode !== 'BG') {
          return { lat: cityLat, lng: cityLng };
      }

      return { lat, lng };
    }

    // Ако не намери улицата, върни поне центъра на града
    return { lat: cityLat, lng: cityLng };

  } catch (error) {
    console.error('Error fetching coordinates (Photon):', error);
    return null;
  }
};