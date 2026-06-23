import { type ReactNode } from "react";
import { Image, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { AdoptionPet, HelpLocation, LostPetNotice, PetKind } from "../types/pet";
import type { AppStyles, Translation } from "../app/types";
import type { ThemePalette } from "../theme";
import { MetaLine } from "./ui";

export function LostCard({
  item,
  styles,
  theme,
  t,
}: {
  item: LostPetNotice;
  styles: AppStyles;
  theme: ThemePalette;
  t: Translation;
}) {
  return (
    <PetCardFrame
      imageUrl={item.imageUrl}
      imageLabel={t.accessibility.petPhoto.replace("{name}", item.name)}
      kind={item.kind}
      styles={styles}
      theme={theme}
    >
      <Text style={styles.cardMeta}>
        {t.lost.lastSeen}: {item.lastSeen}
      </Text>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardDescription}>{item.description}</Text>
      <MetaLine
        icon="location-outline"
        label={item.area}
        styles={styles}
        theme={theme}
      />
      <Text style={styles.contactText}>
        {t.common.contact}: {item.contact}
      </Text>
    </PetCardFrame>
  );
}

export function HelpCard({
  item,
  styles,
  theme,
  t,
}: {
  item: HelpLocation;
  styles: AppStyles;
  theme: ThemePalette;
  t: Translation;
}) {
  return (
    <PetCardFrame
      imageUrl={item.imageUrl}
      imageLabel={t.accessibility.locationPhoto.replace("{title}", item.title)}
      kind={item.kind}
      styles={styles}
      theme={theme}
    >
      <Text style={styles.cardMeta}>
        {item.urgency === "high" ? t.help.urgent : t.help.normal}
      </Text>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDescription}>{item.description}</Text>
      <MetaLine
        icon="location-outline"
        label={item.area}
        styles={styles}
        theme={theme}
      />
      <View
        style={[styles.badge, item.urgency === "high" && styles.badgeUrgent]}
      >
        <Text
          style={[
            styles.badgeText,
            item.urgency === "high" && styles.badgeUrgentText,
          ]}
        >
          {t.common.urgency[item.urgency]}
        </Text>
      </View>
    </PetCardFrame>
  );
}

export function AdoptionCard({
  item,
  styles,
  theme,
  t,
}: {
  item: AdoptionPet;
  styles: AppStyles;
  theme: ThemePalette;
  t: Translation;
}) {
  return (
    <PetCardFrame
      imageUrl={item.imageUrl}
      imageLabel={t.accessibility.petPhoto.replace("{name}", item.name)}
      kind={item.kind}
      styles={styles}
      theme={theme}
    >
      <Text style={styles.cardMeta}>{item.age}</Text>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardDescription}>{item.description}</Text>
      <MetaLine
        icon="location-outline"
        label={item.area}
        styles={styles}
        theme={theme}
      />
      <View style={styles.tagRow}>
        {item.personality.map((tag) => (
          <View key={tag} style={styles.badge}>
            <Text style={styles.badgeText}>{tag}</Text>
          </View>
        ))}
      </View>
    </PetCardFrame>
  );
}

export function PetCardFrame({
  imageUrl,
  imageLabel,
  kind,
  children,
  styles,
  theme,
}: {
  imageUrl: string;
  imageLabel: string;
  kind: PetKind;
  children: ReactNode;
  styles: AppStyles;
  theme: ThemePalette;
}) {
  return (
    <View style={styles.petCard}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.petImage}
        accessibilityLabel={imageLabel}
      />
      <View style={styles.petContent}>{children}</View>
      <View
        style={[
          styles.speciesIcon,
          { backgroundColor: kind === "cat" ? theme.cat : theme.dog },
        ]}
      >
        <MaterialCommunityIcons
          name={kind === "cat" ? "cat" : "dog"}
          color={theme.bgDeep}
          size={25}
        />
      </View>
    </View>
  );
}

