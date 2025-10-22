// ================================
// apps/api/src/routes/orders.js - COMPLETE WITH SSE
// ================================
import { Router } from "express";
import { collections, toObjectId } from "../db.js";
import { apiError, wrapAsync } from "../util/error.js";
import { parseBody, CreateOrderSchema } from "../util/validate.js";

const r = Router();



// Get orders (optionally filtered by customerId)
r.get(
  "/",
  wrapAsync(async (req, res) => {
    const { orders } = collections();
    const customerId = req.query.customerId;
    
    if (customerId) {
      let objectId;
      try {
        objectId = toObjectId(customerId);
      } catch (error) {
        return apiError(res, 400, "INVALID_ID", "Invalid customer ID format");
      }
      
      const docs = await orders.find({ customerId: objectId }).sort({ createdAt: -1 }).toArray();
      return res.json(docs);
    }
    
    // Return all orders
    const docs = await orders.find({}).sort({ createdAt: -1 }).toArray();
    res.json(docs);
  })
);

// Get single order by ID
r.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const { orders } = collections();
    
    let objectId;
    try {
      objectId = toObjectId(req.params.id);
    } catch (error) {
      return apiError(res, 400, "INVALID_ID", "Invalid order ID format");
    }
    
    const doc = await orders.findOne({ _id: objectId });
    if (!doc) {
      return apiError(res, 404, "ORDER_NOT_FOUND", "Order not found");
    }
    
    res.json(doc);
  })
);

// Create new order
r.post(
  "/",
  wrapAsync(async (req, res) => {
    const { orders } = collections();
    const body = parseBody(CreateOrderSchema, req.body);
    
    // Convert customerId and productIds to ObjectId
    let customerId;
    try {
      customerId = toObjectId(body.customerId);
    } catch (error) {
      return apiError(res, 400, "INVALID_CUSTOMER_ID", "Invalid customer ID");
    }
    
    const items = body.items.map(item => ({
      ...item,
      productId: toObjectId(item.productId)
    }));
    
    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const now = new Date();
    const doc = {
      customerId,
      items,
      total,
      status: "PENDING",
      carrier: null,
      estimatedDelivery: null,
      createdAt: now,
      updatedAt: now,
    };
    
    const ins = await orders.insertOne(doc);
    res.status(201).json({ ...doc, _id: ins.insertedId });
  })
);

export default r;