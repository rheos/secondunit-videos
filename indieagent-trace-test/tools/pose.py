# pose.py: per-frame body landmarks from a base clip with MediaPipe PoseLandmarker (heavy), run locally.
#   uv run --python 3.11 --with mediapipe --with opencv-python-headless python tools/pose.py _in/base.mp4 assets/pose_raw.json [--overlay out/overlay.mp4]
# Output: {fps, w, h, frames: [[ [x_px, y_px, visibility] x 33 ] or null]}. Pixel coords, y down.
# The overlay draws the skeleton on the source so the trace can be checked by eye (near side orange, far side blue).
import json, sys, argparse
import cv2
import mediapipe as mp
from mediapipe.tasks.python import vision, BaseOptions

ap = argparse.ArgumentParser()
ap.add_argument('src'); ap.add_argument('out'); ap.add_argument('--overlay'); ap.add_argument('--model', default='_in/pose_landmarker_heavy.task')
a = ap.parse_args()

cap = cv2.VideoCapture(a.src)
fps = cap.get(cv2.CAP_PROP_FPS); W = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)); H = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
lm = vision.PoseLandmarker.create_from_options(vision.PoseLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=a.model), running_mode=vision.RunningMode.VIDEO,
    num_poses=1, min_pose_detection_confidence=.5, min_tracking_confidence=.5))
vw = cv2.VideoWriter(a.overlay, cv2.VideoWriter_fourcc(*'mp4v'), fps, (W, H)) if a.overlay else None
BONES = [(11, 12), (11, 23), (12, 24), (23, 24), (11, 13), (13, 15), (12, 14), (14, 16), (23, 25), (25, 27), (27, 29), (29, 31), (27, 31), (24, 26), (26, 28), (28, 30), (30, 32), (28, 32), (7, 0), (8, 0)]
frames, i = [], 0
while True:
    ok, img = cap.read()
    if not ok: break
    res = lm.detect_for_video(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(img, cv2.COLOR_BGR2RGB)), int(i * 1000 / fps))
    if res.pose_landmarks:
        pts = [[p.x * W, p.y * H, p.visibility] for p in res.pose_landmarks[0]]
        frames.append(pts)
        if vw is not None:
            for b0, b1 in BONES:
                col = (40, 140, 255) if b0 % 2 else (255, 150, 40)   # odd = left landmarks
                cv2.line(img, tuple(int(v) for v in pts[b0][:2]), tuple(int(v) for v in pts[b1][:2]), col, 2, cv2.LINE_AA)
    else:
        frames.append(None)
    if vw is not None:
        cv2.putText(img, f'f{i}', (8, 22), cv2.FONT_HERSHEY_SIMPLEX, .6, (255, 255, 255), 2); vw.write(img)
    i += 1
if vw is not None: vw.release()
json.dump({'fps': fps, 'w': W, 'h': H, 'frames': frames}, open(a.out, 'w'))
print(f'{i} frames, {sum(f is None for f in frames)} missed, {fps} fps, {W}x{H}')
