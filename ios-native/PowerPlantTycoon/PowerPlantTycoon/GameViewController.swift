import UIKit
import WebKit

@MainActor
final class GameViewController: UIViewController, WKNavigationDelegate {
    private var webView: WKWebView!
    private var storeKitBridge: PowerPlantStoreKitBridge!
    private var adsBridge: PowerPlantAdsBridge!

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 0.02, green: 0.07, blue: 0.11, alpha: 1.0)

        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        webView = WKWebView(frame: .zero, configuration: config)
        webView.translatesAutoresizingMaskIntoConstraints = false
        webView.navigationDelegate = self
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.isOpaque = false
        webView.backgroundColor = .clear

        storeKitBridge = PowerPlantStoreKitBridge(webView: webView)
        adsBridge = PowerPlantAdsBridge(webView: webView, viewController: self)
        webView.configuration.userContentController.add(storeKitBridge, name: PowerPlantStoreKitBridge.messageHandlerName)
        webView.configuration.userContentController.add(adsBridge, name: PowerPlantAdsBridge.messageHandlerName)

        view.addSubview(webView)
        NSLayoutConstraint.activate([
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            webView.topAnchor.constraint(equalTo: view.topAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])

        guard let indexURL = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "www") else {
            assertionFailure("Missing www/index.html in app bundle")
            return
        }
        webView.loadFileURL(indexURL, allowingReadAccessTo: indexURL.deletingLastPathComponent())
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        Task { await storeKitBridge.bootstrap(); await adsBridge.bootstrap() }
    }

    func webView(_ webView: WKWebView,
                 decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else {
            decisionHandler(.allow)
            return
        }

        if url.isFileURL || url.scheme == "about" {
            decisionHandler(.allow)
            return
        }

        if navigationAction.navigationType == .linkActivated,
           let scheme = url.scheme?.lowercased(),
           scheme == "http" || scheme == "https" {
            UIApplication.shared.open(url)
            decisionHandler(.cancel)
            return
        }

        decisionHandler(.allow)
    }

    deinit {
        webView?.configuration.userContentController.removeScriptMessageHandler(forName: PowerPlantStoreKitBridge.messageHandlerName)
        webView?.configuration.userContentController.removeScriptMessageHandler(forName: PowerPlantAdsBridge.messageHandlerName)
    }
}
