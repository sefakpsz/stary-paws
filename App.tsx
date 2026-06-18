import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
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
} from 'react-native';
import { mockDataByLanguage } from './src/data/mockData';
import { turkeyLocations } from './src/data/locations';
import { translations } from './src/i18n/translations';
import type { AdoptionPet, HelpLocation, Language, LostPetNotice, PetKind, Urgency } from './src/types/pet';
import pawPattern from './assets/paw-pattern.png';

type ThemeMode = 'light' | 'dark';
type TabKey = 'home' | 'lost' | 'help' | 'adoption' | 'settings';
type CreateType = 'lost' | 'help' | 'adoption';
type PetKindFilter = PetKind | 'all';
type UrgencyFilter = Urgency | 'all';
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
  cat: string;
  dog: string;
  pawOpacity: number;
}

const tabs: TabKey[] = ['home', 'lost', 'help', 'adoption', 'settings'];

const locationOptions = turkeyLocations;

const palette: Record<ThemeMode, ThemePalette> = {
  light: {
    bg: '#edf2df',
    bgDeep: '#cbd9bc',
    surface: 'rgba(255, 252, 243, 0.94)',
    surfaceStrong: '#fffaf0',
    text: '#28342a',
    muted: '#687060',
    border: 'rgba(65, 82, 56, 0.16)',
    primary: '#c0663f',
    secondary: '#477454',
    secondaryStrong: '#254c35',
    accent: '#d8a13a',
    cat: '#df8ab4',
    dog: '#6d8e50',
    pawOpacity: 0.26,
  },
  dark: {
    bg: '#0d2b1b',
    bgDeep: '#07190f',
    surface: 'rgba(25, 35, 29, 0.94)',
    surfaceStrong: '#233229',
    text: '#efe8db',
    muted: '#b8b09f',
    border: 'rgba(239, 232, 219, 0.12)',
    primary: '#eb916d',
    secondary: '#82ad76',
    secondaryStrong: '#a7d696',
    accent: '#e1b95b',
    cat: '#f1a1c5',
    dog: '#a9c979',
    pawOpacity: 0.18,
  },
};

export default function App() {
  const [language, setLanguage] = useState<Language>('tr');
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [createType, setCreateType] = useState<CreateType | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [helpLocationQuery, setHelpLocationQuery] = useState('');
  const [helpUrgencyFilter, setHelpUrgencyFilter] = useState<UrgencyFilter>('all');
  const [lostKindFilter, setLostKindFilter] = useState<PetKindFilter>('all');
  const [lostLocationQuery, setLostLocationQuery] = useState('');
  const [lostNameQuery, setLostNameQuery] = useState('');
  const [adoptionKindFilter, setAdoptionKindFilter] = useState<PetKindFilter>('all');
  const [adoptionLocationQuery, setAdoptionLocationQuery] = useState('');
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const screenTranslateY = useRef(new Animated.Value(0)).current;
  const themeOpacity = useRef(new Animated.Value(1)).current;
  const languageOpacity = useRef(new Animated.Value(1)).current;
  const tabTransitionId = useRef(0);

  const t = translations[language];
  const data = useMemo(() => getCardData(language), [language]);
  const theme = palette[themeMode];
  const styles = useMemo(() => createStyles(theme), [theme]);
  const resultsOpacity = useRef(new Animated.Value(1)).current;
  const resultsTranslateY = useRef(new Animated.Value(0)).current;
  const filterTransitionId = useRef(0);

  const helpResults = data.helpLocations.filter(
    (item) => matchesQuery(item.area, helpLocationQuery) && matchesUrgency(item.urgency, helpUrgencyFilter),
  );
  const lostResults = data.lostPetNotices.filter(
    (item) =>
      matchesKind(item.kind, lostKindFilter) &&
      matchesQuery(item.area, lostLocationQuery) &&
      matchesQuery(item.name, lostNameQuery),
  );
  const adoptionResults = data.adoptionPets.filter(
    (item) => matchesKind(item.kind, adoptionKindFilter) && matchesQuery(item.area, adoptionLocationQuery),
  );

  const requestCreate = (type: CreateType) => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    setCreateType(type);
  };

  const updateFilters = (change: () => void) => {
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

  const updatePetKindFilter = (current: PetKindFilter, next: PetKindFilter, change: () => void) => {
    if (current === next) return;
    updateFilters(change);
  };

  const updateUrgencyFilter = (current: UrgencyFilter, next: UrgencyFilter, change: () => void) => {
    if (current === next) return;
    updateFilters(change);
  };

  const switchTab = (tab: TabKey) => {
    if (tab === activeTab) return;

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
    const nextThemeMode = themeMode === 'dark' ? 'light' : 'dark';
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
    const nextLanguage = language === 'tr' ? 'en' : 'tr';
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
    if (activeTab === 'home') {
      return (
        <HomeScreen
          styles={styles}
          theme={theme}
          t={t}
          onOpenTab={switchTab}
          onCreate={requestCreate}
        />
      );
    }

    if (activeTab === 'lost') {
      return (
        <FeedScreen
          title={t.lost.title}
          description={t.lost.description}
          actionLabel={t.lost.createTitle}
          onCreate={() => requestCreate('lost')}
          styles={styles}
          resultsOpacity={resultsOpacity}
          resultsTranslateY={resultsTranslateY}
          filters={
            <LostFilters
              kind={lostKindFilter}
              location={lostLocationQuery}
              name={lostNameQuery}
              onChangeKind={(value) => updatePetKindFilter(lostKindFilter, value, () => setLostKindFilter(value))}
              onChangeLocation={setLostLocationQuery}
              onChangeName={setLostNameQuery}
              hasActiveFilters={lostKindFilter !== 'all' || Boolean(lostLocationQuery) || Boolean(lostNameQuery)}
              onClear={() => {
                if (lostKindFilter === 'all' && !lostLocationQuery && !lostNameQuery) return;
                updateFilters(() => {
                  setLostKindFilter('all');
                  setLostLocationQuery('');
                  setLostNameQuery('');
                });
              }}
              styles={styles}
              theme={theme}
              t={t}
            />
          }
        >
          {lostResults.length > 0 ? (
            lostResults.map((item) => <LostCard key={item.id} item={item} styles={styles} theme={theme} t={t} />)
          ) : (
            <EmptyResults styles={styles} t={t} />
          )}
        </FeedScreen>
      );
    }

    if (activeTab === 'help') {
      return (
        <FeedScreen
          title={t.help.title}
          description={t.help.description}
          actionLabel={t.help.createTitle}
          onCreate={() => requestCreate('help')}
          styles={styles}
          resultsOpacity={resultsOpacity}
          resultsTranslateY={resultsTranslateY}
          filters={
            <HelpFilters
              value={helpLocationQuery}
              urgency={helpUrgencyFilter}
              onChangeText={setHelpLocationQuery}
              onChangeUrgency={(value) =>
                updateUrgencyFilter(helpUrgencyFilter, value, () => setHelpUrgencyFilter(value))
              }
              hasActiveFilters={Boolean(helpLocationQuery) || helpUrgencyFilter !== 'all'}
              onClear={() => {
                if (!helpLocationQuery && helpUrgencyFilter === 'all') return;
                updateFilters(() => {
                  setHelpLocationQuery('');
                  setHelpUrgencyFilter('all');
                });
              }}
              label={t.filters.locationSearch}
              styles={styles}
              theme={theme}
              t={t}
            />
          }
        >
          {helpResults.length > 0 ? (
            helpResults.map((item) => <HelpCard key={item.id} item={item} styles={styles} theme={theme} t={t} />)
          ) : (
            <EmptyResults styles={styles} t={t} />
          )}
        </FeedScreen>
      );
    }

    if (activeTab === 'adoption') {
      return (
        <FeedScreen
          title={t.adoption.title}
          description={t.adoption.description}
          actionLabel={t.adoption.createTitle}
          onCreate={() => requestCreate('adoption')}
          styles={styles}
          resultsOpacity={resultsOpacity}
          resultsTranslateY={resultsTranslateY}
          filters={
            <AdoptionFilters
              kind={adoptionKindFilter}
              location={adoptionLocationQuery}
              onChangeKind={(value) =>
                updatePetKindFilter(adoptionKindFilter, value, () => setAdoptionKindFilter(value))
              }
              onChangeLocation={setAdoptionLocationQuery}
              hasActiveFilters={adoptionKindFilter !== 'all' || Boolean(adoptionLocationQuery)}
              onClear={() => {
                if (adoptionKindFilter === 'all' && !adoptionLocationQuery) return;
                updateFilters(() => {
                  setAdoptionKindFilter('all');
                  setAdoptionLocationQuery('');
                });
              }}
              styles={styles}
              theme={theme}
              t={t}
            />
          }
        >
          {adoptionResults.length > 0 ? (
            adoptionResults.map((item) => <AdoptionCard key={item.id} item={item} styles={styles} theme={theme} />)
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
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <BackgroundPaws styles={styles} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
            >
              <Ionicons name={iconName} color={isActive ? theme.text : theme.muted} size={20} />
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{t.tabs[tab]}</Text>
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
  styles,
  theme,
  t,
  onOpenTab,
  onCreate,
}: {
  styles: ReturnType<typeof createStyles>;
  theme: ThemePalette;
  t: Translation;
  onOpenTab: (tab: TabKey) => void;
  onCreate: (type: CreateType) => void;
}) {
  return (
    <View>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>{t.home.eyebrow}</Text>
        <Text style={styles.heroTitle}>{t.home.title}</Text>
        <Text style={styles.bodyText}>{t.home.description}</Text>
        <View style={styles.actionRow}>
          <MobileButton label={t.home.lost} icon="search" onPress={() => onOpenTab('lost')} styles={styles} />
          <MobileButton label={t.home.help} icon="map" onPress={() => onCreate('help')} styles={styles} secondary />
        </View>
      </View>

      <View style={styles.statsRow}>
        <StatPill label={t.common.public} value={t.home.readOpen} styles={styles} />
        <StatPill label={t.common.protected} value={t.home.writeProtected} styles={styles} />
      </View>

      <View style={styles.featureGrid}>
        <FeatureCard title={t.home.lost} icon="alert-circle" theme={theme} styles={styles} />
        <FeatureCard title={t.home.help} icon="location" theme={theme} styles={styles} />
        <FeatureCard title={t.home.adoption} icon="heart" theme={theme} styles={styles} />
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
  filters,
  resultsOpacity,
  resultsTranslateY,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onCreate: () => void;
  children: ReactNode;
  styles: ReturnType<typeof createStyles>;
  filters?: ReactNode;
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
        <MobileButton label={actionLabel} icon="add" onPress={onCreate} styles={styles} compact />
      </View>
      {filters}
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

function LostFilters({
  kind,
  location,
  name,
  onChangeKind,
  onChangeLocation,
  onChangeName,
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
  hasActiveFilters: boolean;
  onClear: () => void;
  styles: ReturnType<typeof createStyles>;
  theme: ThemePalette;
  t: Translation;
}) {
  return (
    <FilterPanel styles={styles}>
      <KindFilter value={kind} onChange={onChangeKind} styles={styles} theme={theme} t={t} />
      <LocationFilterInput
        label={t.common.location}
        value={location}
        onChangeText={onChangeLocation}
        styles={styles}
        theme={theme}
        t={t}
      />
      <FilterInput
        label={t.filters.animalName}
        value={name}
        onChangeText={onChangeName}
        placeholder={t.filters.animalNamePlaceholder}
        icon="paw-outline"
        styles={styles}
        theme={theme}
      />
      {hasActiveFilters && <ClearFiltersButton onPress={onClear} styles={styles} theme={theme} t={t} />}
    </FilterPanel>
  );
}

function AdoptionFilters({
  kind,
  location,
  onChangeKind,
  onChangeLocation,
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
  hasActiveFilters: boolean;
  onClear: () => void;
  styles: ReturnType<typeof createStyles>;
  theme: ThemePalette;
  t: Translation;
}) {
  return (
    <FilterPanel styles={styles}>
      <KindFilter value={kind} onChange={onChangeKind} styles={styles} theme={theme} t={t} />
      <LocationFilterInput
        label={t.common.location}
        value={location}
        onChangeText={onChangeLocation}
        styles={styles}
        theme={theme}
        t={t}
      />
      {hasActiveFilters && <ClearFiltersButton onPress={onClear} styles={styles} theme={theme} t={t} />}
    </FilterPanel>
  );
}

function HelpFilters({
  value,
  urgency,
  onChangeText,
  onChangeUrgency,
  hasActiveFilters,
  onClear,
  label,
  styles,
  theme,
  t,
}: {
  value: string;
  urgency: UrgencyFilter;
  onChangeText: (value: string) => void;
  onChangeUrgency: (value: UrgencyFilter) => void;
  hasActiveFilters: boolean;
  onClear: () => void;
  label: string;
  styles: ReturnType<typeof createStyles>;
  theme: ThemePalette;
  t: Translation;
}) {
  return (
    <FilterPanel styles={styles}>
      <LocationFilterInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        styles={styles}
        theme={theme}
        t={t}
      />
      <UrgencyFilterControl value={urgency} onChange={onChangeUrgency} styles={styles} theme={theme} t={t} />
      {hasActiveFilters && <ClearFiltersButton onPress={onClear} styles={styles} theme={theme} t={t} />}
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
    <Pressable style={styles.clearFiltersButton} onPress={onPress}>
      <Ionicons name="close-circle-outline" size={15} color={theme.muted} />
      <Text style={styles.clearFiltersText}>{t.filters.clear}</Text>
    </Pressable>
  );
}

function FilterPanel({ children, styles }: { children: ReactNode; styles: ReturnType<typeof createStyles> }) {
  return <View style={styles.filterPanel}>{children}</View>;
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
    { value: 'all', label: t.common.all, icon: 'paw-outline' },
    { value: 'cat', label: t.common.cat, icon: 'ellipse-outline' },
    { value: 'dog', label: t.common.dog, icon: 'radio-button-off-outline' },
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
              style={[styles.segmentButton, isActive && styles.segmentButtonActive]}
              onPress={() => onChange(option.value)}
            >
              <Ionicons name={option.icon} size={15} color={isActive ? theme.text : theme.muted} />
              <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>{option.label}</Text>
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
    { value: 'all', label: t.common.all, icon: 'options-outline' },
    { value: 'low', label: t.common.urgency.low, icon: 'remove-circle-outline' },
    { value: 'medium', label: t.common.urgency.medium, icon: 'alert-circle-outline' },
    { value: 'high', label: t.common.urgency.high, icon: 'warning-outline' },
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
              style={[styles.segmentButton, isActive && styles.segmentButtonActive]}
              onPress={() => onChange(option.value)}
            >
              <Ionicons name={option.icon} size={15} color={isActive ? theme.text : theme.muted} />
              <Text style={[styles.segmentText, isActive && styles.segmentTextActive]} numberOfLines={1}>
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
  label,
  value,
  onChangeText,
  styles,
  theme,
  t,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  styles: ReturnType<typeof createStyles>;
  theme: ThemePalette;
  t: Translation;
}) {
  const parsedLocation = parseLocationValue(value);
  const citySuggestions = getCitySuggestions(parsedLocation.city);
  const districtSuggestions = parsedLocation.selectedCity
    ? getDistrictSuggestions(parsedLocation.selectedCity.city, parsedLocation.district)
    : [];

  const updateCity = (city: string) => {
    onChangeText(city);
  };

  const updateDistrict = (district: string) => {
    if (!parsedLocation.selectedCity) return;
    onChangeText([parsedLocation.selectedCity.city, district].filter(Boolean).join(' '));
  };

  return (
    <View style={styles.filterGroup}>
      <Text style={styles.filterLabel}>{label}</Text>
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
        <Pressable key={suggestion} style={styles.suggestionItem} onPress={() => onSelect(suggestion)}>
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
        />
      </View>
    </View>
  );
}

function EmptyResults({ styles, t }: { styles: ReturnType<typeof createStyles>; t: Translation }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="search-outline" size={22} color={styles.emptyText.color} />
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
            <Ionicons name={isAuthenticated ? 'person' : 'person-outline'} size={24} color={theme.bgDeep} />
          </View>
          <View style={styles.settingsUserText}>
            <Text style={styles.profileName}>{isAuthenticated ? t.profile.name : t.settings.signedOut}</Text>
            <Text style={styles.profileEmail}>{isAuthenticated ? t.profile.email : t.auth.description}</Text>
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
          icon={themeMode === 'dark' ? 'moon' : 'sunny'}
          label={t.settings.theme}
          value={themeMode === 'dark' ? t.settings.darkMode : t.settings.lightMode}
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
    <Pressable style={styles.settingsRow} onPress={onPress}>
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
    <PetCardFrame imageUrl={item.imageUrl} kind={item.kind} styles={styles} theme={theme}>
      <Text style={styles.cardMeta}>{t.lost.lastSeen}: {item.lastSeen}</Text>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardDescription}>{item.description}</Text>
      <MetaLine icon="location-outline" label={item.area} styles={styles} theme={theme} />
      <Text style={styles.contactText}>{t.common.contact}: {item.contact}</Text>
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
    <PetCardFrame imageUrl={item.imageUrl} kind={item.kind} styles={styles} theme={theme}>
      <Text style={styles.cardMeta}>{item.urgency === 'high' ? t.help.urgent : t.help.normal}</Text>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDescription}>{item.description}</Text>
      <MetaLine icon="location-outline" label={item.area} styles={styles} theme={theme} />
      <View style={[styles.badge, item.urgency === 'high' && styles.badgeUrgent]}>
        <Text style={styles.badgeText}>{t.common.urgency[item.urgency]}</Text>
      </View>
    </PetCardFrame>
  );
}

function AdoptionCard({
  item,
  styles,
  theme,
}: {
  item: AdoptionPet;
  styles: ReturnType<typeof createStyles>;
  theme: ThemePalette;
}) {
  return (
    <PetCardFrame imageUrl={item.imageUrl} kind={item.kind} styles={styles} theme={theme}>
      <Text style={styles.cardMeta}>{item.age}</Text>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardDescription}>{item.description}</Text>
      <MetaLine icon="location-outline" label={item.area} styles={styles} theme={theme} />
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
  kind,
  children,
  styles,
  theme,
}: {
  imageUrl: string;
  kind: PetKind;
  children: ReactNode;
  styles: ReturnType<typeof createStyles>;
  theme: ThemePalette;
}) {
  return (
    <View style={styles.petCard}>
      <Image source={{ uri: imageUrl }} style={styles.petImage} />
      <View style={styles.petContent}>{children}</View>
      <View style={[styles.speciesIcon, { backgroundColor: kind === 'cat' ? theme.cat : theme.dog }]}>
        <MaterialCommunityIcons
          name={kind === 'cat' ? 'cat' : 'dog'}
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
    >
      <Ionicons name={icon} color={secondary ? styles.buttonSecondaryText.color : styles.buttonText.color} size={16} />
      <Text style={[styles.buttonText, secondary && styles.buttonSecondaryText]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function StatPill({ label, value, styles }: { label: string; value: string; styles: ReturnType<typeof createStyles> }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statValue}>{label}</Text>
      <Text style={styles.statLabel}>{value}</Text>
    </View>
  );
}

function FeatureCard({
  title,
  icon,
  theme,
  styles,
}: {
  title: string;
  icon: IconName;
  theme: ThemePalette;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.featureCard}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} color={theme.secondaryStrong} size={21} />
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
    </View>
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
    <SmoothModal visible={visible} onClose={onClose} styles={styles}>
      <View style={styles.modalIcon}>
        <Ionicons name="shield-checkmark" size={28} color={theme.secondaryStrong} />
      </View>
      <Text style={styles.modalTitle}>{t.auth.title}</Text>
      <Text style={styles.bodyText}>{t.auth.description}</Text>
      <MetaLine icon="checkmark-circle-outline" label={t.auth.benefitOne} styles={styles} theme={theme} />
      <MetaLine icon="checkmark-circle-outline" label={t.auth.benefitTwo} styles={styles} theme={theme} />
      <View style={styles.modalActions}>
        <MobileButton label={t.actions.close} icon="close" onPress={onClose} styles={styles} secondary />
        <MobileButton label={t.actions.demoSignIn} icon="log-in-outline" onPress={onSignIn} styles={styles} />
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
  const [displayType, setDisplayType] = useState<CreateType>('lost');

  useEffect(() => {
    if (type) setDisplayType(type);
  }, [type]);

  const currentType = type ?? displayType;
  const title =
    currentType === 'lost' ? t.lost.createTitle : currentType === 'help' ? t.help.createTitle : t.adoption.createTitle;

  return (
    <SmoothModal visible={visible} onClose={onClose} styles={styles}>
      <Text style={styles.modalTitle}>{title}</Text>
      <Text style={styles.bodyText}>{t.create.description}</Text>
      <TextInput placeholder={t.create.placeholderTitle} placeholderTextColor={theme.muted} style={styles.input} />
      <TextInput placeholder={t.create.placeholderArea} placeholderTextColor={theme.muted} style={styles.input} />
      <TextInput
        placeholder={t.create.placeholderDescription}
        placeholderTextColor={theme.muted}
        style={[styles.input, styles.textArea]}
        multiline
      />
      <TextInput placeholder={t.create.placeholderContact} placeholderTextColor={theme.muted} style={styles.input} />
      <View style={styles.modalActions}>
        <MobileButton label={t.actions.close} icon="close" onPress={onClose} styles={styles} secondary />
        <MobileButton
          label={t.create.submit}
          icon="send"
          onPress={() => Alert.alert(t.create.title, t.create.success)}
          styles={styles}
        />
      </View>
    </SmoothModal>
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
    <SmoothModal visible={visible} onClose={onClose} styles={styles}>
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
          onPress={() => Alert.alert(t.profile.preferences, t.profile.description)}
          styles={styles}
          theme={theme}
        />
      </View>
      <View style={styles.modalActions}>
        <MobileButton label={t.actions.close} icon="close" onPress={onClose} styles={styles} secondary />
        <MobileButton label={t.actions.signOut} icon="log-out-outline" onPress={onSignOut} styles={styles} />
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
    <Pressable style={styles.profileRow} onPress={onPress}>
      <Ionicons name={icon} size={18} color={theme.secondaryStrong} />
      <Text style={styles.profileRowText}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={theme.muted} />
    </Pressable>
  );
}

function SmoothModal({
  visible,
  onClose,
  styles,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  styles: ReturnType<typeof createStyles>;
  children: ReactNode;
}) {
  const [isMounted, setMounted] = useState(visible);
  const progress = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    progress.stopAnimation();

    if (visible) {
      setMounted(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
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
  }, [progress, visible]);

  if (!isMounted) return null;

  const sheetTranslateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [36, 0],
  });

  return (
    <Modal visible={isMounted} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Animated.View pointerEvents="none" style={[styles.modalScrim, { opacity: progress }]} />
        <Animated.View
          style={[
            styles.modalSheetWrap,
            {
              opacity: progress,
              transform: [{ translateY: sheetTranslateY }],
            },
          ]}
        >
          <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
            {children}
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

function BackgroundPaws({ styles }: { styles: ReturnType<typeof createStyles> }) {
  const paws = [
    { top: 34, left: -42, transform: [{ rotate: '-18deg' }] },
    { top: 120, right: -26, transform: [{ rotate: '22deg' }] },
    { top: 286, left: 24, transform: [{ rotate: '16deg' }] },
    { bottom: 170, right: 28, transform: [{ rotate: '-12deg' }] },
    { bottom: 40, left: -16, transform: [{ rotate: '28deg' }] },
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

function getTabIcon(tab: TabKey, active: boolean): IconName {
  if (tab === 'home') return active ? 'home' : 'home-outline';
  if (tab === 'lost') return active ? 'search' : 'search-outline';
  if (tab === 'help') return active ? 'map' : 'map-outline';
  if (tab === 'settings') return active ? 'settings' : 'settings-outline';
  return active ? 'heart' : 'heart-outline';
}

function matchesKind(kind: PetKind, filter: PetKindFilter) {
  return filter === 'all' || kind === filter;
}

function matchesUrgency(urgency: Urgency, filter: UrgencyFilter) {
  return filter === 'all' || urgency === filter;
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
      district: '',
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
    .filter((option) => normalizeSearch(option.city).startsWith(cityQuery) && normalizeSearch(option.city) !== cityQuery)
    .slice(0, 8)
    .map((option) => option.city);
}

function getDistrictSuggestions(city: string, value: string) {
  const selectedCity = locationOptions.find((option) => option.city === city);
  if (!selectedCity) return [];

  const districtQuery = normalizeSearch(value);
  if (selectedCity.districts.some((district) => normalizeSearch(district) === districtQuery)) return [];

  return selectedCity.districts
    .filter((district) => !districtQuery || normalizeSearch(district).startsWith(districtQuery))
    .map((district) => district);
}

function findSelectedCity(value: string) {
  const normalizedValue = normalizeSearch(value);
  return locationOptions.find((option) => {
    const normalizedCity = normalizeSearch(option.city);
    return normalizedValue === normalizedCity || normalizedValue.startsWith(`${normalizedCity} `);
  }) ?? null;
}

function normalizeSearch(value: string) {
  return value
    .trim()
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function createStyles(theme: ThemePalette) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.bg,
    },
    backgroundPaw: {
      position: 'absolute',
      width: 180,
      height: 180,
      opacity: theme.pawOpacity,
    },
    backgroundPawImage: {
      resizeMode: 'contain',
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
      fontWeight: '900',
      textTransform: 'uppercase',
      marginBottom: 8,
    },
    heroTitle: {
      color: theme.text,
      fontSize: 30,
      lineHeight: 35,
      fontWeight: '900',
      marginBottom: 10,
    },
    bodyText: {
      color: theme.muted,
      fontSize: 15,
      lineHeight: 23,
    },
    actionRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonSecondary: {
      backgroundColor: `${theme.secondary}26`,
      borderColor: `${theme.secondary}55`,
    },
    buttonCompact: {
      marginRight: 0,
      alignSelf: 'flex-start',
    },
    buttonPressed: {
      opacity: 0.82,
    },
    buttonText: {
      color: '#fffaf7',
      fontWeight: '900',
      marginLeft: 6,
    },
    buttonSecondaryText: {
      color: theme.secondaryStrong,
    },
    statsRow: {
      flexDirection: 'row',
      marginTop: 14,
    },
    statPill: {
      flex: 1,
      padding: 14,
      borderRadius: 14,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      marginRight: 10,
    },
    statValue: {
      color: theme.text,
      fontWeight: '900',
      marginBottom: 4,
    },
    statLabel: {
      color: theme.muted,
      fontSize: 12,
      fontWeight: '700',
    },
    featureGrid: {
      marginTop: 14,
    },
    featureCard: {
      padding: 16,
      borderRadius: 16,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    featureIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${theme.secondary}22`,
      marginRight: 10,
    },
    featureTitle: {
      color: theme.text,
      fontSize: 16,
      fontWeight: '900',
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
      fontWeight: '900',
      marginBottom: 8,
    },
    cardStack: {
      paddingBottom: 10,
    },
    filterPanel: {
      borderRadius: 18,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 14,
      marginBottom: 14,
    },
    filterGroup: {
      marginBottom: 12,
    },
    filterLabel: {
      color: theme.text,
      fontWeight: '900',
      fontSize: 13,
      marginBottom: 8,
    },
    segmentedControl: {
      flexDirection: 'row',
      backgroundColor: theme.surfaceStrong,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 4,
    },
    segmentButton: {
      flex: 1,
      minHeight: 38,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      paddingHorizontal: 8,
    },
    segmentButtonActive: {
      backgroundColor: `${theme.accent}24`,
    },
    segmentText: {
      color: theme.muted,
      fontWeight: '900',
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
      flexDirection: 'row',
      alignItems: 'center',
    },
    filterInput: {
      flex: 1,
      color: theme.text,
      fontWeight: '800',
      paddingVertical: 10,
      paddingLeft: 8,
    },
    clearFiltersButton: {
      alignSelf: 'flex-start',
      minHeight: 32,
      paddingHorizontal: 2,
      paddingTop: 2,
      flexDirection: 'row',
      alignItems: 'center',
    },
    clearFiltersText: {
      color: theme.muted,
      fontWeight: '800',
      fontSize: 12,
      marginLeft: 4,
    },
    suggestionList: {
      maxHeight: 220,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surfaceStrong,
      marginTop: 8,
      overflow: 'hidden',
    },
    suggestionItem: {
      minHeight: 40,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    suggestionText: {
      color: theme.text,
      fontWeight: '800',
      marginLeft: 8,
    },
    emptyState: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      padding: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      color: theme.muted,
      fontWeight: '900',
      textAlign: 'center',
      marginTop: 8,
    },
    petCard: {
      borderRadius: 18,
      overflow: 'hidden',
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 14,
    },
    petImage: {
      width: '100%',
      aspectRatio: 3 / 4,
      backgroundColor: theme.bgDeep,
    },
    petContent: {
      padding: 16,
    },
    speciesIcon: {
      position: 'absolute',
      right: 14,
      bottom: 14,
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0.9,
    },
    cardMeta: {
      color: theme.muted,
      fontSize: 13,
      fontWeight: '800',
      marginBottom: 6,
    },
    cardTitle: {
      color: theme.text,
      fontSize: 22,
      fontWeight: '900',
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
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    metaText: {
      color: theme.muted,
      fontWeight: '800',
      marginLeft: 6,
      flex: 1,
    },
    contactText: {
      color: theme.text,
      fontWeight: '900',
      paddingRight: 44,
    },
    badge: {
      alignSelf: 'flex-start',
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
      backgroundColor: `${theme.secondary}28`,
      marginRight: 6,
      marginBottom: 6,
    },
    badgeUrgent: {
      backgroundColor: '#c24f4f33',
    },
    badgeText: {
      color: theme.secondaryStrong,
      fontWeight: '900',
      fontSize: 12,
    },
    tagRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
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
      fontWeight: '900',
      fontSize: 12,
      textTransform: 'uppercase',
      marginBottom: 10,
    },
    settingsUserHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    settingsAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
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
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingsIcon: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${theme.secondary}22`,
      marginRight: 10,
    },
    settingsRowContent: {
      flex: 1,
    },
    settingsRowLabel: {
      color: theme.text,
      fontWeight: '900',
      fontSize: 14,
    },
    settingsRowValue: {
      color: theme.muted,
      fontWeight: '700',
      fontSize: 12,
      marginTop: 2,
    },
    tabBar: {
      position: 'absolute',
      left: 12,
      right: 12,
      bottom: 18,
      borderRadius: 24,
      padding: 8,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      flexDirection: 'row',
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      borderRadius: 18,
      paddingVertical: 8,
    },
    tabItemActive: {
      backgroundColor: `${theme.accent}24`,
    },
    tabText: {
      color: theme.muted,
      fontWeight: '800',
      fontSize: 11,
      marginTop: 3,
    },
    tabTextActive: {
      color: theme.text,
    },
    modalBackdrop: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    modalScrim: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.42)',
    },
    modalSheetWrap: {
      width: '100%',
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
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${theme.secondary}24`,
      marginBottom: 12,
    },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    profileAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.secondaryStrong,
      marginRight: 12,
    },
    profileIdentity: {
      flex: 1,
    },
    profileName: {
      color: theme.text,
      fontWeight: '900',
      fontSize: 15,
    },
    profileEmail: {
      color: theme.muted,
      fontWeight: '700',
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
      flexDirection: 'row',
      alignItems: 'center',
    },
    profileRowText: {
      flex: 1,
      color: theme.text,
      fontWeight: '900',
      marginLeft: 10,
    },
    modalTitle: {
      color: theme.text,
      fontSize: 24,
      fontWeight: '900',
      marginBottom: 8,
    },
    modalActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
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
    textArea: {
      minHeight: 94,
      paddingTop: 12,
      textAlignVertical: 'top',
    },
    inputPlaceholder: {
      color: theme.muted,
    },
  });
}
