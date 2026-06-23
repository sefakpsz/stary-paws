import type { AdoptionPet, Language, PetKind } from "../types/pet";
import { apiRequest, isApiConfigured } from "./client";
import { mockResponse } from "./mock";
import { getMockAppData } from "./mockData";

export type AdoptionFilters = {
  kind?: PetKind | "all";
  language: Language;
  location?: string;
};

export type CreateAdoptionInput = {
  area: string;
  contact: string;
  description: string;
  title: string;
};

export async function listAdoptionPets(filters: AdoptionFilters) {
  if (isApiConfigured()) {
    return apiRequest<AdoptionPet[]>("/adoptions", { query: filters });
  }

  return mockResponse(getMockAppData(filters.language).adoptionPets);
}

export async function createAdoptionPet(input: CreateAdoptionInput) {
  if (isApiConfigured()) {
    return apiRequest<AdoptionPet>("/adoptions", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  return mockResponse({
    id: `adopt-${Date.now()}`,
    name: input.title,
    kind: "cat",
    age: "",
    area: input.area,
    personality: [],
    description: input.description,
    imageUrl:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80",
  } satisfies AdoptionPet);
}
