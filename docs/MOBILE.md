# Strong Vault — Android & iOS only

Strong Vault is distributed as **native mobile apps** (Capacitor). Vault data stays on the device (encrypted in the WebView). There is no hosted web app requirement for end users.

## Prerequisites

| Platform | Tools |
|----------|--------|
| **Both** | Node 20+, `npm install` |
| **Android** | [Android Studio](https://developer.android.com/studio), **JDK 21** (Capacitor 7) |
| **iOS** | Mac with [Xcode](https://developer.apple.com/xcode/), Apple Developer account for device/App Store |

## Build the app bundle

```bash
npm install
npm run build:mobile
```

**Windows:** Stop any running `next dev` first. If the build fails with `500.html` rename / `EPERM` / `.next\trace` errors, delete the `.next` folder and retry. The build script already raises the Node memory limit for webpack.

This will:

1. Static-export the Next.js UI into `www/`
2. Run `cap sync` for `android/` and `ios/` (after first-time iOS setup)

## Run on Android

```bash
npm run build:mobile
npm run cap:open:android
```

In Android Studio: **Run** on an emulator or USB device (use **Run ▶**, not an old APK). For Play Store, use **Build → Generate Signed Bundle / APK**.

If you see a **persistent white / blank screen**, check Logcat for a rapid loop of  
`Handling local request: https://localhost/en/family-management/` with no `/_next/` assets — that is Capacitor html5mode serving a redirecting root `index.html`. The mobile build + `server.appStartPath` must point at `.../index.html`. Rebuild with `npm run build:mobile`, uninstall the app, then Run again.

## Run on iOS (Mac only)

First time on a Mac:

```bash
npm run cap:add:ios   # only once
npm run build:mobile
npm run cap:open:ios
```

In Xcode: select your team, then **Run** on simulator or device. Archive for TestFlight/App Store via **Product → Archive**.

## Live reload during development (optional)

1. `npm run dev` on your PC (port **4028**).
2. Find your PC LAN IP (e.g. `192.168.1.10`).
3. PowerShell:

   ```powershell
   $env:CAP_SERVER_URL="http://192.168.1.10:4028"
   npm run cap:sync
   npm run cap:open:android
   ```

The shell loads the dev server instead of `www/`. Use only on trusted networks.

## Store listing notes

- **Privacy**: All vault documents and encryption keys stay on-device; no cloud vault sync.
- **Permissions**: Internet is used for optional analytics consent and font/CDN assets in the static bundle; core vault works offline after install.
- **Icons**: Replace `android/app/src/main/res/` and iOS asset catalogs with your final brand assets before release.
