import Foundation
import UIKit
import WebKit
import AppTrackingTransparency
#if canImport(GoogleMobileAds)
import GoogleMobileAds
#endif

@MainActor
final class PowerPlantAdsBridge: NSObject, WKScriptMessageHandler {
    static let messageHandlerName = "powerPlantAds"

    // Production AdMob ad unit IDs for Power Plant Tycoon.
    static let interstitialID = "ca-app-pub-1138328624207381/3100389712"
    static let rewardedID = "ca-app-pub-1138328624207381/8874239389"

    private weak var webView: WKWebView?
    private weak var viewController: UIViewController?
#if canImport(GoogleMobileAds)
    private var interstitialAd: InterstitialAd?
    private var rewardedAd: RewardedAd?
#endif

    init(webView: WKWebView, viewController: UIViewController) {
        self.webView = webView
        self.viewController = viewController
        super.init()
    }

    func bootstrap() async {
#if canImport(GoogleMobileAds)
        if #available(iOS 14, *),
           ATTrackingManager.trackingAuthorizationStatus == .notDetermined {
            let _: ATTrackingManager.AuthorizationStatus = await withCheckedContinuation { continuation in
                ATTrackingManager.requestTrackingAuthorization { status in
                    continuation.resume(returning: status)
                }
            }
        }
        await MobileAds.shared.start()
        await loadInterstitial()
        await loadRewarded()
        send(["status": "ready"])
#else
        send(["status": "unavailable", "message": "Google Mobile Ads SDK is not available in this build."])
#endif
    }

    func userContentController(_ userContentController: WKUserContentController,
                               didReceive message: WKScriptMessage) {
        guard let body = message.body as? [String: Any],
              let action = body["action"] as? String else { return }
        Task { @MainActor in
            switch action {
            case "status": await bootstrap()
            case "showInterstitial": await showInterstitial()
            case "showRewarded": await showRewarded(rewardType: body["rewardType"] as? String ?? "boost10")
            default: send(["status": "error", "message": "Unknown ads action."])
            }
        }
    }

    private func showInterstitial() async {
#if canImport(GoogleMobileAds)
        guard let vc = viewController else { return }
        if interstitialAd == nil { await loadInterstitial() }
        guard let ad = interstitialAd else { send(["status": "error", "message": "Interstitial ad is still loading."]); return }
        interstitialAd = nil
        ad.present(from: vc)
#else
        send(["status": "unavailable", "message": "Google Mobile Ads SDK is not installed."])
#endif
    }

    private func showRewarded(rewardType: String) async {
#if canImport(GoogleMobileAds)
        guard let vc = viewController else { return }
        if rewardedAd == nil { await loadRewarded() }
        guard let ad = rewardedAd else { send(["status": "error", "message": "Rewarded ad is still loading."]); return }
        rewardedAd = nil
        ad.present(from: vc) { [weak self] in
            self?.send(["status": "rewardEarned", "rewardType": rewardType])
        }
#else
        send(["status": "unavailable", "message": "Google Mobile Ads SDK is not installed."])
#endif
    }

#if canImport(GoogleMobileAds)
    private func loadInterstitial() async {
        do {
            interstitialAd = try await InterstitialAd.load(with: Self.interstitialID, request: Request())
            interstitialAd?.fullScreenContentDelegate = self
        } catch { interstitialAd = nil; print("Interstitial load failed: \(error.localizedDescription)") }
    }

    private func loadRewarded() async {
        do {
            rewardedAd = try await RewardedAd.load(with: Self.rewardedID, request: Request())
            rewardedAd?.fullScreenContentDelegate = self
        } catch { rewardedAd = nil; print("Rewarded load failed: \(error.localizedDescription)") }
    }
#endif

    private func send(_ payload: [String: Any]) {
        guard JSONSerialization.isValidJSONObject(payload),
              let data = try? JSONSerialization.data(withJSONObject: payload),
              let json = String(data: data, encoding: .utf8) else { return }
        webView?.evaluateJavaScript("window.powerPlantAdsResult(\(json));")
    }
}

#if canImport(GoogleMobileAds)
extension PowerPlantAdsBridge: FullScreenContentDelegate {
    func adDidDismissFullScreenContent(_ ad: FullScreenPresentingAd) {
        send(["status": "dismissed"])
        Task { @MainActor in await loadInterstitial(); await loadRewarded() }
    }

    func ad(_ ad: FullScreenPresentingAd, didFailToPresentFullScreenContentWithError error: Error) {
        send(["status": "error", "message": "Ad could not be presented."])
        Task { @MainActor in await loadInterstitial(); await loadRewarded() }
    }
}
#endif
