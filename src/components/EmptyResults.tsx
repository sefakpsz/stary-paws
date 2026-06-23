import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { AppStyles, Translation } from "../app/types";

export function EmptyResults({
  styles,
  t,
}: {
  styles: AppStyles;
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

