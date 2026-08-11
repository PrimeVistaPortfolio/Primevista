require("dotenv").config({ path: require("path").resolve(__dirname, "../.env.local") });
const mongoose = require("mongoose");
const { dbConnect, Service, SERVICE_CATALOG_SEED } = require("@primevista/shared");

async function main() {
  await dbConnect();

  const existingSlugs = new Set((await Service.find({}, "slug").lean()).map((s) => s.slug));
  const toInsert = SERVICE_CATALOG_SEED.filter((s) => !existingSlugs.has(s.slug));

  if (toInsert.length) {
    await Service.insertMany(toInsert);
    console.log(`[seed:services] Inserted ${toInsert.length} services.`);
  } else {
    console.log("[seed:services] Catalog already seeded, nothing to do.");
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("[seed:services] failed", err);
  process.exit(1);
});
