import { useRef, useState } from "react";
import { Animated, Easing } from "react-native";
import type { TabKey } from "../app/types";
import { useReduceMotionPreference } from "../utils/accessibility";

export function useScreenTransition(initialTab: TabKey = "home") {
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const screenTranslateY = useRef(new Animated.Value(0)).current;
  const tabTransitionId = useRef(0);
  const reduceMotion = useReduceMotionPreference();

  const switchTab = (tab: TabKey) => {
    if (tab === activeTab) return;

    if (reduceMotion) {
      setActiveTab(tab);
      return;
    }

    const transitionId = tabTransitionId.current + 1;
    tabTransitionId.current = transitionId;
    screenOpacity.stopAnimation();
    screenTranslateY.stopAnimation();

    Animated.parallel([
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(screenTranslateY, {
        toValue: 8,
        duration: 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (!finished || tabTransitionId.current !== transitionId) return;

      setActiveTab(tab);
      screenTranslateY.setValue(-6);
      Animated.parallel([
        Animated.timing(screenOpacity, {
          toValue: 1,
          duration: 190,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(screenTranslateY, {
          toValue: 0,
          duration: 190,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  return {
    activeTab,
    reduceMotion,
    screenOpacity,
    screenTranslateY,
    switchTab,
  };
}
