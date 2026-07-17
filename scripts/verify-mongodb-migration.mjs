/**
 * Compare collection names, document counts, and index counts between old and new MongoDB URIs.
 */
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { MongoClient } = require(path.join(__dirname, '../server/node_modules/mongodb'));

function parseArgs() {
  const out = {};
  for (const arg of process.argv.slice(2)) {
    const m = arg.match(/^--([^=]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

async function getDbStats(uri, label) {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const dbName = db.databaseName;
  const collections = (await db.listCollections().toArray()).map((c) => c.name).sort();
  const stats = {};
  const indexes = {};

  for (const name of collections) {
    stats[name] = await db.collection(name).countDocuments();
    indexes[name] = (await db.collection(name).indexes()).length;
  }

  await client.close();
  return { label, dbName, collections, stats, indexes };
}

const { 'old-uri': oldUri, 'new-uri': newUri } = parseArgs();
if (!oldUri || !newUri) {
  console.error('Usage: node verify-mongodb-migration.mjs --old-uri=... --new-uri=...');
  process.exit(1);
}

const oldStats = await getDbStats(oldUri, 'OLD');
const newStats = await getDbStats(newUri, 'NEW');

console.log(`\nOLD: ${oldStats.dbName} (${oldStats.collections.length} collections)`);
console.log(`NEW: ${newStats.dbName} (${newStats.collections.length} collections)\n`);

const missingInNew = oldStats.collections.filter((c) => !newStats.collections.includes(c));
const extraInNew = newStats.collections.filter((c) => !oldStats.collections.includes(c));

let ok = true;

if (missingInNew.length) {
  ok = false;
  console.error('MISSING collections in new DB:', missingInNew.join(', '));
}
if (extraInNew.length) {
  console.warn('Extra collections in new DB (not in old):', extraInNew.join(', '));
}

console.log('\nCollection          | Old count | New count | Old idx | New idx | Status');
console.log('--------------------+-----------+-----------+---------+---------+--------');

for (const name of oldStats.collections) {
  const oc = oldStats.stats[name] ?? 0;
  const nc = newStats.stats[name] ?? 0;
  const oi = oldStats.indexes[name] ?? 0;
  const ni = newStats.indexes[name] ?? 0;
  const match = oc === nc && oi === ni;
  if (!match) ok = false;
  const status = match ? 'OK' : 'MISMATCH';
  console.log(
    `${name.padEnd(19)} | ${String(oc).padStart(9)} | ${String(nc).padStart(9)} | ${String(oi).padStart(7)} | ${String(ni).padStart(7)} | ${status}`,
  );
}

console.log(ok ? '\nVerification PASSED.' : '\nVerification FAILED — review mismatches above.');
process.exit(ok ? 0 : 1);
