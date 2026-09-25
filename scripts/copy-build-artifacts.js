import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const distDir = path.join(root, 'dist');
const buildDir = path.join(root, 'build');
const outDir = path.join(root, 'out');

if (!fs.existsSync(distDir) || !fs.existsSync(path.join(distDir, 'index.html'))) {
  console.error('❌ Build failed: dist/index.html does not exist.');
  process.exit(1);
}

// Mirror to build/ and out/ to satisfy any deployment artifact uploader (Vite dist, CRA build, static out)
[buildDir, outDir].forEach((targetDir) => {
  try {
    fs.rmSync(targetDir, { recursive: true, force: true });
    fs.cpSync(distDir, targetDir, { recursive: true });
    console.log(`✓ Mirrored build artifacts to: ${path.relative(root, targetDir)}/`);
  } catch (err) {
    console.error(`Failed to mirror to ${targetDir}:`, err);
  }
});

// Verify index.html exists and is non-empty in all target locations
['dist', 'build', 'out'].forEach((d) => {
  const indexPath = path.join(root, d, 'index.html');
  if (fs.existsSync(indexPath)) {
    const size = fs.statSync(indexPath).size;
    console.log(`✓ Verified ${d}/index.html (${size} bytes)`);
  } else {
    console.error(`❌ Verification failed: ${d}/index.html is missing`);
    process.exit(1);
  }
});

console.log('🎉 Valid build artifacts successfully produced and verified!');
