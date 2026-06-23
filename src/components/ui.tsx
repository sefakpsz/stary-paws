import { type ReactNode } from "react";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { AppStyles, IconName } from "../app/types";
import type { ThemePalette } from "../theme";
import pawPattern from "../../assets/paw-pattern.png";

export function MobileButton({
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
  styles: AppStyles;
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

export function ActivityRow({
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
  styles: AppStyles;
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

export function MetaLine({
  icon,
  label,
  styles,
  theme,
}: {
  icon: IconName;
  label: string;
  styles: AppStyles;
  theme: ThemePalette;
}) {
  return (
    <View style={styles.metaLine}>
      <Ionicons name={icon} size={16} color={theme.secondaryStrong} />
      <Text style={styles.metaText}>{label}</Text>
    </View>
  );
}

export function BackgroundPaws({
  styles,
}: {
  styles: AppStyles;
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

