// macOS Vision OCR: görüntüdeki satırları ve kutularını JSON olarak verir (koordinatlar 0..1, sol üst köken).
import Foundation
import Vision
import AppKit

let path = CommandLine.arguments[1]
guard let img = NSImage(contentsOfFile: path), let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else { exit(1) }
let req = VNRecognizeTextRequest()
req.recognitionLevel = .accurate
req.usesLanguageCorrection = false
req.recognitionLanguages = ["en-US", "tr-TR"]
let h = VNImageRequestHandler(cgImage: cg, options: [:])
try h.perform([req])
var out: [[String: Any]] = []
for o in req.results ?? [] {
  guard let c = o.topCandidates(1).first else { continue }
  let b = o.boundingBox
  out.append(["t": c.string, "x": b.minX, "y": 1 - b.maxY, "w": b.width, "h": b.height, "c": c.confidence])
}
let data = try JSONSerialization.data(withJSONObject: out, options: [])
FileHandle.standardOutput.write(data)
