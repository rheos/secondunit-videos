// Song times for the medical-chart look (verse 2). Whisper word times snapped to energy-rise onsets
// in the 300-3500 Hz band of assets/song.wav (rise > 2.5 dB over 40 ms). No vocal stem exists yet.
const B = {
  t0: 70.5, t1: 119.5,
  line1: 71.68,     // "the doctor asks me girl..."
  doctor: 72.39, asks: 73.77, girl: 74.06, what: 74.52, idling: 75.14,
  bk1a: 77.15, bk1b: 79.92,   // backing "you don't love me" x2: petals 1, 2
  flip1: 82.15,
  laugh: 82.99, winter: 84.47, feel: 85.43, bee: 86.50, sting: 87.49,
  bk2a: 88.16, bk2b: 90.90,   // petals 3, 4
  flip2: 92.95,
  wouldnt: 94.35, get: 95.06, even: 96.08, free: 97.60,
  bk3a: 99.13, bk3b: 101.90,  // petals 5, 6
  flip3: 104.25,
  youre: 104.99, stupid: 106.41, record: 107.77, company: 108.34,
  bk4a: 109.99, bk4b: 112.72, // petals 7, 8
  last: 115.70,               // "you don't love me": petal 9, the last one
  end: 118.30,
};
const PETAL_DROPS = [B.bk1a, B.bk1b, B.bk2a, B.bk2b, B.bk3a, B.bk3b, B.bk4a, B.bk4b, B.last];
