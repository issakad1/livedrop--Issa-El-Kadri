// ================================
// apps/api/src/routes/analytics.js
// Analytics with Database Aggregation - PART 5 COMPLETE
// ================================
import { Router } from "express";
import { collections } from "../db.js";
import { apiError, wrapAsync } from "../util/error.js";

const r = Router();

// ================================
// DAILY REVENUE (Part 1 Requirement)
// ================================
r.get(
  "/daily-revenue",
  wrapAsync(async (req, res) => {
    const { orders } = collections();
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

    const rows = await orders.aggregate(pipeline).toArray();
    res.json(rows);
  })
);

// ================================
// DASHBOARD METRICS (Part 1 Requirement)
// ================================
r.get(
  "/dashboard-metrics",
  wrapAsync(async (_req, res) => {
    const { orders } = collections();
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

    const [agg] = await orders.aggregate(pipeline).toArray();
    res.json(agg || { revenue: 0, orders: 0, avgOrderValue: 0 });
  })
);

// ================================
// ORDERS BY STATUS - ✅ NEW FOR PART 5
// ================================
r.get(
  "/orders-by-status",
  wrapAsync(async (_req, res) => {
    const { orders } = collections();
    
    // ✅ Use MongoDB aggregation to group by status
    const pipeline = [
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ];
    
    const results = await orders.aggregate(pipeline).toArray();
    res.json(results);
  })
);

export default r;