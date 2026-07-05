import { type ReactNode, useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import type { AppStyles, IconName, Translation } from "../app/types";
import type { ThemePalette } from "../theme";
import { AppIcon } from "./PhosphorIcon";
import { MobileButton } from "./ui";

export function FeedScreen({
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
  reduceMotion,
  hasActiveFilters,
  errorMessage,
  isLoading,
  onRetry,
  resultsOpacity,
  resultsTranslateY,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onCreate: () => void;
  children: ReactNode;
  styles: AppStyles;
  t: Translation;
  filters?: ReactNode;
  insight?: ReactNode;
  filtersOpen: boolean;
  onToggleFilters: () => void;
  reduceMotion: boolean;
  hasActiveFilters: boolean;
  errorMessage?: string;
  isLoading?: boolean;
  onRetry?: () => void;
  resultsOpacity: Animated.Value;
  resultsTranslateY: Animated.Value;
}) {
  const [filtersMounted, setFiltersMounted] = useState(filtersOpen);
  const filterPanelProgress = useRef(new Animated.Value(filtersOpen ? 1 : 0))
    .current;

  useEffect(() => {
    filterPanelProgress.stopAnimation();

    if (filtersOpen) {
      setFiltersMounted(true);
      if (reduceMotion) {
        filterPanelProgress.setValue(1);
        return;
      }

      Animated.timing(filterPanelProgress, {
        toValue: 1,
        duration: 190,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      return;
    }

    if (reduceMotion) {
      filterPanelProgress.setValue(0);
      setFiltersMounted(false);
      return;
    }

    Animated.timing(filterPanelProgress, {
      toValue: 0,
      duration: 155,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setFiltersMounted(false);
    });
  }, [filterPanelProgress, filtersOpen, reduceMotion]);

  const filterPanelMotion = {
    opacity: filterPanelProgress,
    transform: [
      {
        translateY: filterPanelProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [-6, 0],
        }),
      },
      {
        scale: filterPanelProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.985, 1],
        }),
      },
    ],
  };

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
      <FeedStatusNotice
        errorMessage={errorMessage}
        isLoading={isLoading}
        onRetry={onRetry}
        styles={styles}
        t={t}
      />
      {!filtersOpen && !filtersMounted && (
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
            <AppIcon
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
          <AppIcon
            name="chevron-forward"
            size={18}
            color={styles.filterToggleLabel.color}
          />
        </Pressable>
      )}
      {filtersMounted && (
        <Animated.View style={filterPanelMotion}>{filters}</Animated.View>
      )}
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

export function FeedStatusNotice({
  errorMessage,
  isLoading,
  onRetry,
  styles,
  t,
}: {
  errorMessage?: string;
  isLoading?: boolean;
  onRetry?: () => void;
  styles: AppStyles;
  t: Translation;
}) {
  if (!isLoading && !errorMessage) return null;

  return (
    <View style={styles.feedStatus}>
      <AppIcon
        name={errorMessage ? "cloud-offline-outline" : "sync-outline"}
        size={17}
        color={styles.feedStatusText.color}
      />
      <Text style={styles.feedStatusText}>
        {errorMessage || t.common.loading}
      </Text>
      {errorMessage && onRetry && (
        <Pressable
          style={styles.feedStatusAction}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel={t.common.retry}
        >
          <Text style={styles.feedStatusActionText}>{t.common.retry}</Text>
        </Pressable>
      )}
    </View>
  );
}

export function FeedInsight({
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
  styles: AppStyles;
  theme: ThemePalette;
}) {
  const content = (
    <>
      <View
        style={[styles.feedInsightIcon, urgent && styles.feedInsightIconUrgent]}
      >
        <AppIcon
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
        <AppIcon
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
