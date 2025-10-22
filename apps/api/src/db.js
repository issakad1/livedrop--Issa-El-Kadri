// apps/api/src/db.js
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || "week5";

if (!MONGODB_URI) {
  console.error("[FATAL] Missing MONGODB_URI in environment");
  process.exit(1);
}

let client = null;
let db = null;

export async function connectDB() {
  try {
    if (client && db) {
      console.log("[DB] Already connected");
      return db;
    }

    console.log("[DB] Connecting to MongoDB...");

    client = new MongoClient(MONGODB_URI, {
      ssl: true,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    await client.connect();
    db = client.db(DB_NAME);

    await db.command({ ping: 1 });
    console.log(`[DB] Connected successfully to database: ${DB_NAME}`);

    return db;
  } catch (error) {
    console.error("❌ [DB] Connection failed:", error);
    throw error;
  }
}

export function collections() {
  if (!db) throw new Error("[DB] Not connected. Call connectDB() first.");
  return {
    customers: db.collection("customers"),
    products: db.collection("products"),
    orders: db.collection("orders"),
  };
}

export async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("[DB] Connection closed");
  }
}
// ✅ Helper function to safely convert string to ObjectId
export function toObjectId(id) {
  if (!id) return null;
  if (id instanceof ObjectId) return id;
  if (!ObjectId.isValid(id)) throw new Error("Invalid ObjectId format");
  return new ObjectId(id);
}

// ✅ Provide getDb helper for use in function-registry.js
export function getDb() {
  if (!db) {
    throw new Error("[DB] Database not connected. Please call connectDB() first.");
  }
  return db;
}

// ❌ Remove this (causes duplicate export)
// export { ObjectId };
