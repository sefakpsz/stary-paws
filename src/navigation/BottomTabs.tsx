import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import type { AppStyles, TabKey, Translation } from "../app/types";
import type { ThemePalette } from "../theme";
import { getTabIcon } from "../utils/data";

const tabs: TabKey[] = ["home", "lost", "help", "adoption", "settings"];

export function BottomTabs({
  activeTab,
  onSelectTab,
  styles,
  theme,
  t,
}: {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  styles: AppStyles;
  theme: ThemePalette;
  t: Translation;
}) {
  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const isActive = tab === activeTab;
        const iconName = getTabIcon(tab, isActive);
        return (
          <Pressable
            key={tab}
            style={[styles.tabItem, isActive && styles.tabItemActive]}
            onPress={() => onSelectTab(tab)}
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
  );
}
