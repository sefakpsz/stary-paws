# Stray Paws Mobile

React Native + TypeScript mobile app for Stray Paws, scaffolded with Expo.

The mobile app is intentionally self-contained under `mobile/` and does not change the web app build.

## What Is Included

- Expo + React Native + TypeScript
- Turkish-first UI with English toggle
- Light / dark theme toggle
- Home, Lost, Help, and Adoption tabs
- Mock pet/help/adoption data
- Protected demo posting flow with sign-in modal
- Generated paw asset for icon/background decoration

## Requirements

Expo SDK 56 requires:

- Node.js 22.13.x or newer
- npm
- Android Studio for Android emulator
- Xcode on macOS for iOS Simulator

## Install

From the repository root:

```bash
cd mobile
npm install
npx expo install --fix
```

`npx expo install --fix` lets Expo align package versions with the installed SDK.

## Run The Development Server

```bash
cd mobile
npm run start
```

This opens Expo CLI. From there:

- Press `a` to open Android
- Press `i` to open iOS Simulator
- Scan the QR code with Expo Go for a physical device

You can also start a target directly:

```bash
npm run android
npm run ios
npm run web
```

## Android Emulator

1. Install Android Studio.
2. Open Android Studio > Device Manager.
3. Create a virtual device, for example Pixel 8.
4. Start the emulator.
5. In another terminal:

```bash
cd mobile
npm run android
```

If Expo cannot find the emulator, confirm Android Studio installed the Android SDK and that the emulator is already running.

## iOS Simulator

Requires macOS and Xcode.

1. Install Xcode from the App Store.
2. Open Xcode once and accept required prompts.
3. Open Simulator from Xcode > Open Developer Tool > Simulator.
4. In another terminal:

```bash
cd mobile
npm run ios
```

## Physical Device

1. Install Expo Go from the App Store or Google Play.
2. Run:

```bash
cd mobile
npm run start
```

3. Scan the QR code shown by Expo CLI.

Your phone and computer should be on the same network.

## Type Check

After installing dependencies:

```bash
cd mobile
npm run typecheck
```

## Production Builds

Expo production builds are usually handled with EAS Build.

Install and log in:

```bash
npm install -g eas-cli
eas login
```

Create initial EAS config:

```bash
cd mobile
eas build:configure
```

Build Android:

```bash
eas build --platform android
```

Build iOS:

```bash
eas build --platform ios
```

For iOS App Store builds, you need an Apple Developer account. For Android Play Store builds, you need a Google Play Developer account.

## Notes

- This app currently uses local mock data.
- The demo posting form does not call a backend yet.
- The existing `src/api/httpClient.ts` from the web app can guide the future mobile API client shape, but the mobile project should keep its own API layer under `mobile/src/api/` when backend work starts.
