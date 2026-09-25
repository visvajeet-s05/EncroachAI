# EncroachAI — Vision-Edge Traffic Signal Control

Vision-Edge Traffic Signal Control Under Informal Road Encroachment using Spatial-Temporal Graph Neural Networks (ST-GNN) along the Anna Salai 7-node arterial corridor in Chennai, India.

---

## 🏛️ Architecture Overview

EncroachAI is built as a **pure static Single-Page Application (SPA)** with client-side routing, interactive 3D WebGL digital twin rendering (Three.js), and provenance-controlled local dataset visualizations:

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Motion, Lucide React.
- **3D & Visualizations**: Three.js WebGL intersection canvas, Canvas Confetti, custom SVG / ST-GNN diagram visualizers.
- **Data & Provenance**: Versioned, immutable local JSON datasets (`src/data/`) with provenance metadata tags tracking synthetic test benchmarks vs. field-verified ground truth.
- **Runtime**: **Zero backend, zero serverless functions, zero API keys, zero environment variables required.**

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm (bundled with Node.js)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/encroachai/encroachai.git
cd encroachai

# Install dependencies
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Vite will start the local development server at `http://localhost:3000` (or `http://localhost:5173`).

---

## 🛠️ Build & Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite local development server with HMR. |
| `npm run build` | Compiles TypeScript and creates optimized static production bundle in `dist/`. |
| `npm run preview` | Serves the production build locally for verification. |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`). |
| `npm run clean` | Cleans previous build artifacts in `dist/`. |
| `npm run import:detections` | Imports verified YOLOv8 encroachment detection runs into `src/data/`. |
| `npm run import:simulation` | Imports Webster vs. ST-GNN simulation results into `src/data/`. |

---

## 🌐 Deploying to Vercel

This repository is pre-configured for static deployment on Vercel:

1. Push your repository to GitHub: `https://github.com/encroachai/encroachai`
2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import the GitHub repository.
4. Vercel will automatically detect `vercel.json` and configure:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**: *None needed (leave blank)*
5. Click **Deploy**. Vercel will build and serve the static files with client-side SPA routing enabled.

---

## 🗺️ Application Routes

- `/` — **Command Center (Overview)**: Hero presentation, corridor telemetry overview, methodology summary, and 3D intersection digital twin.
- `/problem` — **Bottlenecks (The Encroachment Problem)**: Real-world urban survey of 7 Anna Salai bottlenecks, effective carriageway reduction calculations, and capacity degradation dynamics.
- `/architecture` — **Neural ST-GNN (3-Layer Pipeline)**: Interactive 3-layer architecture explorer detailing Perception (Edge-Vision), Fusion & Prediction (ST-GNN), and Actuation (Dynamic Phase Allocation).
- `/demo` — **Edge Vision (Detection Demo)**: Interactive detection gallery with bounding boxes, spatial encroachment class filters (street vendors, unorganized parking, construction debris), and live simulated inference.
- `/simulation` — **Signal Actuation (Corridor Simulation)**: 7-junction Anna Salai arterial corridor simulator with interactive 3D WebGL junction twin and real-time Webster vs. ST-GNN scenario switcher.
- `/results` — **Analytics (Ablation & Results)**: Comprehensive benchmark comparison across 100 random seed runs, ablation studies, queue dissipation metrics, and fuel savings analysis.
- `/methodology` — **Calibration & Methodology**: Sensor matrices, camera calibration geometry, homography transformations, and mathematical formulations.
- `/about` — **About EncroachAI**: Academic research profile, system specifications, technical stack, and author information.

---

## 📜 License & Research Context

Developed for academic research on spatial-temporal traffic control under non-lane-based heterogeneous traffic conditions.
