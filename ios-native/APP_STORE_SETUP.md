# Power Plant Tycoon — iOS Monetization RC2

This folder is the native iPhone wrapper source for the current Power Plant Tycoon release candidate.

## Bundle ID currently used by the source
`com.calasco352.powerplanttycoon`

Do not register a different Bundle ID in App Store Connect without also changing the product IDs below.

## StoreKit products to create in App Store Connect

Permanent / Non-Consumable:
- `com.calasco352.powerplanttycoon.removeads` — Remove Ads
- `com.calasco352.powerplanttycoon.autogenerate` — Auto Generate
- `com.calasco352.powerplanttycoon.executivelicense` — Executive License

Consumable:
- `com.calasco352.powerplanttycoon.turbogrid` — Turbo Grid Pack
- `com.calasco352.powerplanttycoon.maintenancecrate` — Maintenance Crate
- `com.calasco352.powerplanttycoon.capitalinjection` — Capital Injection

The app pulls display prices from StoreKit; prices are NOT hard-coded in the web game.

## Ads design
- No banner ad on the Home screen.
- Optional rewarded ad: 2× output for 10 minutes.
- Forced interstitials are sparse: after every 2 completed contracts, the ad becomes eligible and is shown at the player's next page transition, with a minimum 3-minute cooldown.
- Remove Ads disables forced interstitials permanently.
- Rewarded ads remain optional even when Remove Ads is owned.

## Google Mobile Ads setup in Xcode
1. File > Add Package Dependencies.
2. Add: `https://github.com/googleads/swift-package-manager-google-mobile-ads.git`
3. Add the package product to the app target.
4. Add the AdMob App ID to Info.plist. `InfoPlist_AdMob_TEST_SNIPPET.xml` contains Google's TEST App ID for development.
5. This build uses Google's official iOS TEST ad unit IDs inside `PowerPlantAdsBridge.swift`.
6. NEVER ship the test App ID/ad unit IDs. Replace all of them with the real IDs from your AdMob app before App Store submission.

## Consent/privacy before production ads
Before release, configure Google's User Messaging Platform (UMP), complete the App Store privacy questionnaire, and decide whether the production ad setup will request App Tracking Transparency permission. This RC intentionally does not request ATT yet.

## Web vs native testing
GitHub Pages:
- Purchase buttons use TEST BUY and immediately simulate success.
- Rewarded ad uses TEST AD and immediately grants the reward.
- Forced interstitials are not displayed in the browser.

Native iPhone/TestFlight:
- Store buttons call StoreKit.
- Rewarded/interstitial ads call Google Mobile Ads.
- Permanent ownership is read from Apple Transaction.currentEntitlements.
- Restore Purchases uses AppStore.sync().

## Existing assets
Keep your repository's existing `images/` and `audio/` folders. Copy them into the native `www/` bundle before creating the Xcode build.
