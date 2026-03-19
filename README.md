# Hasi Maxi

Hasi Maxi is a Vite + React application.

## Development
- `npm run dev` to start the dev server
- `npm run build` to build for production
- `npm run test` to run unit tests

## PWA
- The app is configured as a Progressive Web App using `vite-plugin-pwa`.
- A service worker is generated during production build and enables offline caching for app shell and image assets.
- Web app manifest is available at `public/manifest.webmanifest`.

## Notifications
- In-app notifications are managed through a unified notification service and notification center context.
- Local browser notifications are optional and user-controlled from Settings.
- Browser notifications do not use backend push in this implementation; they are triggered from app events on the device.
- If browser notifications are denied or unsupported, the app falls back to in-app notifications.

## Browser support notes
- Best experience: Chrome/Edge (desktop + Android).
- iOS/Safari support for web notifications and install behavior can vary by version and user settings.
