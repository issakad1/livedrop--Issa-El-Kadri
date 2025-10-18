// ================================
// apps/storefront/apps/api/src/routes/analytics.js
// ================================
import { Router } from "express";
import { collections } from "../db.js";
import { apiError, wrapAsync } from "../util/error.js";

const r = Router();

// ✅ Removed the top-level collections() call

r.get(
  "/daily-revenue",
  wrapAsync(async (req, res) => {
    const { orders } = collections(); // ✅ safe inside handler
    const from = String(req.query.from || "");
    const to = String(req.query.to || "");

    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      return apiError(res, 400, "BAD_REQUEST", "from/to must be YYYY-MM-DD");
    }

    const fromDate = new Date(from + "T00:00:00.000Z");
    const toDate = new Date(to + "T23:59:59.999Z");

    const pipeline = [
      { $match: { createdAt: { $gte: fromDate, $lte: toDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$total" },
          orderCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          revenue: { $round: ["$revenue", 2] },
          orderCount: 1,
        },
      },
      { $sort: { date: 1 } },
    ];

    const rows = await orders.aggregate(pipeline).toArray(); // ✅ add .toArray()
    res.json(rows);
  })
);

r.get(
  "/dashboard-metrics",
  wrapAsync(async (_req, res) => {
    const { orders } = collections(); // ✅ safe inside handler
    const pipeline = [
      {
        $group: {
          _id: null,
          revenue: { $sum: "$total" },
          count: { $sum: 1 },
          avg: { $avg: "$total" },
        },
      },
      {
        $project: {
          _id: 0,
          revenue: { $round: ["$revenue", 2] },
          orders: "$count",
          avgOrderValue: { $round: ["$avg", 2] },
        },
      },
    ];

    const [agg] = await orders.aggregate(pipeline).toArray(); // ✅ add .toArray()
    res.json(agg || { revenue: 0, orders: 0, avgOrderValue: 0 });
  })
);

export default r;
