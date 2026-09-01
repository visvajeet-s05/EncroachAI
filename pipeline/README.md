# EncroachAI — Research Pipeline & Data Ingestion Manual

This directory contains the operational machine learning, annotation, and micro-simulation tools to transition empirical field experiments directly into the EncroachAI interactive platform.

---

## 5-Step Operational Roadmap

```
1. Video Capture (Spencers, Gemini, Nandanam)
      │
      ▼
2. Annotation (CVAT / Roboflow - 4 Classes)
      │
      ▼
3. YOLOv10 Fine-Tuning (Colab / Local GPU)
      │
      ▼
4. SUMO TraCI Micro-Simulation (Webster Dynamic Phase Control)
      │
      ▼
5. CLI Ingestion (`npm run import:detections` & `npm run import:simulation`)
```

---

### Step 1: Real-World Footage Acquisition
Record high-angle 1080p 30fps video during peak (08:30-10:30, 17:30-19:30) and off-peak at our 3 active research sites:
1. **Spencers Plaza / Thousand Lights Junction** (Anna Salai)
2. **Gemini Flyover / Cathedral Road Approach** (Anna Salai)
3. **Nandanam / Usman Road Connector** (Chamiers Road)

---

### Step 2: Annotation Setup (CVAT / Roboflow)
Import `pipeline/annotation_guide_cvat_roboflow.json` into CVAT or Roboflow:
- `0`: `vendor_cart` (pushcarts, fruit/snack stalls)
- `1`: `double_parked_vehicle` (stopped autos, bikes, delivery vans)
- `2`: `illegal_stall` (tarpaulin, vegetable crates, displays)
- `3`: `pedestrian_spillover` (walking in vehicular lanes)

Export annotations in **YOLO format** (`images/` and `labels/`).

---

### Step 3: YOLOv10 Model Fine-Tuning
Run the training script (or upload to Google Colab Pro / Kaggle GPU):
```bash
python pipeline/yolov10_finetune.py \
  --data pipeline/encroachai_dataset.yaml \
  --model yolov10n.pt \
  --epochs 60 \
  --batch 16 \
  --export-onnx
```

Run batch inference on test footage to generate export JSON:
```bash
python pipeline/run_inference_exporter.py \
  --weights runs/encroachai/chennai_arterials/weights/best.pt \
  --source ./field_footage/ \
  --output ./yolov10_chennai_measured.json
```

---

### Step 4: SUMO TraCI Micro-Simulation
Run the micro-simulation controller with dynamic encroachment capacity modulation:
```bash
python pipeline/sumo_traci_controller.py \
  --scenario heavy \
  --export-csv ./sumo_chennai_results.csv
```

---

### Step 5: Ingest into Web Application
The ingestion tool defaults to **Safe Sandbox Mode** (writing to `*.test.json`) to protect live research integrity. Use `--live` **strictly and solely** when importing genuine field experiment outputs:

#### A. Safe Sandbox Testing (with synthetic fixtures):
```bash
# Dry-run test detection conversion (writes to src/data/detectionSamples.test.json):
npm run import:detections -- ./scripts/fixtures/sample_yolov10_export.json

# Dry-run test SUMO conversion (writes to src/data/simulationResults.test.json):
npm run import:simulation -- ./scripts/fixtures/sample_sumo_tripinfo.xml moderate
```

#### B. Genuine Research Output Ingestion (Live Production Mode):
```bash
# Ingest genuine YOLOv10 detection predictions into LIVE database:
npm run import:detections -- --live ./yolov10_chennai_measured.json

# Ingest genuine SUMO simulation results into LIVE database:
npm run import:simulation -- --live ./sumo_chennai_results.csv heavy
```

When `--live` is provided with genuine experimental outputs, the web dashboard will automatically display green **Measured** provenance tags and update interactive queue charts, node inspections, and comparative tables in real time.
