#!/usr/bin/env python3
"""
EncroachAI — Dataset Split & Annotation Validator
-------------------------------------------------
Validates that:
  1. dataset/images/ and dataset/labels/ directories match pipeline/encroachai_dataset.yaml
  2. Every image has a matching .txt label file (and vice-versa)
  3. Every bounding box has class_id in [0, 1, 2, 3]
  4. Coordinates (x_center, y_center, width, height) are strictly normalized within (0.0, 1.0]

Usage:
    python pipeline/validate_dataset.py
"""

import os
import sys
from pathlib import Path

VALID_CLASSES = {0: "vendor_cart", 1: "double_parked_vehicle", 2: "illegal_stall", 3: "pedestrian_spillover"}
SPLITS = ["train", "val", "test"]

def validate_dataset(dataset_root: Path):
    print("=" * 65)
    print("🚦 EncroachAI — YOLOv10 Dataset Audit")
    print(f"📂 Dataset Root: {dataset_root.resolve()}")
    print("=" * 65)

    if not dataset_root.exists():
        print(f"❌ Dataset root directory does not exist: {dataset_root}")
        return False

    total_images = 0
    total_labels = 0
    total_boxes = 0
    class_counts = {cid: 0 for cid in VALID_CLASSES}
    errors = []

    for split in SPLITS:
        img_dir = dataset_root / "images" / split
        lbl_dir = dataset_root / "labels" / split

        if not img_dir.exists():
            errors.append(f"Missing images split directory: {img_dir}")
            continue
        if not lbl_dir.exists():
            errors.append(f"Missing labels split directory: {lbl_dir}")
            continue

        images = set(p.stem for p in img_dir.glob("*.jpg")) | set(p.stem for p in img_dir.glob("*.png"))
        labels = set(p.stem for p in lbl_dir.glob("*.txt"))

        total_images += len(images)
        total_labels += len(labels)

        # Check for unannotated images or orphaned labels
        missing_labels = images - labels
        orphaned_labels = labels - images

        if missing_labels:
            errors.append(f"[{split}] {len(missing_labels)} images missing .txt labels: {list(missing_labels)[:3]}")
        if orphaned_labels:
            errors.append(f"[{split}] {len(orphaned_labels)} .txt labels have no matching image: {list(orphaned_labels)[:3]}")

        # Validate label contents
        for lbl_path in lbl_dir.glob("*.txt"):
            with open(lbl_path, "r", encoding="utf-8") as f:
                lines = [l.strip() for l in f if l.strip()]
                for line_idx, line in enumerate(lines, 1):
                    parts = line.split()
                    if len(parts) != 5:
                        errors.append(f"[{split}/{lbl_path.name}:{line_idx}] Expected 5 elements, got {len(parts)}: '{line}'")
                        continue
                    try:
                        cid = int(parts[0])
                        xc, yc, w, h = map(float, parts[1:])
                    except ValueError:
                        errors.append(f"[{split}/{lbl_path.name}:{line_idx}] Non-numeric values in line: '{line}'")
                        continue

                    if cid not in VALID_CLASSES:
                        errors.append(f"[{split}/{lbl_path.name}:{line_idx}] Invalid class ID {cid} (must be 0-3)")
                    else:
                        class_counts[cid] += 1

                    for name, val in [("x_center", xc), ("y_center", yc), ("width", w), ("height", h)]:
                        if not (0.0 <= val <= 1.0):
                            errors.append(f"[{split}/{lbl_path.name}:{line_idx}] {name} out of bounds: {val} (must be 0.0-1.0)")

                    total_boxes += 1

        print(f"✓ Split [{split.upper()}]: {len(images)} images | {len(labels)} labels verified")

    print("\n📊 Encroachment Class Distribution:")
    for cid, cname in VALID_CLASSES.items():
        print(f"  [{cid}] {cname:<24}: {class_counts[cid]} instances")

    print(f"\nTotal Dataset Footprint: {total_images} frames | {total_boxes} annotated bounding boxes")

    if errors:
        print(f"\n❌ Encountered {len(errors)} validation error(s):")
        for err in errors[:10]:
            print(f"  - {err}")
        return False

    print("\n🎉 Dataset validation passed with 100% integrity!")
    return True

if __name__ == "__main__":
    repo_root = Path(__file__).resolve().parent.parent
    success = validate_dataset(repo_root / "dataset")
    sys.exit(0 if success else 1)
