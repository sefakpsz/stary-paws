export type Language = 'tr' | 'en';
export type PetKind = 'cat' | 'dog';
export type Urgency = 'low' | 'medium' | 'high';

export interface LostPetNotice {
  id: string;
  name: string;
  kind: PetKind;
  area: string;
  lastSeen: string;
  description: string;
  contact: string;
  imageUrl: string;
}

export interface HelpLocation {
  id: string;
  title: string;
  kind: PetKind;
  area: string;
  urgency: Urgency;
  description: string;
  imageUrl: string;
}

export interface AdoptionPet {
  id: string;
  name: string;
  kind: PetKind;
  age: string;
  area: string;
  personality: string[];
  description: string;
  imageUrl: string;
}
