// ================================
// apps/api/src/server.js
// Main Server - PART 5 COMPLETE WITH FAILED REQUEST TRACKING
// ================================
import path from "path";
import { fileURLToPath } from 'url';
import dotenv from "dotenv";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (two levels up from src/)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

console.log("DEBUG ENV PATH:", path.resolve(__dirname, "../../.env"));
console.log("DEBUG ENV VALUES:", {
  MONGODB_URI: process.env.MONGODB_URI ? "OK" : "missing",
  DB_NAME: process.env.DB_NAME,
  LLM: process.env.LLM_ENDPOINT_URL || "missing"
});

import express from "express";
import cors from "cors";
import morgan from "morgan";
import { performance } from "node:perf_hooks";
import { connectDB } from "./db.js";

import customersRouter from "./routes/customers.js";
import productsRouter from "./routes/products.js";
import ordersRouter from "./routes/orders.js";
import analyticsRouter from "./routes/analytics.js";
import dashboardRouter, { perf } from "./routes/dashboard.js";
import seedRouter from "./routes/seed.js";
import orderStreamRouter from "./sse/order-status.js";
import { apiError } from "./util/error.js";
import assistantRoutes from "./routes/assistant.js";

// Initialize app
const app = express();

// ================================
// Middleware
// ================================
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("tiny"));

// ✅ Track API version + latency + FAILED REQUESTS
app.use((req, res, next) => {
  res.setHeader("x-api-version", "1");

  const start = performance.now();
  res.on("finish", () => {
    const ms = performance.now() - start;
    perf.requestsTotal++;
    
    // ✅ TRACK FAILED REQUESTS (4xx and 5xx)
    if (res.statusCode >= 400) {
      perf.failedRequests++;
    }
    
    perf.latencies.push(ms);
    if (perf.latencies.length > 500) perf.latencies.shift();
  });
  next();
});

// ================================
// Health Check
// ================================
app.get("/health", (_req, res) => res.json({ ok: true, db: "data-api" }));

// ================================
// API Routes
// ================================
app.use("/api/customers", customersRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api", seedRouter);
app.use("/api/assistant", assistantRoutes);
app.use("/api/orders", orderStreamRouter);

// ================================
// Error Handling
// ================================
app.use((req, res) =>
  apiError(res, 404, "NOT_FOUND", `Route ${req.method} ${req.path} not found`)
);

app.use((err, req, res, _next) => {
  console.error("[ERR]", err);
  return apiError(
    res,
    err.status || 500,
    err.code || "INTERNAL_ERROR",
    err.message || "Unexpected server error",
    err.details
  );
});

// ================================
// Start Server
// ================================
const port = Number(process.env.PORT || 8080);

async function startServer() {
  try {
    await connectDB();
    console.log("[DB] Connection established");

    app.listen(port, () => {
      console.log(`[API] Server running on port ${port} (Data API)`);
      console.log(`[DASHBOARD] http://localhost:${port}/api/dashboard/performance`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err);
    process.exit(1);
  }
}

startServer();