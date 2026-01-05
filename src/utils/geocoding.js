/**
 * Fetches coordinates (latitude and longitude) for a given address and city
 * using the OpenStreetMap Nominatim API.
 * 
 * @param {string} city - The city name
 * @param {string} address - The street address
 * @returns {Promise<{lat: number, lng: number} | null>} - The coordinates or null if not found
 */
export const getCoordinates = async (city, address) => {
  if (!city && !address) return null;
  
  try {
    const query = [address, city].filter(Boolean).join(', ');
    if (!query) return null;

    const encodedQuery = encodeURIComponent(query);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CatRegistryApp/1.0' // Nominatim requires a User-Agent
      }
    });

    if (!response.ok) {
        throw new Error(`Geocoding error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    return null;
  }
};
