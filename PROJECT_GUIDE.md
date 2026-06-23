# Stray Paws Mobile Project Guide

This guide explains the project for a backend developer who is new to mobile development. The app is now split into screens, reusable components, theme, utilities, data, and types so you do not need to understand one huge file before you can make changes.

## Big Picture

Stray Paws is an Expo React Native mobile app. It currently uses local mock data instead of a backend API.

The app supports:

- Home, Lost, Help, Adoption, and Settings tabs
- Lost pet notices
- Street animal help locations
- Adoption profiles
- Demo sign-in for protected posting
- Turkish and English UI text
- System language support
- System light/dark theme support
- Current-location filtering
- Filter panels with animations
- Accessible labels and reduced-motion support

From a backend point of view, this is a client app with local fixtures. The API layer does not exist yet, but the domain model and UI flows are ready for one.

## Technology Stack

- `expo`: development/build system for React Native.
- `react-native`: mobile UI primitives like `View`, `Text`, `Pressable`, `TextInput`, `Modal`, and `Image`.
- `react`: component and state model.
- `typescript`: static typing.
- `@expo/vector-icons`: icon library.
- `expo-location`: phone location permission, GPS, and reverse geocoding.
- `expo-localization`: phone language detection.
- `expo-status-bar`: status bar color handling.
- `react-native-web`: lets Expo run the app in a browser for development.

Useful commands:

```bash
npm install
npm run start
npm run android
npm run ios
npm run web
npm run typecheck
```

## Current Folder Structure

```text
.
├── App.tsx
├── app.json
├── package.json
├── package-lock.json
├── PROJECT_GUIDE.md
├── README.md
├── tsconfig.json
├── assets/
│   ├── icon.png
│   └── paw-pattern.png
└── src/
    ├── app/
    │   ├── AppNavigator.tsx
    │   ├── AppProviders.tsx
    │   └── types.ts
    ├── api/
    │   ├── adoptions.ts
    │   ├── appData.ts
    │   ├── auth.ts
    │   ├── client.ts
    │   ├── helpLocations.ts
    │   ├── lostPets.ts
    │   ├── media.ts
    │   ├── mock.ts
    │   ├── mockData.ts
    │   └── posts.ts
    ├── components/
    │   ├── AppModals.tsx
    │   ├── EmptyResults.tsx
    │   ├── cards.tsx
    │   ├── feed.tsx
    │   ├── filters.tsx
    │   ├── modals.tsx
    │   └── ui.tsx
    ├── data/
    │   └── locations.ts
    ├── i18n/
    │   └── translations.ts
    ├── hooks/
    │   ├── useAppData.ts
    │   ├── useAppLanguage.ts
    │   ├── useAppTheme.ts
    │   ├── useAuthState.ts
    │   └── useScreenTransition.ts
    ├── navigation/
    │   └── BottomTabs.tsx
    ├── screens/
    │   ├── AdoptionScreen.tsx
    │   ├── HelpScreen.tsx
    │   ├── HomeScreen.tsx
    │   ├── LostScreen.tsx
    │   └── SettingsScreen.tsx
    ├── theme/
    │   └── index.ts
    ├── types/
    │   ├── assets.d.ts
    │   └── pet.ts
    └── utils/
        ├── accessibility.ts
        ├── data.ts
        ├── deviceLocation.ts
        ├── locationSuggestions.ts
        └── preferences.ts
```

## How To Read The Project

1. `src/types/pet.ts` - domain models.
2. `src/api/mockData.ts` - fake backend data behind the API layer.
3. `src/i18n/translations.ts` - UI text in Turkish and English.
4. `src/theme/index.ts` - colors and styles.
5. `App.tsx` - tiny entry point.
6. `src/app/AppProviders.tsx` and `src/app/AppNavigator.tsx` - app shell and screen selection.
7. `src/screens/*.tsx` - full page behavior.
8. `src/components/feed.tsx`, `filters.tsx`, and `cards.tsx` - reusable building blocks.
9. `src/utils/deviceLocation.ts` - native phone location logic.

## Root Files

### `App.tsx`

`App.tsx` is now only the app entry point.

It renders:

```tsx
export default function App() {
  return (
    <AppProviders>
      <AppNavigator />
    </AppProviders>
  );
}
```

Backend mental model: `App.tsx` is like `main.ts` or a tiny bootstrap file. It wires the top-level app container and does not own feature behavior.

### `app.json`

Expo/native app configuration. It controls app name, icon, splash image, iOS bundle identifier, Android package name, location permission text, and Expo plugins.

### `package.json`

Defines dependencies and scripts.

### `tsconfig.json`

TypeScript configuration. The project is strict and checks `App.tsx` plus all files under `src/`.

## `src/app`

### `src/app/AppProviders.tsx`

Wraps the app with providers for:

- Language state
- Theme state
- Demo auth/create modal state

Provider order matters because theme labels use the active language.

### `src/app/AppNavigator.tsx`

Owns the app shell and screen selection.

It is responsible for:

- Reading language/theme/auth context
- Reading active tab transition state
- Selecting which screen to render
- Passing shared app data, styles, and callbacks into screens
- Rendering the status bar
- Rendering the background paws
- Rendering the scroll container
- Rendering `BottomTabs`
- Rendering `AppModals`

### `src/app/types.ts`

Shared app-level TypeScript types: `TabKey`, `CreateType`, `PetKindFilter`, `UrgencyFilter`, `IconName`, `Translation`, and `AppStyles`.

Backend comparison: shared application contracts used across modules.

## `src/api`

The app is now API-ready. Screens and app shell code do not import mock data directly; they load through endpoint-shaped API functions.

### `src/api/client.ts`

Central request helper. It contains `API_BASE_URL`, `apiRequest`, `isApiConfigured`, `ApiError`, and `ApiUnavailableError`.

Right now `API_BASE_URL` is empty, so endpoint files use mock fallback. When a backend exists, configure the base URL and the same endpoint files can call the real API.

### `src/api/mockData.ts`

Fake backend data lives here. It exports `getMockAppData(language)`, which localizes fixture data for the current app language.

### `src/api/lostPets.ts`

Endpoint-shaped functions for:

- `GET /lost-pets`
- `POST /lost-pets`

### `src/api/helpLocations.ts`

Endpoint-shaped functions for:

- `GET /help-locations`
- `POST /help-locations`

### `src/api/adoptions.ts`

Endpoint-shaped functions for:

- `GET /adoptions`
- `POST /adoptions`

### `src/api/appData.ts`

Aggregates lost pet notices, help locations, and adoption pets for the app shell.

### `src/api/posts.ts`

Maps the generic create modal form to the correct create endpoint.

### `src/api/auth.ts`

Contains demo login behind an API-shaped function. Real token auth should start here.

### `src/api/media.ts`

Prepared for future image upload through `POST /media/uploads`.

## `src/hooks`

### `src/hooks/useAppLanguage.ts`

Owns system/manual language state and language-change animation.

It provides:

- `language`
- `languageLabel`
- `languageOpacity`
- `t`
- `switchLanguage`

### `src/hooks/useAppTheme.ts`

Owns system/manual theme state and theme-change animation.

It provides:

- `styles`
- `theme`
- `themeLabel`
- `themeMode`
- `themeOpacity`
- `switchTheme`

### `src/hooks/useAuthState.ts`

Owns demo auth and modal state.

It provides:

- signed-in state
- auth modal visibility
- profile modal visibility
- create modal type
- sign-in/sign-out handlers
- create request gate

It calls `src/api/auth.ts`, so replacing mock login with real token auth has a clear entry point.

### `src/hooks/useAppData.ts`

Owns app data loading state.

It provides:

- `data`
- `isLoading`
- `errorMessage`
- `reload`

It calls `src/api/appData.ts`, so replacing mock fixture loading with real network calls does not require rewriting screens.

### `src/hooks/useScreenTransition.ts`

Owns active tab state and tab transition animation.

It provides:

- `activeTab`
- `switchTab`
- `screenOpacity`
- `screenTranslateY`
- `reduceMotion`

## `src/navigation`

### `src/navigation/BottomTabs.tsx`

Renders the bottom tab bar and tab buttons.

## `src/types`

### `src/types/pet.ts`

Domain models: `Language`, `PetKind`, `Urgency`, `LostPetNotice`, `HelpLocation`, and `AdoptionPet`.

Backend comparison: DTOs/entities from the client perspective.

### `src/types/assets.d.ts`

Lets TypeScript understand PNG imports.

## `src/data`

### `src/data/locations.ts`

Static Turkey city/district reference data for filter suggestions.

## `src/i18n`

### `src/i18n/translations.ts`

All fixed UI text for Turkish and English. User-generated content should usually stay as the user wrote it; fixed interface labels belong here.

## `src/theme`

### `src/theme/index.ts`

Contains `ThemeMode`, `ThemePalette`, `palette`, and `createStyles(theme)`.

`palette` defines light/dark color tokens. `createStyles` converts the active palette into React Native styles.

## `src/screens`

Screens are full-page app surfaces.

### `src/screens/HomeScreen.tsx`

Responsible for the Home tab: hero message, main action buttons, activity panel, and shortcuts.

### `src/screens/LostScreen.tsx`

Responsible for the Lost tab: lost notice filters, current-location filtering, visible count, list rendering, and empty state.

State owned here:

```ts
kindFilter
locationQuery
nameQuery
filtersOpen
isLocating
```

### `src/screens/HelpScreen.tsx`

Responsible for the Help tab: urgent/current-location action card, urgency filter, location filter, help location list, and empty state.

State owned here:

```ts
locationQuery
urgencyFilter
currentLocationQuery
currentLocationLabel
filtersOpen
isLocating
```

### `src/screens/AdoptionScreen.tsx`

Responsible for the Adoption tab: adoption filters, visible count, adoption profile list, and empty state.

State owned here:

```ts
kindFilter
locationQuery
filtersOpen
```

### `src/screens/SettingsScreen.tsx`

Responsible for the Settings tab: account status, demo sign-in/sign-out, language row, theme row, and profile access.

## Shared Feed Structure

Lost, Help, and Adoption now live in separate screen files, but they still share the same visual feed layout:

```text
Page title
Description
Create button
Insight/count card
Collapsed/open filter panel
List of cards
Empty state
```

That shared structure is handled by `src/components/feed.tsx`. Each screen passes page-specific parts into it:

- Lost uses `LostFilters` and `LostCard`.
- Help uses `HelpFilters` and `HelpCard`.
- Adoption uses `AdoptionFilters` and `AdoptionCard`.

## `src/components`

### `src/components/feed.tsx`

Contains `FeedScreen` and `FeedInsight`.

`FeedScreen` is the reusable layout for Lost, Help, and Adoption pages. It handles header layout, create button placement, collapsed filter button, animated filter panel open/close, loading/error state, retry action, and result list wrapper.

### `src/components/filters.tsx`

Contains `LostFilters`, `HelpFilters`, `AdoptionFilters`, `FilterPanel`, `KindFilter`, `UrgencyFilterControl`, `LocationFilterInput`, `SuggestionList`, `FilterInput`, and `ClearFiltersButton`.

This file owns filter UI only. Filter state lives in the screen files.

### `src/components/cards.tsx`

Contains `LostCard`, `HelpCard`, `AdoptionCard`, and `PetCardFrame`.

These convert domain objects into visible cards.

### `src/components/modals.tsx`

Contains `AuthModal`, `CreateModal`, `CreateField`, `ProfileModal`, `ProfileRow`, and `SmoothModal`.

Current auth is still demo-oriented, but create behavior already goes through `src/api/posts.ts`. With an empty API base URL it uses mock fallback; with a backend configured it can submit to real endpoints.

### `src/components/ui.tsx`

Small shared visual pieces: `MobileButton`, `ActivityRow`, `MetaLine`, and `BackgroundPaws`.

### `src/components/EmptyResults.tsx`

Small empty state shown when filters return no results.

## `src/utils`

### `src/utils/accessibility.ts`

Contains `useReduceMotionPreference`, which reads the phone's reduced-motion accessibility setting.

### `src/utils/preferences.ts`

Contains phone language/theme preference helpers.

### `src/utils/data.ts`

Contains view/data helpers: `matchesKind`, `matchesUrgency`, `matchesQuery`, and `getTabIcon`.

### `src/utils/locationSuggestions.ts`

Contains city/district parsing and suggestions used by the location filter UI.

### `src/utils/deviceLocation.ts`

Contains native phone location logic: ask permission, read GPS, reverse-geocode, and format a location query.

For production geospatial search, sending raw coordinates is better than only sending city/district text:

```text
GET /help-locations?lat=41.0082&lng=28.9784&urgency=high
```

## Page Ownership After Refactor

### Home

File: `src/screens/HomeScreen.tsx`

Wired from: `src/app/AppNavigator.tsx`

### Lost

File: `src/screens/LostScreen.tsx`

### Help

File: `src/screens/HelpScreen.tsx`

### Adoption

File: `src/screens/AdoptionScreen.tsx`

### Settings

File: `src/screens/SettingsScreen.tsx`

State lives in providers/hooks; the screen receives labels and callbacks.

## Navigation Model

The app does not use React Navigation yet.

Navigation is simple state:

```ts
const [activeTab, setActiveTab] = useState<TabKey>("home");
```

The bottom tab bar changes `activeTab`, and `renderScreen()` decides what to show.

## Data Flow

Current flow:

```text
mockData.ts
  -> src/api endpoint files
  -> src/api/appData.ts
  -> src/hooks/useAppData.ts
  -> AppNavigator passes each data list to its screen
  -> screen filters arrays in memory
  -> cards render filtered results
```

The endpoint files already accept filter-shaped arguments. The screens still filter locally for this prototype; the next backend step is to pass those filter values into endpoint calls and let the server handle filtering/pagination.

## API Layer

```text
src/api/
├── client.ts
├── lostPets.ts
├── helpLocations.ts
├── adoptions.ts
├── auth.ts
├── media.ts
├── mock.ts
├── mockData.ts
└── posts.ts
```

Responsibilities:

- `client.ts`: base URL, auth headers, error handling.
- `lostPets.ts`: lost pet endpoints.
- `helpLocations.ts`: help endpoint calls.
- `adoptions.ts`: adoption endpoint calls.
- `auth.ts`: login/session endpoints.
- `media.ts`: image upload endpoints.
- `mock.ts`: small async mock response helper.
- `mockData.ts`: local fixture data used only as API fallback.
- `posts.ts`: create form dispatcher.

## Backend Integration Plan

A sensible backend path from here:

1. Configure `API_BASE_URL` in `src/api/client.ts`.
2. Match backend response JSON to the TypeScript interfaces in `src/types/pet.ts`.
3. Move Lost/Help/Adoption filter state into endpoint query params.
4. Add pagination fields to list endpoints.
5. Replace mock demo auth with real token auth and secure token storage.
6. Add image picker/upload and use `src/api/media.ts`.
7. Refresh lists after successful create calls.
8. Add push notifications later.

Good initial API shape:

```text
GET    /lost-pets
POST   /lost-pets
GET    /help-locations
POST   /help-locations
GET    /adoptions
POST   /adoptions
POST   /auth/login
POST   /media/uploads
```

## Mobile Concepts For Backend Developers

A component is a function that returns UI.

```tsx
export function LostCard({ item }) {
  return <Text>{item.name}</Text>;
}
```

Props are arguments passed from parent components to child components.

```tsx
<LostCard item={notice} styles={styles} />
```

State is local client memory that causes UI to re-render when changed.

```ts
const [activeTab, setActiveTab] = useState("home");
```

Location requires both runtime permission in code and native permission text in `app.json`.

React Native does not use normal CSS files here. Styles are generated by `StyleSheet.create()` in `src/theme/index.ts` and passed into components.

## Why This Refactor Helps

Before, `App.tsx` had almost everything. That made it fast to prototype but hard to learn.

Now:

- Domain types live in `src/types`.
- Shared app types live in `src/app`.
- Fake data lives in `src/data`.
- Translations live in `src/i18n`.
- Theme and styles live in `src/theme`.
- Full pages live in `src/screens`.
- Reusable UI lives in `src/components`.
- Non-visual logic lives in `src/utils`.
- `App.tsx` stays focused on choosing screens and rendering the app shell.

This matches how a larger mobile app is usually organized and makes it much easier to find the right place for a change.

## Current Limitations

The app still does not have:

- Real backend API calls
- Persistent authentication
- Persistent user settings
- Real post creation
- Image picking/upload
- Push notifications
- Pagination
- Server-side filtering
- Automated tests
