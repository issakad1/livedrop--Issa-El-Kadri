// apps/api/src/routes/products.js
import { Router } from "express";
import { collections, toObjectId } from "../db.js"; // ✅ Import helper
import { apiError, wrapAsync } from "../util/error.js";
import { parseBody, ProductSchema } from "../util/validate.js";

const r = Router();

r.get(
  "/",
  wrapAsync(async (req, res) => {
    const { products } = collections();
    const search = String(req.query.search || "").trim();
    const tag = String(req.query.tag || "").trim();
    const sort = String(req.query.sort || "relevance");
    const page = Math.max(1, parseInt(String(req.query.page || "1")));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || "12"))));

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }
    if (tag) filter.tags = tag;

    const sortMap = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      newest: { createdAt: -1 },
      stock_desc: { stock: -1 },
    };
    const sortSpec = sortMap[sort] || { createdAt: -1 };

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      products.find({ ...filter }).sort(sortSpec).skip(skip).limit(limit).toArray(),
      products.countDocuments(filter),
    ]);

    res.json({ items, page, total });
  })
);

r.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const { products } = collections();
    
    // ✅ Convert string to ObjectId safely
    let objectId;
    try {
      objectId = toObjectId(req.params.id);
    } catch (error) {
      return apiError(res, 400, "INVALID_ID", "Invalid product ID format");
    }
    
    const doc = await products.findOne({ _id: objectId });
    if (!doc) return apiError(res, 404, "PRODUCT_NOT_FOUND", "Product not found");
    res.json(doc);
  })
);

r.post(
  "/",
  wrapAsync(async (req, res) => {
    const { products } = collections();
    const body = parseBody(ProductSchema, req.body);
    const now = new Date();
    const doc = { ...body, createdAt: now, updatedAt: now };
    const ins = await products.insertOne(doc);
    res.status(201).json({ ...doc, _id: ins.insertedId });
  })
);

export default r;