# Altitude Smart Pass mobile

Altitude Smart Pass is an Expo and React Native app for RIT students to explore café spending, menu options, and loyalty rewards at Altitude Coffee. Students can set a personal weekly or monthly budget and manually record café expenses. The budget and entries are stored locally on the device.

## Run in Expo Go

1. Install Node.js and the project dependencies:

   ```bash
   cd smartpass-mobile
   npm install
   ```

2. Start the Expo development server:

   ```bash
   npx expo start
   ```

3. Open the **Expo Go** app on an iPhone or Android phone and scan the QR code shown in the terminal. The phone and development computer should be on the same network.

You can also press `a` to open an available Android emulator. The iOS Simulator requires macOS; on Windows, use a physical iPhone with Expo Go.

## Project structure

- `src/app/` contains the Expo Router routes for Home, Budget, Menu, Rewards, and Profile.
- `src/components/` contains reusable interface components and the platform-specific tab navigation.
- `src/constants/cafe-config.ts` is the single source for café branding, currency, budget presets, and demo purchase-based loyalty settings.
- `assets/images/altitude-coffee-editorial.jpg` is a bundled café editorial photo from Unsplash (photo ID `1495474472287-4d71bcdd2085`).

Run checks from `smartpass-mobile`:

```bash
npx tsc --noEmit
npm run lint
npm test
npm run test:rewards
```

## Demo limitations

Profile identity and menu content are demo data. Budget and expense entries persist locally with AsyncStorage and are not synced between devices. The app does not connect to a bank, process payments, or import purchases automatically. Loyalty points are estimated from manually entered café expenses; there is no authentication, backend, or point-of-sale integration.

Expenses are grouped against the current Monday-to-Sunday week or calendar month selected for the personal budget. The complete expense history remains available for review and editing.
