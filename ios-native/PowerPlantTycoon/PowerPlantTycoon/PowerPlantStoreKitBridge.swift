import Foundation
import StoreKit
import WebKit

@MainActor
final class PowerPlantStoreKitBridge: NSObject, WKScriptMessageHandler {
    static let messageHandlerName = "powerPlantStoreKit"

    static let autoGenerateProductID = "com.calascointeractive.powerplanttycoon.autogenerate"
    static let removeAdsProductID = "com.calascointeractive.powerplanttycoon.removeads"
    static let executiveLicenseProductID = "com.calascointeractive.powerplanttycoon.executivelicense"
    static let turboGridProductID = "com.calascointeractive.powerplanttycoon.turbogrid"
    static let maintenanceCrateProductID = "com.calascointeractive.powerplanttycoon.maintenancecrate"
    static let capitalInjectionProductID = "com.calascointeractive.powerplanttycoon.capitalinjection"
    static let allProductIDs: Set<String> = [
        autoGenerateProductID, removeAdsProductID, executiveLicenseProductID,
        turboGridProductID, maintenanceCrateProductID, capitalInjectionProductID
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
        await sendEntitlements(status: "ready")
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
            send(["status": "error", "message": "Unknown purchase item."]); return
        }
        do {
            let product: Product
            if let cached = products[productID] { product = cached }
            else {
                let fetched = try await Product.products(for: [productID])
                guard let first = fetched.first else { send(["status": "error", "message": "Purchase item is not available."]); return }
                products[productID] = first; product = first
            }
            let result = try await product.purchase()
            switch result {
            case .success(let verification):
                let transaction = try verified(verification)
                let txID = String(transaction.id)
                await transaction.finish()
                await sendEntitlements(status: "purchased", productID: transaction.productID, transactionID: txID)
            case .pending: send(["status": "pending", "productID": productID])
            case .userCancelled: send(["status": "cancelled", "productID": productID])
            @unknown default: send(["status": "error", "message": "Unknown App Store purchase result."])
            }
        } catch {
            send(["status": "error", "message": "The purchase could not be completed."])
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
            for await result in Transaction.updates {
                guard !Task.isCancelled else { return }
                if case .verified(let transaction) = result { await transaction.finish() }
                await self?.sendEntitlements(status: "entitlements")
            }
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
