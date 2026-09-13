import Foundation
// PPT BUILD 13 STOREKIT DELIVERY HARDENING
// PPT BUILD 13 VIP + GAME CENTER
// PPT BUILD 14 VIP PURCHASE RETRY
import StoreKit
import GameKit
import UIKit
import WebKit

@MainActor
final class PowerPlantStoreKitBridge: NSObject, WKScriptMessageHandler, GKGameCenterControllerDelegate {
    static let messageHandlerName = "powerPlantStoreKit"

    static let autoGenerateProductID = "com.calascointeractive.powerplanttycoon.autogenerate"
    static let removeAdsProductID = "com.calascointeractive.powerplanttycoon.removeads"
    static let executiveLicenseProductID = "com.calascointeractive.powerplanttycoon.executivelicense"
    static let turboGridProductID = "com.calascointeractive.powerplanttycoon.turbogrid"
    static let maintenanceCrateProductID = "com.calascointeractive.powerplanttycoon.maintenancecrate"
    static let capitalInjectionProductID = "com.calascointeractive.powerplanttycoon.capitalinjection"
    static let hqExecutiveThemeProductID = "com.calascointeractive.powerplanttycoon.hqexecutivetheme"
    static let offlineOperationsProductID = "com.calascointeractive.powerplanttycoon.offlineoperations"
    static let marketIntelligenceProductID = "com.calascointeractive.powerplanttycoon.marketintelligence"
    static let emergencyEngineeringProductID = "com.calascointeractive.powerplanttycoon.emergencyengineering"
    static let rdAcceleratorProductID = "com.calascointeractive.powerplanttycoon.rdaccelerator"
    static let recruitmentDriveProductID = "com.calascointeractive.powerplanttycoon.recruitmentdrive"
    static let gridReserveProductID = "com.calascointeractive.powerplanttycoon.gridreserve"
    static let regionalExpansionProductID = "com.calascointeractive.powerplanttycoon.regionalexpansion"
    static let foundersBundleProductID = "com.calascointeractive.powerplanttycoon.foundersbundle"
    static let autoSellLicenseProductID = "com.calascointeractive.powerplanttycoon.autosell"
    static let vipMonthlyProductID = "com.calascointeractive.powerplanttycoon.vip.monthly"
    static let vipYearlyProductID = "com.calascointeractive.powerplanttycoon.vip.yearly"
    static let allProductIDs: Set<String> = [
        autoGenerateProductID, removeAdsProductID, executiveLicenseProductID,
        turboGridProductID, maintenanceCrateProductID, capitalInjectionProductID,
        hqExecutiveThemeProductID, offlineOperationsProductID, marketIntelligenceProductID,
        emergencyEngineeringProductID, rdAcceleratorProductID, recruitmentDriveProductID,
        gridReserveProductID, regionalExpansionProductID, foundersBundleProductID,
        autoSellLicenseProductID, vipMonthlyProductID, vipYearlyProductID
    ]

    private weak var webView: WKWebView?
    private var products: [String: Product] = [:]
    private var transactionUpdatesTask: Task<Void, Never>?

    init(webView: WKWebView) {
        self.webView = webView
        super.init()
        transactionUpdatesTask = observeTransactionUpdates()
    }

    deinit { transactionUpdatesTask?.cancel() }

    func bootstrap() async {
        await loadProducts()
        await deliverUnfinishedTransactions()
        await sendEntitlements(status: "ready")
        authenticateGameCenter()
    }

    func userContentController(_ userContentController: WKUserContentController,
                               didReceive message: WKScriptMessage) {
        guard let body = message.body as? [String: Any],
              let action = body["action"] as? String else { return }
        let rawProductID = body["productID"] as? String

        let productID: String? = {
            guard let raw = rawProductID else { return nil }

            let key = raw.lowercased().filter { $0.isLetter || $0.isNumber }

            if key.contains("remove") && key.contains("ad") {
                return Self.removeAdsProductID
            }

            if key.contains("auto") && key.contains("generate") {
                return Self.autoGenerateProductID
            }

            if key.contains("executive") && key.contains("license") {
                return Self.executiveLicenseProductID
            }

            if key.contains("turbo") && key.contains("grid") {
                return Self.turboGridProductID
            }

            if key.contains("maintenance") && key.contains("crate") {
                return Self.maintenanceCrateProductID
            }

            if key.contains("capital") && key.contains("injection") {
                return Self.capitalInjectionProductID
            }

            return raw
        }()
        Task { @MainActor in
            switch action {
            case "status": await sendEntitlements(status: "ready")
            case "products": await loadProducts()
            case "purchase": if let productID { await purchase(productID: productID) }
            case "restore": await restorePurchases()
            case "manageSubscriptions": await showManageSubscriptions()
            case "gameCenterAuth": authenticateGameCenter()
            case "gameCenterSubmit":
                if let leaderboardID = body["leaderboardID"] as? String,
                   let scoreNumber = body["score"] as? NSNumber {
                    submitGameCenterScore(leaderboardID: leaderboardID, score: scoreNumber.int64Value)
                } else {
                    send(["status": "gameCenterError", "message": "Invalid leaderboard score request."])
                }
            case "gameCenterShow":
                if let leaderboardID = body["leaderboardID"] as? String {
                    showGameCenterLeaderboard(leaderboardID)
                }
            default: send(["status": "error", "message": "Unknown StoreKit action."])
            }
        }
    }

    private func loadProducts() async {
        do {
            let fetched = try await Product.products(for: Array(Self.allProductIDs))
            products = Dictionary(uniqueKeysWithValues: fetched.map { ($0.id, $0) })
            send(["status": "products", "prices": Dictionary(uniqueKeysWithValues: fetched.map { ($0.id, $0.displayPrice) })])
        } catch {
            send(["status": "error", "message": "Unable to load App Store products right now."])
        }
    }

    private func purchase(productID: String) async {
        guard Self.allProductIDs.contains(productID) else {
            send(["status": "error", "productID": productID,
                  "message": "Unknown purchase item."]); return
        }
        do {
            var product = products[productID]

            // StoreKit/TestFlight can briefly return an empty product list after
            // new subscription metadata is created or changed. Retry the exact
            // requested product instead of failing the first lookup.
            if product == nil {
                for attempt in 0..<4 {
                    let fetched = try await Product.products(for: [productID])
                    if let first = fetched.first {
                        products[productID] = first
                        product = first
                        break
                    }
                    if attempt < 3 {
                        let delay = UInt64(700_000_000 * (attempt + 1))
                        try? await Task.sleep(nanoseconds: delay)
                    }
                }
            }

            // One final full catalog refresh catches a product that appeared
            // while the purchase button was being pressed.
            if product == nil {
                await loadProducts()
                product = products[productID]
            }

            guard let product else {
                send(["status": "error", "code": "productUnavailable",
                      "productID": productID,
                      "message": "Apple has not returned this purchase yet. Please try again in a moment."])
                return
            }

            let result = try await product.purchase()
            switch result {
            case .success(let verification):
                let transaction = try verified(verification)
                let delivered = await sendTransactionDelivery(transaction)
                if delivered {
                    await transaction.finish()
                } else {
                    send(["status": "pending", "productID": transaction.productID,
                          "message": "Purchase verified. Delivery will resume automatically."])
                }
            case .pending:
                send(["status": "pending", "productID": productID,
                      "message": "Purchase is awaiting Apple approval."])
            case .userCancelled:
                send(["status": "cancelled", "productID": productID])
            @unknown default:
                send(["status": "error", "productID": productID,
                      "message": "Unknown App Store purchase result."])
            }
        } catch {
            send(["status": "error", "productID": productID,
                  "message": "The purchase could not be completed. Please try again."])
        }
    }

    private func restorePurchases() async {
        do { try await AppStore.sync(); await sendEntitlements(status: "restored") }
        catch { send(["status": "error", "message": "Purchases could not be restored."]) }
    }

    private func currentOwnedProductIDs() async -> [String] {
        var owned = Set<String>()
        for await result in Transaction.currentEntitlements {
            guard case .verified(let transaction) = result, transaction.revocationDate == nil else { continue }
            owned.insert(transaction.productID)
        }
        return Array(owned).sorted()
    }

    private func sendEntitlements(status: String, productID: String? = nil, transactionID: String? = nil) async {
        var payload: [String: Any] = ["status": status, "ownedProductIDs": await currentOwnedProductIDs()]
        if let productID { payload["productID"] = productID }
        if let transactionID { payload["transactionID"] = transactionID }
        send(payload)
    }

    private func observeTransactionUpdates() -> Task<Void, Never> {
        Task { @MainActor [weak self] in
            guard let self else { return }
            for await result in Transaction.updates {
                guard !Task.isCancelled else { return }
                guard case .verified(let transaction) = result else { continue }
                let delivered = await self.sendTransactionDelivery(transaction)
                if delivered { await transaction.finish() }
            }
        }
    }

    private func deliverUnfinishedTransactions() async {
        for await result in Transaction.unfinished {
            guard case .verified(let transaction) = result else { continue }
            let delivered = await sendTransactionDelivery(transaction)
            if delivered { await transaction.finish() }
        }
    }

    private func sendTransactionDelivery(_ transaction: Transaction) async -> Bool {
        var payload: [String: Any] = [
            "status": "purchased",
            "productID": transaction.productID,
            "transactionID": String(transaction.id),
            "ownedProductIDs": await currentOwnedProductIDs()
        ]
        // Preserve a concrete object type for JSONSerialization.
        if transaction.revocationDate != nil { payload["revoked"] = true }
        guard JSONSerialization.isValidJSONObject(payload),
              let data = try? JSONSerialization.data(withJSONObject: payload),
              let json = String(data: data, encoding: .utf8),
              let webView else { return false }
        return await withCheckedContinuation { continuation in
            webView.evaluateJavaScript("window.powerPlantStoreKitResult(\(json)); true;") { _, error in
                continuation.resume(returning: error == nil)
            }
        }
    }

    private static let leaderboardIDs: Set<String> = [
        "com.calascointeractive.powerplanttycoon.lb.companyvalue",
        "com.calascointeractive.powerplanttycoon.lb.prestige",
        "com.calascointeractive.powerplanttycoon.lb.empirelevel",
        "com.calascointeractive.powerplanttycoon.lb.weeklygrowth",
        "com.calascointeractive.powerplanttycoon.lb.weeklyenergy"
    ]

    private func authenticateGameCenter() {
        let player = GKLocalPlayer.local
        player.authenticateHandler = { [weak self] viewController, error in
            guard let self else { return }
            if let viewController {
                self.presentGameCenterController(viewController)
                return
            }
            if player.isAuthenticated {
                self.send(["status": "gameCenterAuth", "authenticated": true, "alias": player.alias])
            } else {
                self.send(["status": "gameCenterAuth", "authenticated": false,
                           "message": error?.localizedDescription ?? "Game Center sign-in is not active."])
            }
        }
    }

    private func submitGameCenterScore(leaderboardID: String, score: Int64) {
        guard Self.leaderboardIDs.contains(leaderboardID) else {
            send(["status": "gameCenterError", "message": "Unknown leaderboard."]); return
        }
        guard GKLocalPlayer.local.isAuthenticated else {
            authenticateGameCenter()
            send(["status": "gameCenterError", "message": "Sign in to Game Center first."]); return
        }
        let safeScore = max(0, min(score, 9_000_000_000_000_000))
        GKLeaderboard.submitScore(Int(safeScore), context: 0, player: GKLocalPlayer.local,
                                  leaderboardIDs: [leaderboardID]) { [weak self] error in
            Task { @MainActor in
                if let error {
                    self?.send(["status": "gameCenterError", "message": error.localizedDescription])
                } else {
                    self?.send(["status": "gameCenterSubmitted", "leaderboardID": leaderboardID,
                                "score": safeScore])
                }
            }
        }
    }

    private func showGameCenterLeaderboard(_ leaderboardID: String) {
        guard Self.leaderboardIDs.contains(leaderboardID) else {
            send(["status": "gameCenterError", "message": "Unknown leaderboard."]); return
        }
        guard GKLocalPlayer.local.isAuthenticated else { authenticateGameCenter(); return }
        let controller = GKGameCenterViewController(leaderboardID: leaderboardID,
                                                     playerScope: .global,
                                                     timeScope: .allTime)
        controller.gameCenterDelegate = self
        presentGameCenterController(controller)
    }

    private func presentGameCenterController(_ controller: UIViewController) {
        guard var presenter = webView?.window?.rootViewController else {
            send(["status": "gameCenterError", "message": "Unable to present Game Center."]); return
        }
        while let next = presenter.presentedViewController { presenter = next }
        presenter.present(controller, animated: true)
    }

    func gameCenterViewControllerDidFinish(_ gameCenterViewController: GKGameCenterViewController) {
        gameCenterViewController.dismiss(animated: true)
    }

    private func showManageSubscriptions() async {
        guard let scene = webView?.window?.windowScene else {
            send(["status": "error", "message": "Unable to open subscription management."]); return
        }
        do {
            try await AppStore.showManageSubscriptions(in: scene)
            await sendEntitlements(status: "ready")
        } catch {
            send(["status": "error", "message": "Subscription management is unavailable right now."])
        }
    }

    private func verified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result { case .verified(let safe): return safe; case .unverified: throw StoreBridgeError.failedVerification }
    }

    private func send(_ payload: [String: Any]) {
        guard JSONSerialization.isValidJSONObject(payload),
              let data = try? JSONSerialization.data(withJSONObject: payload),
              let json = String(data: data, encoding: .utf8) else { return }
        webView?.evaluateJavaScript("window.powerPlantStoreKitResult(\(json));")
    }
}

enum StoreBridgeError: Error { case failedVerification }
