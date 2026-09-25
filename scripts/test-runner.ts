import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { VALID_ROUTES, isValidRoute } from '../src/lib/routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, errorDetail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${testName}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${testName}`);
    if (errorDetail) console.error(`     Details: ${errorDetail}`);
  }
}

console.log('===============================================================');
console.log('🧪 EncroachAI Automated Verification & Test Suite');
console.log('===============================================================');

// 1. ROUTING TESTS
console.log('\n[Suite 1: Routing & Navigation]');
const EXPECTED_ROUTES = [
  '/',
  '/about',
  '/tool'
];

assert(
  VALID_ROUTES.length === 3,
  `Exactly 3 canonical routes registered (found: ${VALID_ROUTES.length})`
);

for (const route of EXPECTED_ROUTES) {
  assert(isValidRoute(route), `Route '${route}' passes isValidRoute check`);
}
assert(!isValidRoute('/invalid-route-xyz'), 'Non-existent route rejected');
assert(!isValidRoute('/admin/dashboard'), 'Unregistered admin route rejected');

// 2. DATA SCHEMAS & PROVENANCE INTEGRITY
console.log('\n[Suite 2: Research Data & Schema Integrity]');

// A. Detection Samples
const detectionsPath = path.join(ROOT_DIR, 'src', 'data', 'detectionSamples.json');
assert(fs.existsSync(detectionsPath), 'src/data/detectionSamples.json exists');
const detectionSamples = JSON.parse(fs.readFileSync(detectionsPath, 'utf8'));
assert(Array.isArray(detectionSamples) && detectionSamples.length >= 8, `detectionSamples contains >=8 samples (found: ${detectionSamples.length})`);

let allDetectionsValid = true;
for (const sample of detectionSamples) {
  if (!sample.id || !sample.location || !sample.provenance) allDetectionsValid = false;
  const detections = sample.detections || sample.predictions;
  if (!detections || !Array.isArray(detections)) {
    allDetectionsValid = false;
    continue;
  }
  for (const det of detections) {
    const [x, y, w, h] = det.bbox;
    if (x < 0 || x > 100 || y < 0 || y > 100 || w <= 0 || h <= 0) {
      allDetectionsValid = false;
    }
  }
}
assert(allDetectionsValid, 'All detection bounding boxes within valid 0-100% bounds with provenance tags');

// B. Simulation Results
const simPath = path.join(ROOT_DIR, 'src', 'data', 'simulationResults.json');
assert(fs.existsSync(simPath), 'src/data/simulationResults.json exists');
const simData = JSON.parse(fs.readFileSync(simPath, 'utf8'));
assert(Boolean(simData.light && simData.moderate && simData.heavy), 'All 3 regimes (light, moderate, heavy) defined in simulationResults');
const modStaticDelay = simData.moderate?.avgDelaySec?.static;
const modEncroachDelay = simData.moderate?.avgDelaySec?.yourSystem;
assert(modStaticDelay > modEncroachDelay, `EncroachAI reduces delay (${modStaticDelay}s -> ${modEncroachDelay}s)`);
assert(Array.isArray(simData.moderate.throughputOverTime) && simData.moderate.throughputOverTime.length > 0, 'Throughput timeSeries data present in simulation data');

// C. Corridor Map
const corridorMapPath = path.join(ROOT_DIR, 'src', 'data', 'corridorMap.json');
assert(fs.existsSync(corridorMapPath), 'src/data/corridorMap.json exists');
const corridorMap = JSON.parse(fs.readFileSync(corridorMapPath, 'utf8'));
const intersections = corridorMap.intersections || corridorMap.junctions;
assert(Array.isArray(intersections) && intersections.length === 7, `Corridor map defines exactly 7 junctions (found: ${intersections.length})`);
const activeJunctions = intersections.filter((j: any) => j.scope === 'active-experiment' || j.status === 'active');
assert(activeJunctions.length === 3, `Corridor map defines exactly 3 active instrumented junctions (found: ${activeJunctions.length})`);

// 3. SUMO ARTERIAL SIMULATION ASSETS
console.log('\n[Suite 3: SUMO Simulation Pipeline Assets]');
const simFiles = [
  'sim/anna_salai_corridor.sumocfg',
  'sim/anna_salai_corridor.net.xml',
  'sim/corridor.rou.xml',
  'sim/encroachment.add.xml'
];

for (const sf of simFiles) {
  const filePath = path.join(ROOT_DIR, sf);
  const exists = fs.existsSync(filePath);
  assert(exists, `SUMO asset exists: ${sf}`);
  if (exists) {
    const content = fs.readFileSync(filePath, 'utf8');
    assert(content.startsWith('<?xml') || content.includes('<configuration') || content.includes('<net'), `Valid XML header in ${sf}`);
  }
}

// 4. DATASET SPECIFICATION & SEED SCAFFOLD
console.log('\n[Suite 4: Dataset & YOLOv10 Directory Scaffold]');
const datasetDirs = [
  'dataset/images/train',
  'dataset/images/val',
  'dataset/images/test',
  'dataset/labels/train',
  'dataset/labels/val',
  'dataset/labels/test'
];

for (const dd of datasetDirs) {
  const dirPath = path.join(ROOT_DIR, dd);
  assert(fs.existsSync(dirPath), `Dataset split exists: ${dd}`);
}

const datasetYamlPath = path.join(ROOT_DIR, 'pipeline', 'encroachai_dataset.yaml');
assert(fs.existsSync(datasetYamlPath), 'pipeline/encroachai_dataset.yaml exists');

// 5. SECURITY & ENVIRONMENT HYGIENE
console.log('\n[Suite 5: Zero-Leak & Build Safety]');
assert(fs.existsSync(path.join(ROOT_DIR, 'vercel.json')), 'vercel.json static rewrite present');
assert(fs.existsSync(path.join(ROOT_DIR, 'tsconfig.json')), 'tsconfig.json present');

const tsconfig = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'tsconfig.json'), 'utf8'));
assert(tsconfig.compilerOptions?.strict === true, 'TypeScript compiler strict mode explicitly enabled');

// SUMMARY
console.log('\n===============================================================');
if (failedTests === 0) {
  console.log(`🎉 ALL ${totalTests} TESTS PASSED SUCCESSFULLY (100% Pass Rate)`);
  console.log('===============================================================');
  process.exit(0);
} else {
  console.error(`❌ ${failedTests} of ${totalTests} TESTS FAILED`);
  console.log('===============================================================');
  process.exit(1);
}
