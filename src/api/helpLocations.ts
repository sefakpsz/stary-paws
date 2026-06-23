import type { HelpLocation, Language, PetKind, Urgency } from "../types/pet";
import { apiRequest, isApiConfigured } from "./client";
import { mockResponse } from "./mock";
import { getMockAppData } from "./mockData";

export type HelpLocationFilters = {
  kind?: PetKind | "all";
  language: Language;
  location?: string;
  urgency?: Urgency | "all";
};

export type CreateHelpLocationInput = {
  area: string;
  contact: string;
  description: string;
  title: string;
};

export async function listHelpLocations(filters: HelpLocationFilters) {
  if (isApiConfigured()) {
    return apiRequest<HelpLocation[]>("/help-locations", { query: filters });
  }

  return mockResponse(getMockAppData(filters.language).helpLocations);
}

export async function createHelpLocation(input: CreateHelpLocationInput) {
  if (isApiConfigured()) {
    return apiRequest<HelpLocation>("/help-locations", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  return mockResponse({
    id: `help-${Date.now()}`,
    title: input.title,
    kind: "cat",
    area: input.area,
    urgency: "medium",
    description: input.description,
    imageUrl:
      "https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=900&q=80",
  } satisfies HelpLocation);
}
