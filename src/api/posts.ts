import type { CreateFormField, CreateType } from "../app/types";
import { createAdoptionPet } from "./adoptions";
import { createHelpLocation } from "./helpLocations";
import { createLostPetNotice } from "./lostPets";

export type CreatePostInput = Record<CreateFormField, string>;

export async function submitPost(type: CreateType, input: CreatePostInput) {
  const payload = {
    area: input.area,
    contact: input.contact,
    description: input.description,
    title: input.title,
  };

  if (type === "lost") return createLostPetNotice(payload);
  if (type === "help") return createHelpLocation(payload);
  return createAdoptionPet(payload);
}
