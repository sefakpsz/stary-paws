import { createContext, createElement, type ReactNode, useContext, useRef, useState } from "react";
import { Animated, Easing } from "react-native";
import type { LanguagePreference, Translation } from "../app/types";
import { translations } from "../i18n/translations";
import type { Language } from "../types/pet";
import { useReduceMotionPreference } from "../utils/accessibility";
import {
  getLanguagePreferenceLabel,
  getNextLanguagePreference,
  getSystemLanguage,
} from "../utils/preferences";

type AppLanguageContextValue = {
  language: Language;
  languageLabel: string;
  languageOpacity: Animated.Value;
  t: Translation;
  switchLanguage: () => void;
};

const AppLanguageContext = createContext<AppLanguageContextValue | null>(null);

export function AppLanguageProvider({ children }: { children: ReactNode }) {
  const [languagePreference, setLanguagePreference] =
    useState<LanguagePreference>("system");
  const languageOpacity = useRef(new Animated.Value(1)).current;
  const reduceMotion = useReduceMotionPreference();
  const systemLanguage = getSystemLanguage();
  const language =
    languagePreference === "system" ? systemLanguage : languagePreference;
  const t = translations[language];
  const languageLabel = getLanguagePreferenceLabel(
    languagePreference,
    systemLanguage,
    t,
  );

  const switchLanguage = () => {
    const update = () => {
      setLanguagePreference((preference) =>
        getNextLanguagePreference(preference),
      );
    };

    if (reduceMotion) {
      update();
      return;
    }

    languageOpacity.stopAnimation();
    Animated.timing(languageOpacity, {
      toValue: 0.72,
      duration: 80,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      update();
      Animated.timing(languageOpacity, {
        toValue: 1,
        duration: 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
  };

  return createElement(
    AppLanguageContext.Provider,
    { value: { language, languageLabel, languageOpacity, t, switchLanguage } },
    children,
  );
}

export function useAppLanguage() {
  const context = useContext(AppLanguageContext);
  if (!context) {
    throw new Error("useAppLanguage must be used inside AppLanguageProvider");
  }

  return context;
}
