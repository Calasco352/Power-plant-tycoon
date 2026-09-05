POWER PLANT TYCOON — APP STORE TRANSITION RC1

This package is based on the working Release Candidate 1 Long Game + Electrical Units + Scroll Fix build.

WHAT CHANGED
- StoreKit bridge added for the permanent Auto Generate entitlement.
- Restore Purchases is wired for the native iPhone wrapper.
- Browser/GitHub Pages still uses TEST BUY for development.
- Browser-only test purchase cards are hidden automatically inside the native iPhone app.
- Auto Generate ownership in the native app is controlled by Apple StoreKit, not only localStorage.
- Cache version bumped to v=10.
- Native Swift wrapper source is included under ios-native/.

IMPORTANT
The root index.html, css/game.css and js/game.js are the replacement web files.
Your existing images/ and audio/ folders remain required and should stay in the repository.

The ios-native folder is for the upcoming Xcode/cloud-Mac step; it does not affect GitHub Pages.
