import type { translations } from "../i18n/translations";
import type { Language, PetKind, Urgency } from "../types/pet";

export type ThemePreference = "light" | "dark" | "system";
export type LanguagePreference = Language | "system";
export type TabKey = "home" | "lost" | "help" | "adoption" | "settings";
export type CreateType = "lost" | "help" | "adoption";
export type CreateFormField = "title" | "area" | "description" | "contact";
export type PetKindFilter = PetKind | "all";
export type UrgencyFilter = Urgency | "all";
export type { IconName } from "../components/PhosphorIcon";
export type Translation = (typeof translations)[Language];
export type AppStyles = ReturnType<typeof import("../theme").createStyles>;
