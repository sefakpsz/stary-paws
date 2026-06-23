import { useState } from "react";
import type { AppStyles, PetKindFilter, Translation } from "../app/types";
import { EmptyResults } from "../components/EmptyResults";
import { AdoptionCard } from "../components/cards";
import { FeedInsight, FeedScreen } from "../components/feed";
import { AdoptionFilters } from "../components/filters";
import type { ThemePalette } from "../theme";
import type { AdoptionPet } from "../types/pet";
import { matchesKind, matchesQuery } from "../utils/data";
import { useFilterAnimation } from "../utils/filterAnimation";

export function AdoptionScreen({
  pets,
  styles,
  theme,
  t,
  errorMessage,
  isLoading,
  reduceMotion,
  onCreate,
  onRetry,
}: {
  pets: AdoptionPet[];
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
  const { resultsOpacity, resultsTranslateY, updateFilters } =
    useFilterAnimation(reduceMotion);

  const results = pets.filter(
    (item) =>
      matchesKind(item.kind, kindFilter) &&
      matchesQuery(item.area, locationQuery),
  );
  const hasActiveFilters = kindFilter !== "all" || Boolean(locationQuery);

  return (
    <FeedScreen
      title={t.adoption.title}
      description={t.adoption.description}
      actionLabel={t.adoption.createTitle}
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
          icon="heart-outline"
          label={t.adoption.insightLabel}
          value={`${results.length} ${t.adoption.insightUnit}`}
          compact
          styles={styles}
          theme={theme}
        />
      }
      filters={
        <AdoptionFilters
          kind={kindFilter}
          location={locationQuery}
          onChangeKind={(value) => {
            if (kindFilter === value) return;
            updateFilters(() => setKindFilter(value));
          }}
          onChangeLocation={setLocationQuery}
          onClose={() => setFiltersOpen(false)}
          hasActiveFilters={hasActiveFilters}
          onClear={() => {
            if (!hasActiveFilters) return;
            updateFilters(() => {
              setKindFilter("all");
              setLocationQuery("");
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
