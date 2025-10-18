// ================================
// 3) Update server to use connectDB stub
// apps/storefront/apps/api/src/server.js
// ================================
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB } from "./db.js";
import customersRouter from "./routes/customers.js";
import productsRouter from "./routes/products.js";
import ordersRouter from "./routes/orders.js";
import analyticsRouter from "./routes/analytics.js";
import dashboardRouter, { perf } from "./routes/dashboard.js";
import { apiError } from "./util/error.js";
import { performance } from "node:perf_hooks";

dotenv.config();
const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "1mb" }));
app.use((req, res, next) => { res.setHeader("x-api-version", "1"); next(); });
app.use((req, res, next) => {
  const start = performance.now();
  res.on("finish", () => {
    const ms = performance.now() - start;
    perf.requestsTotal++;
    perf.latencies.push(ms);
    if (perf.latencies.length > 500) perf.latencies.shift();
  });
  next();
});
app.use(morgan("tiny"));

app.get("/health", (_req, res) => res.json({ ok: true, db: "data-api" }));
app.use("/api/customers", customersRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/dashboard", dashboardRouter);

app.use((req, res) => apiError(res, 404, "NOT_FOUND", `Route ${req.method} ${req.path} not found`));
app.use((err, req, res, _next) => {
  console.error("[ERR]", err);
  return apiError(res, err.status || 500, err.code || "INTERNAL_ERROR", err.message || "Unexpected server error", err.details);
});

const port = Number(process.env.PORT || 8080);
const db = connectDB();
app.locals.db = db;
app.listen(port, () => console.log(`[API] http://localhost:${port} (Data API)`));
