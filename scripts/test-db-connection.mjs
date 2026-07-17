/**
 * Quick DB connection + CRUD smoke test against SpacillyDB.
 * Run: node scripts/test-db-connection.mjs
 */
import dotenv from 'dotenv';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const mongoose = require(path.join(__dirname, '../server/node_modules/mongoose'));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../server/env') });
dotenv.config({ path: path.join(__dirname, '../server/.env') });

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!uri) {
  console.error('MONGODB_URI / MONGO_URI not set');
  process.exit(1);
}

const TEST_COLL = '_migration_smoke_test';

await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
const db = mongoose.connection.db;
const dbName = db.databaseName;
console.log('Connected to database:', dbName);

const coll = db.collection(TEST_COLL);
const inserted = await coll.insertOne({ test: true, at: new Date() });
const found = await coll.findOne({ _id: inserted.insertedId });
const updated = await coll.updateOne({ _id: inserted.insertedId }, { $set: { updated: true } });
const deleted = await coll.deleteOne({ _id: inserted.insertedId });

const collections = (await db.listCollections().toArray()).map((c) => c.name).sort();
console.log('Collections count:', collections.length);
console.log('CRUD smoke test:', {
  insert: !!found,
  update: updated.modifiedCount === 1,
  delete: deleted.deletedCount === 1,
});

await mongoose.disconnect();
console.log('Database connection test PASSED.');
process.exit(0);
