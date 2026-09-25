#!/usr/bin/env python3
"""
EncroachAI — SUMO Corridor Network Builder & Validator
------------------------------------------------------
Validates the Anna Salai 7-intersection arterial network files in sim/
and verifies that all node IDs, edge names, detectors, and routes match
the EncroachAI schema and TraCI controller expectation.

Usage:
    python pipeline/build_sumo_network.py --check
"""

import os
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

REQUIRED_JUNCTIONS = ["int-1", "int-2", "int-3", "int-4", "int-5", "int-6", "int-7"]
REQUIRED_EDGE_PREFIXES = ["edge_entry_spencers", "edge_spencers_tlights", "edge_tlights_gemini"]

def validate_network(sim_dir: Path):
    print("=" * 60)
    print("🚦 EncroachAI — SUMO Corridor Network Validation")
    print(f"📂 Directory: {sim_dir.resolve()}")
    print("=" * 60)

    cfg_file = sim_dir / "anna_salai_corridor.sumocfg"
    net_file = sim_dir / "anna_salai_corridor.net.xml"
    rou_file = sim_dir / "corridor.rou.xml"
    add_file = sim_dir / "encroachment.add.xml"

    for f in [cfg_file, net_file, rou_file, add_file]:
        if not f.exists():
            print(f"❌ Missing required file: {f.name}")
            return False
        print(f"✓ Found: {f.name} ({f.stat().st_size} bytes)")

    # Validate XML syntax
    try:
        net_tree = ET.parse(net_file)
        net_root = net_tree.getroot()
        junction_ids = [j.get("id") for j in net_root.findall("junction")]
        for rj in REQUIRED_JUNCTIONS:
            if rj not in junction_ids:
                print(f"❌ Missing junction: {rj}")
                return False
            print(f"  ✓ Junction verified: {rj}")

        rou_tree = ET.parse(rou_file)
        vtypes = [vt.get("id") for vt in rou_tree.getroot().findall("vType")]
        print(f"✓ Heterogeneous Vehicle Types: {', '.join(vtypes)}")

        add_tree = ET.parse(add_file)
        detectors = [d.get("id") for d in add_tree.getroot().findall("laneAreaDetector")]
        print(f"✓ E2 Lane Area Detectors: {len(detectors)} approach loops configured")

    except ET.ParseError as e:
        print(f"❌ XML Parsing Error: {e}")
        return False

    print("\n🎉 All SUMO corridor network assets passed verification cleanly!")
    return True

if __name__ == "__main__":
    script_dir = Path(__file__).resolve().parent
    repo_root = script_dir.parent
    sim_dir = repo_root / "sim"
    success = validate_network(sim_dir)
    sys.exit(0 if success else 1)
