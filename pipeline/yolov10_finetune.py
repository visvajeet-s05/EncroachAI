#!/usr/bin/env python3
"""
EncroachAI — YOLOv10 Fine-Tuning Pipeline
-------------------------------------------------------------
Automated training script for fine-tuning YOLOv10-Nano / YOLOv10-Small
on IDD base features + Chennai 4-class Encroachment Dataset.

Usage:
    python yolov10_finetune.py --data pipeline/encroachai_dataset.yaml --epochs 60 --batch 16 --model yolov10n.pt
"""

import os
import sys
import json
import argparse
from pathlib import Path

def parse_args():
    parser = argparse.ArgumentParser(description="EncroachAI YOLOv10 Fine-Tuning Pipeline")
    parser.add_argument("--data", type=str, default="pipeline/encroachai_dataset.yaml", help="Path to dataset yaml")
    parser.add_argument("--model", type=str, default="yolov10n.pt", help="Base model weights (yolov10n.pt / yolov10s.pt)")
    parser.add_argument("--epochs", type=int, default=60, help="Number of fine-tuning epochs")
    parser.add_argument("--imgsz", type=int, default=640, help="Input image resolution")
    parser.add_argument("--batch", type=int, default=16, help="Batch size")
    parser.add_argument("--device", type=str, default="0", help="CUDA device ID or 'cpu'")
    parser.add_argument("--export-json", type=str, default="yolov10_export_results.json", help="Path to export converted predictions for EncroachAI web UI")
    parser.add_argument("--export-onnx", action="store_true", help="Export trained model to ONNX for TensorRT edge deployment")
    return parser.parse_args()

def train_and_export(args):
    try:
        from ultralytics import YOLOv10
    except ImportError:
        try:
            from ultralytics import YOLO as YOLOv10
        except ImportError:
            print("❌ Ultralytics not installed. Install via: pip install ultralytics")
            sys.exit(1)

    print("=" * 70)
    print("🚦 EncroachAI — YOLOv10 Edge Vision Training")
    print(f"📦 Model: {args.model}")
    print(f"📊 Dataset: {args.data}")
    print(f"🔄 Epochs: {args.epochs} | Batch: {args.batch} | ImgSize: {args.imgsz}")
    print("=" * 70)

    # 1. Load pretrained weights (IDD / COCO pretrained)
    model = YOLOv10(args.model)

    # 2. Start fine-tuning with augmentations tailored for tropical urban corridors
    results = model.train(
        data=args.data,
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        device=args.device,
        optimizer="AdamW",
        lr0=0.001,
        lrf=0.01,
        weight_decay=0.0005,
        warmup_epochs=3.0,
        # Tropical lighting & weather augmentations
        hsv_h=0.015,
        hsv_s=0.7,
        hsv_v=0.4,
        degrees=5.0,
        translate=0.1,
        scale=0.5,
        shear=2.0,
        perspective=0.0005,
        flipud=0.0,
        fliplr=0.5,
        mosaic=1.0,
        mixup=0.15,
        save=True,
        project="runs/encroachai",
        name="chennai_arterials",
        exist_ok=True
    )

    print("\n✅ Training complete! Evaluating on validation split...")
    metrics = model.val()
    print(f"📈 mAP@50: {metrics.box.map50:.4f}")
    print(f"📈 mAP@50-95: {metrics.box.map:.4f}")

    # 3. Export to ONNX if requested
    if args.export_onnx:
        print("\n⚡ Exporting to ONNX format for TensorRT / NVIDIA Jetson Orin Nano...")
        model.export(format="onnx", dynamic=True, simplify=True)

    print("\n🎉 Model weights saved to runs/encroachai/chennai_arterials/weights/best.pt")
    print("Run inference and export with: python pipeline/run_inference_exporter.py")

if __name__ == "__main__":
    args = parse_args()
    train_and_export(args)
