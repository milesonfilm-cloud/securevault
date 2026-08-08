import Foundation
import Capacitor
import UIKit

/**
 * SecureVault-tuned Capgo Share Target plugin (Capacitor 7).
 * Reads appGroupId from capacitor.config; polls App Group UserDefaults on
 * open-URL and didBecomeActive so the Share Extension can hand off files.
 */
@objc(CapacitorShareTargetPlugin)
public class CapacitorShareTargetPlugin: CAPPlugin, CAPBridgedPlugin {
    private let pluginVersion: String = "7.0.8"
    public let identifier = "CapacitorShareTargetPlugin"
    public let jsName = "CapacitorShareTarget"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getPluginVersion", returnType: CAPPluginReturnPromise)
    ]

    override public func load() {
        super.load()

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleOpenURL(_:)),
            name: .capacitorOpenURL,
            object: nil
        )

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleAppDidBecomeActive),
            name: UIApplication.didBecomeActiveNotification,
            object: nil
        )

        checkForSharedContent()
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
    }

    @objc private func handleOpenURL(_ notification: Notification) {
        guard let object = notification.object as? [String: Any],
              let url = object["url"] as? URL else {
            return
        }

        if (url.scheme == "capacitor" && url.host == "share")
            || url.host == "share"
            || url.path == "/share"
            || (url.scheme == "securevault" && (url.host == "share" || url.path.contains("share"))) {
            checkForSharedContent()
        }
    }

    @objc private func handleAppDidBecomeActive(_ notification: Notification) {
        checkForSharedContent()
    }

    private func resolvedAppGroupId() -> String {
        if let fromConfig = getConfig().getString("appGroupId"), !fromConfig.isEmpty {
            return fromConfig
        }
        return "group.com.securevault.app"
    }

    private func checkForSharedContent() {
        let appGroupId = resolvedAppGroupId()
        guard let userDefaults = UserDefaults(suiteName: appGroupId) else {
            return
        }

        let possibleKeys = ["share-target-data", "SharedData"]
        var sharedData: [String: Any]?
        var usedKey: String?

        for key in possibleKeys {
            if let data = userDefaults.dictionary(forKey: key) {
                sharedData = data
                usedKey = key
                break
            }
        }

        guard let data = sharedData, let key = usedKey else {
            return
        }

        var shareEvent: [String: Any] = [:]
        shareEvent["title"] = data["title"] as? String ?? ""

        var texts: [String] = []
        if let sharedTexts = data["texts"] as? [String] {
            texts = sharedTexts
        } else if let sharedTexts = data["texts"] as? [[String: Any]] {
            texts = sharedTexts.compactMap { $0["value"] as? String }
        }
        shareEvent["texts"] = texts

        var files: [[String: Any]] = []
        if let sharedFiles = data["files"] as? [[String: Any]] {
            files = sharedFiles
        }
        shareEvent["files"] = files

        userDefaults.removeObject(forKey: key)
        userDefaults.synchronize()

        notifyListeners("shareReceived", data: shareEvent, retainUntilConsumed: true)
    }

    @objc func getPluginVersion(_ call: CAPPluginCall) {
        call.resolve(["version": self.pluginVersion])
    }
}
