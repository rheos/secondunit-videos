"""Track a clip for the doodle layer.

Writes data/track_<clip>.json with, per 24 fps frame:
  cam:  [a, b, c, d, tx, ty], the affine that maps a frame-0 point to where it sits in this frame
        (background features, LK flow, RANSAC), so doodles pinned to the world ride the handheld camera;
  pose: 33 MediaPipe landmarks [x, y, visibility] in pixels, or null when no person is found.
With --masks, also writes the person's segmentation mask per frame to work/mask_<clip>/m_NNNNN.png (gitignored).

uv run --no-project --with opencv-python-headless --with mediapipe --with numpy python tools/track.py walk
"""
import json
import sys
import urllib.request
from pathlib import Path

import cv2
import numpy as np

HERE = Path(__file__).resolve().parent.parent
MODEL = HERE / "work" / "pose_landmarker_heavy.task"
MODEL_URL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/latest/pose_landmarker_heavy.task"


def camera_track(frames, person_boxes):
    """Cumulative affine frame0 -> frame i from frame-to-frame LK flow on background corners."""
    acc = np.eye(3)
    out = [acc[:2].flatten().tolist()]
    prev = cv2.cvtColor(frames[0], cv2.COLOR_BGR2GRAY)
    for i in range(1, len(frames)):
        cur = cv2.cvtColor(frames[i], cv2.COLOR_BGR2GRAY)
        mask = np.full(prev.shape, 255, np.uint8)
        box = person_boxes[i - 1]
        if box:
            x0, y0, x1, y1 = box
            mask[max(0, y0):y1, max(0, x0):x1] = 0
        pts = cv2.goodFeaturesToTrack(prev, 600, 0.01, 8, mask=mask)
        m = np.eye(3)
        if pts is not None and len(pts) > 8:
            nxt, st, _ = cv2.calcOpticalFlowPyrLK(prev, cur, pts, None, winSize=(21, 21), maxLevel=3)
            good = st.ravel() == 1
            if good.sum() > 8:
                a, _ = cv2.estimateAffinePartial2D(pts[good], nxt[good], method=cv2.RANSAC, ransacReprojThreshold=2.0)
                if a is not None:
                    m = np.vstack([a, [0, 0, 1]])
        acc = m @ acc
        out.append(acc[:2].flatten().tolist())
        prev = cur
    return out


def pose_track(frames, mask_dir=None):
    import mediapipe as mp
    from mediapipe.tasks.python import BaseOptions, vision

    if not MODEL.exists():
        urllib.request.urlretrieve(MODEL_URL, MODEL)
    opts = vision.PoseLandmarkerOptions(base_options=BaseOptions(model_asset_path=str(MODEL)),
                                        running_mode=vision.RunningMode.VIDEO, num_poses=1,
                                        min_pose_detection_confidence=0.3, min_tracking_confidence=0.3,
                                        output_segmentation_masks=True)
    poses, boxes = [], []
    with vision.PoseLandmarker.create_from_options(opts) as lm:
        for i, f in enumerate(frames):
            h, w = f.shape[:2]
            img = mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(f, cv2.COLOR_BGR2RGB))
            r = lm.detect_for_video(img, int(i * 1000 / 24))
            if mask_dir is not None:
                m = np.zeros((h, w), np.uint8)
                if r.segmentation_masks:
                    v = r.segmentation_masks[0].numpy_view(); v = v[..., 0] if v.ndim == 3 else v
                    m = (np.clip(v, 0, 1) * 255).astype(np.uint8)
                cv2.imwrite(str(mask_dir / f"m_{i:05d}.png"), m)
            if r.pose_landmarks:
                p = [[round(l.x * w, 1), round(l.y * h, 1), round(l.visibility, 2)] for l in r.pose_landmarks[0]]
                xs = [q[0] for q in p]; ys = [q[1] for q in p]
                pad = 0.25 * (max(ys) - min(ys)) + 20
                boxes.append([int(min(xs) - pad), int(min(ys) - pad * 1.6), int(max(xs) + pad), int(max(ys) + pad)])
                poses.append(p)
            else:
                poses.append(None); boxes.append(None)
    return poses, boxes


def main():
    clip = sys.argv[1]
    cap = cv2.VideoCapture(str(HERE / "work" / f"{clip}.mp4"))
    frames = []
    while True:
        ok, f = cap.read()
        if not ok:
            break
        frames.append(f)
    h, w = frames[0].shape[:2]
    mask_dir = None
    if "--masks" in sys.argv:
        mask_dir = HERE / "work" / f"mask_{clip}"; mask_dir.mkdir(exist_ok=True)
    poses, boxes = pose_track(frames, mask_dir)
    cam = camera_track(frames, boxes)
    (HERE / "data").mkdir(exist_ok=True)
    out = HERE / "data" / f"track_{clip}.json"
    out.write_text(json.dumps({"clip": clip, "w": w, "h": h, "fps": 24, "n": len(frames), "cam": cam, "pose": poses}))
    found = sum(p is not None for p in poses)
    print(f"{out.name}: {len(frames)} frames, pose found in {found}")


if __name__ == "__main__":
    main()
