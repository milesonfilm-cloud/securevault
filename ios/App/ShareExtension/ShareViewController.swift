import UIKit
import UniformTypeIdentifiers

/// Share Extension: receive images/PDFs/text from WhatsApp and other apps,
/// stash them in the App Group, then open SecureVault.
class ShareViewController: UIViewController {
    private let appGroupId = "group.com.securevault.app"
    private let urlScheme = "securevault"

    private var texts: [String] = []
    private var files: [[String: Any]] = []
    private let stateLock = NSLock()

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground

        guard let extensionItem = extensionContext?.inputItems.first as? NSExtensionItem,
              let attachments = extensionItem.attachments, !attachments.isEmpty else {
            complete()
            return
        }

        Task { @MainActor in
            for (index, attachment) in attachments.enumerated() {
                await processAttachment(attachment, index: index)
            }
            saveAndRedirect(title: extensionItem.attributedTitle?.string ?? extensionItem.attributedContentText?.string ?? "")
        }
    }

    private func processAttachment(_ attachment: NSItemProvider, index: Int) async {
        if attachment.hasItemConformingToTypeIdentifier(UTType.image.identifier) {
            do {
                let data = try await attachment.loadItem(forTypeIdentifier: UTType.image.identifier)
                if let url = data as? URL, let saved = saveFileToGroup(url) {
                    appendFile(uri: saved.absoluteString, name: url.lastPathComponent, mime: mimeForPath(url.pathExtension, fallback: "image/jpeg"))
                } else if let image = data as? UIImage, let saved = saveImageToGroup(image, index: index) {
                    appendFile(uri: saved.absoluteString, name: "share_\(index).png", mime: "image/png")
                } else if let data = data as? Data, let image = UIImage(data: data), let saved = saveImageToGroup(image, index: index) {
                    appendFile(uri: saved.absoluteString, name: "share_\(index).png", mime: "image/png")
                }
            } catch {
                /* ignore */
            }
            return
        }

        if attachment.hasItemConformingToTypeIdentifier(UTType.pdf.identifier) {
            do {
                let data = try await attachment.loadItem(forTypeIdentifier: UTType.pdf.identifier)
                if let url = data as? URL, let saved = saveFileToGroup(url) {
                    appendFile(uri: saved.absoluteString, name: url.lastPathComponent, mime: "application/pdf")
                } else if let data = data as? Data, let saved = saveDataToGroup(data, name: "share_\(index).pdf") {
                    appendFile(uri: saved.absoluteString, name: "share_\(index).pdf", mime: "application/pdf")
                }
            } catch {
                /* ignore */
            }
            return
        }

        if attachment.hasItemConformingToTypeIdentifier(UTType.fileURL.identifier) {
            do {
                if let url = try await attachment.loadItem(forTypeIdentifier: UTType.fileURL.identifier) as? URL,
                   let saved = saveFileToGroup(url) {
                    appendFile(
                        uri: saved.absoluteString,
                        name: url.lastPathComponent,
                        mime: mimeForPath(url.pathExtension, fallback: "application/octet-stream")
                    )
                }
            } catch {
                /* ignore */
            }
            return
        }

        if attachment.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
            do {
                if let url = try await attachment.loadItem(forTypeIdentifier: UTType.url.identifier) as? URL {
                    if url.isFileURL, let saved = saveFileToGroup(url) {
                        appendFile(
                            uri: saved.absoluteString,
                            name: url.lastPathComponent,
                            mime: mimeForPath(url.pathExtension, fallback: "application/octet-stream")
                        )
                    } else {
                        appendText(url.absoluteString)
                    }
                }
            } catch {
                /* ignore */
            }
            return
        }

        if attachment.hasItemConformingToTypeIdentifier(UTType.plainText.identifier) {
            do {
                if let text = try await attachment.loadItem(forTypeIdentifier: UTType.plainText.identifier) as? String {
                    appendText(text)
                }
            } catch {
                /* ignore */
            }
        }
    }

    private func appendText(_ text: String) {
        stateLock.lock()
        texts.append(text)
        stateLock.unlock()
    }

    private func appendFile(uri: String, name: String, mime: String) {
        stateLock.lock()
        files.append(["uri": uri, "name": name, "mimeType": mime])
        stateLock.unlock()
    }

    private func saveAndRedirect(title: String) {
        stateLock.lock()
        let shareData: [String: Any] = [
            "title": title,
            "texts": texts,
            "files": files,
        ]
        stateLock.unlock()

        let defaults = UserDefaults(suiteName: appGroupId)
        defaults?.set(shareData, forKey: "share-target-data")
        defaults?.synchronize()

        if let url = URL(string: "\(urlScheme)://share") {
            openHostApp(url)
        } else {
            complete()
        }
    }

    private func containerURL() -> URL? {
        FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroupId)
    }

    private func saveFileToGroup(_ url: URL) -> URL? {
        guard let container = containerURL() else { return nil }
        let dest = container.appendingPathComponent(url.lastPathComponent)
        try? FileManager.default.removeItem(at: dest)
        do {
            try FileManager.default.copyItem(at: url, to: dest)
            return dest
        } catch {
            // Some providers only allow reading data — fall back to Data copy
            guard let data = try? Data(contentsOf: url) else { return nil }
            try? data.write(to: dest)
            return dest
        }
    }

    private func saveImageToGroup(_ image: UIImage, index: Int) -> URL? {
        guard let container = containerURL(), let data = image.pngData() else { return nil }
        let dest = container.appendingPathComponent("share_\(index).png")
        try? data.write(to: dest)
        return dest
    }

    private func saveDataToGroup(_ data: Data, name: String) -> URL? {
        guard let container = containerURL() else { return nil }
        let dest = container.appendingPathComponent(name)
        try? data.write(to: dest)
        return dest
    }

    private func mimeForPath(_ ext: String, fallback: String) -> String {
        switch ext.lowercased() {
        case "png": return "image/png"
        case "jpg", "jpeg": return "image/jpeg"
        case "webp": return "image/webp"
        case "heic": return "image/heic"
        case "pdf": return "application/pdf"
        case "txt": return "text/plain"
        default: return fallback
        }
    }

    private func openHostApp(_ url: URL) {
        var responder: UIResponder? = self
        let selector = sel_registerName("openURL:")
        while let r = responder {
            if r.responds(to: selector) {
                r.perform(selector, with: url)
                break
            }
            responder = r.next
        }
        complete()
    }

    private func complete() {
        extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
    }
}
