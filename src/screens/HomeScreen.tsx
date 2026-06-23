import { Text, View } from "react-native";
import type { CreateType, TabKey, Translation, AppStyles } from "../app/types";
import type { ThemePalette } from "../theme";
import { ActivityRow, MobileButton } from "../components/ui";
import type { AppData } from "../api/mockData";
import { FeedStatusNotice } from "../components/feed";

export function HomeScreen({
  data,
  styles,
  theme,
  t,
  errorMessage,
  isLoading,
  onOpenTab,
  onCreate,
  onRetry,
}: {
  data: AppData;
  styles: AppStyles;
  theme: ThemePalette;
  t: Translation;
  errorMessage?: string;
  isLoading?: boolean;
  onOpenTab: (tab: TabKey) => void;
  onCreate: (type: CreateType) => void;
  onRetry?: () => void;
}) {
  const urgentHelp =
    data.helpLocations.find((item) => item.urgency === "high") ??
    data.helpLocations[0];
  const latestLost = data.lostPetNotices[0];
  const readyAdoption = data.adoptionPets[0];

  return (
    <View>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>{t.home.eyebrow}</Text>
        <Text style={styles.heroTitle}>{t.home.title}</Text>
        <Text style={styles.bodyText}>{t.home.description}</Text>
        <View style={styles.actionRow}>
          <MobileButton
            label={t.home.searchLost}
            icon="search"
            onPress={() => onOpenTab("lost")}
            styles={styles}
          />
          <MobileButton
            label={t.home.shareHelp}
            icon="map"
            onPress={() => onCreate("help")}
            styles={styles}
            secondary
          />
          <MobileButton
            label={t.home.reportLost}
            icon="alert-circle-outline"
            onPress={() => onCreate("lost")}
            styles={styles}
            secondary
          />
        </View>
      </View>

      <FeedStatusNotice
        errorMessage={errorMessage}
        isLoading={isLoading}
        onRetry={onRetry}
        styles={styles}
        t={t}
      />

      <View style={styles.activityPanel}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityTitle}>{t.home.activityTitle}</Text>
          <Text style={styles.activityDescription}>
            {t.home.activityDescription}
          </Text>
        </View>
        <ActivityRow
          label={t.home.urgentHelp}
          title={urgentHelp.title}
          detail={urgentHelp.area}
          icon="warning-outline"
          urgent
          styles={styles}
          theme={theme}
          onPress={() => onOpenTab("help")}
        />
        <ActivityRow
          label={t.home.latestLost}
          title={latestLost.name}
          detail={latestLost.area}
          icon="search-outline"
          styles={styles}
          theme={theme}
          onPress={() => onOpenTab("lost")}
        />
        <ActivityRow
          label={t.home.readyAdoption}
          title={readyAdoption.name}
          detail={readyAdoption.area}
          icon="heart-outline"
          styles={styles}
          theme={theme}
          onPress={() => onOpenTab("adoption")}
        />
      </View>
    </View>
  );
}
