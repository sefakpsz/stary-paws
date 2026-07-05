import { useState } from "react";
import { Alert } from "react-native";
import type { AppStyles, Translation, UrgencyFilter } from "../app/types";
import { EmptyResults } from "../components/EmptyResults";
import { HelpCard } from "../components/cards";
import { FeedInsight, FeedScreen } from "../components/feed";
import { HelpFilters } from "../components/filters";
import type { ThemePalette } from "../theme";
import type { HelpLocation } from "../types/pet";
import { matchesQuery, matchesUrgency } from "../utils/data";
import { getDeviceLocationQuery } from "../utils/deviceLocation";
import { useFilterAnimation } from "../utils/filterAnimation";

export function HelpScreen({
  locations,
  styles,
  theme,
  t,
  errorMessage,
  isLoading,
  reduceMotion,
  onCreate,
  onRetry,
}: {
  locations: HelpLocation[];
  styles: AppStyles;
  theme: ThemePalette;
  t: Translation;
  errorMessage?: string;
  isLoading?: boolean;
  reduceMotion: boolean;
  onCreate: () => void;
  onRetry?: () => void;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>("all");
  const [currentLocationQuery, setCurrentLocationQuery] = useState("");
  const [currentLocationLabel, setCurrentLocationLabel] = useState("");
  const [isLocating, setLocating] = useState(false);
  const { resultsOpacity, resultsTranslateY, updateFilters } =
    useFilterAnimation(reduceMotion);

  const results = locations.filter(
    (item) =>
      matchesQuery(item.area, locationQuery) &&
      matchesUrgency(item.urgency, urgencyFilter),
  );
  const nearbyUrgentCount = locations.filter(
    (item) =>
      item.urgency === "high" &&
      Boolean(currentLocationQuery) &&
      matchesQuery(item.area, currentLocationQuery),
  ).length;
  const hasActiveFilters = Boolean(locationQuery) || urgencyFilter !== "all";

  const applyCurrentLocation = async () => {
    if (isLocating) return;

    setLocating(true);
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
        setCurrentLocationQuery(location.query);
        setCurrentLocationLabel(location.label);
        setUrgencyFilter("high");
        setLocationQuery(location.query);
      });
    } catch {
      Alert.alert(t.lost.locationErrorTitle, t.lost.locationError);
    } finally {
      setLocating(false);
    }
  };

  return (
    <FeedScreen
      title={t.help.title}
      description={t.help.description}
      actionLabel={t.help.createTitle}
      onCreate={onCreate}
      styles={styles}
      t={t}
      resultsOpacity={resultsOpacity}
      resultsTranslateY={resultsTranslateY}
      filtersOpen={filtersOpen}
      onToggleFilters={() => setFiltersOpen((open) => !open)}
      reduceMotion={reduceMotion}
      hasActiveFilters={hasActiveFilters}
      errorMessage={errorMessage}
      isLoading={isLoading}
      onRetry={onRetry}
      insight={
        <FeedInsight
          icon="warning-outline"
          label={t.help.insightLabel}
          value={
            currentLocationQuery
              ? `${nearbyUrgentCount} ${t.help.insightUnit}`
              : isLocating
                ? t.help.locationPending
                : t.help.locationAction
          }
          detail={
            currentLocationQuery
              ? t.help.insightDetail.replace("{location}", currentLocationLabel)
              : t.help.insightPrompt
          }
          onPress={applyCurrentLocation}
          urgent={Boolean(currentLocationQuery) && nearbyUrgentCount > 0}
          loading={isLocating}
          styles={styles}
          theme={theme}
        />
      }
      filters={
        <HelpFilters
          value={locationQuery}
          urgency={urgencyFilter}
          onChangeText={setLocationQuery}
          onChangeUrgency={(value) => {
            if (urgencyFilter === value) return;
            updateFilters(() => setUrgencyFilter(value));
          }}
          onClose={() => setFiltersOpen(false)}
          hasActiveFilters={hasActiveFilters}
          onClear={() => {
            if (!hasActiveFilters) return;
            updateFilters(() => {
              setLocationQuery("");
              setUrgencyFilter("all");
            });
          }}
          styles={styles}
          theme={theme}
          t={t}
        />
      }
    >
      {results.length > 0 ? (
        results.map((item) => (
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
