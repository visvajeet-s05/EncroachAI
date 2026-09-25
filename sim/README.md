# EncroachAI — SUMO Arterial Corridor Simulation (Anna Salai, Chennai)

This directory contains the microscopic traffic simulation assets for the Anna Salai / Usman Road 7-intersection arterial corridor in Chennai, India.

## Network Topology
- **int-1**: Spencers Plaza (Active Multi-Class Encroachment)
- **int-2**: Thousand Lights (Contextual / Downstream)
- **int-3**: Gemini Flyover (Active Bottleneck & Merge)
- **int-4**: DMS Metro (Contextual Transit Node)
- **int-5**: Nandanam / Usman Road Connector (Active Heavy Pushcart Spillover)
- **int-6**: Saidapet (Contextual)
- **int-7**: Guindy Egress Hub (Active Arterial Discharge)

## Files
- `anna_salai_corridor.sumocfg`: Main SUMO project configuration
- `anna_salai_corridor.net.xml`: 7-junction arterial roadway network with lane assignments, speed limits, and traffic light programs
- `corridor.rou.xml`: Heterogeneous Indian traffic vehicle types (motorcycles, cars, auto-rickshaws, buses) and corridor demand flows
- `encroachment.add.xml`: E2 lane area induction loop detectors and bottleneck rerouters

## How to Run

### 1. Interactive Visual Simulation (SUMO GUI)
```bash
sumo-gui -c sim/anna_salai_corridor.sumocfg
```

### 2. Automated Dynamic TraCI Signal Control (Python)
Run the dynamic capacity adjustment loop using EncroachAI's Webster-compensated split optimizer:
```bash
python pipeline/sumo_traci_controller.py --scenario moderate --steps 3600 --export-xml sim_tripinfo.xml --export-csv sim_approach.csv
```

### 3. Ingest into Web Dashboard
Exported simulation metrics can be directly verified and ingested into the interactive dashboard:
```bash
# Safe test run:
npm run import:simulation -- --file sim_approach.csv --tripinfo sim_tripinfo.xml

# Ingest into live production dashboard:
npm run import:simulation -- --file sim_approach.csv --tripinfo sim_tripinfo.xml --live
```
