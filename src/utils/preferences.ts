import * as Localization from "expo-localization";
import type { Language } from "../types/pet";
import type { LanguagePreference, Translation, ThemePreference } from "../app/types";
import type { ThemeMode } from "../theme";

export function getSystemLanguage(): Language {
  const locale = Localization.getLocales()[0];
  return locale?.languageCode?.toLowerCase() === "tr" ? "tr" : "en";
}

export function getNextLanguagePreference(
  preference: LanguagePreference,
): LanguagePreference {
  if (preference === "system") return "tr";
  if (preference === "tr") return "en";
  return "system";
}

export function getNextThemePreference(preference: ThemePreference): ThemePreference {
  if (preference === "system") return "light";
  if (preference === "light") return "dark";
  return "system";
}

export function getLanguagePreferenceLabel(
  preference: LanguagePreference,
  systemLanguage: Language,
  t: Translation,
) {
  if (preference === "system") {
    return `${t.settings.system} (${systemLanguage.toUpperCase()})`;
  }

  return preference.toUpperCase();
}

export function getThemePreferenceLabel(
  preference: ThemePreference,
  systemThemeMode: ThemeMode,
  t: Translation,
) {
  const themeLabel =
    systemThemeMode === "dark" ? t.settings.darkMode : t.settings.lightMode;

  if (preference === "system") {
    return `${t.settings.system} (${themeLabel})`;
  }

  return preference === "dark" ? t.settings.darkMode : t.settings.lightMode;
}

