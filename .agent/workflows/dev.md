---
description: How to develop and run the One'N'Move Expo app
---

## Prerequisites

// turbo-all

1. Ensure Node.js v20+ is installed:
```bash
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm use 20
```

2. Install dependencies (if not already installed):
```bash
cd /Users/kamiofrancis/oam && npm install
```

## Development

3. Start the Expo dev server (web preview):
```bash
cd /Users/kamiofrancis/oam && npx expo start --web
```

4. Or start for mobile (Expo Go):
```bash
cd /Users/kamiofrancis/oam && npx expo start
```

## Project Structure

- `app/` — Screens (file-based routing via expo-router)
  - `(auth)/` — Login, OTP, role select, profile setup
  - `(driver)/` — Dashboard, earnings, jobs, schedule, profile, trip-logger
  - `(owner)/` — Fleet dashboard, vehicles, drivers, analytics, profile, trip-reports
  - `(shared)/` — Messages, notifications, reviews, settings, referrals, background-checks, disputes
- `components/` — Reusable UI (`Button`, `Card`, `Badge`, `Avatar`, `Input`, `ScreenWrapper`, `RoleSwitcher`)
- `constants/` — Design tokens (`Colors`, `Typography`, `Spacing`, `Routes`)
- `context/` — `AuthContext`, `RoleContext`
- `data/` — Mock data (`jobs`, `vehicles`, `drivers`, `earnings`, `reviews`, `trips`, `referrals`, `disputes`)
- `utils/` — `formatting`, `matching` (route-weighted), `sms` (fallback logic)

## Adding a New Screen

1. Create the file in the appropriate route group under `app/`
2. Import shared components from `components/ui/` and `components/layout/`
3. Use design tokens from `constants/Colors`, `Typography`, `Spacing`
4. Wrap the screen with `<ScreenWrapper title="..." subtitle="...">`
5. Use mock data from `data/` — no backend needed yet

## Key Design Tokens

- Primary: `#FFD700` (Bold Gold)
- Secondary: `#8B5CF6` (Purple)
- Background: `#000000` (Pure Black)
- Surface hierarchy: `#111111` → `#1A1A1A` → `#222222`

## Common Commands

- `npx expo start --web` — Web preview at localhost:8081
- `npx expo start --ios` — iOS simulator
- `npx expo start --android` — Android emulator
- `npx expo start --clear` — Clear Metro cache if stale
