// apps/api/src/routes/customers.js
import { Router } from "express";
import { collections, toObjectId } from "../db.js";
import { apiError, wrapAsync } from "../util/error.js";

const r = Router();

// Get customer by email (for simple user identification)
r.get(
  "/",
  wrapAsync(async (req, res) => {
    const { customers } = collections();
    const email = String(req.query.email || "").trim().toLowerCase();
    
    if (!email) {
      return apiError(res, 400, "MISSING_EMAIL", "Email query parameter is required");
    }
    
    const doc = await customers.findOne({ email });
    if (!doc) {
      return apiError(res, 404, "CUSTOMER_NOT_FOUND", "Customer not found");
    }
    
    res.json(doc);
  })
);

// Get customer by ID
r.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const { customers } = collections();
    
    let objectId;
    try {
      objectId = toObjectId(req.params.id);
    } catch (error) {
      return apiError(res, 400, "INVALID_ID", "Invalid customer ID format");
    }
    
    const doc = await customers.findOne({ _id: objectId });
    if (!doc) {
      return apiError(res, 404, "CUSTOMER_NOT_FOUND", "Customer not found");
    }
    
    res.json(doc);
  })
);

export default r;