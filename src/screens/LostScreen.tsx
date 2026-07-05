import { useState } from "react";
import { Alert } from "react-native";
import type { AppStyles, PetKindFilter, Translation } from "../app/types";
import { EmptyResults } from "../components/EmptyResults";
import { LostCard } from "../components/cards";
import { FeedInsight, FeedScreen } from "../components/feed";
import { LostFilters } from "../components/filters";
import type { ThemePalette } from "../theme";
import type { LostPetNotice } from "../types/pet";
import { matchesKind, matchesQuery } from "../utils/data";
import { getDeviceLocationQuery } from "../utils/deviceLocation";
import { useFilterAnimation } from "../utils/filterAnimation";

export function LostScreen({
  notices,
  styles,
  theme,
  t,
  errorMessage,
  isLoading,
  reduceMotion,
  onCreate,
  onRetry,
}: {
  notices: LostPetNotice[];
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
  const [kindFilter, setKindFilter] = useState<PetKindFilter>("all");
  const [locationQuery, setLocationQuery] = useState("");
  const [nameQuery, setNameQuery] = useState("");
  const [currentLocationLabel, setCurrentLocationLabel] = useState("");
  const [isLocating, setLocating] = useState(false);
  const { resultsOpacity, resultsTranslateY, updateFilters } =
    useFilterAnimation(reduceMotion);

  const results = notices.filter(
    (item) =>
      matchesKind(item.kind, kindFilter) &&
      matchesQuery(item.area, locationQuery) &&
      matchesQuery(item.name, nameQuery),
  );
  const hasActiveFilters =
    kindFilter !== "all" || Boolean(locationQuery) || Boolean(nameQuery);

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
        setCurrentLocationLabel(location.label);
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
      title={t.lost.title}
      description={t.lost.description}
      actionLabel={t.lost.createTitle}
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
          icon="search-outline"
          label={t.lost.insightLabel}
          value={
            currentLocationLabel
              ? `${results.length} ${t.lost.insightUnit}`
              : isLocating
                ? t.lost.locationPending
                : t.lost.locationAction
          }
          detail={
            currentLocationLabel
              ? t.lost.insightDetail.replace("{location}", currentLocationLabel)
              : t.lost.insightPrompt
          }
          onPress={applyCurrentLocation}
          loading={isLocating}
          styles={styles}
          theme={theme}
        />
      }
      filters={
        <LostFilters
          kind={kindFilter}
          location={locationQuery}
          name={nameQuery}
          onChangeKind={(value) => {
            if (kindFilter === value) return;
            updateFilters(() => setKindFilter(value));
          }}
          onChangeLocation={setLocationQuery}
          onChangeName={setNameQuery}
          onClose={() => setFiltersOpen(false)}
          hasActiveFilters={hasActiveFilters}
          onClear={() => {
            if (!hasActiveFilters) return;
            updateFilters(() => {
              setKindFilter("all");
              setLocationQuery("");
              setNameQuery("");
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
