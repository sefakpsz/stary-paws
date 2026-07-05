import { type ReactNode, useEffect, useRef, useState } from "react";
import { Alert, Animated, Easing, Modal, Pressable, Text, TextInput, View } from "react-native";
import type { AppStyles, CreateFormField, CreateType, IconName, Translation } from "../app/types";
import type { ThemePalette } from "../theme";
import { useReduceMotionPreference } from "../utils/accessibility";
import { submitPost } from "../api/posts";
import { AppIcon } from "./PhosphorIcon";
import { MetaLine, MobileButton } from "./ui";

export function AuthModal({
  visible,
  onClose,
  onSignIn,
  styles,
  t,
  theme,
}: {
  visible: boolean;
  onClose: () => void;
  onSignIn: () => void;
  styles: AppStyles;
  t: Translation;
  theme: ThemePalette;
}) {
  return (
    <SmoothModal
      visible={visible}
      onClose={onClose}
      closeLabel={t.actions.close}
      styles={styles}
    >
      <View style={styles.modalIcon}>
        <AppIcon
          name="shield-checkmark"
          size={28}
          color={theme.secondaryStrong}
        />
      </View>
      <Text style={styles.modalTitle}>{t.auth.title}</Text>
      <Text style={styles.bodyText}>{t.auth.description}</Text>
      <MetaLine
        icon="checkmark-circle-outline"
        label={t.auth.benefitOne}
        styles={styles}
        theme={theme}
      />
      <MetaLine
        icon="checkmark-circle-outline"
        label={t.auth.benefitTwo}
        styles={styles}
        theme={theme}
      />
      <View style={styles.modalActions}>
        <MobileButton
          label={t.actions.close}
          icon="close"
          onPress={onClose}
          styles={styles}
          secondary
        />
        <MobileButton
          label={t.actions.demoSignIn}
          icon="log-in-outline"
          onPress={onSignIn}
          styles={styles}
        />
      </View>
    </SmoothModal>
  );
}

export function CreateModal({
  visible,
  type,
  onClose,
  onSubmitted,
  styles,
  t,
  theme,
}: {
  visible: boolean;
  type: CreateType | null;
  onClose: () => void;
  onSubmitted?: () => void;
  styles: AppStyles;
  t: Translation;
  theme: ThemePalette;
}) {
  const [displayType, setDisplayType] = useState<CreateType>("lost");
  const [form, setForm] = useState<Record<CreateFormField, string>>({
    title: "",
    area: "",
    description: "",
    contact: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<CreateFormField, string>>
  >({});
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (type) setDisplayType(type);
  }, [type]);

  useEffect(() => {
    if (!visible) {
      setErrors({});
      setFormStatus("idle");
      setSubmitError("");
    }
  }, [visible]);

  const currentType = type ?? displayType;
  const title =
    currentType === "lost"
      ? t.lost.createTitle
      : currentType === "help"
        ? t.help.createTitle
        : t.adoption.createTitle;

  const updateField = (field: CreateFormField, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFormStatus("idle");
    setSubmitError("");
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const submit = async () => {
    const nextErrors: Partial<Record<CreateFormField, string>> = {};
    (["title", "area", "description", "contact"] as CreateFormField[]).forEach(
      (field) => {
        if (!form[field].trim()) nextErrors[field] = t.create.required;
      },
    );

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setFormStatus("idle");
      return;
    }

    setFormStatus("submitting");
    setSubmitError("");
    try {
      await submitPost(currentType, form);
      setFormStatus("success");
      onSubmitted?.();
    } catch (error) {
      setFormStatus("idle");
      setSubmitError(
        error instanceof Error ? error.message : t.create.submitError,
      );
    }
  };

  return (
    <SmoothModal
      visible={visible}
      onClose={onClose}
      closeLabel={t.actions.close}
      styles={styles}
    >
      <Text style={styles.modalTitle}>{title}</Text>
      <Text style={styles.bodyText}>{t.create.description}</Text>
      <CreateField
        label={t.create.titleLabel}
        value={form.title}
        onChangeText={(value) => updateField("title", value)}
        placeholder={t.create.placeholderTitle}
        error={errors.title}
        styles={styles}
        theme={theme}
      />
      <CreateField
        label={t.create.areaLabel}
        value={form.area}
        onChangeText={(value) => updateField("area", value)}
        placeholder={t.create.placeholderArea}
        error={errors.area}
        styles={styles}
        theme={theme}
      />
      <CreateField
        label={t.create.descriptionLabel}
        value={form.description}
        onChangeText={(value) => updateField("description", value)}
        placeholder={t.create.placeholderDescription}
        error={errors.description}
        multiline
        styles={styles}
        theme={theme}
      />
      <CreateField
        label={t.create.contactLabel}
        value={form.contact}
        onChangeText={(value) => updateField("contact", value)}
        placeholder={t.create.placeholderContact}
        error={errors.contact}
        styles={styles}
        theme={theme}
      />
      {Object.keys(errors).length > 0 && (
        <Text style={styles.formErrorSummary} accessibilityRole="alert">
          {t.create.requiredSummary}
        </Text>
      )}
      {formStatus === "success" && (
        <Text style={styles.formSuccess} accessibilityRole="alert">
          {t.create.success}
        </Text>
      )}
      {submitError && (
        <Text style={styles.fieldError} accessibilityRole="alert">
          {submitError}
        </Text>
      )}
      <View style={styles.modalActions}>
        <MobileButton
          label={t.actions.close}
          icon="close"
          onPress={onClose}
          styles={styles}
          secondary
        />
        <MobileButton
          label={
            formStatus === "submitting" ? t.create.submitting : t.create.submit
          }
          icon="send"
          onPress={submit}
          styles={styles}
        />
      </View>
    </SmoothModal>
  );
}

export function CreateField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  multiline,
  styles,
  theme,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  error?: string;
  multiline?: boolean;
  styles: AppStyles;
  theme: ThemePalette;
}) {
  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.muted}
        style={[
          styles.input,
          multiline && styles.textArea,
          Boolean(error) && styles.inputError,
        ]}
        multiline={multiline}
        accessibilityLabel={label}
        accessibilityHint={error}
      />
      {error && (
        <Text style={styles.fieldError} accessibilityRole="alert">
          {error}
        </Text>
      )}
    </View>
  );
}

export function ProfileModal({
  visible,
  onClose,
  onSignOut,
  styles,
  t,
  theme,
}: {
  visible: boolean;
  onClose: () => void;
  onSignOut: () => void;
  styles: AppStyles;
  t: Translation;
  theme: ThemePalette;
}) {
  return (
    <SmoothModal
      visible={visible}
      onClose={onClose}
      closeLabel={t.actions.close}
      styles={styles}
    >
      <View style={styles.profileHeader}>
        <View style={styles.profileAvatar}>
          <AppIcon name="person" size={28} color={theme.bgDeep} />
        </View>
        <View style={styles.profileIdentity}>
          <Text style={styles.modalTitle}>{t.profile.title}</Text>
          <Text style={styles.profileName}>{t.profile.name}</Text>
          <Text style={styles.profileEmail}>{t.profile.email}</Text>
        </View>
      </View>
      <Text style={styles.bodyText}>{t.profile.description}</Text>
      <View style={styles.profileOptions}>
        <ProfileRow
          icon="person-outline"
          label={t.profile.settings}
          onPress={() => Alert.alert(t.profile.settings, t.profile.description)}
          styles={styles}
          theme={theme}
        />
        <ProfileRow
          icon="notifications-outline"
          label={t.profile.preferences}
          onPress={() =>
            Alert.alert(t.profile.preferences, t.profile.description)
          }
          styles={styles}
          theme={theme}
        />
      </View>
      <View style={styles.modalActions}>
        <MobileButton
          label={t.actions.close}
          icon="close"
          onPress={onClose}
          styles={styles}
          secondary
        />
        <MobileButton
          label={t.actions.signOut}
          icon="log-out-outline"
          onPress={onSignOut}
          styles={styles}
        />
      </View>
    </SmoothModal>
  );
}

export function ProfileRow({
  icon,
  label,
  onPress,
  styles,
  theme,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  styles: AppStyles;
  theme: ThemePalette;
}) {
  return (
    <Pressable
      style={styles.profileRow}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <AppIcon name={icon} size={18} color={theme.secondaryStrong} />
      <Text style={styles.profileRowText}>{label}</Text>
      <AppIcon name="chevron-forward" size={18} color={theme.muted} />
    </Pressable>
  );
}

export function SmoothModal({
  visible,
  onClose,
  closeLabel,
  styles,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  closeLabel: string;
  styles: AppStyles;
  children: ReactNode;
}) {
  const [isMounted, setMounted] = useState(visible);
  const progress = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const reduceMotion = useReduceMotionPreference();

  useEffect(() => {
    progress.stopAnimation();

    if (visible) {
      setMounted(true);
      if (reduceMotion) {
        progress.setValue(1);
        return;
      }
      Animated.timing(progress, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      return;
    }

    if (reduceMotion) {
      progress.setValue(0);
      setMounted(false);
      return;
    }

    Animated.timing(progress, {
      toValue: 0,
      duration: 170,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [progress, reduceMotion, visible]);

  if (!isMounted) return null;

  const sheetTranslateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [36, 0],
  });

  return (
    <Modal
      visible={isMounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.modalBackdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={closeLabel}
      >
        <Animated.View
          pointerEvents="none"
          style={[styles.modalScrim, { opacity: progress }]}
        />
        <Animated.View
          style={[
            styles.modalSheetWrap,
            {
              opacity: progress,
              transform: [{ translateY: sheetTranslateY }],
            },
          ]}
        >
          <Pressable
            style={styles.modalCard}
            onPress={(event) => event.stopPropagation()}
            accessible={false}
            accessibilityViewIsModal
          >
            {children}
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
