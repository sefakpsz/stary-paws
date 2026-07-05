import { Text, View } from "react-native";
import type { AppStyles, Translation } from "../app/types";
import { AppIcon } from "./PhosphorIcon";

export function EmptyResults({
  styles,
  t,
}: {
  styles: AppStyles;
  t: Translation;
}) {
  return (
    <View style={styles.emptyState}>
      <AppIcon
        name="search-outline"
        size={22}
        color={styles.emptyText.color}
      />
      <Text style={styles.emptyText}>{t.filters.noResults}</Text>
    </View>
  );
}

