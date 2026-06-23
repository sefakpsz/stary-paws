import { turkeyLocations } from "../data/locations";

const locationOptions = turkeyLocations;

export function parseLocationValue(value: string) {
  const trimmedValue = value.trim();
  const selectedCity = findSelectedCity(trimmedValue);

  if (!selectedCity) {
    return {
      city: trimmedValue,
      district: "",
      selectedCity: null,
    };
  }

  return {
    city: selectedCity.city,
    district: trimmedValue.slice(selectedCity.city.length).trim(),
    selectedCity,
  };
}

export function getCitySuggestions(value: string) {
  const cityQuery = normalizeSearch(value);
  if (!cityQuery) return [];

  return locationOptions
    .filter(
      (option) =>
        normalizeSearch(option.city).startsWith(cityQuery) &&
        normalizeSearch(option.city) !== cityQuery,
    )
    .slice(0, 8)
    .map((option) => option.city);
}

export function getDistrictSuggestions(city: string, value: string) {
  const selectedCity = locationOptions.find((option) => option.city === city);
  if (!selectedCity) return [];

  const districtQuery = normalizeSearch(value);
  if (
    selectedCity.districts.some(
      (district) => normalizeSearch(district) === districtQuery,
    )
  )
    return [];

  return selectedCity.districts
    .filter(
      (district) =>
        !districtQuery || normalizeSearch(district).startsWith(districtQuery),
    )
    .map((district) => district);
}

export function findSelectedCity(value: string) {
  const normalizedValue = normalizeSearch(value);
  return (
    locationOptions.find((option) => {
      const normalizedCity = normalizeSearch(option.city);
      return (
        normalizedValue === normalizedCity ||
        normalizedValue.startsWith(`${normalizedCity} `)
      );
    }) ?? null
  );
}

export function normalizeSearch(value: string) {
  return value
    .trim()
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

