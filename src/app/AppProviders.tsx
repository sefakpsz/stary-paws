import type { ReactNode } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppLanguageProvider } from "../hooks/useAppLanguage";
import { AppThemeProvider } from "../hooks/useAppTheme";
import { AuthStateProvider } from "../hooks/useAuthState";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider>
      <AppLanguageProvider>
        <AppThemeProvider>
          <AuthStateProvider>{children}</AuthStateProvider>
        </AppThemeProvider>
      </AppLanguageProvider>
    </SafeAreaProvider>
  );
}
