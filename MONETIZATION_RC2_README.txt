POWER PLANT TYCOON — MONETIZATION RC2

BASE
- Release Candidate long-game build
- Electrical unit scaling
- Mobile scroll fix
- StoreKit native wrapper

NEW IN THIS BUILD
- Remove Ads permanent purchase hook
- Auto Generate permanent purchase remains
- Executive License permanent purchase (+25% generation, +10% sale value)
- Turbo Grid consumable (+60 minutes 2× output)
- Maintenance Crate consumable (full repair + 15 minute 2× boost)
- Capital Injection consumable (scales to at least 30 minutes of operating value)
- Optional rewarded ad for 10 minutes of 2× output
- Sparse interstitial ad logic after contract milestones/page transitions
- 3-minute minimum interstitial cooldown
- Remove Ads disables forced interstitials but leaves optional rewarded ads
- Native Google Mobile Ads bridge with Google TEST ad unit IDs
- Expanded StoreKit bridge for all six products
- Restore Purchases for permanent products
- Browser test simulations remain safe on GitHub Pages
- Cache version bumped to v=11

IMPORTANT
- TEST ad IDs must be replaced with your own AdMob IDs before App Store submission.
- Actual IAP products must be created in App Store Connect before TestFlight purchase tests can return real products.
- Your existing images/ and audio/ folders stay in the repository.
