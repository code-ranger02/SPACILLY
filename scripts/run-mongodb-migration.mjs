/**
 * Run mongodump + mongorestore migration via child_process.
 * Requires MongoDB Database Tools on PATH.
 */
import { execSync, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dumpDir = path.join(root, 'dump');

const OLD_URI =
  'mongodb+srv://reaglex:Loading99.99@reagle-x.uh9s5rn.mongodb.net/ReaglexDB?retryWrites=true&w=majority&appName=Reagle-x';
const NEW_URI =
  'mongodb+srv://spacilly:Loading99.99%25@spacilly.phhthbt.mongodb.net/SpacillyDB?retryWrites=true&w=majority&appName=spacilly';

function run(cmd, args, label) {
  console.log(`\n=== ${label} ===`);
  console.log(`${cmd} ${args.join(' ')}`);
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: true, cwd: root });
  if (r.status !== 0) {
    throw new Error(`${label} failed with exit code ${r.status ?? 'unknown'}`);
  }
}

function findTool(name) {
  try {
    const out = execSync(`where ${name}`, { encoding: 'utf8', shell: true }).trim();
    const first = out.split(/\r?\n/)[0]?.trim();
    if (first) return first;
  } catch {
    /* not on PATH */
  }

  const roots = [
    'C:\\Program Files\\MongoDB\\Tools',
    'C:\\Program Files (x86)\\MongoDB\\Tools',
  ];

  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
      const binDir = entry.isDirectory() ? path.join(root, entry.name, 'bin') : null;
      if (!binDir) continue;
      const exe = path.join(binDir, `${name}.exe`);
      if (fs.existsSync(exe)) return exe;
    }
    const flat = path.join(root, 'bin', `${name}.exe`);
    if (fs.existsSync(flat)) return flat;
  }

  return null;
}

const mongodump = findTool('mongodump');
const mongorestore = findTool('mongorestore');

if (!mongodump || !mongorestore) {
  console.error('MongoDB Database Tools not found. Install from:');
  console.error('https://www.mongodb.com/try/download/database-tools');
  process.exit(1);
}

console.log('Using:', mongodump);
console.log('Using:', mongorestore);

run(mongodump, [`--uri=${OLD_URI}`, `--out=${dumpDir}`], 'Step 1: Dump ReaglexDB');

const sourceDump = path.join(dumpDir, 'ReaglexDB');
if (!fs.existsSync(sourceDump)) {
  throw new Error(`Dump folder missing: ${sourceDump}`);
}

run(mongorestore, [`--uri=${NEW_URI}`, '--drop', sourceDump], 'Step 2: Restore to SpacillyDB');

console.log('\n=== Step 3: Verify ===');
const verify = spawnSync(
  process.execPath,
  [
    path.join(__dirname, 'verify-mongodb-migration.mjs'),
    `--old-uri=${OLD_URI}`,
    `--new-uri=${NEW_URI}`,
  ],
  { stdio: 'inherit', cwd: root, shell: false },
);

process.exit(verify.status ?? 1);
