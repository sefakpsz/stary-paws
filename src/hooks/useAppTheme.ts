import { createContext, createElement, type ReactNode, useContext, useMemo, useRef, useState } from "react";
import { Animated, Easing, useColorScheme } from "react-native";
import type { ThemePreference } from "../app/types";
import { createStyles, palette, type ThemeMode, type ThemePalette } from "../theme";
import { useReduceMotionPreference } from "../utils/accessibility";
import { getNextThemePreference, getThemePreferenceLabel } from "../utils/preferences";
import { useAppLanguage } from "./useAppLanguage";

type AppThemeContextValue = {
  styles: ReturnType<typeof createStyles>;
  theme: ThemePalette;
  themeLabel: string;
  themeMode: ThemeMode;
  themeOpacity: Animated.Value;
  switchTheme: () => void;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const colorScheme = useColorScheme();
  const [themePreference, setThemePreference] =
    useState<ThemePreference>("system");
  const themeOpacity = useRef(new Animated.Value(1)).current;
  const reduceMotion = useReduceMotionPreference();
  const { t } = useAppLanguage();

  const systemThemeMode: ThemeMode = colorScheme === "light" ? "light" : "dark";
  const themeMode =
    themePreference === "system" ? systemThemeMode : themePreference;
  const theme = palette[themeMode];
  const styles = useMemo(() => createStyles(theme), [theme]);
  const themeLabel = getThemePreferenceLabel(
    themePreference,
    systemThemeMode,
    t,
  );

  const switchTheme = () => {
    const nextThemePreference = getNextThemePreference(themePreference);
    const update = () => setThemePreference(nextThemePreference);

    if (reduceMotion) {
      update();
      return;
    }

    themeOpacity.stopAnimation();
    Animated.timing(themeOpacity, {
      toValue: 0.72,
      duration: 110,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      update();
      Animated.timing(themeOpacity, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
  };

  return createElement(
    AppThemeContext.Provider,
    {
      value: {
        styles,
        theme,
        themeLabel,
        themeMode,
        themeOpacity,
        switchTheme,
      },
    },
    children,
  );
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used inside AppThemeProvider");
  }

  return context;
}
