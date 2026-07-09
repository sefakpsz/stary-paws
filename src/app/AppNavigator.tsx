import { StatusBar } from "expo-status-bar";
import { Animated, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { TabKey } from "./types";
import { AppModals } from "../components/AppModals";
import { BackgroundPaws } from "../components/ui";
import { useAppData } from "../hooks/useAppData";
import { useAppLanguage } from "../hooks/useAppLanguage";
import { useAppTheme } from "../hooks/useAppTheme";
import { useAuthState } from "../hooks/useAuthState";
import { useScreenTransition } from "../hooks/useScreenTransition";
import { BottomTabs } from "../navigation/BottomTabs";
import { AdoptionScreen } from "../screens/AdoptionScreen";
import { HelpScreen } from "../screens/HelpScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { LostScreen } from "../screens/LostScreen";
import { SettingsScreen } from "../screens/SettingsScreen";

export function AppNavigator() {
  const insets = useSafeAreaInsets();
  const { language, languageLabel, languageOpacity, t, switchLanguage } =
    useAppLanguage();
  const { styles, theme, themeLabel, themeMode, themeOpacity, switchTheme } =
    useAppTheme();
  const {
    isAuthenticated,
    openAuth,
    openProfile,
    requestCreate,
    signOut,
  } = useAuthState();
  const {
    activeTab,
    reduceMotion,
    screenOpacity,
    screenTranslateY,
    switchTab,
  } = useScreenTransition();
  const { data, errorMessage, isLoading, reload } = useAppData(language);

  // Every tab stays mounted and is only hidden with `display: none` (rather
  // than conditionally rendered) so switching tabs never resets a screen's
  // local state, like open filters or search results.
  const hiddenUnless = (tab: TabKey) =>
    activeTab === tab ? undefined : { display: "none" as const };

  return (
    <Animated.View style={[styles.root, { opacity: themeOpacity }]}>
      <StatusBar style={themeMode === "dark" ? "light" : "dark"} />
      <BackgroundPaws styles={styles} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: 16 + insets.top, paddingBottom: 96 + Math.min(insets.bottom, 18) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: Animated.multiply(screenOpacity, languageOpacity),
            transform: [{ translateY: screenTranslateY }],
          }}
        >
          <View style={hiddenUnless("home")}>
            <HomeScreen
              data={data}
              styles={styles}
              theme={theme}
              t={t}
              errorMessage={errorMessage}
              isLoading={isLoading}
              onOpenTab={switchTab}
              onCreate={requestCreate}
              onRetry={reload}
            />
          </View>
          <View style={hiddenUnless("lost")}>
            <LostScreen
              notices={data.lostPetNotices}
              styles={styles}
              theme={theme}
              t={t}
              errorMessage={errorMessage}
              isLoading={isLoading}
              reduceMotion={reduceMotion}
              onCreate={() => requestCreate("lost")}
              onRetry={reload}
            />
          </View>
          <View style={hiddenUnless("help")}>
            <HelpScreen
              locations={data.helpLocations}
              styles={styles}
              theme={theme}
              t={t}
              errorMessage={errorMessage}
              isLoading={isLoading}
              reduceMotion={reduceMotion}
              onCreate={() => requestCreate("help")}
              onRetry={reload}
            />
          </View>
          <View style={hiddenUnless("adoption")}>
            <AdoptionScreen
              pets={data.adoptionPets}
              styles={styles}
              theme={theme}
              t={t}
              errorMessage={errorMessage}
              isLoading={isLoading}
              reduceMotion={reduceMotion}
              onCreate={() => requestCreate("adoption")}
              onRetry={reload}
            />
          </View>
          <View style={hiddenUnless("settings")}>
            <SettingsScreen
              styles={styles}
              theme={theme}
              t={t}
              themeMode={themeMode}
              languageLabel={languageLabel}
              themeLabel={themeLabel}
              isAuthenticated={isAuthenticated}
              onToggleLanguage={switchLanguage}
              onToggleTheme={switchTheme}
              onOpenAuth={openAuth}
              onOpenProfile={openProfile}
              onSignOut={signOut}
            />
          </View>
        </Animated.View>
      </ScrollView>

      <BottomTabs
        activeTab={activeTab}
        onSelectTab={switchTab}
        styles={styles}
        theme={theme}
        t={t}
        bottomInset={insets.bottom}
      />

      <AppModals onPostSubmitted={reload} />
    </Animated.View>
  );
}
