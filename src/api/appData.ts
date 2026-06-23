import type { Language } from "../types/pet";
import { listAdoptionPets } from "./adoptions";
import { listHelpLocations } from "./helpLocations";
import { listLostPetNotices } from "./lostPets";
import type { AppData } from "./mockData";
export { getMockAppData } from "./mockData";

export async function fetchAppData(language: Language): Promise<AppData> {
  const [lostPetNotices, helpLocations, adoptionPets] = await Promise.all([
    listLostPetNotices({ language }),
    listHelpLocations({ language }),
    listAdoptionPets({ language }),
  ]);

  return {
    lostPetNotices,
    helpLocations,
    adoptionPets,
  };
}
