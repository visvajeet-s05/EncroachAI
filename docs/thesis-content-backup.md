# EncroachAI: Thesis Content & Research Backup

> **Source Extraction & Archive Notice**:
> This document archives the detailed theoretical literature, mathematical foundations, ST-GNN architecture, calibration matrices, and empirical results tables extracted prior to site simplification. This content is preserved verbatim for the project thesis document and conference presentation slides.

---

## 1. Title & Abstract

### Title
**EncroachAI: Vision-Edge Traffic Signal Control Under Informal Road Encroachment Using Spatial-Temporal Graph Neural Networks**

### Abstract
Urban traffic signal control systems, from Webster's foundational 1958 formulation to modern adaptive systems such as SCATS and SCOOT, share a common and largely unexamined assumption: that road capacity is a fixed, geometric constant determined by the number and width of marked lanes. In dense Indian urban corridors, this assumption is routinely violated. Roadside vendor carts, double-parked vehicles, informal stalls, and pedestrian spillover reduce the effective, usable width of a carriageway by an estimated 30–50%, yet signal timing continues to be computed as though this encroachment does not exist. The result is systematic under- or over-allocation of green time, worsening congestion even under otherwise well-designed adaptive control.

This thesis proposes EncroachAI, a three-layer system that replaces this fixed-capacity assumption with a real-time, vision-derived estimate of usable road capacity:
1. **Perception Layer (Edge YOLOv10)**: Detects and classifies four categories of informal encroachment — vendor carts, double-parked vehicles, illegal stalls, and pedestrian spillover — from standard traffic camera footage, and computes a functional capacity multiplier ($C_{\text{mult}}$) that reflects the actual, rather than nominal, width available to traffic.
2. **Reasoning Layer (Spatial-Temporal GNN)**: Combines Chebyshev spectral graph convolutions with temporal gated convolutions to model a corridor of connected intersections as a directed graph $\mathcal{G} = (\mathcal{V}, \mathcal{E})$, predicting downstream queue propagation and bottleneck discharge 5 to 15 minutes into the future.
3. **Actuation Layer (Modified Webster Formulation)**: Dynamically scales the saturation flow term ($s_{\text{eff}} = s_{\text{nominal}} \times C_{\text{mult}}$) to compute adaptive signal timing that reflects real, observed road conditions rather than assumed ones.

The system is evaluated on a 6.8 km stretch of the Anna Salai corridor in Chennai, India, with experimental validation focused on three representative junctions: Spencers Plaza, Gemini Flyover, and the Nandanam connector. Training data combines the public India Driving Dataset (IDD) with proprietary annotated footage collected at the three study junctions. System performance is evaluated through SUMO microsimulation against two baselines: a static fixed-timing (Webster) controller and a capacity-agnostic adaptive controller resembling SCATS/SCOOT, across light, moderate, and heavy encroachment scenarios.

---

## 2. Theoretical Background & Literature Gap

### The Fundamental Gap in Traffic Signal Control Literature
> *"Existing traffic-signal optimization literature almost universally treats carriageway width as a fixed geometric parameter. In the Global South, this assumption fails within minutes of peak-hour onset as informal vendor pushcarts, double-parked logistics vehicles, and pedestrian spillover usurp up to 50% of the active transit surface."*

### Key Academic Baselines & Citations
1. **Webster, F. V. (1958)**. *Traffic Signal Settings*. Road Research Technical Paper No. 39, Road Research Laboratory, UK.
   - Fixed cycle length formula: $C_0 = \frac{1.5L + 5}{1 - Y}$ where $Y = \sum y_i = \sum \frac{q_i}{s_i}$. Assumes constant saturation flow $s_i$.
2. **Highway Capacity Manual (HCM 2010)**. Transportation Research Board (TRB), Washington, D.C.
   - Prescribes standard lane capacity base values ($1,900\text{ pcphpl}$) and width adjustment factors $f_w$, which assume lane discipline and structural barriers rather than dynamic, transient encroachment.
3. **Varma, G., et al. (2019)**. *IDD: A Dataset for Exploring Problems of Autonomous Navigation in Unconstrained Environments*. IEEE/CVF WACV.
   - Documents unstructured traffic, absent lane markings, and multi-class road friction.
4. **Yu, B., Yin, H., & Zhu, Z. (2018)**. *Spatio-Temporal Graph Convolutional Networks: A Deep Learning Framework for Traffic Forecasting*. IJCAI.
   - Chebyshev graph convolutions combined with temporal gated convolutions.
5. **Wang, A., et al. (2024)**. *YOLOv10: Real-Time End-to-End Object Detection*. arXiv:2405.14458.
   - NMS-free dual-label assignments for latency-critical edge deployment.

---

## 3. Informal Encroachment Taxonomy (Chennai Corridor Study)

| Class ID | Class Name | Vernacular / Tamil | Physical Geometry Impact | Equivalent Friction ($PCU$) | Temporal Behavior Pattern |
|---|---|---|---|---|---|
| 0 | **Vendor Pushcart** | தள்ளுவண்டி (Pushcart) | $-22\%$ to $-35\%$ curb lane width | $1.45\text{ PCU}$ | Semi-static during peak hours (07:00–11:00 & 16:30–21:30); customer clusters generate lateral pedestrian friction. |
| 1 | **Double-Parked Vehicle** | இரட்டை நிறுத்தம் | $-30\%$ to $-45\%$ carriageway width | $1.80\text{ PCU}$ | Transient (5–20 min) courier delivery, drop-offs, autos; creates severe merge turbulence and upstream shockwaves. |
| 2 | **Illegal Semi-Permanent Stall** | ஆக்கிரமிப்பு கடை | $-35\%$ to $-58\%$ carriageway width | $2.10\text{ PCU}$ | Sustained tarpaulin canopies, crates, display counters extending into roadway; renders curb lane permanently unusable. |
| 3 | **Pedestrian Spillover** | பாதசாரி திரட்சி | $-15\%$ to $-28\%$ approach width | $1.20\text{ PCU}$ | High density near bus stops and transit portals forcing crowds off occupied sidewalks into transit lanes. |

---

## 4. Camera Homography & Field Calibration

### Inverse Perspective Mapping (IPM)
Camera pixels $(u, v)$ from pole-mounted CCTV sensors are mapped onto ground-plane metric coordinates $(X, Y)$ via planar homography matrix $\mathbf{H} \in \mathbb{R}^{3 \times 3}$:

$$\begin{bmatrix} X \\ Y \\ 1 \end{bmatrix} \sim \mathbf{H} \begin{bmatrix} u \\ v \\ 1 \end{bmatrix} = \begin{bmatrix} h_{11} & h_{12} & h_{13} \\ h_{21} & h_{22} & h_{23} \\ h_{31} & h_{32} & h_{33} \end{bmatrix} \begin{bmatrix} u \\ v \\ 1 \end{bmatrix}$$

### Usable Road Capacity Multiplier
For nominal road curb-to-median width $W_{\text{nominal}}$ and detected lateral obstacle boundary intrusion $w_{\text{encroached}}$:

$$W_{\text{eff}}(t) = \max\left(W_{\text{min}}, W_{\text{nominal}} - \max_{k \in \mathcal{K}} w_{\text{encroached}, k}(t)\right)$$

$$C_{\text{mult}}(t) = \frac{W_{\text{eff}}(t)}{W_{\text{nominal}}} \in [0.42, 1.00]$$

---

## 5. Three-Layer System Architecture

### Layer 1: Vision-Edge Perception
- **Model**: YOLOv10-Nano / Small running TensorRT FP16 on NVIDIA Jetson Orin Nano (15W).
- **Latency**: $22.4\text{ ms}$ inference time ($>40\text{ FPS}$).
- **State Vector**: $\mathbf{x}_i(t) = [q_i(t), v_i(t), W_{\text{eff}, i}(t), C_{\text{mult}, i}(t)]$ for each intersection approach $i$.

```python
# Layer 1 Perception Snippet
def estimate_functional_capacity(frame, nominal_width_m=10.5):
    results = yolov10_model(frame, conf=0.45, iou=0.65)
    encroachments = results.boxes.filter_by_class([
        'vendor_cart', 'double_parked', 'illegal_stall', 'pedestrian'
    ])
    projected_mask = homography_warp(encroachments.polygons)
    encroached_width_m = compute_lateral_lane_intrusion(projected_mask)
    effective_width = max(3.5, nominal_width_m - encroached_width_m)
    capacity_ratio = effective_width / nominal_width_m
    return {"effective_width_m": effective_width, "capacity_mult": capacity_ratio}
```

### Layer 2: Spatial-Temporal GNN Reasoning
- **Corridor Graph**: $\mathcal{G} = (\mathcal{V}, \mathcal{E})$ where $|\mathcal{V}| = 7$ intersections on Anna Salai, edges represent directional link travel times.
- **Convolutions**: 2-layer Chebyshev spectral graph convolution (ChebNet, polynomial order $K=3$) interleaved with Gated Linear Unit (GLU) temporal convolutions.
- **Objective**: Predict downstream queue buildup $Q_{i}(t + \Delta t)$ under constrained capacity up to 15 minutes ahead.

```python
# Layer 2 ST-GNN Snippet
class SpatialTemporalGNN(nn.Module):
    def __init__(self, in_channels=4, hidden_dim=64, num_nodes=7):
        super().__init__()
        self.spatial_gcn1 = ChebConv(in_channels, hidden_dim, K=3)
        self.temporal_conv1 = TemporalGatedConv(hidden_dim, hidden_dim, kernel_size=3)
        self.spatial_gcn2 = ChebConv(hidden_dim, hidden_dim, K=3)
        self.temporal_conv2 = TemporalGatedConv(hidden_dim, hidden_dim, kernel_size=3)
        self.fc_timing = nn.Linear(hidden_dim, 4)
        
    def forward(self, x, edge_index, edge_weight):
        h = F.relu(self.spatial_gcn1(x, edge_index, edge_weight))
        h = self.temporal_conv1(h)
        h = F.relu(self.spatial_gcn2(h, edge_index, edge_weight))
        h = self.temporal_conv2(h)
        return self.fc_timing(h)
```

### Layer 3: Modified Webster Dynamic Actuation
- **Dynamic Saturation Flow**: $s_{\text{eff}, i}(t) = s_{\text{nominal}, i} \times C_{\text{mult}, i}(t)$
- **Dynamic Critical Flow Ratio**: $y_i(t) = \frac{q_i(t)}{s_{\text{eff}, i}(t)}$
- **Optimal Cycle Length**:
  $$C^*(t) = \left[ \frac{1.5 L + 5}{1 - \sum y_i(t)} \right]_{C_{\text{min}}}^{C_{\text{max}}}$$
  where $L$ is total lost time per cycle, $C_{\text{min}} = 60\text{s}$, $C_{\text{max}} = 140\text{s}$.
- **Green Phase Allocation**:
  $$g_i^*(t) = \frac{y_i(t)}{\sum y_j(t)} \left(C^*(t) - L\right)$$

---

## 6. Full Benchmark Results & Evaluation Tables

Evaluated across 100 random seed microsimulation runs on SUMO 1.20 along Anna Salai (6.8 km, 7 junctions).

### Table 1: Comprehensive Corridor Benchmark Across Congestion Regimes

| Scenario / Regime | Control Method | Avg Delay (s/veh) | Max Queue (veh) | Throughput (veh/hr) | Est. CO2 (g/km) | Delay vs Fixed | Stat. Sig. |
|---|---|---|---|---|---|---|---|
| **Light Encroachment** (8–14% curb loss) | Static Fixed Webster | 42.4 | 48 | 1,420 | 84.5 | Baseline | — |
| | Capacity-Agnostic Adaptive | 36.1 | 38 | 1,540 | 76.2 | $-14.8\%$ | $p < 0.05$ |
| | **EncroachAI (Ours)** | **28.5** | **26** | **1,680** | **64.1** | **$-32.7\%$** | $p < 0.001$ |
| **Moderate Encroachment** (22–35% curb loss) | Static Fixed Webster | 68.9 | 94 | 1,180 | 128.4 | Baseline | — |
| | Capacity-Agnostic Adaptive | 54.2 | 72 | 1,310 | 104.8 | $-21.3\%$ | $p < 0.01$ |
| | **EncroachAI (Ours)** | **38.2** | **44** | **1,540** | **81.3** | **$-44.5\%$** | $p < 0.001$ |
| **Heavy Encroachment** (38–58% curb loss) | Static Fixed Webster | 96.5 | 168 | 880 | 184.2 | Baseline | — |
| | Capacity-Agnostic Adaptive | 78.4 | 134 | 1,020 | 152.6 | $-18.7\%$ | $p < 0.05$ |
| | **EncroachAI (Ours)** | **52.1** | **78** | **1,320** | **110.4** | **$-46.0\%$** | $p < 0.001$ |

### Table 2: Study Junction Performance Breakdown (Moderate Regime)

| Junction Name | Nominal Width | Encroached Width | Usable Capacity | Fixed Webster Delay | Capacity-Agnostic Delay | EncroachAI Delay | Delay Reduction |
|---|---|---|---|---|---|---|---|
| **Spencers Plaza** (Anna Salai North) | 10.5 m | 6.8 m | $64.8\%$ | 68.2 s | 52.6 s | **36.4 s** | **$-46.6\%$** |
| **Gemini Flyover Connector** | 14.0 m | 10.2 m | $72.8\%$ | 54.8 s | 44.1 s | **32.8 s** | **$-40.1\%$** |
| **Nandanam / Usman Connector** | 10.5 m | 5.2 m | $49.5\%$ | 83.7 s | 65.9 s | **45.4 s** | **$-45.8\%$** |
| **Corridor Mean** | 11.7 m | 7.4 m | $62.4\%$ | 68.9 s | 54.2 s | **38.2 s** | **$-44.5\%$** |

### Table 3: Ablation Study of EncroachAI Components

| Configuration | Model Components | Avg Delay (s) | Throughput Gain | Queue Variance Reduction |
|---|---|---|---|---|
| A | Baseline Fixed Webster | 68.9 s | $0.0\%$ | $0.0\%$ |
| B | + Layer 1 Only (Local YOLOv10 Capacity Multiplier) | 49.5 s | $+14.2\%$ | $+21.6\%$ |
| C | + Layer 1 & 2 (No Webster scaling, heuristic rule) | 44.8 s | $+19.8\%$ | $+33.4\%$ |
| **D** | **Full System (Layer 1 Perception + Layer 2 ST-GNN + Layer 3 Webster)** | **38.2 s** | **$+30.5\%$** | **$+53.2\%$** |
