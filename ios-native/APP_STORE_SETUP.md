# Power Plant Tycoon — iOS / App Store transition

This folder contains the native iPhone wrapper source for the current Release Candidate 1 web game.

## Intended identifiers

- Suggested bundle ID: `com.calasco352.powerplanttycoon`
- Auto Generate product ID: `com.calasco352.powerplanttycoon.autogenerate`
- Auto Generate type: **Non-Consumable**

The product ID in `PowerPlantStoreKitBridge.swift` and `js/game.js` must exactly match the product you create in App Store Connect.

## What is already wired

- The game still works normally on GitHub Pages.
- In a browser, Auto Generate uses the existing TEST BUY behavior.
- In the iPhone wrapper, Auto Generate calls Apple StoreKit instead.
- StoreKit is the source of truth for ownership in the native app.
- Restore Purchases calls `AppStore.sync()` and rechecks current entitlements.
- The browser-only test booster card is hidden automatically in the native iPhone app.
- The native wrapper loads the game from bundled local files, so gameplay does not depend on GitHub Pages being online.

## When you have cloud-Mac/Xcode access

1. Open Xcode and create a new **iOS App** named `PowerPlantTycoon` using SwiftUI and Swift.
2. Set the bundle identifier to your final identifier (suggested above).
3. Set the deployment target to iOS 15 or newer.
4. Replace the generated app Swift file with `PowerPlantTycoonApp.swift`.
5. Add `GameViewController.swift` and `PowerPlantStoreKitBridge.swift` to the app target.
6. Add a folder named `www` to the Xcode project as a folder reference and make sure it is included in the app target.
7. Put the current game files inside that `www` folder: `index.html`, `css/`, `js/`, `images/`, and `audio/`.
8. Add `PrivacyInfo.xcprivacy` to the app target.
9. In Signing & Capabilities, select your Apple Developer team.
10. In App Store Connect, create the Auto Generate non-consumable using the exact product ID above.
11. Run on an iPhone/TestFlight build and test purchase, cancel, pending, relaunch, reset-save, and Restore Purchases paths.

## Before App Store submission

The current native plan intentionally launches with only Auto Generate as a real paid digital feature. Browser TEST BUY items are hidden in the native app. Additional consumables can be added later after the first StoreKit flow is proven stable.
