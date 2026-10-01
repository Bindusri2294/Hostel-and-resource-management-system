const mongoose = require("mongoose");
require("dotenv").config();

const MIGRATIONS = [
  { from: "K1", to: "KIET" },
  { from: "KK", to: "KIET+" },
  { from: "K+", to: "KIET+" },
  { from: "KW", to: "KIETW" },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log("Connected to MongoDB\n");

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();

  // Phase 1: Inspect — show what will be changed
  console.log("=== PHASE 1: INSPECTION ===\n");
  let totalDocs = 0;

  for (const colInfo of collections) {
    const colName = colInfo.name;
    const col = db.collection(colName);

    for (const { from, to } of MIGRATIONS) {
      // Check both "Campus" and "campus" field variants
      const filter = {
        $or: [{ Campus: from }, { campus: from }],
      };
      const count = await col.countDocuments(filter);
      if (count > 0) {
        console.log(`  [${colName}] "${from}" → "${to}": ${count} documents`);
        totalDocs += count;
      }
    }
  }

  if (totalDocs === 0) {
    console.log("  No documents need migration. All campus codes are already up to date.");
    process.exit(0);
  }

  console.log(`\nTotal documents to migrate: ${totalDocs}\n`);

  // Phase 2: Migrate
  console.log("=== PHASE 2: MIGRATION ===\n");

  for (const colInfo of collections) {
    const colName = colInfo.name;
    const col = db.collection(colName);

    for (const { from, to } of MIGRATIONS) {
      // Update "Campus" field (uppercase)
      const res1 = await col.updateMany({ Campus: from }, { $set: { Campus: to } });
      if (res1.modifiedCount > 0) {
        console.log(`  ✅ [${colName}] Campus: "${from}" → "${to}": ${res1.modifiedCount} updated`);
      }

      // Update "campus" field (lowercase)
      const res2 = await col.updateMany({ campus: from }, { $set: { campus: to } });
      if (res2.modifiedCount > 0) {
        console.log(`  ✅ [${colName}] campus: "${from}" → "${to}": ${res2.modifiedCount} updated`);
      }
    }
  }

  console.log("\n✅ Campus code migration complete!");
  process.exit(0);
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
