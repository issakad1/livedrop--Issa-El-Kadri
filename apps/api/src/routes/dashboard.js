// ================================
// apps/api/src/routes/dashboard.js
// Dashboard Metrics - PART 5 COMPLETE
// ================================
import { Router } from "express";
import { getAssistantAnalytics } from "../assistant/assistant-engine.js";

// ✅ Performance tracking object (exported for use in server.js)
export const perf = { 
  requestsTotal: 0, 
  latencies: [], 
  sseConnections: 0, 
  failedRequests: 0,  // ✅ ADDED FOR PART 5
  llmMsByIntent: {} 
};

const r = Router();

// ================================
// BUSINESS METRICS
// ================================
r.get("/business-metrics", (_req, res) => {
  // Redirect to analytics endpoint (already implemented with aggregation)
  res.redirect(307, "/api/analytics/dashboard-metrics");
});

// ================================
// PERFORMANCE MONITORING
// ================================
r.get("/performance", (_req, res) => {
  const lat = [...perf.latencies];
  const avg = lat.length ? lat.reduce((a, b) => a + b, 0) / lat.length : 0;
  const p95 = lat.length 
    ? lat.slice().sort((a, b) => a - b)[Math.floor(lat.length * 0.95) - 1] || 0 
    : 0;
  
  res.json({
    requestsTotal: perf.requestsTotal,
    avgLatencyMs: Number(avg.toFixed(1)),
    p95LatencyMs: Number((p95 || 0).toFixed(1)),
    sseConnections: perf.sseConnections,
    failedRequests: perf.failedRequests  // ✅ NOW TRACKED
  });
});

// ================================
// ASSISTANT ANALYTICS - ✅ FIXED FOR PART 5
// ================================
r.get("/assistant-stats", (_req, res) => {
  // ✅ Get real statistics from assistant engine
  const stats = getAssistantAnalytics();
  res.json(stats);
});

export default r;