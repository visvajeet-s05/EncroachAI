#!/usr/bin/env python3
"""
Keyframe Quality & Diversity Filter for EncroachAI Annotation Pipeline.
Filters extracted video frames based on:
1. Motion Blur / Focus Quality (Laplacian variance >= threshold)
2. Exposure / Dynamic Range (Mean brightness within [min_bright, max_bright])
3. Per-Clip Volume Safety Cap Audit (flags folders exceeding max threshold)

Supports OpenCV (cv2), Pillow (PIL), and standard Python library (pure PPM/PGM/JPEG header fallback).

Outputs sorted frames into:
- keyframes/accepted/<junction>/<timewindow>/
- keyframes/flagged-for-review/<junction>/<timewindow>/
"""

import os
import sys
import glob
import shutil
import argparse
from pathlib import Path
from typing import Dict, List, Tuple

# Detect available image processing backend
OPENCV_AVAILABLE = False
PIL_AVAILABLE = False

try:
    import cv2
    import numpy as np
    OPENCV_AVAILABLE = True
except ImportError:
    try:
        from PIL import Image, ImageStat, ImageFilter
        PIL_AVAILABLE = True
    except ImportError:
        pass


def parse_args():
    parser = argparse.ArgumentParser(
        description="Filter and organize extracted keyframes for EncroachAI CVAT/Roboflow annotation."
    )
    parser.add_argument(
        "--input-dir",
        type=str,
        default="dataset/raw_frames",
        help="Path to directory containing raw extracted keyframes or subfolders",
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default="keyframes",
        help="Path to output root directory (creates 'accepted' and 'flagged-for-review')",
    )
    parser.add_argument(
        "--max-frames-per-clip",
        type=int,
        default=150,
        help="Safety ceiling warning threshold for frames from a single clip (default: 150)",
    )
    parser.add_argument(
        "--blur-threshold",
        type=float,
        default=100.0,
        help="Minimum Laplacian variance for blur detection (default: 100.0)",
    )
    parser.add_argument(
        "--min-brightness",
        type=float,
        default=40.0,
        help="Minimum mean grayscale brightness [0-255] (default: 40.0)",
    )
    parser.add_argument(
        "--max-brightness",
        type=float,
        default=215.0,
        help="Maximum mean grayscale brightness [0-255] (default: 215.0)",
    )
    return parser.parse_args()


def assess_frame_quality(
    file_path: Path,
    blur_threshold: float,
    min_brightness: float,
    max_brightness: float,
) -> Tuple[bool, List[str], Dict[str, float]]:
    """
    Evaluates frame quality based on blur variance and exposure range.
    Returns: (is_accepted, list_of_reasons, metrics_dict)
    """
    reasons = []
    laplacian_var = 150.0  # Default nominal passing value if native backend unavailable
    mean_brightness = 128.0

    if OPENCV_AVAILABLE:
        img = cv2.imread(str(file_path))
        if img is None:
            return False, ["Corrupted or unreadable image file"], {"blur_var": 0.0, "brightness": 0.0}
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        mean_brightness = float(np.mean(gray))
    elif PIL_AVAILABLE:
        try:
            with Image.open(str(file_path)) as pil_img:
                gray_img = pil_img.convert("L")
                stat = ImageStat.Stat(gray_img)
                mean_brightness = float(stat.mean[0])
                
                # Compute Laplacian-style high frequency edge energy
                edges = gray_img.filter(ImageFilter.FIND_EDGES)
                edge_stat = ImageStat.Stat(edges)
                laplacian_var = float(edge_stat.var[0])
        except Exception as e:
            return False, [f"Error reading image: {e}"], {"blur_var": 0.0, "brightness": 0.0}
    else:
        # Basic file sanity check (size > 10KB to avoid truncated frames)
        file_size = file_path.stat().st_size
        if file_size < 10240:
            reasons.append(f"Undersized/corrupted frame ({file_size} bytes)")
        return len(reasons) == 0, reasons, {"file_size_kb": file_size / 1024}

    if laplacian_var < blur_threshold:
        reasons.append(f"Blurry (Laplacian var {laplacian_var:.1f} < {blur_threshold})")
    if mean_brightness < min_brightness:
        reasons.append(f"Underexposed (Mean brightness {mean_brightness:.1f} < {min_brightness})")
    elif mean_brightness > max_brightness:
        reasons.append(f"Overexposed (Mean brightness {mean_brightness:.1f} > {max_brightness})")

    metrics = {
        "blur_var": laplacian_var,
        "brightness": mean_brightness,
    }
    is_accepted = len(reasons) == 0
    return is_accepted, reasons, metrics


def main():
    args = parse_args()
    input_path = Path(args.input_dir)
    out_root = Path(args.output_dir)

    accepted_dir = out_root / "accepted"
    flagged_dir = out_root / "flagged-for-review"

    accepted_dir.mkdir(parents=True, exist_ok=True)
    flagged_dir.mkdir(parents=True, exist_ok=True)

    supported_exts = ("*.jpg", "*.jpeg", "*.png", "*.JPG", "*.PNG")
    all_files: List[Path] = []
    if input_path.exists():
        for ext in supported_exts:
            all_files.extend(input_path.rglob(ext))

    all_files = sorted(all_files)

    backend_name = "OpenCV (cv2)" if OPENCV_AVAILABLE else ("Pillow (PIL)" if PIL_AVAILABLE else "Standard Python (File integrity mode)")
    print("=" * 70)
    print(" EncroachAI Keyframe Quality & Diversity Filter")
    print("=" * 70)
    print(f" Engine Backend    : {backend_name}")
    print(f" Input Directory   : {input_path}")
    print(f" Output Directory  : {out_root}")
    print(f" Blur Threshold    : {args.blur_threshold}")
    print(f" Brightness Limits : [{args.min_brightness}, {args.max_brightness}]")
    print(f" Max Frame Cap/Clip: {args.max_frames_per_clip}")
    print(f" Total Frames Found: {len(all_files)}")
    print("-" * 70)

    if not all_files:
        print(f"\n[INFO] No image files found in '{args.input_dir}'.")
        print(f"Ready to filter keyframes once extracted using 'pipeline/FIELD_DATA_COLLECTION_GUIDE.md'.")
        print(f"Expected input path: {args.input_dir}\n")
        return

    stats = {
        "total": len(all_files),
        "accepted": 0,
        "flagged": 0,
        "by_folder": {},
    }

    for file_path in all_files:
        rel_path = file_path.relative_to(input_path)
        subfolder = rel_path.parent
        folder_label = str(subfolder) if str(subfolder) != "." else "root"

        if folder_label not in stats["by_folder"]:
            stats["by_folder"][folder_label] = {"accepted": 0, "flagged": 0}

        is_accepted, reasons, metrics = assess_frame_quality(
            file_path,
            blur_threshold=args.blur_threshold,
            min_brightness=args.min_brightness,
            max_brightness=args.max_brightness,
        )

        if is_accepted:
            stats["accepted"] += 1
            stats["by_folder"][folder_label]["accepted"] += 1
            target_sub = accepted_dir / subfolder
            target_sub.mkdir(parents=True, exist_ok=True)
            shutil.copy2(file_path, target_sub / file_path.name)
        else:
            stats["flagged"] += 1
            stats["by_folder"][folder_label]["flagged"] += 1
            target_sub = flagged_dir / subfolder
            target_sub.mkdir(parents=True, exist_ok=True)
            shutil.copy2(file_path, target_sub / file_path.name)

    print("\n" + "=" * 70)
    print(" KEYFRAME COVERAGE & QUALITY SUMMARY REPORT")
    print("=" * 70)
    print(f"Total Frames Processed : {stats['total']}")
    print(f"Frames Accepted        : {stats['accepted']} ({stats['accepted'] / stats['total'] * 100:.1f}%)")
    print(f"Frames Flagged (Review): {stats['flagged']} ({stats['flagged'] / stats['total'] * 100:.1f}%)")
    print("-" * 70)
    print(f"{'Folder / Subdirectory':<38} | {'Accepted':<9} | {'Flagged':<9} | {'Total':<9} | {'Status':<10}")
    print("-" * 70)
    
    cap_exceeded_warnings = []
    for folder, counts in stats["by_folder"].items():
        folder_tot = counts["accepted"] + counts["flagged"]
        status = "OK"
        if folder_tot > args.max_frames_per_clip:
            status = "EXCEEDED"
            cap_exceeded_warnings.append(folder)
        print(f"{folder:<38} | {counts['accepted']:<9} | {counts['flagged']:<9} | {folder_tot:<9} | {status:<10}")
    
    print("=" * 70)
    if cap_exceeded_warnings:
        print("\n[WARNING] The following clip subfolders produced >", args.max_frames_per_clip, "frames:")
        for w in cap_exceeded_warnings:
            print(f"  - {w} ({stats['by_folder'][w]['accepted'] + stats['by_folder'][w]['flagged']} frames)")
        print("Recommendation: Raise SCENE_THRESH (e.g. to 0.30 or 0.35) to prevent over-triggering on background flow.\n")
    
    print(f"Accepted frames ready for CVAT/Roboflow: {accepted_dir}")
    print(f"Flagged frames reserved for human check : {flagged_dir}")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    main()
