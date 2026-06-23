import { useRef } from "react";
import { Animated, Easing } from "react-native";

export function useFilterAnimation(reduceMotion: boolean) {
  const resultsOpacity = useRef(new Animated.Value(1)).current;
  const resultsTranslateY = useRef(new Animated.Value(0)).current;
  const transitionId = useRef(0);

  const updateFilters = (change: () => void) => {
    if (reduceMotion) {
      change();
      return;
    }

    const nextTransitionId = transitionId.current + 1;
    transitionId.current = nextTransitionId;
    resultsOpacity.stopAnimation();
    resultsTranslateY.stopAnimation();

    Animated.parallel([
      Animated.timing(resultsOpacity, {
        toValue: 0.68,
        duration: 70,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(resultsTranslateY, {
        toValue: 5,
        duration: 70,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (transitionId.current !== nextTransitionId) return;

      change();
      resultsTranslateY.setValue(-4);
      Animated.parallel([
        Animated.timing(resultsOpacity, {
          toValue: 1,
          duration: 135,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(resultsTranslateY, {
          toValue: 0,
          duration: 135,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  return {
    resultsOpacity,
    resultsTranslateY,
    updateFilters,
  };
}
