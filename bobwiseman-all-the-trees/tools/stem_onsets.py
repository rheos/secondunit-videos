"""Note attacks in the 'other' Demucs stem (brass, keys, guitar), for snapping a listener's held-key
trumpet marks to real attacks. Usage: stem_onsets.py <other.wav> <out.json>"""
import sys, json, numpy as np, librosa
y, sr = librosa.load(sys.argv[1], sr=22050, mono=True)
hop = 256
# Weight the trumpet's strong partials (roughly 400-3000 Hz) when measuring onset strength.
S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop))
f = librosa.fft_frequencies(sr=sr, n_fft=2048)
w = ((f > 380) & (f < 3200)).astype(float)
env = librosa.onset.onset_strength(S=librosa.amplitude_to_db(S * w[:, None], ref=np.max), sr=sr, hop_length=hop)
on = librosa.onset.onset_detect(onset_envelope=env, sr=sr, hop_length=hop, backtrack=False, units='frames', delta=.06, wait=3)
peak = float(env.max())
rms = librosa.feature.rms(S=S * w[:, None], frame_length=2048, hop_length=hop)[0]
out = {'hop_s': hop / sr, 'onsets': [{'t': round(float(i * hop / sr), 3), 's': round(float(env[i] / peak), 3)} for i in on],
       'rms': [round(float(v), 5) for v in rms]}
json.dump(out, open(sys.argv[2], 'w'))
print(len(on), 'onsets')
