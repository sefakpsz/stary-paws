import { type ReactNode } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import type { AppStyles, IconName, PetKindFilter, Translation, UrgencyFilter } from "../app/types";
import { AppIcon } from "./PhosphorIcon";
import type { ThemePalette } from "../theme";
import { getCitySuggestions, getDistrictSuggestions, parseLocationValue } from "../utils/locationSuggestions";

export function LostFilters({
  kind,
  location,
  name,
  onChangeKind,
  onChangeLocation,
  onChangeName,
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
  onClose: () => void;
  hasActiveFilters: boolean;
  onClear: () => void;
  styles: AppStyles;
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

export function AdoptionFilters({
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
  styles: AppStyles;
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

export function HelpFilters({
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
  styles: AppStyles;
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

export function ClearFiltersButton({
  onPress,
  styles,
  theme,
  t,
}: {
  onPress: () => void;
  styles: AppStyles;
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
      <AppIcon name="close-circle-outline" size={15} color={theme.muted} />
      <Text style={styles.clearFiltersText}>{t.filters.clear}</Text>
    </Pressable>
  );
}

export function FilterPanel({
  onClose,
  children,
  styles,
  theme,
  t,
}: {
  onClose: () => void;
  children: ReactNode;
  styles: AppStyles;
  theme: ThemePalette;
  t: Translation;
}) {
  return (
    <View style={styles.filterPanel}>
      <Pressable
        style={styles.filterPanelClose}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={t.actions.close}
        hitSlop={8}
      >
        <AppIcon name="chevron-up" size={17} color={theme.muted} />
      </Pressable>
      {children}
    </View>
  );
}

export function KindFilter({
  value,
  onChange,
  styles,
  theme,
  t,
}: {
  value: PetKindFilter;
  onChange: (value: PetKindFilter) => void;
  styles: AppStyles;
  theme: ThemePalette;
  t: Translation;
}) {
  const options: { value: PetKindFilter; label: string }[] = [
    { value: "all", label: t.common.all },
    { value: "cat", label: t.common.cat },
    { value: "dog", label: t.common.dog },
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
              <Text
                style={[
                  styles.segmentText,
                  styles.segmentTextSolo,
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

export function UrgencyFilterControl({
  value,
  onChange,
  styles,
  theme,
  t,
}: {
  value: UrgencyFilter;
  onChange: (value: UrgencyFilter) => void;
  styles: AppStyles;
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
              <AppIcon
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

export function LocationFilterInput({
  value,
  onChangeText,
  styles,
  theme,
  t,
}: {
  value: string;
  onChangeText: (value: string) => void;
  styles: AppStyles;
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

export function SuggestionList({
  suggestions,
  icon,
  onSelect,
  styles,
  theme,
}: {
  suggestions: string[];
  icon: IconName;
  onSelect: (value: string) => void;
  styles: AppStyles;
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
          <AppIcon name={icon} size={15} color={theme.secondaryStrong} />
          <Text style={styles.suggestionText}>{suggestion}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

export function FilterInput({
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
  styles: AppStyles;
  theme: ThemePalette;
}) {
  return (
    <View style={styles.filterGroup}>
      <Text style={styles.filterLabel}>{label}</Text>
      <View style={styles.filterInputWrap}>
        <AppIcon name={icon} size={17} color={theme.secondaryStrong} />
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

