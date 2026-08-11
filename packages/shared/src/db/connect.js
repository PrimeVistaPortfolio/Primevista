const mongoose = require("mongoose");

let cached = global._primevistaMongoose;
if (!cached) {
  cached = global._primevistaMongoose = { conn: null, promise: null };
}

/**
 * Reuses a single connection across hot-reloads / serverless invocations.
 */
async function dbConnect() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set in the environment");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, { bufferCommands: false })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { dbConnect };
