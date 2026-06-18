import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Alert,
  Animated,
  Easing,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { mockDataByLanguage } from "./src/data/mockData";
import { turkeyLocations } from "./src/data/locations";
import { translations } from "./src/i18n/translations";
import type {
  AdoptionPet,
  HelpLocation,
  Language,
  LostPetNotice,
  PetKind,
  Urgency,
} from "./src/types/pet";
import pawPattern from "./assets/paw-pattern.png";

type ThemeMode = "light" | "dark";
type TabKey = "home" | "lost" | "help" | "adoption" | "settings";
type CreateType = "lost" | "help" | "adoption";
type CreateFormField = "title" | "area" | "description" | "contact";
type PetKindFilter = PetKind | "all";
type UrgencyFilter = Urgency | "all";
type IconName = keyof typeof Ionicons.glyphMap;
type Translation = (typeof translations)[Language];

interface ThemePalette {
  bg: string;
  bgDeep: string;
  surface: string;
  surfaceStrong: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  secondary: string;
  secondaryStrong: string;
  accent: string;
  danger: string;
  dangerBg: string;
  success: string;
  successBg: string;
  cat: string;
  dog: string;
  pawOpacity: number;
}

const tabs: TabKey[] = ["home", "lost", "help", "adoption", "settings"];

const locationOptions = turkeyLocations;

const palette: Record<ThemeMode, ThemePalette> = {
  light: {
    bg: "#edf2df",
    bgDeep: "#cbd9bc",
    surface: "rgba(255, 252, 243, 0.94)",
    surfaceStrong: "#fffaf0",
    text: "#28342a",
    muted: "#687060",
    border: "rgba(65, 82, 56, 0.16)",
    primary: "#a94f31",
    secondary: "#477454",
    secondaryStrong: "#254c35",
    accent: "#d8a13a",
    danger: "#9f3030",
    dangerBg: "rgba(159, 48, 48, 0.13)",
    success: "#254c35",
    successBg: "rgba(71, 116, 84, 0.15)",
    cat: "#df8ab4",
    dog: "#6d8e50",
    pawOpacity: 1,
  },
  dark: {
    bg: "#0d2b1b",
    bgDeep: "#07190f",
    surface: "rgba(25, 35, 29, 0.94)",
    surfaceStrong: "#233229",
    text: "#efe8db",
    muted: "#b8b09f",
    border: "rgba(239, 232, 219, 0.12)",
    primary: "#eb916d",
    secondary: "#82ad76",
    secondaryStrong: "#a7d696",
    accent: "#e1b95b",
    danger: "#ffb0a5",
    dangerBg: "rgba(255, 128, 112, 0.16)",
    success: "#a7d696",
    successBg: "rgba(130, 173, 118, 0.18)",
    cat: "#f1a1c5",
    dog: "#a9c979",
    pawOpacity: 0.1,
  },
};

export default function App() {
  const [language, setLanguage] = useState<Language>("tr");
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [createType, setCreateType] = useState<CreateType | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [helpLocationQuery, setHelpLocationQuery] = useState("");
  const [helpUrgencyFilter, setHelpUrgencyFilter] =
    useState<UrgencyFilter>("all");
  const [helpCurrentLocationQuery, setHelpCurrentLocationQuery] = useState("");
  const [helpCurrentLocationLabel, setHelpCurrentLocationLabel] = useState("");
  const [isLocatingHelp, setLocatingHelp] = useState(false);
  const [lostFiltersOpen, setLostFiltersOpen] = useState(false);
  const [helpFiltersOpen, setHelpFiltersOpen] = useState(false);
  const [adoptionFiltersOpen, setAdoptionFiltersOpen] = useState(false);
  const [lostKindFilter, setLostKindFilter] = useState<PetKindFilter>("all");
  const [lostLocationQuery, setLostLocationQuery] = useState("");
  const [lostNameQuery, setLostNameQuery] = useState("");
  const [isLocatingLost, setLocatingLost] = useState(false);
  const [adoptionKindFilter, setAdoptionKindFilter] =
    useState<PetKindFilter>("all");
  const [adoptionLocationQuery, setAdoptionLocationQuery] = useState("");
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const screenTranslateY = useRef(new Animated.Value(0)).current;
  const themeOpacity = useRef(new Animated.Value(1)).current;
  const languageOpacity = useRef(new Animated.Value(1)).current;
  const tabTransitionId = useRef(0);
  const reduceMotion = useReduceMotionPreference();

  const t = translations[language];
  const data = useMemo(() => getCardData(language), [language]);
  const theme = palette[themeMode];
  const styles = useMemo(() => createStyles(theme), [theme]);
  const resultsOpacity = useRef(new Animated.Value(1)).current;
  const resultsTranslateY = useRef(new Animated.Value(0)).current;
  const filterTransitionId = useRef(0);

  const helpResults = data.helpLocations.filter(
    (item) =>
      matchesQuery(item.area, helpLocationQuery) &&
      matchesUrgency(item.urgency, helpUrgencyFilter),
  );
  const lostResults = data.lostPetNotices.filter(
    (item) =>
      matchesKind(item.kind, lostKindFilter) &&
      matchesQuery(item.area, lostLocationQuery) &&
      matchesQuery(item.name, lostNameQuery),
  );
  const adoptionResults = data.adoptionPets.filter(
    (item) =>
      matchesKind(item.kind, adoptionKindFilter) &&
      matchesQuery(item.area, adoptionLocationQuery),
  );
  const nearbyUrgentHelpCount = data.helpLocations.filter(
    (item) =>
      item.urgency === "high" &&
      Boolean(helpCurrentLocationQuery) &&
      matchesQuery(item.area, helpCurrentLocationQuery),
  ).length;

  const requestCreate = (type: CreateType) => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    setCreateType(type);
  };

  const applyLostCurrentLocation = async () => {
    if (isLocatingLost) return;

    setLocatingLost(true);
    try {
      const location = await getDeviceLocationQuery();

      if (location.status === "denied") {
        Alert.alert(t.lost.locationDeniedTitle, t.lost.locationDenied);
        return;
      }

      if (!location.query) {
        Alert.alert(t.lost.locationErrorTitle, t.lost.locationError);
        return;
      }

      updateFilters(() => {
        setLostLocationQuery(location.query);
      });
      Alert.alert(t.common.location, t.lost.locationApplied);
    } catch {
      Alert.alert(t.lost.locationErrorTitle, t.lost.locationError);
    } finally {
      setLocatingLost(false);
    }
  };

  const applyHelpCurrentLocation = async () => {
    if (isLocatingHelp) return;

    setLocatingHelp(true);
    try {
      const location = await getDeviceLocationQuery();

      if (location.status === "denied") {
        Alert.alert(t.lost.locationDeniedTitle, t.lost.locationDenied);
        return;
      }

      if (!location.query) {
        Alert.alert(t.lost.locationErrorTitle, t.lost.locationError);
        return;
      }

      updateFilters(() => {
        setHelpCurrentLocationQuery(location.query);
        setHelpCurrentLocationLabel(location.label);
        setHelpUrgencyFilter("high");
        setHelpLocationQuery(location.query);
      });
    } catch {
      Alert.alert(t.lost.locationErrorTitle, t.lost.locationError);
    } finally {
      setLocatingHelp(false);
    }
  };

  const updateFilters = (change: () => void) => {
    if (reduceMotion) {
      change();
      return;
    }

    const transitionId = filterTransitionId.current + 1;
    filterTransitionId.current = transitionId;
    resultsOpacity.stopAnimation();
    resultsTranslateY.stopAnimation();

    Animated.parallel([
      Animated.timing(resultsOpacity, {
        toValue: 0.68,
        duration: 70,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(resultsTranslateY, {
        toValue: 5,
        duration: 70,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (filterTransitionId.current !== transitionId) return;

      change();
      resultsTranslateY.setValue(-4);
      Animated.parallel([
        Animated.timing(resultsOpacity, {
          toValue: 1,
          duration: 135,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(resultsTranslateY, {
          toValue: 0,
          duration: 135,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const updatePetKindFilter = (
    current: PetKindFilter,
    next: PetKindFilter,
    change: () => void,
  ) => {
    if (current === next) return;
    updateFilters(change);
  };

  const updateUrgencyFilter = (
    current: UrgencyFilter,
    next: UrgencyFilter,
    change: () => void,
  ) => {
    if (current === next) return;
    updateFilters(change);
  };

  const switchTab = (tab: TabKey) => {
    if (tab === activeTab) return;

    if (reduceMotion) {
      setActiveTab(tab);
      return;
    }

    const transitionId = tabTransitionId.current + 1;
    tabTransitionId.current = transitionId;
    screenOpacity.stopAnimation();
    screenTranslateY.stopAnimation();

    Animated.parallel([
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(screenTranslateY, {
        toValue: 8,
        duration: 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (!finished || tabTransitionId.current !== transitionId) return;

      setActiveTab(tab);
      screenTranslateY.setValue(-6);
      Animated.parallel([
        Animated.timing(screenOpacity, {
          toValue: 1,
          duration: 190,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(screenTranslateY, {
          toValue: 0,
          duration: 190,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const switchTheme = () => {
    const nextThemeMode = themeMode === "dark" ? "light" : "dark";
    if (reduceMotion) {
      setThemeMode(nextThemeMode);
      return;
    }

    themeOpacity.stopAnimation();

    Animated.timing(themeOpacity, {
      toValue: 0.72,
      duration: 110,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setThemeMode(nextThemeMode);
      Animated.timing(themeOpacity, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
  };

  const switchLanguage = () => {
    const nextLanguage = language === "tr" ? "en" : "tr";
    if (reduceMotion) {
      setLanguage(nextLanguage);
      return;
    }

    languageOpacity.stopAnimation();

    Animated.timing(languageOpacity, {
      toValue: 0.72,
      duration: 80,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setLanguage(nextLanguage);
      Animated.timing(languageOpacity, {
        toValue: 1,
        duration: 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
  };

  const renderScreen = () => {
    if (activeTab === "home") {
      return (
        <HomeScreen
          data={data}
          styles={styles}
          theme={theme}
          t={t}
          onOpenTab={switchTab}
          onCreate={requestCreate}
        />
      );
    }

    if (activeTab === "lost") {
      return (
        <FeedScreen
          title={t.lost.title}
          description={t.lost.description}
          actionLabel={t.lost.createTitle}
          onCreate={() => requestCreate("lost")}
          styles={styles}
          t={t}
          resultsOpacity={resultsOpacity}
          resultsTranslateY={resultsTranslateY}
          filtersOpen={lostFiltersOpen}
          onToggleFilters={() => setLostFiltersOpen((open) => !open)}
          hasActiveFilters={
            lostKindFilter !== "all" ||
            Boolean(lostLocationQuery) ||
            Boolean(lostNameQuery)
          }
          insight={
            <FeedInsight
              icon="search-outline"
              label={t.lost.insightLabel}
              value={`${lostResults.length} ${t.lost.insightUnit}`}
              compact
              styles={styles}
              theme={theme}
            />
          }
          filters={
            <LostFilters
              kind={lostKindFilter}
              location={lostLocationQuery}
              name={lostNameQuery}
              onChangeKind={(value) =>
                updatePetKindFilter(lostKindFilter, value, () =>
                  setLostKindFilter(value),
                )
              }
              onChangeLocation={setLostLocationQuery}
              onChangeName={setLostNameQuery}
              onUseCurrentLocation={applyLostCurrentLocation}
              isLocating={isLocatingLost}
              onClose={() => setLostFiltersOpen(false)}
              hasActiveFilters={
                lostKindFilter !== "all" ||
                Boolean(lostLocationQuery) ||
                Boolean(lostNameQuery)
              }
              onClear={() => {
                if (
                  lostKindFilter === "all" &&
                  !lostLocationQuery &&
                  !lostNameQuery
                )
                  return;
                updateFilters(() => {
                  setLostKindFilter("all");
                  setLostLocationQuery("");
                  setLostNameQuery("");
                });
              }}
              styles={styles}
              theme={theme}
              t={t}
            />
          }
        >
          {lostResults.length > 0 ? (
            lostResults.map((item) => (
              <LostCard
                key={item.id}
                item={item}
                styles={styles}
                theme={theme}
                t={t}
              />
            ))
          ) : (
            <EmptyResults styles={styles} t={t} />
          )}
        </FeedScreen>
      );
    }

    if (activeTab === "help") {
      return (
        <FeedScreen
          title={t.help.title}
          description={t.help.description}
          actionLabel={t.help.createTitle}
          onCreate={() => requestCreate("help")}
          styles={styles}
          t={t}
          resultsOpacity={resultsOpacity}
          resultsTranslateY={resultsTranslateY}
          filtersOpen={helpFiltersOpen}
          onToggleFilters={() => setHelpFiltersOpen((open) => !open)}
          hasActiveFilters={
            Boolean(helpLocationQuery) || helpUrgencyFilter !== "all"
          }
          insight={
            <FeedInsight
              icon="warning-outline"
              label={t.help.insightLabel}
              value={
                helpCurrentLocationQuery
                  ? `${nearbyUrgentHelpCount} ${t.help.insightUnit}`
                  : isLocatingHelp
                    ? t.help.locationPending
                    : t.help.locationAction
              }
              detail={
                helpCurrentLocationQuery
                  ? t.help.insightDetail.replace(
                      "{location}",
                      helpCurrentLocationLabel,
                    )
                  : t.help.insightPrompt
              }
              onPress={applyHelpCurrentLocation}
              urgent
              loading={isLocatingHelp}
              styles={styles}
              theme={theme}
            />
          }
          filters={
            <HelpFilters
              value={helpLocationQuery}
              urgency={helpUrgencyFilter}
              onChangeText={setHelpLocationQuery}
              onChangeUrgency={(value) =>
                updateUrgencyFilter(helpUrgencyFilter, value, () =>
                  setHelpUrgencyFilter(value),
                )
              }
              onClose={() => setHelpFiltersOpen(false)}
              hasActiveFilters={
                Boolean(helpLocationQuery) || helpUrgencyFilter !== "all"
              }
              onClear={() => {
                if (!helpLocationQuery && helpUrgencyFilter === "all") return;
                updateFilters(() => {
                  setHelpLocationQuery("");
                  setHelpUrgencyFilter("all");
                });
              }}
              styles={styles}
              theme={theme}
              t={t}
            />
          }
        >
          {helpResults.length > 0 ? (
            helpResults.map((item) => (
              <HelpCard
                key={item.id}
                item={item}
                styles={styles}
                theme={theme}
                t={t}
              />
            ))
          ) : (
            <EmptyResults styles={styles} t={t} />
          )}
        </FeedScreen>
      );
    }

    if (activeTab === "adoption") {
      return (
        <FeedScreen
          title={t.adoption.title}
          description={t.adoption.description}
          actionLabel={t.adoption.createTitle}
          onCreate={() => requestCreate("adoption")}
          styles={styles}
          t={t}
          resultsOpacity={resultsOpacity}
          resultsTranslateY={resultsTranslateY}
          filtersOpen={adoptionFiltersOpen}
          onToggleFilters={() => setAdoptionFiltersOpen((open) => !open)}
          hasActiveFilters={
            adoptionKindFilter !== "all" || Boolean(adoptionLocationQuery)
          }
          insight={
            <FeedInsight
              icon="heart-outline"
              label={t.adoption.insightLabel}
              value={`${adoptionResults.length} ${t.adoption.insightUnit}`}
              compact
              styles={styles}
              theme={theme}
            />
          }
          filters={
            <AdoptionFilters
              kind={adoptionKindFilter}
              location={adoptionLocationQuery}
              onChangeKind={(value) =>
                updatePetKindFilter(adoptionKindFilter, value, () =>
                  setAdoptionKindFilter(value),
                )
              }
              onChangeLocation={setAdoptionLocationQuery}
              onClose={() => setAdoptionFiltersOpen(false)}
              hasActiveFilters={
                adoptionKindFilter !== "all" || Boolean(adoptionLocationQuery)
              }
              onClear={() => {
                if (adoptionKindFilter === "all" && !adoptionLocationQuery)
                  return;
                updateFilters(() => {
                  setAdoptionKindFilter("all");
                  setAdoptionLocationQuery("");
                });
              }}
              styles={styles}
              theme={theme}
              t={t}
            />
          }
        >
          {adoptionResults.length > 0 ? (
            adoptionResults.map((item) => (
              <AdoptionCard
                key={item.id}
                item={item}
                styles={styles}
                theme={theme}
                t={t}
              />
            ))
          ) : (
            <EmptyResults styles={styles} t={t} />
          )}
        </FeedScreen>
      );
    }

    return (
      <SettingsScreen
        styles={styles}
        theme={theme}
        t={t}
        language={language}
        themeMode={themeMode}
        isAuthenticated={isAuthenticated}
        onToggleLanguage={switchLanguage}
        onToggleTheme={switchTheme}
        onOpenAuth={() => setShowAuth(true)}
        onOpenProfile={() => setShowProfile(true)}
        onSignOut={() => setAuthenticated(false)}
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

      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          const iconName = getTabIcon(tab, isActive);
          return (
            <Pressable
              key={tab}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => switchTab(tab)}
              accessibilityRole="button"
              accessibilityLabel={t.tabs[tab]}
              accessibilityState={{ selected: isActive }}
            >
              <Ionicons
                name={iconName}
                color={isActive ? theme.text : theme.muted}
                size={20}
              />
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {t.tabs[tab]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <AuthModal
        visible={showAuth}
        onClose={() => setShowAuth(false)}
        onSignIn={() => {
          setAuthenticated(true);
          setShowAuth(false);
        }}
        styles={styles}
        t={t}
        theme={theme}
      />

      <CreateModal
        visible={Boolean(createType)}
        type={createType}
        onClose={() => setCreateType(null)}
        styles={styles}
        t={t}
        theme={theme}
      />

      <ProfileModal
        visible={showProfile}
        onClose={() => setShowProfile(false)}
        onSignOut={() => {
          setAuthenticated(false);
          setShowProfile(false);
        }}
        styles={styles}
        t={t}
        theme={theme}
      />
    </Animated.View>
  );
}

function HomeScreen({
  data,
  styles,
  theme,
  t,
  onOpenTab,
  onCreate,
}: {
  data: ReturnType<typeof getCardData>;
  styles: ReturnType<typeof createStyles>;
  theme: ThemePalette;
  t: Translation;
  onOpenTab: (tab: TabKey) => void;
  onCreate: (type: CreateType) => void;
}) {
  const urgentHelp =
    data.helpLocations.find((item) => item.urgency === "high") ??
    data.helpLocations[0];
  const latestLost = data.lostPetNotices[0];
  const readyAdoption = data.adoptionPets[0];

  return (
    <View>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>{t.home.eyebrow}</Text>
        <Text style={styles.heroTitle}>{t.home.title}</Text>
        <Text style={styles.bodyText}>{t.home.description}</Text>
        <View style={styles.actionRow}>
          <MobileButton
            label={t.home.searchLost}
            icon="search"
            onPress={() => onOpenTab("lost")}
            styles={styles}
          />
          <MobileButton
            label={t.home.shareHelp}
            icon="map"
            onPress={() => onCreate("help")}
            styles={styles}
            secondary
          />
          <MobileButton
            label={t.home.reportLost}
            icon="alert-circle-outline"
            onPress={() => onCreate("lost")}
            styles={styles}
            secondary
          />
        </View>
      </View>

      <View style={styles.activityPanel}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityTitle}>{t.home.activityTitle}</Text>
          <Text style={styles.activityDescription}>
            {t.home.activityDescription}
          </Text>
        </View>
        <ActivityRow
          label={t.home.urgentHelp}
          title={urgentHelp.title}
          detail={urgentHelp.area}
          icon="warning-outline"
          urgent
          styles={styles}
          theme={theme}
          onPress={() => onOpenTab("help")}
        />
        <ActivityRow
          label={t.home.latestLost}
          title={latestLost.name}
          detail={latestLost.area}
          icon="search-outline"
          styles={styles}
          theme={theme}
          onPress={() => onOpenTab("lost")}
        />
        <ActivityRow
          label={t.home.readyAdoption}
          title={readyAdoption.name}
          detail={readyAdoption.area}
          icon="heart-outline"
          styles={styles}
          theme={theme}
          onPress={() => onOpenTab("adoption")}
        />
      </View>
    </View>
  );
}
function FeedScreen({
  title,
  description,
  actionLabel,
  onCreate,
  children,
  styles,
  t,
  filters,
  insight,
  filtersOpen,
  onToggleFilters,
  hasActiveFilters,
  resultsOpacity,
  resultsTranslateY,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onCreate: () => void;
  children: ReactNode;
  styles: ReturnType<typeof createStyles>;
  t: Translation;
  filters?: ReactNode;
  insight?: ReactNode;
  filtersOpen: boolean;
  onToggleFilters: () => void;
  hasActiveFilters: boolean;
  resultsOpacity: Animated.Value;
  resultsTranslateY: Animated.Value;
}) {
  return (
    <View>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionText}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.bodyText}>{description}</Text>
        </View>
        <MobileButton
          label={actionLabel}
          icon="add"
          onPress={onCreate}
          styles={styles}
          compact
        />
      </View>
      {insight}
      {!filtersOpen && (
        <Pressable
          style={[
            styles.filterToggle,
            hasActiveFilters && styles.filterToggleActive,
          ]}
          onPress={onToggleFilters}
          accessibilityRole="button"
          accessibilityState={{ expanded: false }}
          accessibilityLabel={t.actions.filters}
        >
          <View style={styles.filterToggleIcon}>
            <Ionicons
              name="options-outline"
              size={17}
              color={styles.filterToggleLabel.color}
            />
          </View>
          <View style={styles.filterToggleText}>
            <Text style={styles.filterToggleLabel}>{t.actions.filters}</Text>
            {hasActiveFilters && (
              <Text style={styles.filterToggleBadge}>{t.filters.active}</Text>
            )}
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={styles.filterToggleLabel.color}
          />
        </Pressable>
      )}
      {filtersOpen && filters}
      <Animated.View
        style={[
          styles.cardStack,
          {
            opacity: resultsOpacity,
            transform: [{ translateY: resultsTranslateY }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
}

function FeedInsight({
  icon,
  label,
  value,
  detail,
  onPress,
  urgent,
  compact,
  loading,
  styles,
  theme,
}: {
  icon: IconName;
  label: string;
  value: string;
  detail?: string;
  onPress?: () => void;
  urgent?: boolean;
  compact?: boolean;
  loading?: boolean;
  styles: ReturnType<typeof createStyles>;
  theme: ThemePalette;
}) {
  const content = (
    <>
      <View
        style={[styles.feedInsightIcon, urgent && styles.feedInsightIconUrgent]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={urgent ? theme.danger : theme.secondaryStrong}
        />
      </View>
      <View style={styles.feedInsightText}>
        <Text
          style={[
            styles.feedInsightLabel,
            urgent && styles.feedInsightLabelUrgent,
          ]}
        >
          {label}
        </Text>
        <Text style={styles.feedInsightValue}>{loading ? value : value}</Text>
        {detail && <Text style={styles.feedInsightDetail}>{detail}</Text>}
      </View>
      {onPress && (
        <Ionicons
          name={loading ? "hourglass-outline" : "navigate-outline"}
          size={18}
          color={urgent ? theme.danger : theme.muted}
        />
      )}
    </>
  );

  const insightStyle = [
    styles.feedInsight,
    compact && styles.feedInsightCompact,
    urgent && styles.feedInsightUrgent,
  ];

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [insightStyle, pressed && styles.buttonPressed]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value}${detail ? `, ${detail}` : ""}`}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={insightStyle}>
      {content}
    </View>
  );
}

function LostFilters({
  kind,
  location,
  name,
  onChangeKind,
  onChangeLocation,
  onChangeName,
  onUseCurrentLocation,
  isLocating,
  onClose,
  hasActiveFilters,
  onClear,
  styles,
  theme,
  t,
}: {
  kind: PetKindFilter;
  location: string;
  name: string;
  onChangeKind: (kind: PetKindFilter) => void;
  onChangeLocation: (value: string) => void;
  onChangeName: (value: string) => void;
  onUseCurrentLocation: () => void;
  isLocating: boolean;
  onClose: () => void;
  hasActiveFilters: boolean;
  onClear: () => void;
  styles: ReturnType<typeof createStyles>;
  theme: ThemePalette;
  t: Translation;
}) {
  return (
    <FilterPanel onClose={onClose} styles={styles} theme={theme} t={t}>
      <KindFilter
        value={kind}
        onChange={onChangeKind}
        styles={styles}
        theme={theme}
        t={t}
      />
      <LocationFilterInput
        value={location}
        onChangeText={onChangeLocation}
        styles={styles}
        theme={theme}
        t={t}
      />
      <Pressable
        style={styles.currentLocationButton}
        onPress={onUseCurrentLocation}
        disabled={isLocating}
        accessibilityRole="button"
        accessibilityState={{ disabled: isLocating }}
        accessibilityLabel={t.actions.useCurrentLocation}
      >
        <Ionicons name="navigate-outline" size={16} color={theme.secondaryStrong} />
        <Text style={styles.currentLocationText}>
          {isLocating ? t.lost.locationPending : t.actions.useCurrentLocation}
        </Text>
      </Pressable>
      <FilterInput
        label={t.filters.animalName}
        value={name}
        onChangeText={onChangeName}
        placeholder={t.filters.animalNamePlaceholder}
        icon="paw-outline"
        styles={styles}
        theme={theme}
      />
      {hasActiveFilters && (
        <ClearFiltersButton
          onPress={onClear}
          styles={styles}
          theme={theme}
          t={t}
        />
      )}
    </FilterPanel>
  );
}

function AdoptionFilters({
  kind,
  location,
  onChangeKind,
  onChangeLocation,
  onClose,
  hasActiveFilters,
  onClear,
  styles,
  theme,
  t,
}: {
  kind: PetKindFilter;
  location: string;
  onChangeKind: (kind: PetKindFilter) => void;
  onChangeLocation: (value: string) => void;
  onClose: () => void;
  hasActiveFilters: boolean;
  onClear: () => void;
  styles: ReturnType<typeof createStyles>;
  theme: ThemePalette;
  t: Translation;
}) {
  return (
    <FilterPanel onClose={onClose} styles={styles} theme={theme} t={t}>
      <KindFilter
        value={kind}
        onChange={onChangeKind}
        styles={styles}
        theme={theme}
        t={t}
      />
      <LocationFilterInput
        value={location}
        onChangeText={onChangeLocation}
        styles={styles}
        theme={theme}
        t={t}
      />
      {hasActiveFilters && (
        <ClearFiltersButton
          onPress={onClear}
          styles={styles}
          theme={theme}
          t={t}
        />
      )}
    </FilterPanel>
  );
}

function HelpFilters({
  value,
  urgency,
  onChangeText,
  onChangeUrgency,
  onClose,
  hasActiveFilters,
  onClear,
  styles,
  theme,
  t,
}: {
  value: string;
  urgency: UrgencyFilter;
  onChangeText: (value: string) => void;
  onChangeUrgency: (value: UrgencyFilter) => void;
  onClose: () => void;
  hasActiveFilters: boolean;
  onClear: () => void;
  styles: ReturnType<typeof createStyles>;
  theme: ThemePalette;
  t: Translation;
}) {
  return (
    <FilterPanel onClose={onClose} styles={styles} theme={theme} t={t}>
      <LocationFilterInput
        value={value}
        onChangeText={onChangeText}
        styles={styles}
        theme={theme}
        t={t}
      />
      <UrgencyFilterControl
        value={urgency}
        onChange={onChangeUrgency}
        styles={styles}
        theme={theme}
        t={t}
      />
      {hasActiveFilters && (
        <ClearFiltersButton
          onPress={onClear}
          styles={styles}
          theme={theme}
          t={t}
        />
      )}
    </FilterPanel>
  );
}

function ClearFiltersButton({
  onPress,
  styles,
  theme,
  t,
}: {
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  theme: ThemePalette;
  t: Translation;
}) {
  return (
    <Pressable
      style={styles.clearFiltersButton}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t.filters.clear}
    >
      <Ionicons name="close-circle-outline" size={15} color={theme.muted} />
      <Text style={styles.clearFiltersText}>{t.filters.clear}</Text>
    </Pressable>
  );
}

function FilterPanel({
  onClose,
  children,
  styles,
  theme,
  t,
}: {
  onClose: () => void;
  children: ReactNode;
  styles: ReturnType<typeof createStyles>;
  theme: ThemePalette;
  t: Translation;
}) {
  return (
    <View style={styles.filterPanel}>
      <View style={styles.filterPanelHeader}>
        <View />
        <Pressable
          style={styles.filterPanelClose}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t.actions.close}
        >
          <Ionicons name="chevron-up" size={19} color={theme.muted} />
        </Pressable>
      </View>
      {children}
    </View>
  );
}

function KindFilter({
  value,
  onChange,
  styles,
  theme,
  t,
}: {
  value: PetKindFilter;
  onChange: (value: PetKindFilter) => void;
  styles: ReturnType<typeof createStyles>;
  theme: ThemePalette;
  t: Translation;
}) {
  const options: { value: PetKindFilter; label: string; icon: IconName }[] = [
    { value: "all", label: t.common.all, icon: "paw-outline" },
    { value: "cat", label: t.common.cat, icon: "ellipse-outline" },
    { value: "dog", label: t.common.dog, icon: "radio-button-off-outline" },
  ];

  return (
    <View style={styles.filterGroup}>
      <Text style={styles.filterLabel}>{t.filters.animalType}</Text>
      <View style={styles.segmentedControl}>
        {options.map((option) => {
          const isActive = option.value === value;
          return (
            <Pressable
              key={option.value}
              style={[
                styles.segmentButton,
                isActive && styles.segmentButtonActive,
              ]}
              onPress={() => onChange(option.value)}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityState={{ selected: isActive }}
            >
              <Ionicons
                name={option.icon}
                size={15}
                color={isActive ? theme.text : theme.muted}
              />
              <Text
                style={[
                  styles.segmentText,
                  isActive && styles.segmentTextActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function UrgencyFilterControl({
  value,
  onChange,
  styles,
  theme,
  t,
}: {
  value: UrgencyFilter;
  onChange: (value: UrgencyFilter) => void;
  styles: ReturnType<typeof createStyles>;
  theme: ThemePalette;
  t: Translation;
}) {
  const options: { value: UrgencyFilter; label: string; icon: IconName }[] = [
    { value: "all", label: t.common.all, icon: "options-outline" },
    {
      value: "low",
      label: t.common.urgency.low,
      icon: "remove-circle-outline",
    },
    {
      value: "medium",
      label: t.common.urgency.medium,
      icon: "alert-circle-outline",
    },
    { value: "high", label: t.common.urgency.high, icon: "warning-outline" },
  ];

  return (
    <View style={styles.filterGroup}>
      <Text style={styles.filterLabel}>{t.filters.emergencyLevel}</Text>
      <View style={styles.segmentedControl}>
        {options.map((option) => {
          const isActive = option.value === value;
          return (
            <Pressable
              key={option.value}
              style={[
                styles.segmentButton,
                isActive && styles.segmentButtonActive,
              ]}
              onPress={() => onChange(option.value)}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityState={{ selected: isActive }}
            >
              <Ionicons
                name={option.icon}
                size={15}
                color={isActive ? theme.text : theme.muted}
              />
              <Text
                style={[
                  styles.segmentText,
                  isActive && styles.segmentTextActive,
                ]}
                numberOfLines={1}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function LocationFilterInput({
  value,
  onChangeText,
  styles,
  theme,
  t,
}: {
  value: string;
  onChangeText: (value: string) => void;
  styles: ReturnType<typeof createStyles>;
  theme: ThemePalette;
  t: Translation;
}) {
  const parsedLocation = parseLocationValue(value);
  const citySuggestions = getCitySuggestions(parsedLocation.city);
  const districtSuggestions = parsedLocation.selectedCity
    ? getDistrictSuggestions(
        parsedLocation.selectedCity.city,
        parsedLocation.district,
      )
    : [];

  const updateCity = (city: string) => {
    onChangeText(city);
  };

  const updateDistrict = (district: string) => {
    if (!parsedLocation.selectedCity) return;
    onChangeText(
      [parsedLocation.selectedCity.city, district].filter(Boolean).join(" "),
    );
  };

  return (
    <View style={styles.filterGroup}>
      <FilterInput
        label={t.filters.city}
        value={parsedLocation.city}
        onChangeText={updateCity}
        placeholder={t.filters.cityPlaceholder}
        icon="business-outline"
        styles={styles}
        theme={theme}
      />
      {citySuggestions.length > 0 && (
        <SuggestionList
          suggestions={citySuggestions}
          icon="business-outline"
          onSelect={updateCity}
          styles={styles}
          theme={theme}
        />
      )}
      {parsedLocation.selectedCity && (
        <>
          <FilterInput
            label={t.filters.district}
            value={parsedLocation.district}
            onChangeText={updateDistrict}
            placeholder={t.filters.districtPlaceholder}
            icon="location-outline"
            styles={styles}
            theme={theme}
          />
          {districtSuggestions.length > 0 && (
            <SuggestionList
              suggestions={districtSuggestions}
              icon="location-outline"
              onSelect={updateDistrict}
              styles={styles}
              theme={theme}
            />
          )}
        </>
      )}
    </View>
  );
}

function SuggestionList({
  suggestions,
  icon,
  onSelect,
  styles,
  theme,
}: {
  suggestions: string[];
  icon: IconName;
  onSelect: (value: string) => void;
  styles: ReturnType<typeof createStyles>;
  theme: ThemePalette;
}) {
  return (
    <ScrollView
      style={styles.suggestionList}
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {suggestions.map((suggestion) => (
        <Pressable
          key={suggestion}
          style={styles.suggestionItem}
          onPress={() => onSelect(suggestion)}
          accessibilityRole="button"
          accessibilityLabel={suggestion}
        >
          <Ionicons name={icon} size={15} color={theme.secondaryStrong} />
          <Text style={styles.suggestionText}>{suggestion}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function FilterInput({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  styles,
  theme,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  icon: IconName;
  styles: ReturnType<typeof createStyles>;
  theme: ThemePalette;
}) {
  return (
    <View style={styles.filterGroup}>
      <Text style={styles.filterLabel}>{label}</Text>
      <View style={styles.filterInputWrap}>
        <Ionicons name={icon} size={17} color={theme.secondaryStrong} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.muted}
          style={styles.filterInput}
          accessibilityLabel={label}
        />
      </View>
    </View>
  );
}

function EmptyResults({
  styles,
  t,
}: {
  styles: ReturnType<typeof createStyles>;
  t: Translation;
}) {
  return (
    <View style={styles.emptyState}>
      <Ionicons
        name="search-outline"
        size={22}
        color={styles.emptyText.color}
      />
      <Text style={styles.emptyText}>{t.filters.noResults}</Text>
    </View>
  );
}

function SettingsScreen({
  styles,
  theme,
  t,
  language,
  themeMode,
  isAuthenticated,
  onToggleLanguage,
  onToggleTheme,
  onOpenAuth,
  onOpenProfile,
  onSignOut,
}: {
  styles: ReturnType<typeof createStyles>;
  theme: ThemePalette;
  t: Translation;
  language: Language;
  themeMode: ThemeMode;
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
          value={language.toUpperCase()}
          onPress={onToggleLanguage}
          styles={styles}
          theme={theme}
        />
        <SettingsRow
          icon={themeMode === "dark" ? "moon" : "sunny"}
          label={t.settings.theme}
          value={
            themeMode === "dark" ? t.settings.darkMode : t.settings.lightMode
          }
          onPress={onToggleTheme}
          styles={styles}
          theme={theme}
        />
      </View>
    </View>
  );
}

function SettingsRow({
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
  styles: ReturnType<typeof createStyles>;
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

function LostCard({
  item,
  styles,
  theme,
  t,
}: {
  item: LostPetNotice;
  styles: ReturnType<typeof createStyles>;
  theme: ThemePalette;
  t: Translation;
}) {
  return (
    <PetCardFrame
      imageUrl={item.imageUrl}
      imageLabel={t.accessibility.petPhoto.replace("{name}", item.name)}
      kind={item.kind}
      styles={styles}
      theme={theme}
    >
      <Text style={styles.cardMeta}>
        {t.lost.lastSeen}: {item.lastSeen}
      </Text>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardDescription}>{item.description}</Text>
      <MetaLine
        icon="location-outline"
        label={item.area}
        styles={styles}
        theme={theme}
      />
      <Text style={styles.contactText}>
        {t.common.contact}: {item.contact}
      </Text>
    </PetCardFrame>
  );
}

function HelpCard({
  item,
  styles,
  theme,
  t,
}: {
  item: HelpLocation;
  styles: ReturnType<typeof createStyles>;
  theme: ThemePalette;
  t: Translation;
}) {
  return (
    <PetCardFrame
      imageUrl={item.imageUrl}
      imageLabel={t.accessibility.locationPhoto.replace("{title}", item.title)}
      kind={item.kind}
      styles={styles}
      theme={theme}
    >
      <Text style={styles.cardMeta}>
        {item.urgency === "high" ? t.help.urgent : t.help.normal}
      </Text>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDescription}>{item.description}</Text>
      <MetaLine
        icon="location-outline"
        label={item.area}
        styles={styles}
        theme={theme}
      />
      <View
        style={[styles.badge, item.urgency === "high" && styles.badgeUrgent]}
      >
        <Text
          style={[
            styles.badgeText,
            item.urgency === "high" && styles.badgeUrgentText,
          ]}
        >
          {t.common.urgency[item.urgency]}
        </Text>
      </View>
    </PetCardFrame>
  );
}

function AdoptionCard({
  item,
  styles,
  theme,
  t,
}: {
  item: AdoptionPet;
  styles: ReturnType<typeof createStyles>;
  theme: ThemePalette;
  t: Translation;
}) {
  return (
    <PetCardFrame
      imageUrl={item.imageUrl}
      imageLabel={t.accessibility.petPhoto.replace("{name}", item.name)}
      kind={item.kind}
      styles={styles}
      theme={theme}
    >
      <Text style={styles.cardMeta}>{item.age}</Text>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardDescription}>{item.description}</Text>
      <MetaLine
        icon="location-outline"
        label={item.area}
        styles={styles}
        theme={theme}
      />
      <View style={styles.tagRow}>
        {item.personality.map((tag) => (
          <View key={tag} style={styles.badge}>
            <Text style={styles.badgeText}>{tag}</Text>
          </View>
        ))}
      </View>
    </PetCardFrame>
  );
}

function PetCardFrame({
  imageUrl,
  imageLabel,
  kind,
  children,
  styles,
  theme,
}: {
  imageUrl: string;
  imageLabel: string;
  kind: PetKind;
  children: ReactNode;
  styles: ReturnType<typeof createStyles>;
  theme: ThemePalette;
}) {
  return (
    <View style={styles.petCard}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.petImage}
        accessibilityLabel={imageLabel}
      />
      <View style={styles.petContent}>{children}</View>
      <View
        style={[
          styles.speciesIcon,
          { backgroundColor: kind === "cat" ? theme.cat : theme.dog },
        ]}
      >
        <MaterialCommunityIcons
          name={kind === "cat" ? "cat" : "dog"}
          color={theme.bgDeep}
          size={25}
        />
      </View>
    </View>
  );
}

function MobileButton({
  label,
  icon,
  onPress,
  styles,
  secondary,
  compact,
}: {
  label: string;
  icon: IconName;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  secondary?: boolean;
  compact?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        secondary && styles.buttonSecondary,
        compact && styles.buttonCompact,
        pressed && styles.buttonPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons
        name={icon}
        color={
          secondary ? styles.buttonSecondaryText.color : styles.buttonText.color
        }
        size={16}
      />
      <Text
        style={[styles.buttonText, secondary && styles.buttonSecondaryText]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ActivityRow({
  label,
  title,
  detail,
  icon,
  onPress,
  urgent,
  styles,
  theme,
}: {
  label: string;
  title: string;
  detail: string;
  icon: IconName;
  onPress: () => void;
  urgent?: boolean;
  styles: ReturnType<typeof createStyles>;
  theme: ThemePalette;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.activityRow,
        urgent && styles.activityRowUrgent,
        pressed && styles.buttonPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${title}, ${detail}`}
    >
      <View style={[styles.activityIcon, urgent && styles.activityIconUrgent]}>
        <Ionicons
          name={icon}
          color={urgent ? theme.danger : theme.secondaryStrong}
          size={20}
        />
      </View>
      <View style={styles.activityText}>
        <Text
          style={[styles.activityLabel, urgent && styles.activityLabelUrgent]}
        >
          {label}
        </Text>
        <Text style={styles.activityItemTitle}>{title}</Text>
        <Text style={styles.activityDetail}>{detail}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.muted} />
    </Pressable>
  );
}

function MetaLine({
  icon,
  label,
  styles,
  theme,
}: {
  icon: IconName;
  label: string;
  styles: ReturnType<typeof createStyles>;
  theme: ThemePalette;
}) {
  return (
    <View style={styles.metaLine}>
      <Ionicons name={icon} size={16} color={theme.secondaryStrong} />
      <Text style={styles.metaText}>{label}</Text>
    </View>
  );
}

function AuthModal({
  visible,
  onClose,
  onSignIn,
  styles,
  t,
  theme,
}: {
  visible: boolean;
  onClose: () => void;
  onSignIn: () => void;
  styles: ReturnType<typeof createStyles>;
  t: Translation;
  theme: ThemePalette;
}) {
  return (
    <SmoothModal
      visible={visible}
      onClose={onClose}
      closeLabel={t.actions.close}
      styles={styles}
    >
      <View style={styles.modalIcon}>
        <Ionicons
          name="shield-checkmark"
          size={28}
          color={theme.secondaryStrong}
        />
      </View>
      <Text style={styles.modalTitle}>{t.auth.title}</Text>
      <Text style={styles.bodyText}>{t.auth.description}</Text>
      <MetaLine
        icon="checkmark-circle-outline"
        label={t.auth.benefitOne}
        styles={styles}
        theme={theme}
      />
      <MetaLine
        icon="checkmark-circle-outline"
        label={t.auth.benefitTwo}
        styles={styles}
        theme={theme}
      />
      <View style={styles.modalActions}>
        <MobileButton
          label={t.actions.close}
          icon="close"
          onPress={onClose}
          styles={styles}
          secondary
        />
        <MobileButton
          label={t.actions.demoSignIn}
          icon="log-in-outline"
          onPress={onSignIn}
          styles={styles}
        />
      </View>
    </SmoothModal>
  );
}

function CreateModal({
  visible,
  type,
  onClose,
  styles,
  t,
  theme,
}: {
  visible: boolean;
  type: CreateType | null;
  onClose: () => void;
  styles: ReturnType<typeof createStyles>;
  t: Translation;
  theme: ThemePalette;
}) {
  const [displayType, setDisplayType] = useState<CreateType>("lost");
  const [form, setForm] = useState<Record<CreateFormField, string>>({
    title: "",
    area: "",
    description: "",
    contact: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<CreateFormField, string>>
  >({});
  const [formStatus, setFormStatus] = useState<"idle" | "success">("idle");

  useEffect(() => {
    if (type) setDisplayType(type);
  }, [type]);

  useEffect(() => {
    if (!visible) {
      setErrors({});
      setFormStatus("idle");
    }
  }, [visible]);

  const currentType = type ?? displayType;
  const title =
    currentType === "lost"
      ? t.lost.createTitle
      : currentType === "help"
        ? t.help.createTitle
        : t.adoption.createTitle;

  const updateField = (field: CreateFormField, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFormStatus("idle");
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const submit = () => {
    const nextErrors: Partial<Record<CreateFormField, string>> = {};
    (["title", "area", "description", "contact"] as CreateFormField[]).forEach(
      (field) => {
        if (!form[field].trim()) nextErrors[field] = t.create.required;
      },
    );

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setFormStatus("idle");
      return;
    }

    setFormStatus("success");
  };

  return (
    <SmoothModal
      visible={visible}
      onClose={onClose}
      closeLabel={t.actions.close}
      styles={styles}
    >
      <Text style={styles.modalTitle}>{title}</Text>
      <Text style={styles.bodyText}>{t.create.description}</Text>
      <CreateField
        label={t.create.titleLabel}
        value={form.title}
        onChangeText={(value) => updateField("title", value)}
        placeholder={t.create.placeholderTitle}
        error={errors.title}
        styles={styles}
        theme={theme}
      />
      <CreateField
        label={t.create.areaLabel}
        value={form.area}
        onChangeText={(value) => updateField("area", value)}
        placeholder={t.create.placeholderArea}
        error={errors.area}
        styles={styles}
        theme={theme}
      />
      <CreateField
        label={t.create.descriptionLabel}
        value={form.description}
        onChangeText={(value) => updateField("description", value)}
        placeholder={t.create.placeholderDescription}
        error={errors.description}
        multiline
        styles={styles}
        theme={theme}
      />
      <CreateField
        label={t.create.contactLabel}
        value={form.contact}
        onChangeText={(value) => updateField("contact", value)}
        placeholder={t.create.placeholderContact}
        error={errors.contact}
        styles={styles}
        theme={theme}
      />
      {Object.keys(errors).length > 0 && (
        <Text style={styles.formErrorSummary} accessibilityRole="alert">
          {t.create.requiredSummary}
        </Text>
      )}
      {formStatus === "success" && (
        <Text style={styles.formSuccess} accessibilityRole="alert">
          {t.create.success}
        </Text>
      )}
      <View style={styles.modalActions}>
        <MobileButton
          label={t.actions.close}
          icon="close"
          onPress={onClose}
          styles={styles}
          secondary
        />
        <MobileButton
          label={t.create.submit}
          icon="send"
          onPress={submit}
          styles={styles}
        />
      </View>
    </SmoothModal>
  );
}

function CreateField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  multiline,
  styles,
  theme,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  error?: string;
  multiline?: boolean;
  styles: ReturnType<typeof createStyles>;
  theme: ThemePalette;
}) {
  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.muted}
        style={[
          styles.input,
          multiline && styles.textArea,
          Boolean(error) && styles.inputError,
        ]}
        multiline={multiline}
        accessibilityLabel={label}
        accessibilityHint={error}
      />
      {error && (
        <Text style={styles.fieldError} accessibilityRole="alert">
          {error}
        </Text>
      )}
    </View>
  );
}

function ProfileModal({
  visible,
  onClose,
  onSignOut,
  styles,
  t,
  theme,
}: {
  visible: boolean;
  onClose: () => void;
  onSignOut: () => void;
  styles: ReturnType<typeof createStyles>;
  t: Translation;
  theme: ThemePalette;
}) {
  return (
    <SmoothModal
      visible={visible}
      onClose={onClose}
      closeLabel={t.actions.close}
      styles={styles}
    >
      <View style={styles.profileHeader}>
        <View style={styles.profileAvatar}>
          <Ionicons name="person" size={28} color={theme.bgDeep} />
        </View>
        <View style={styles.profileIdentity}>
          <Text style={styles.modalTitle}>{t.profile.title}</Text>
          <Text style={styles.profileName}>{t.profile.name}</Text>
          <Text style={styles.profileEmail}>{t.profile.email}</Text>
        </View>
      </View>
      <Text style={styles.bodyText}>{t.profile.description}</Text>
      <View style={styles.profileOptions}>
        <ProfileRow
          icon="person-outline"
          label={t.profile.settings}
          onPress={() => Alert.alert(t.profile.settings, t.profile.description)}
          styles={styles}
          theme={theme}
        />
        <ProfileRow
          icon="notifications-outline"
          label={t.profile.preferences}
          onPress={() =>
            Alert.alert(t.profile.preferences, t.profile.description)
          }
          styles={styles}
          theme={theme}
        />
      </View>
      <View style={styles.modalActions}>
        <MobileButton
          label={t.actions.close}
          icon="close"
          onPress={onClose}
          styles={styles}
          secondary
        />
        <MobileButton
          label={t.actions.signOut}
          icon="log-out-outline"
          onPress={onSignOut}
          styles={styles}
        />
      </View>
    </SmoothModal>
  );
}

function ProfileRow({
  icon,
  label,
  onPress,
  styles,
  theme,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  theme: ThemePalette;
}) {
  return (
    <Pressable
      style={styles.profileRow}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={18} color={theme.secondaryStrong} />
      <Text style={styles.profileRowText}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={theme.muted} />
    </Pressable>
  );
}

function SmoothModal({
  visible,
  onClose,
  closeLabel,
  styles,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  closeLabel: string;
  styles: ReturnType<typeof createStyles>;
  children: ReactNode;
}) {
  const [isMounted, setMounted] = useState(visible);
  const progress = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const reduceMotion = useReduceMotionPreference();

  useEffect(() => {
    progress.stopAnimation();

    if (visible) {
      setMounted(true);
      if (reduceMotion) {
        progress.setValue(1);
        return;
      }
      Animated.timing(progress, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      return;
    }

    if (reduceMotion) {
      progress.setValue(0);
      setMounted(false);
      return;
    }

    Animated.timing(progress, {
      toValue: 0,
      duration: 170,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [progress, reduceMotion, visible]);

  if (!isMounted) return null;

  const sheetTranslateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [36, 0],
  });

  return (
    <Modal
      visible={isMounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.modalBackdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={closeLabel}
      >
        <Animated.View
          pointerEvents="none"
          style={[styles.modalScrim, { opacity: progress }]}
        />
        <Animated.View
          style={[
            styles.modalSheetWrap,
            {
              opacity: progress,
              transform: [{ translateY: sheetTranslateY }],
            },
          ]}
        >
          <Pressable
            style={styles.modalCard}
            onPress={(event) => event.stopPropagation()}
            accessible={false}
            accessibilityViewIsModal
          >
            {children}
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

function BackgroundPaws({
  styles,
}: {
  styles: ReturnType<typeof createStyles>;
}) {
  const paws = [
    { top: 34, left: -42, transform: [{ rotate: "-18deg" }] },
    { top: 120, right: -26, transform: [{ rotate: "22deg" }] },
    { top: 286, left: 24, transform: [{ rotate: "16deg" }] },
    { bottom: 170, right: 28, transform: [{ rotate: "-12deg" }] },
    { bottom: 40, left: -16, transform: [{ rotate: "28deg" }] },
  ];

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {paws.map((style, index) => (
        <ImageBackground
          key={index}
          source={pawPattern}
          style={[styles.backgroundPaw, style]}
          imageStyle={styles.backgroundPawImage}
        />
      ))}
    </View>
  );
}

function useReduceMotionPreference() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let isMounted = true;

    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (isMounted) setReduceMotion(enabled);
    });

    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}

function getTabIcon(tab: TabKey, active: boolean): IconName {
  if (tab === "home") return active ? "home" : "home-outline";
  if (tab === "lost") return active ? "search" : "search-outline";
  if (tab === "help") return active ? "map" : "map-outline";
  if (tab === "settings") return active ? "settings" : "settings-outline";
  return active ? "heart" : "heart-outline";
}

function matchesKind(kind: PetKind, filter: PetKindFilter) {
  return filter === "all" || kind === filter;
}

function matchesUrgency(urgency: Urgency, filter: UrgencyFilter) {
  return filter === "all" || urgency === filter;
}

function getCardData(language: Language) {
  const userContent = mockDataByLanguage.tr;
  const structuredContent = mockDataByLanguage[language];

  return {
    lostPetNotices: userContent.lostPetNotices.map((item, index) => ({
      ...item,
      area: structuredContent.lostPetNotices[index]?.area ?? item.area,
    })),
    helpLocations: userContent.helpLocations.map((item, index) => ({
      ...item,
      area: structuredContent.helpLocations[index]?.area ?? item.area,
    })),
    adoptionPets: userContent.adoptionPets.map((item, index) => ({
      ...item,
      area: structuredContent.adoptionPets[index]?.area ?? item.area,
    })),
  };
}

function matchesQuery(value: string, query: string) {
  const tokens = normalizeSearch(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  const normalizedValue = normalizeSearch(value);
  return tokens.every((token) => normalizedValue.includes(token));
}

function parseLocationValue(value: string) {
  const trimmedValue = value.trim();
  const selectedCity = findSelectedCity(trimmedValue);

  if (!selectedCity) {
    return {
      city: trimmedValue,
      district: "",
      selectedCity: null,
    };
  }

  return {
    city: selectedCity.city,
    district: trimmedValue.slice(selectedCity.city.length).trim(),
    selectedCity,
  };
}

function getCitySuggestions(value: string) {
  const cityQuery = normalizeSearch(value);
  if (!cityQuery) return [];

  return locationOptions
    .filter(
      (option) =>
        normalizeSearch(option.city).startsWith(cityQuery) &&
        normalizeSearch(option.city) !== cityQuery,
    )
    .slice(0, 8)
    .map((option) => option.city);
}

function getDistrictSuggestions(city: string, value: string) {
  const selectedCity = locationOptions.find((option) => option.city === city);
  if (!selectedCity) return [];

  const districtQuery = normalizeSearch(value);
  if (
    selectedCity.districts.some(
      (district) => normalizeSearch(district) === districtQuery,
    )
  )
    return [];

  return selectedCity.districts
    .filter(
      (district) =>
        !districtQuery || normalizeSearch(district).startsWith(districtQuery),
    )
    .map((district) => district);
}

function findSelectedCity(value: string) {
  const normalizedValue = normalizeSearch(value);
  return (
    locationOptions.find((option) => {
      const normalizedCity = normalizeSearch(option.city);
      return (
        normalizedValue === normalizedCity ||
        normalizedValue.startsWith(`${normalizedCity} `)
      );
    }) ?? null
  );
}

function normalizeSearch(value: string) {
  return value
    .trim()
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatDeviceLocationQuery(place?: Location.LocationGeocodedAddress) {
  if (!place) return "";

  const city = place.city || place.region || place.subregion || "";
  const district =
    place.district ||
    place.subregion ||
    place.name ||
    "";

  return [city, district]
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part, index, parts) => parts.indexOf(part) === index)
    .join(" ");
}

async function getDeviceLocationQuery() {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== Location.PermissionStatus.GRANTED) {
    return { status: "denied" as const, query: "", label: "" };
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  const [place] = await Location.reverseGeocodeAsync(position.coords);
  const query = formatDeviceLocationQuery(place);

  return {
    status: "granted" as const,
    query,
    label: query.split(" ").join(", "),
  };
}

function createStyles(theme: ThemePalette) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.bg,
    },
    backgroundPaw: {
      position: "absolute",
      width: 168,
      height: 168,
      opacity: theme.pawOpacity,
    },
    backgroundPawImage: {
      resizeMode: "contain",
    },
    content: {
      padding: 16,
      paddingTop: 64,
      paddingBottom: 110,
    },
    heroCard: {
      padding: 18,
      borderRadius: 18,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    eyebrow: {
      color: theme.primary,
      fontSize: 12,
      fontWeight: "900",
      textTransform: "uppercase",
      marginBottom: 8,
    },
    heroTitle: {
      color: theme.text,
      fontSize: 30,
      lineHeight: 35,
      fontWeight: "900",
      marginBottom: 10,
    },
    bodyText: {
      color: theme.muted,
      fontSize: 15,
      lineHeight: 23,
    },
    actionRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 16,
    },
    button: {
      minHeight: 44,
      borderRadius: 22,
      paddingHorizontal: 16,
      marginRight: 10,
      marginBottom: 10,
      backgroundColor: theme.primary,
      borderWidth: 1,
      borderColor: theme.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      maxWidth: "100%",
    },
    buttonSecondary: {
      backgroundColor: `${theme.secondary}26`,
      borderColor: `${theme.secondary}55`,
    },
    buttonCompact: {
      marginRight: 0,
      alignSelf: "flex-start",
    },
    buttonPressed: {
      opacity: 0.82,
    },
    buttonText: {
      color: "#fffaf7",
      fontWeight: "900",
      marginLeft: 6,
      flexShrink: 1,
    },
    buttonSecondaryText: {
      color: theme.secondaryStrong,
    },
    activityPanel: {
      marginTop: 16,
      borderRadius: 18,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 14,
    },
    activityHeader: {
      marginBottom: 10,
    },
    activityTitle: {
      color: theme.text,
      fontSize: 18,
      fontWeight: "900",
      marginBottom: 4,
    },
    activityDescription: {
      color: theme.muted,
      fontSize: 13,
      lineHeight: 19,
      fontWeight: "700",
    },
    activityRow: {
      minHeight: 72,
      borderRadius: 14,
      backgroundColor: theme.surfaceStrong,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 12,
      marginTop: 8,
      flexDirection: "row",
      alignItems: "center",
    },
    activityRowUrgent: {
      backgroundColor: theme.dangerBg,
      borderColor: `${theme.danger}55`,
    },
    activityIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${theme.secondary}22`,
      marginRight: 12,
    },
    activityIconUrgent: {
      backgroundColor: `${theme.danger}22`,
    },
    activityText: {
      flex: 1,
      paddingRight: 8,
    },
    activityLabel: {
      color: theme.secondaryStrong,
      fontSize: 12,
      fontWeight: "900",
      marginBottom: 2,
    },
    activityLabelUrgent: {
      color: theme.danger,
    },
    activityItemTitle: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "900",
    },
    activityDetail: {
      color: theme.muted,
      fontSize: 12,
      lineHeight: 17,
      fontWeight: "700",
      marginTop: 2,
    },
    sectionHeader: {
      marginBottom: 14,
    },
    sectionText: {
      marginBottom: 12,
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 28,
      fontWeight: "900",
      marginBottom: 8,
    },
    cardStack: {
      paddingBottom: 10,
    },
    feedInsight: {
      borderRadius: 16,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 14,
      marginBottom: 14,
      flexDirection: "row",
      alignItems: "center",
    },
    feedInsightCompact: {
      minHeight: 54,
      paddingVertical: 10,
    },
    feedInsightUrgent: {
      backgroundColor: theme.dangerBg,
      borderColor: `${theme.danger}55`,
    },
    feedInsightIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${theme.secondary}22`,
      marginRight: 12,
    },
    feedInsightIconUrgent: {
      backgroundColor: `${theme.danger}22`,
    },
    feedInsightText: {
      flex: 1,
    },
    feedInsightLabel: {
      color: theme.secondaryStrong,
      fontSize: 12,
      fontWeight: "900",
      marginBottom: 2,
    },
    feedInsightLabelUrgent: {
      color: theme.danger,
    },
    feedInsightValue: {
      color: theme.text,
      fontSize: 18,
      fontWeight: "900",
      marginBottom: 2,
    },
    feedInsightDetail: {
      color: theme.muted,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "700",
    },
    filterToggle: {
      minHeight: 48,
      borderRadius: 14,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 12,
      marginBottom: 14,
      flexDirection: "row",
      alignItems: "center",
    },
    filterToggleActive: {
      backgroundColor: theme.surfaceStrong,
      borderColor: `${theme.secondary}55`,
    },
    filterToggleIcon: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${theme.secondary}22`,
      marginRight: 10,
    },
    filterToggleText: {
      flex: 1,
      paddingRight: 10,
    },
    filterToggleLabel: {
      color: theme.text,
      fontWeight: "900",
    },
    filterToggleBadge: {
      color: theme.secondaryStrong,
      fontSize: 12,
      fontWeight: "800",
      marginTop: 2,
    },
    filterPanel: {
      borderRadius: 18,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 14,
      marginBottom: 14,
    },
    filterPanelHeader: {
      minHeight: 36,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      marginBottom: 10,
    },
    filterPanelClose: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surfaceStrong,
      borderWidth: 1,
      borderColor: theme.border,
    },
    filterGroup: {
      marginBottom: 12,
    },
    filterLabel: {
      color: theme.text,
      fontWeight: "900",
      fontSize: 13,
      marginBottom: 8,
    },
    segmentedControl: {
      flexDirection: "row",
      backgroundColor: theme.surfaceStrong,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 4,
    },
    segmentButton: {
      flex: 1,
      minHeight: 44,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      paddingHorizontal: 8,
    },
    segmentButtonActive: {
      backgroundColor: `${theme.accent}24`,
    },
    segmentText: {
      color: theme.muted,
      fontWeight: "900",
      fontSize: 12,
      marginLeft: 5,
    },
    segmentTextActive: {
      color: theme.text,
    },
    filterInputWrap: {
      minHeight: 46,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surfaceStrong,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
    },
    filterInput: {
      flex: 1,
      color: theme.text,
      fontWeight: "800",
      paddingVertical: 10,
      paddingLeft: 8,
    },
    clearFiltersButton: {
      alignSelf: "flex-start",
      minHeight: 44,
      paddingHorizontal: 2,
      paddingTop: 2,
      flexDirection: "row",
      alignItems: "center",
    },
    clearFiltersText: {
      color: theme.muted,
      fontWeight: "800",
      fontSize: 12,
      marginLeft: 4,
    },
    currentLocationButton: {
      minHeight: 44,
      alignSelf: "flex-start",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: `${theme.secondary}55`,
      backgroundColor: `${theme.secondary}18`,
      paddingHorizontal: 12,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
    },
    currentLocationText: {
      color: theme.secondaryStrong,
      fontWeight: "900",
      marginLeft: 6,
    },
    suggestionList: {
      maxHeight: 220,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surfaceStrong,
      marginTop: 8,
      overflow: "hidden",
    },
    suggestionItem: {
      minHeight: 44,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    suggestionText: {
      color: theme.text,
      fontWeight: "800",
      marginLeft: 8,
    },
    emptyState: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      padding: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyText: {
      color: theme.muted,
      fontWeight: "900",
      textAlign: "center",
      marginTop: 8,
    },
    petCard: {
      borderRadius: 18,
      overflow: "hidden",
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 14,
    },
    petImage: {
      width: "100%",
      aspectRatio: 3 / 4,
      backgroundColor: theme.bgDeep,
    },
    petContent: {
      padding: 16,
    },
    speciesIcon: {
      position: "absolute",
      right: 14,
      bottom: 14,
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      opacity: 0.9,
    },
    cardMeta: {
      color: theme.muted,
      fontSize: 13,
      fontWeight: "800",
      marginBottom: 6,
    },
    cardTitle: {
      color: theme.text,
      fontSize: 22,
      fontWeight: "900",
      marginBottom: 8,
      paddingRight: 42,
    },
    cardDescription: {
      color: theme.muted,
      fontSize: 15,
      lineHeight: 23,
      marginBottom: 12,
      paddingRight: 34,
    },
    metaLine: {
      color: theme.secondaryStrong,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    metaText: {
      color: theme.muted,
      fontWeight: "800",
      marginLeft: 6,
      flex: 1,
    },
    contactText: {
      color: theme.text,
      fontWeight: "900",
      paddingRight: 44,
    },
    badge: {
      alignSelf: "flex-start",
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
      backgroundColor: `${theme.secondary}28`,
      marginRight: 6,
      marginBottom: 6,
    },
    badgeUrgent: {
      backgroundColor: theme.dangerBg,
      borderWidth: 1,
      borderColor: `${theme.danger}55`,
    },
    badgeText: {
      color: theme.secondaryStrong,
      fontWeight: "900",
      fontSize: 12,
    },
    badgeUrgentText: {
      color: theme.danger,
    },
    tagRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingRight: 44,
    },
    settingsPanel: {
      borderRadius: 18,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 14,
      marginBottom: 14,
    },
    settingsGroupTitle: {
      color: theme.muted,
      fontWeight: "900",
      fontSize: 12,
      textTransform: "uppercase",
      marginBottom: 10,
    },
    settingsUserHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    settingsAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.secondaryStrong,
      marginRight: 12,
    },
    settingsUserText: {
      flex: 1,
    },
    settingsRow: {
      minHeight: 54,
      borderRadius: 14,
      backgroundColor: theme.surfaceStrong,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 12,
      marginTop: 10,
      flexDirection: "row",
      alignItems: "center",
    },
    settingsIcon: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${theme.secondary}22`,
      marginRight: 10,
    },
    settingsRowContent: {
      flex: 1,
    },
    settingsRowLabel: {
      color: theme.text,
      fontWeight: "900",
      fontSize: 14,
    },
    settingsRowValue: {
      color: theme.muted,
      fontWeight: "700",
      fontSize: 12,
      marginTop: 2,
    },
    tabBar: {
      position: "absolute",
      left: 12,
      right: 12,
      bottom: 18,
      borderRadius: 24,
      padding: 8,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      flexDirection: "row",
    },
    tabItem: {
      flex: 1,
      alignItems: "center",
      borderRadius: 18,
      paddingVertical: 8,
    },
    tabItemActive: {
      backgroundColor: `${theme.accent}24`,
    },
    tabText: {
      color: theme.muted,
      fontWeight: "800",
      fontSize: 11,
      marginTop: 3,
    },
    tabTextActive: {
      color: theme.text,
    },
    modalBackdrop: {
      flex: 1,
      justifyContent: "flex-end",
    },
    modalScrim: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: "rgba(0, 0, 0, 0.42)",
    },
    modalSheetWrap: {
      width: "100%",
    },
    modalCard: {
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      padding: 20,
      paddingBottom: 34,
      backgroundColor: theme.surfaceStrong,
      borderWidth: 1,
      borderColor: theme.border,
    },
    modalIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${theme.secondary}24`,
      marginBottom: 12,
    },
    profileHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    profileAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.secondaryStrong,
      marginRight: 12,
    },
    profileIdentity: {
      flex: 1,
    },
    profileName: {
      color: theme.text,
      fontWeight: "900",
      fontSize: 15,
    },
    profileEmail: {
      color: theme.muted,
      fontWeight: "700",
      marginTop: 2,
    },
    profileOptions: {
      marginTop: 14,
    },
    profileRow: {
      minHeight: 48,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      paddingHorizontal: 14,
      marginBottom: 10,
      flexDirection: "row",
      alignItems: "center",
    },
    profileRowText: {
      flex: 1,
      color: theme.text,
      fontWeight: "900",
      marginLeft: 10,
    },
    modalTitle: {
      color: theme.text,
      fontSize: 24,
      fontWeight: "900",
      marginBottom: 8,
    },
    modalActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 16,
    },
    input: {
      minHeight: 46,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      color: theme.text,
      paddingHorizontal: 14,
      marginTop: 10,
    },
    formField: {
      marginTop: 12,
    },
    formLabel: {
      color: theme.text,
      fontWeight: "900",
      fontSize: 13,
      marginBottom: 6,
    },
    inputError: {
      borderColor: theme.danger,
      backgroundColor: theme.dangerBg,
    },
    fieldError: {
      color: theme.danger,
      fontWeight: "800",
      fontSize: 12,
      marginTop: 6,
    },
    formErrorSummary: {
      color: theme.danger,
      fontWeight: "900",
      marginTop: 12,
    },
    formSuccess: {
      color: theme.success,
      backgroundColor: theme.successBg,
      borderWidth: 1,
      borderColor: `${theme.success}55`,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontWeight: "900",
      marginTop: 12,
    },
    textArea: {
      minHeight: 94,
      paddingTop: 12,
      textAlignVertical: "top",
    },
  });
}
