import {
  NunitoSans_400Regular,
  NunitoSans_700Bold,
  NunitoSans_800ExtraBold,
  NunitoSans_900Black,
} from "@expo-google-fonts/nunito-sans";
import { VarelaRound_400Regular } from "@expo-google-fonts/varela-round";
import { useFonts } from "expo-font";
import { AppNavigator } from "./src/app/AppNavigator";
import { AppProviders } from "./src/app/AppProviders";

export default function App() {
  const [fontsLoaded] = useFonts({
    VarelaRound_400Regular,
    NunitoSans_400Regular,
    NunitoSans_700Bold,
    NunitoSans_800ExtraBold,
    NunitoSans_900Black,
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
