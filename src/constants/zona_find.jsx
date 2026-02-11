import plovdivData from "./map.json";

export const findDistrict = (lat, lon) => {
  if (!window.turf) {
    console.error("Turf.js не е зареден!");
    return "";
  }

  const point = window.turf.point([lon, lat]);
  let foundZone = "";

  plovdivData.features.forEach((feature) => {
    if (window.turf.booleanPointInPolygon(point, feature)) {
      foundZone = feature.properties.Zona; 
    }
  });

  return foundZone;
};