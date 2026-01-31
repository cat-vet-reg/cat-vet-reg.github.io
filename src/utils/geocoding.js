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

  // 1. Почистване на града
  const cleanCity = city
    .split('(')[0]
    .replace(/\b(гр\.?|град|с\.?|село)\b/gi, '')
    .trim();

  // 2. Почистване на адреса
  const cleanAddress = address
    ? address.replace(/\b(ул\.?|улица|бул\.?|булевард)\b/gi, '').trim()
    : '';

  // Помощна функция за превръщане на името на латиница (само за сигурност)
  const toLat = (t) => t.replace(/[а-я]/gi, m => "abvgdeejziiklmnoprstufhcshshiyuya"["абвгдеёжзийклмнопрстуфхцчшщъыюя".indexOf(m.toLowerCase())] || m);

  try {
    // СТЪПКА А: Търсим града. Включваме латинското име в търсенето, за да помогнем на Photon
    const citySearch = `${cleanCity} ${toLat(cleanCity)}, Bulgaria`;
    const cityUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(citySearch)}&limit=1`;
    
    const cityRes = await fetch(cityUrl);
    const cityData = await cityRes.json();
    
    if (!cityData.features || cityData.features.length === 0) return null;
    
    const [cityLng, cityLat] = cityData.features[0].geometry.coordinates;

    // Ако няма адрес или той е същият като града
    if (!cleanAddress || cleanAddress.length < 3 || cleanAddress.toLowerCase() === cleanCity.toLowerCase()) {
      return { lat: cityLat, lng: cityLng };
    }

    // СТЪПКА Б: Търсим адреса, но ВИНАГИ добавяме и града в низа
    // Това е критично, за да не "избягаме" към Хасково или Германия
    const fullAddressSearch = `${cleanAddress}, ${cleanCity}, Bulgaria`;

    const addressUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(fullAddressSearch)}&lon=${cityLng}&lat=${cityLat}&limit=1`;

    const response = await fetch(addressUrl, {
      headers: { 'User-Agent': 'CatRegistryApp/1.0' }
    });

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const feat = data.features[0];
      const [lng, lat] = feat.geometry.coordinates;
      
      // Проверка за държава
      const isBG = feat.properties.countrycode === 'BG' || feat.properties.country === 'Bulgaria';
      if (!isBG) return { lat: cityLat, lng: cityLng };

      return { lat, lng };
    }

    return { lat: cityLat, lng: cityLng };

  } catch (error) {
    console.error('Error fetching coordinates:', error);
    return null;
  }
};