/**
 * Fetches coordinates (latitude and longitude) for a given address and city
 * using the Photon (OpenStreetMap) geocoding service.
 *
 * @param {string} city - The city name
 * @param {string} address - The street address
 * @returns {Promise<{lat: number, lng: number} | null>}
 */
export const getCoordinates = async (city, address) => {
  if (!city && !address) return null;

  // Photon is tolerant, but basic cleanup helps
  const normalize = (v) =>
    v
      .replace(/\b(ул\.?|улица|гр\.?|град)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

  const query = [address, city, 'Bulgaria']
    .filter(Boolean)
    .map(normalize)
    .join(', ');

  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(
      query
    )}&limit=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CatRegistryApp/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Photon error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      return null;
    }

    const [lng, lat] = data.features[0].geometry.coordinates;

    return { lat, lng };
  } catch (error) {
    console.error('Error fetching coordinates (Photon):', error);
    return null;
  }
};
