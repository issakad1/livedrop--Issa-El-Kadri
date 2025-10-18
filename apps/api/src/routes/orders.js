// ================================
// apps/storefront/apps/api/src/routes/orders.js
// ================================
import { Router } from "express";
import { collections } from "../db.js";
import { apiError, wrapAsync } from "../util/error.js";
import { parseBody, CreateOrderSchema } from "../util/validate.js";

const r = Router();
const { orders, customers, products } = collections();

r.post("/", wrapAsync(async (req, res) => {
  const body = parseBody(CreateOrderSchema, req.body);

  const customer = await customers.findOne({ _id: body.customerId });
  if (!customer) return apiError(res, 400, "INVALID_CUSTOMER", "customerId not found");

  let total = 0;
  for (const it of body.items) {
    const prod = await products.findOne({ _id: it.productId });
    if (!prod) return apiError(res, 400, "INVALID_PRODUCT", `productId ${it.productId} not found`);
    total += it.price * it.quantity;
  }

  const now = new Date();
  const order = {
    customerId: customer._id,
    items: body.items,
    total: Number(total.toFixed(2)),
    status: "PENDING",
    carrier: null,
    estimatedDelivery: null,
    createdAt: now,
    updatedAt: now
  };

  const ins = await orders.insertOne(order);
  res.status(201).json({ ...order, _id: ins.insertedId });
}));

r.get("/:id", wrapAsync(async (req, res) => {
  const id = String(req.params.id);
  const doc = await orders.findOne({ _id: id });
  if (!doc) return apiError(res, 404, "ORDER_NOT_FOUND", "Invalid order id");
  res.json(doc);
}));

r.get("/", wrapAsync(async (req, res) => {
  const customerId = String(req.query.customerId || "").trim();
  if (!customerId) return apiError(res, 400, "BAD_REQUEST", "customerId query is required");
  const items = await orders.findMany({ filter: { customerId }, sort: { createdAt: -1 } });
  res.json(items);
}));

export default r;
