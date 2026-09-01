# Field Data Collection & Video Ingestion Protocol
## Anna Salai Arterial Corridor (Chennai)

This directory serves as the root structure for capturing, organizing, and preprocessing raw field footage from the 3 locked experimental research junctions along Anna Salai before extracting keyframes for CVAT/Roboflow annotation.

---

## 1. Directory Hierarchy

```
field-footage/
├── spencers-plaza/          # Primary reference junction (Thousand Lights approach)
│   ├── morning-peak/        # 08:00 - 10:00 AM (Moderate / Commuter flow)
│   ├── midday/              # 12:00 - 02:00 PM (Heavy vendor / stall activity)
│   └── offpeak/             # 11:00 - 12:00 PM or 03:00 - 04:00 PM (Light baseline)
├── gemini-flyover/          # Complex multi-approach arterial interchange
│   ├── morning-peak/
│   ├── midday/
│   └── offpeak/
└── nandanam-usman/          # Southbound commercial bottleneck & connector
    ├── morning-peak/
    ├── midday/
    └── offpeak/
```

---

## 2. Standardized File Naming Convention

All raw `.mp4` video files must strictly follow this naming syntax:

```
[junction]_[date]_[timewindow]_[takenumber].mp4
```

### Examples:
- `spencers-plaza_2026-09-05_morning-peak_01.mp4`
- `spencers-plaza_2026-09-05_midday_01.mp4`
- `gemini-flyover_2026-09-05_midday_01.mp4`
- `nandanam-usman_2026-09-06_offpeak_01.mp4`

---

## 3. Filming & Sensor Placement Parameters

| Parameter | Specification | Purpose |
| :--- | :--- | :--- |
| **Angle / Position** | Elevated ($5.5\text{m} - 8.0\text{m}$ mounting height) | Reduces bounding-box occlusion in dense mixed traffic |
| **Framing** | Fixed tripod / stable rest, Landscape | Ensures stable homography for lateral lane intrusion measurement |
| **Resolution** | 1080p ($1920 \times 1080$) @ 30fps minimum | High detail for small class distinctions (`vendor_cart` vs `illegal_stall`) |
| **Duration** | 5 to 10 minutes continuous per session | Samples 3–6 full signal cycles (60s–120s cycle length) |
| **Field of View** | Stop line + 45m upstream approach | Captures effective curb width $W_{\text{eff}}$ and queuing shockwaves |

---

## 4. Single-Clip Calibration & Dry-Run Test (Mandatory Before Batch Ingestion)

Before running extraction across all recorded footage, execute a single-clip dry run on your first recording (`spencers-plaza` morning-peak) to calibrate scene sensitivity:

1. **Create Output Subfolder**:
   ```bash
   mkdir -p dataset/raw_frames/spencers-plaza/morning-peak
   ```
2. **Execute Single-Clip Dry Run Extraction**:
   ```bash
   SCENE_THRESH=0.25
   INTERVAL_SEC=5
   MAX_FRAMES=150

   ffmpeg -i field-footage/spencers-plaza/morning-peak/spencers-plaza_2026-09-05_morning-peak_01.mp4 \
     -vf "select='isnan(prev_selected_t)+gte(t-prev_selected_t,${INTERVAL_SEC})+gt(scene,${SCENE_THRESH})'" \
     -vsync vfr \
     -frames:v ${MAX_FRAMES} \
     -q:v 2 \
     dataset/raw_frames/spencers-plaza/morning-peak/dryrun_%04d.jpg
   ```
3. **Audit Frame Count**:
   Count extracted files:
   ```bash
   ls -1 dataset/raw_frames/spencers-plaza/morning-peak/dryrun_*.jpg | wc -l
   ```
   - Target range for 5–10 min clip: **60 to 120 frames**.
   - If output hits the safety cap (`150`), the threshold is over-triggering on normal vehicle movement: **increase `SCENE_THRESH` to 0.30 or 0.35**.
   - If output only yields ~1 frame per 5 seconds with zero scene-change captures: **decrease `SCENE_THRESH` to 0.20**.
4. **Visual Inspection**:
   Manually check ~10 sample images across different signal cycles to verify diverse obstruction events (e.g. vendors setting up, curb parking, pedestrian overflow) and absent blur.
5. **Proceed to Batch Extraction**:
   Only after confirming calibrated parameters on clip 1, run the command across all remaining junction folders.

---

## 5. Batch Keyframe Extraction Commands (Hybrid Sampling + Safety Cap)

Use the calibrated parameters with the `-frames:v` hard safety ceiling:

```bash
# Configurable extraction parameters:
SCENE_THRESH=0.25      # Calibrated visual change trigger (0.20 - 0.35 range)
INTERVAL_SEC=5         # Minimum 5-second temporal baseline interval
MAX_FRAMES=150         # Hard ceiling safety cap per 5-10 minute clip

# Example for Spencers Plaza midday clip:
mkdir -p dataset/raw_frames/spencers-plaza/midday

ffmpeg -i field-footage/spencers-plaza/midday/spencers-plaza_2026-09-05_midday_01.mp4 \
  -vf "select='isnan(prev_selected_t)+gte(t-prev_selected_t,${INTERVAL_SEC})+gt(scene,${SCENE_THRESH})'" \
  -vsync vfr \
  -frames:v ${MAX_FRAMES} \
  -q:v 2 \
  dataset/raw_frames/spencers-plaza/midday/spencers_midday_%04d.jpg
```

---

## 6. Offline Quality Filtering & Coverage Audit

After extracting raw frames, run the automated quality and safety auditor:

```bash
python3 pipeline/filter_keyframes.py \
  --input-dir dataset/raw_frames \
  --output-dir keyframes \
  --max-frames-per-clip 150 \
  --blur-threshold 100.0 \
  --min-brightness 40.0 \
  --max-brightness 215.0
```

### Filtering Operations:
1. **Blur Detection**: Calculates Laplacian variance $\sigma^2_{\text{Laplacian}}$. Flags motion-blurred frames below threshold 100.
2. **Exposure Check**: Assesses mean luminance $\bar{I} \in [40, 215]$ to flag harsh glare or underexposed frames.
3. **Safety Cap Warning**: Flags any folder exceeding `--max-frames-per-clip` (150) to alert against over-extraction before annotation.
4. **Automated Sorting**: Sorts frames into `keyframes/accepted/` and `keyframes/flagged-for-review/`.
5. **Coverage Matrix**: Outputs a console breakdown per junction/time-window to ensure balanced distribution.

Target ~250–300 accepted frames per junction across all 3 time windows to produce the balanced **750–900 frame** dataset for the 4-class taxonomy:
1. `vendor_cart` (Class 0)
2. `double_parked_vehicle` (Class 1)
3. `illegal_stall` (Class 2)
4. `pedestrian_spillover` (Class 3)
