import * as Location from "expo-location";

export function formatDeviceLocationQuery(place?: Location.LocationGeocodedAddress) {
  if (!place) return "";

  const city = place.city || place.region || place.subregion || "";
  const district =
    place.district ||
    place.subregion ||
    place.name ||
    "";

  return [city, district]
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part, index, parts) => parts.indexOf(part) === index)
    .join(" ");
}

export async function getDeviceLocationQuery() {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== Location.PermissionStatus.GRANTED) {
    return { status: "denied" as const, query: "", label: "" };
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  const [place] = await Location.reverseGeocodeAsync(position.coords);
  const query = formatDeviceLocationQuery(place);

  return {
    status: "granted" as const,
    query,
    label: query.split(" ").join(", "),
  };
}

