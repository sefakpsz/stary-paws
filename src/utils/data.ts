import type { PetKind, Urgency } from "../types/pet";
import type { IconName, PetKindFilter, TabKey, UrgencyFilter } from "../app/types";

export function getTabIcon(tab: TabKey, active: boolean): IconName {
  if (tab === "home") return active ? "home" : "home-outline";
  if (tab === "lost") return active ? "search" : "search-outline";
  if (tab === "help") return active ? "first-aid" : "first-aid-outline";
  if (tab === "adoption") return active ? "heart" : "heart-outline";
  if (tab === "settings") return active ? "settings" : "settings-outline";
  return active ? "home" : "home-outline";
}

export function matchesKind(kind: PetKind, filter: PetKindFilter) {
  return filter === "all" || kind === filter;
}

export function matchesUrgency(urgency: Urgency, filter: UrgencyFilter) {
  return filter === "all" || urgency === filter;
}

export function matchesQuery(value: string, query: string) {
  const tokens = normalizeSearch(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  const normalizedValue = normalizeSearch(value);
  return tokens.every((token) => normalizedValue.includes(token));
}


function normalizeSearch(value: string) {
  return value
    .trim()
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
