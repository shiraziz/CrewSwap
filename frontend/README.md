# CrewSwap frontend

The CrewSwap mobile and web client is built with Expo, React Native, Expo Router, and NativeWind.

## Prerequisites

- Node.js 20 or newer
- npm
- An available CrewSwap backend API
- Expo Go on a device, or an Android/iOS simulator for native testing

## Setup

From this directory, install dependencies:

```bash
npm install
```

Set the backend URL before launching the application. Create `frontend/.env` with one of the following values:

```env
# Web running on the same computer as the API
EXPO_PUBLIC_API_URL=http://localhost:5000/api

# A physical device must use the computer's LAN address instead
# EXPO_PUBLIC_API_URL=http://192.168.1.10:5000/api
```

The API must be reachable from the device or browser. The app also derives a development API URL from Expo's host when this variable is omitted.

## Run

```bash
npx expo start
```

Then use the Expo terminal controls to open the app in Expo Go, Android, iOS, or a web browser.

Useful checks:

```bash
npm run typecheck
npm run lint
npm run build:web
```

## Using the app

1. Register an account or sign in.
2. Complete Personal Information and save fleet qualifications.
3. Add a flight or roster item, then create a flight, leave, or accommodation swap.
4. On **Post Flight Swap**, select a flight or complete the form and press **Publish Swap Listing**. The button creates a draft and publishes it; it is disabled while the request is in progress to prevent duplicate listings.
5. Open Matches to request a compatible swap and Requests to accept, reject, or cancel a request.

Fleet qualifications and preferences are saved through the backend. Returning to Profile reloads the latest qualifications.

## Project layout

- `app/` — Expo Router routes and layouts
- `features/` — screen-level feature modules
- `components/` — reusable UI components
- `lib/api.ts` — authenticated API client and backend URL configuration
- `lib/auth.tsx` — session state and authentication actions
