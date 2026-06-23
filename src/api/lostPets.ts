import type { Language, LostPetNotice, PetKind } from "../types/pet";
import { apiRequest, isApiConfigured } from "./client";
import { getMockAppData } from "./mockData";
import { mockResponse } from "./mock";

export type LostPetFilters = {
  kind?: PetKind | "all";
  language: Language;
  location?: string;
  name?: string;
};

export type CreateLostPetNoticeInput = {
  area: string;
  contact: string;
  description: string;
  title: string;
};

export async function listLostPetNotices(filters: LostPetFilters) {
  if (isApiConfigured()) {
    return apiRequest<LostPetNotice[]>("/lost-pets", { query: filters });
  }

  return mockResponse(getMockAppData(filters.language).lostPetNotices);
}

export async function createLostPetNotice(input: CreateLostPetNoticeInput) {
  if (isApiConfigured()) {
    return apiRequest<LostPetNotice>("/lost-pets", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  return mockResponse({
    id: `lost-${Date.now()}`,
    name: input.title,
    kind: "cat",
    area: input.area,
    lastSeen: input.area,
    description: input.description,
    contact: input.contact,
    imageUrl:
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=900&q=80",
  } satisfies LostPetNotice);
}
