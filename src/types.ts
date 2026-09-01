export type EncroachmentClass = 
  | 'vendor_cart' 
  | 'double_parked_vehicle' 
  | 'illegal_stall' 
  | 'pedestrian_spillover';

export type SeverityLevel = 'light' | 'moderate' | 'heavy';

export type DataProvenance = 'real' | 'projected';

export type CorridorScope = 'active-experiment' | 'extended-context';

export interface BoundingBox {
  class: EncroachmentClass;
  confidence: number;
  bbox: [number, number, number, number]; // [x%, y%, width%, height%]
  label?: string;
  laneImpactPct?: number;
}

export interface DetectionSample {
  id: string;
  provenance: DataProvenance;
  title: string;
  location: string;
  corridor: string;
  timestamp: string;
  nominalLanes: number;
  effectiveLanes: number;
  functionalCapacityPct: number;
  primaryEncroachment: EncroachmentClass;
  severity: SeverityLevel;
  detections: BoundingBox[];
  description: string;
  inferredBottleneck: string;
  imageTheme: string;
}

export interface ApproachWaitTime {
  approach: string;
  static: number;
  adaptive: number;
  yourSystem: number;
}

export interface ThroughputDataPoint {
  time: string;
  static: number;
  adaptive: number;
  yourSystem: number;
}

export interface ScenarioData {
  provenance: DataProvenance;
  waitTime: ApproachWaitTime[];
  throughputOverTime: ThroughputDataPoint[];
  avgDelaySec: { static: number; adaptive: number; yourSystem: number };
  queueLengthMeters: { static: number; adaptive: number; yourSystem: number };
  co2EmissionsKgHr: { static: number; adaptive: number; yourSystem: number };
}

export interface SimulationResults {
  light: ScenarioData;
  moderate: ScenarioData;
  heavy: ScenarioData;
}

export interface IntersectionMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  scope: CorridorScope;
  provenance: DataProvenance;
  currentSeverity: SeverityLevel;
  nominalCapacityPcu: number;
  observedCapacityPcu: number;
  effectiveCapacityPct: number;
  activeGreenPhaseSec: number;
  coordinatedWith: string[];
}

export interface CorridorMapData {
  corridor: string;
  city: string;
  totalLengthKm: number;
  intersections: IntersectionMarker[];
}
