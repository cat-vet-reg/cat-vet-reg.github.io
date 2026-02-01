/**
 * utils/geocoding.js
 * Използва Google Geocoding API за намиране на координати.
 */
export const getCoordinates = async (city, address) => {
  if (!city) return null;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  // Формираме заявката
  const fullAddress = address && address.toLowerCase() !== city.toLowerCase()
    ? `${address}, ${city}, Bulgaria`
    : `${city}, Bulgaria`;

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      fullAddress
    )}&key=${apiKey}&language=bg`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    }
    
    if (data.status === "ZERO_RESULTS") {
      console.warn("Няма намерени резултати за този адрес.");
    } else {
      console.error("Грешка от Google API:", data.error_message || data.status);
    }
    
    return null;
  } catch (error) {
    console.error("Geocoding failed:", error);
    return null;
  }
};