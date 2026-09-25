# EncroachAI Dataset Structure (YOLOv10 / Ultralytics Format)

This directory follows the canonical Ultralytics YOLO dataset specification referenced by `pipeline/encroachai_dataset.yaml`.

```
dataset/
├── images/
│   ├── train/     # Training images (.jpg, .png)
│   ├── val/       # Validation images (.jpg, .png)
│   └── test/      # Test / holdout benchmark images (.jpg, .png)
└── labels/
    ├── train/     # YOLO bounding box label files (.txt)
    ├── val/       # Validation label files (.txt)
    └── test/      # Test label files (.txt)
```

## Annotation Format
Each `.txt` file corresponds to an image of the identical basename (e.g. `spencers_001.jpg` -> `spencers_001.txt`).
Each line represents one encroachment detection in normalized format:
```
<class_id> <x_center> <y_center> <width> <height>
```
All coordinate values are normalized between `0.0` and `1.0`.

## 4-Class Encroachment Taxonomy
| Class ID | Class Name | Description | Nominal Lane Incursion |
|---|---|---|---|
| `0` | `vendor_cart` | Mobile wooden/metal handcart selling food, fruits, tea | 1.5m (~43% lane) |
| `1` | `double_parked_vehicle` | Idling/parked car, auto, delivery scooter in curb lane | 2.1m (~60% lane) |
| `2` | `illegal_stall` | Semi-permanent roadside tarpaulin/bamboo stall | 2.6m (~74% lane) |
| `3` | `pedestrian_spillover` | Pedestrian stream walking on roadway due to blocked sidewalk | 1.2m (~34% lane) |

## Validation
Verify dataset splits and bounding box normalization anytime using:
```bash
python pipeline/validate_dataset.py
```
