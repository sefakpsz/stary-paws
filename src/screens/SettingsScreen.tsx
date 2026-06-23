import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { AppStyles, IconName, Translation } from "../app/types";
import type { ThemeMode, ThemePalette } from "../theme";

export function SettingsScreen({
  styles,
  theme,
  t,
  themeMode,
  languageLabel,
  themeLabel,
  isAuthenticated,
  onToggleLanguage,
  onToggleTheme,
  onOpenAuth,
  onOpenProfile,
  onSignOut,
}: {
  styles: AppStyles;
  theme: ThemePalette;
  t: Translation;
  themeMode: ThemeMode;
  languageLabel: string;
  themeLabel: string;
  isAuthenticated: boolean;
  onToggleLanguage: () => void;
  onToggleTheme: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onSignOut: () => void;
}) {
  return (
    <View>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionText}>
          <Text style={styles.sectionTitle}>{t.settings.title}</Text>
          <Text style={styles.bodyText}>{t.settings.description}</Text>
        </View>
      </View>

      <View style={styles.settingsPanel}>
        <Text style={styles.settingsGroupTitle}>{t.settings.account}</Text>
        <View style={styles.settingsUserHeader}>
          <View style={styles.settingsAvatar}>
            <Ionicons
              name={isAuthenticated ? "person" : "person-outline"}
              size={24}
              color={theme.bgDeep}
            />
          </View>
          <View style={styles.settingsUserText}>
            <Text style={styles.profileName}>
              {isAuthenticated ? t.profile.name : t.settings.signedOut}
            </Text>
            <Text style={styles.profileEmail}>
              {isAuthenticated ? t.profile.email : t.auth.description}
            </Text>
          </View>
        </View>
        {isAuthenticated ? (
          <>
            <SettingsRow
              icon="person-outline"
              label={t.profile.settings}
              value={t.profile.title}
              onPress={onOpenProfile}
              styles={styles}
              theme={theme}
            />
            <SettingsRow
              icon="log-out-outline"
              label={t.actions.signOut}
              value={t.profile.email}
              onPress={onSignOut}
              styles={styles}
              theme={theme}
            />
          </>
        ) : (
          <SettingsRow
            icon="log-in-outline"
            label={t.actions.signIn}
            value={t.actions.demoSignIn}
            onPress={onOpenAuth}
            styles={styles}
            theme={theme}
          />
        )}
      </View>

      <View style={styles.settingsPanel}>
        <SettingsRow
          icon="language-outline"
          label={t.settings.language}
          value={languageLabel}
          onPress={onToggleLanguage}
          styles={styles}
          theme={theme}
        />
        <SettingsRow
          icon={themeMode === "dark" ? "moon" : "sunny"}
          label={t.settings.theme}
          value={themeLabel}
          onPress={onToggleTheme}
          styles={styles}
          theme={theme}
        />
      </View>
    </View>
  );
}

export function SettingsRow({
  icon,
  label,
  value,
  onPress,
  styles,
  theme,
}: {
  icon: IconName;
  label: string;
  value: string;
  onPress: () => void;
  styles: AppStyles;
  theme: ThemePalette;
}) {
  return (
    <Pressable
      style={styles.settingsRow}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${value}`}
    >
      <View style={styles.settingsIcon}>
        <Ionicons name={icon} size={18} color={theme.secondaryStrong} />
      </View>
      <View style={styles.settingsRowContent}>
        <Text style={styles.settingsRowLabel}>{label}</Text>
        <Text style={styles.settingsRowValue}>{value}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.muted} />
    </Pressable>
  );
}

