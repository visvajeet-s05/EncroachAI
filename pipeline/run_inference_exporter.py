#!/usr/bin/env python3
"""
EncroachAI — Batch Inference & JSON Exporter
-------------------------------------------------------------
Runs trained YOLOv10 weights on captured camera footage frames
and exports results in Ultralytics JSON format ready for `npm run import:detections`.

Usage:
    python run_inference_exporter.py --weights runs/encroachai/chennai_arterials/weights/best.pt --source ./test_footage --output ./yolo_real_export.json
"""

import os
import sys
import json
import argparse
from pathlib import Path

def parse_args():
    parser = argparse.ArgumentParser(description="EncroachAI Batch Inference Exporter")
    parser.add_argument("--weights", type=str, default="runs/encroachai/chennai_arterials/weights/best.pt", help="Path to best.pt weights")
    parser.add_argument("--source", type=str, required=True, help="Path to image directory or video file")
    parser.add_argument("--output", type=str, default="yolo_real_export.json", help="Path to output JSON")
    parser.add_argument("--conf", type=float, default=0.45, help="Confidence threshold")
    parser.add_argument("--iou", type=float, default=0.50, help="NMS IoU threshold")
    return parser.parse_args()

def main():
    args = parse_args()
    try:
        from ultralytics import YOLO as YOLOv10
    except ImportError:
        print("❌ Ultralytics not installed. Install via: pip install ultralytics")
        sys.exit(1)

    print(f"🔍 Loading model weights: {args.weights}")
    model = YOLOv10(args.weights)

    CLASS_NAMES = {
        0: "vendor_cart",
        1: "double_parked_vehicle",
        2: "illegal_stall",
        3: "pedestrian_spillover"
    }

    print(f"🎬 Running inference on source: {args.source}")
    results = model.predict(
        source=args.source,
        conf=args.conf,
        iou=args.iou,
        save=False,
        verbose=False
    )

    export_items = []
    for idx, r in enumerate(results):
        img_path = Path(r.path)
        img_w, img_h = r.orig_shape[1], r.orig_shape[0]

        predictions = []
        for box in r.boxes:
            cls_id = int(box.cls[0].item())
            conf_score = float(box.conf[0].item())
            # xywh normalized [xc, yc, w, h]
            xywhn = box.xywhn[0].tolist()
            
            # Estimate lane impact percentage from normalized width
            width_pct = xywhn[2] * 100
            lane_impact = min(45, round(width_pct * 1.15))

            predictions.append({
                "class": CLASS_NAMES.get(cls_id, f"class_{cls_id}"),
                "confidence": round(conf_score, 3),
                "xywhn": [round(v, 4) for v in xywhn],
                "laneImpactPct": lane_impact
            })

        export_items.append({
            "id": f"capture-{img_path.stem}",
            "filename": img_path.name,
            "title": f"{img_path.stem.replace('_', ' ').title()} - Measured Vision Capture",
            "location": "Anna Salai Corridor, Chennai",
            "corridor": "Anna Salai Active Research Corridor",
            "timestamp": "Field Observation Recording",
            "nominalLanes": 4 if "4lane" in img_path.name.lower() else 3,
            "predictions": predictions
        })

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(export_items, f, indent=2)

    print(f"\n✅ Successfully exported {len(export_items)} capture frames to {args.output}!")
    print(f"👉 Import to EncroachAI with: npm run import:detections -- {args.output}")

if __name__ == "__main__":
    main()
