import { StatusBar } from "expo-status-bar";
import { Animated, ScrollView } from "react-native";
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

  const renderScreen = () => {
    if (activeTab === "home") {
      return (
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
      );
    }

    if (activeTab === "lost") {
      return (
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
      );
    }

    if (activeTab === "help") {
      return (
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
      );
    }

    if (activeTab === "adoption") {
      return (
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
      );
    }

    return (
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
    );
  };

  return (
    <Animated.View style={[styles.root, { opacity: themeOpacity }]}>
      <StatusBar style={themeMode === "dark" ? "light" : "dark"} />
      <BackgroundPaws styles={styles} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: Animated.multiply(screenOpacity, languageOpacity),
            transform: [{ translateY: screenTranslateY }],
          }}
        >
          {renderScreen()}
        </Animated.View>
      </ScrollView>

      <BottomTabs
        activeTab={activeTab}
        onSelectTab={switchTab}
        styles={styles}
        theme={theme}
        t={t}
      />

      <AppModals onPostSubmitted={reload} />
    </Animated.View>
  );
}
