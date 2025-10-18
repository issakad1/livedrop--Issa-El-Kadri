// ================================
// 4) Update routes to use Data API wrapper
// apps/storefront/apps/api/src/routes/customers.js
// ================================
import { Router } from "express";
import { collections } from "../db.js";
import { apiError, wrapAsync } from "../util/error.js";

const r = Router();
const { customers } = collections();

r.get("/", wrapAsync(async (req, res) => {
  const email = String(req.query.email || "").trim().toLowerCase();
  if (!email) return apiError(res, 400, "BAD_REQUEST", "email query is required");
  const doc = await customers.findOne({ email });
  if (!doc) return apiError(res, 404, "CUSTOMER_NOT_FOUND", "No customer with that email");
  res.json(doc);
}));

r.get("/:id", wrapAsync(async (req, res) => {
  const id = String(req.params.id);
  const doc = await customers.findOne({ _id: id });
  if (!doc) return apiError(res, 404, "CUSTOMER_NOT_FOUND", "Invalid customer id");
  res.json(doc);
}));

export default r;
