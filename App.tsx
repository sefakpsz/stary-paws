import {
  BarlowCondensed_600SemiBold,
  BarlowCondensed_700Bold,
  BarlowCondensed_800ExtraBold,
  BarlowCondensed_900Black,
} from "@expo-google-fonts/barlow-condensed";
import { Caveat_600SemiBold } from "@expo-google-fonts/caveat";
import {
  ZillaSlab_400Regular,
  ZillaSlab_600SemiBold,
  ZillaSlab_700Bold,
} from "@expo-google-fonts/zilla-slab";
import { useFonts } from "expo-font";
import { AppNavigator } from "./src/app/AppNavigator";
import { AppProviders } from "./src/app/AppProviders";

export default function App() {
  const [fontsLoaded] = useFonts({
    BarlowCondensed_600SemiBold,
    BarlowCondensed_700Bold,
    BarlowCondensed_800ExtraBold,
    BarlowCondensed_900Black,
    ZillaSlab_400Regular,
    ZillaSlab_600SemiBold,
    ZillaSlab_700Bold,
    Caveat_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AppProviders>
      <AppNavigator />
    </AppProviders>
  );
}
