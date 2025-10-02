import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URL;

if (!MONGODB_URI) {
  console.warn("MONGODB_URI not found in environment variables");
  console.log(
    "Available env vars:",
    Object.keys(process.env).filter((key) => key.includes("MONGO"))
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  const uri = MONGODB_URI || "mongodb://localhost:27017/next-mongo";

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose
      .connect(uri, opts)
      .then((mongoose) => {
        console.log("DB connected to:", uri.replace(/\/\/.*@/, "//***@"));
        return mongoose;
      })
      .catch((err) => {
        console.error("DB connection error:", err);
        cached.promise = null;
        throw err;
      });
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("DB connection failed:", e);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
