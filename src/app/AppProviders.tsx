import type { ReactNode } from "react";
import { AppLanguageProvider } from "../hooks/useAppLanguage";
import { AppThemeProvider } from "../hooks/useAppTheme";
import { AuthStateProvider } from "../hooks/useAuthState";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AppLanguageProvider>
      <AppThemeProvider>
        <AuthStateProvider>{children}</AuthStateProvider>
      </AppThemeProvider>
    </AppLanguageProvider>
  );
}
