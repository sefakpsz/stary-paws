import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import type { AppStyles, TabKey, Translation } from "../app/types";
import { AppIcon } from "../components/PhosphorIcon";
import type { ThemePalette } from "../theme";
import { useReduceMotionPreference } from "../utils/accessibility";
import { getTabIcon } from "../utils/data";

const tabs: TabKey[] = ["home", "lost", "help", "adoption", "settings"];

export function BottomTabs({
  activeTab,
  onSelectTab,
  styles,
  theme,
  t,
  bottomInset = 0,
}: {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  styles: AppStyles;
  theme: ThemePalette;
  t: Translation;
  bottomInset?: number;
}) {
  return (
    <View style={[styles.tabBar, { bottom: Math.max(6, bottomInset) }]}>
      {tabs.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <Pressable
            key={tab}
            style={[styles.tabItem, isActive && styles.tabItemActive]}
            onPress={() => onSelectTab(tab)}
            accessibilityRole="button"
            accessibilityLabel={t.tabs[tab]}
            accessibilityState={{ selected: isActive }}
          >
            <TabIcon tab={tab} isActive={isActive} theme={theme} />
            <Text
              style={[styles.tabText, isActive && styles.tabTextActive]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {t.tabs[tab]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function TabIcon({
  tab,
  isActive,
  theme,
}: {
  tab: TabKey;
  isActive: boolean;
  theme: ThemePalette;
}) {
  const reduceMotion = useReduceMotionPreference();
  const fillProgress = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reduceMotion) {
      fillProgress.setValue(isActive ? 1 : 0);
      scale.setValue(1);
      return;
    }

    Animated.timing(fillProgress, {
      toValue: isActive ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();

    if (isActive) {
      scale.setValue(0.82);
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [isActive, reduceMotion, fillProgress, scale]);

  const outlineIcon = getTabIcon(tab, false);
  const filledIcon = getTabIcon(tab, true);

  return (
    <Animated.View
      style={[localStyles.iconStack, { transform: [{ scale }] }]}
    >
      <Animated.View
        style={{ opacity: fillProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0],
        }) }}
      >
        <AppIcon name={outlineIcon} size={20} color={theme.muted} />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fillProgress }]}>
        <AppIcon name={filledIcon} size={20} color={theme.text} />
      </Animated.View>
    </Animated.View>
  );
}

const localStyles = StyleSheet.create({
  iconStack: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
