import { Router } from "express";
export const perf = { requestsTotal: 0, latencies: [], sseConnections: 0, llmMsByIntent: {} };
const r = Router();

r.get("/business-metrics", (_req, res) => {
  res.redirect(307, "/api/analytics/dashboard-metrics");
});

r.get("/performance", (_req, res) => {
  const lat = [...perf.latencies];
  const avg = lat.length ? lat.reduce((a, b) => a + b, 0) / lat.length : 0;
  const p95 = lat.length ? lat.slice().sort((a, b) => a - b)[Math.floor(lat.length * 0.95) - 1] || 0 : 0;
  res.json({
    requestsTotal: perf.requestsTotal,
    avgLatencyMs: Number(avg.toFixed(1)),
    p95LatencyMs: Number((p95 || 0).toFixed(1)),
    sseConnections: perf.sseConnections,
    failedRequests: 0
  });
});

r.get("/assistant-stats", (_req, res) => {
  res.json({ totalQueries: 0, intents: {}, functionCalls: {}, avgResponseMsByIntent: {} });
});

export default r;
