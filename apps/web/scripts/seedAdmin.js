require("dotenv").config({ path: require("path").resolve(__dirname, "../.env.local") });
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { dbConnect, AdminUser } = require("@primevista/shared");

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || "admin@primevista.dev";
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
  const name = process.env.SEED_ADMIN_NAME || "Site Owner";

  await dbConnect();

  const existing = await AdminUser.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`[seed:admin] Admin user already exists: ${email}`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await AdminUser.create({ name, email: email.toLowerCase(), passwordHash, role: "owner" });

  console.log(`[seed:admin] Created admin user:`);
  console.log(`  email:    ${email}`);
  console.log(`  password: ${password}`);
  console.log(`  (set SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD env vars to customize)`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("[seed:admin] failed", err);
  process.exit(1);
});
