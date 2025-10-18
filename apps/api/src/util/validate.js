import { z } from "zod";

export const ProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  price: z.number().min(0).max(5000),
  category: z.string().min(2),
  tags: z.array(z.string()).default([]),
  imageUrl: z.string().url().optional(),
  stock: z.number().int().min(0).default(0)
});

export const OrderItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().min(0),
  quantity: z.number().int().min(1)
});

export const CreateOrderSchema = z.object({
  customerId: z.string().min(1),
  items: z.array(OrderItemSchema).min(1)
});

export function parseBody(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    const err = new Error("Validation failed");
    err.status = 400;
    err.code = "VALIDATION_ERROR";
    err.details = result.error.flatten();
    throw err;
  }
  return result.data;
}
