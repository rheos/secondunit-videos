// Word boxes on every Nth frame of a video, from macOS Vision, as JSON lines.
//
//   swiftc -O tools/ocr_frames.swift -o <bin>
//   <bin> <video> <out.jsonl> [step=6] [start=0] [end=all]
//   <bin> <video> <out.jsonl> --frames <list.txt> [--fast]     only the listed frames
//
// One line per sampled frame: {"f": frame, "w": [[x0, y0, x1, y1, conf, "text"], ...]} with boxes in
// 0-1 of the frame, y down. Boxes are per word (Vision's line split on spaces), so a window edge can
// be checked against each word. Used by panscan_4x5.py to keep burned-in text inside the 4:5 window.
import AVFoundation
import Foundation
import Vision

let a = CommandLine.arguments
guard a.count >= 3 else { print("usage: ocr_frames <video> <out.jsonl> [step] [start] [end] | --frames <list.txt> [--fast]"); exit(2) }
// --frames <file>: OCR exactly these frames (one number per line); --fast: Vision's fast level (boxes only matter)
var only: Set<Int>? = nil
if let k = a.firstIndex(of: "--frames") {
    only = Set(try! String(contentsOfFile: a[k + 1], encoding: .utf8).split(whereSeparator: \.isNewline).compactMap { Int($0) })
}
let fast = a.contains("--fast")
let plain = a.count > 3 && Int(a[3]) != nil
let step = plain ? Int(a[3])! : 6
let first = plain && a.count > 4 ? Int(a[4])! : 0
let last = only.map { $0.max() ?? 0 } ?? (plain && a.count > 5 ? Int(a[5])! : Int.max)

let asset = AVURLAsset(url: URL(fileURLWithPath: a[1]))
let track = asset.tracks(withMediaType: .video)[0]
let reader = try! AVAssetReader(asset: asset)
let output = AVAssetReaderTrackOutput(track: track, outputSettings: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA])
output.alwaysCopiesSampleData = false
reader.add(output)
reader.startReading()
FileManager.default.createFile(atPath: a[2], contents: nil)
let out = FileHandle(forWritingAtPath: a[2])!

func r4(_ v: CGFloat) -> Double { (Double(v) * 10000).rounded() / 10000 }

var i = 0
while let sb = output.copyNextSampleBuffer() {
    defer { i += 1 }
    if i > last { break }
    if let o = only { if !o.contains(i) { continue } } else if i < first || (i - first) % step != 0 { continue }
    guard let px = CMSampleBufferGetImageBuffer(sb) else { continue }
    let req = VNRecognizeTextRequest()
    req.recognitionLevel = fast ? .fast : .accurate
    req.usesLanguageCorrection = false
    req.minimumTextHeight = 0.008
    try? VNImageRequestHandler(cvPixelBuffer: px, options: [:]).perform([req])
    var words: [[Any]] = []
    for obs in req.results ?? [] {
        guard let cand = obs.topCandidates(1).first else { continue }
        let s = cand.string
        var idx = s.startIndex
        // split the line into words and box each one
        for part in s.split(separator: " ", omittingEmptySubsequences: true) {
            guard let r = s.range(of: part, range: idx..<s.endIndex) else { continue }
            idx = r.upperBound
            guard let box = try? cand.boundingBox(for: r)?.boundingBox else { continue }
            words.append([r4(box.minX), r4(1 - box.maxY), r4(box.maxX), r4(1 - box.minY),
                          (Double(cand.confidence) * 100).rounded() / 100, String(part)])
        }
    }
    let line = try! JSONSerialization.data(withJSONObject: ["f": i, "w": words])
    out.write(line); out.write("\n".data(using: .utf8)!)
    if i % 600 == 0 { FileHandle.standardError.write("\(i)\n".data(using: .utf8)!) }
}
out.closeFile()
