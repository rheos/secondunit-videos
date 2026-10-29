"""Freeze source audio energy into deterministic, local animation controls."""
import json, wave
from pathlib import Path
import numpy as np

root = Path(__file__).parent
with wave.open(str(root / 'assets/audio/travel-agent-51-71.wav')) as f:
    sr, channels = f.getframerate(), f.getnchannels()
    pcm = np.frombuffer(f.readframes(f.getnframes()), dtype='<i2').astype(np.float64)
    pcm = pcm.reshape(-1, channels).mean(axis=1) / 32768
hop = int(sr / 50)
size = 2048
freq = np.fft.rfftfreq(size, 1 / sr)
rows = []
for i in range(1001):
    start = i * hop
    chunk = pcm[max(0, start - size // 2):start + size // 2]
    chunk = np.pad(chunk, (0, max(0, size - len(chunk))))[:size]
    spec = abs(np.fft.rfft(chunk * np.hanning(size))) ** 2
    rows.append([np.sqrt(np.mean(chunk ** 2)), np.sqrt(spec[freq < 350].sum()),
                 np.sqrt(spec[(freq > 1500) & (freq < 8000)].sum())])
rows = np.asarray(rows)
for j in range(3):
    rows[:, j] /= max(float(np.percentile(rows[:, j], 95)), 1e-8)
rows = np.minimum(rows, 1.4)
flux = np.maximum(0, np.diff(rows[:, 0], prepend=rows[0, 0]))
peaks = []
for i in range(2, len(flux) - 2):
    if flux[i] > .07 and flux[i] == max(flux[i-2:i+3]):
        if not peaks or i / 50 - peaks[-1] > .16:
            peaks.append(round(i / 50, 3))
data = {'sourceOffset': 51, 'duration': 20, 'rate': 50,
        'bands': [[round(float(v), 4) for v in row] for row in rows],
        'accents': peaks, 'sunCue': 16.58}
(root / 'assets/audio/features.json').write_text(json.dumps(data))
(root / 'assets/audio/features.js').write_text('window.TRAVEL_AUDIO = ' + json.dumps(data) + ';\n')
print(f'{len(rows)} control samples; {len(peaks)} accents; sun at local 16.58s')
