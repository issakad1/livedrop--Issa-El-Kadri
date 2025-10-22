// ================================
// apps/api/src/assistant/function-registry.js
// Enhanced Function Registry (Week 5)
// ================================

import { getDb } from '../db.js';
import { ObjectId } from 'mongodb';

// -------------------------------
// Utility Functions
// -------------------------------

function isValidObjectId(id) {
  return ObjectId.isValid(id);
}

// -------------------------------
// Core DB Query Functions
// -------------------------------

// 1️⃣ Get a single order by ID
async function getOrder(orderId) {
  const db = getDb();

  if (!isValidObjectId(orderId)) {
    console.warn(`[Function] Invalid order ID format: ${orderId}`);
    return { found: false, message: 'Invalid order ID format' };
  }

  const order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) });
  if (!order) return { found: false, message: `Order ${orderId} not found` };

  return {
    found: true,
    orderId: order._id.toString(),
    status: order.status,
    carrier: order.carrier || null,
    estimatedDelivery: order.estimatedDelivery || null,
    items: order.items.map(i => ({
      name: i.name,
      quantity: i.quantity,
      price: i.price
    })),
    total: order.total,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  };
}

// 2️⃣ Search products by text or regex
async function searchProductsByName(query, limit = 3) {
  const db = getDb();
  const normalized = query.toLowerCase().replace(/\b(any|some|the|a|an)\b/g, '').trim();

  // Try full-text search (requires text index)
  let products = await db.collection('products')
    .find({ $text: { $search: normalized } }, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .toArray();

  // Fallback to regex if no text results
  if (products.length === 0) {
    products = await db.collection('products')
      .find({
        $or: [
          { name: { $regex: normalized, $options: 'i' } },
          { description: { $regex: normalized, $options: 'i' } },
          { tags: { $regex: normalized, $options: 'i' } }
        ]
      })
      .limit(limit)
      .toArray();
  }

  if (products.length === 0) {
    return { found: false, query, message: `No products found for "${query}"` };
  }

  return {
    found: true,
    query,
    count: products.length,
    products: products.map(p => ({
      id: p._id.toString(),
      name: p.name,
      description: p.description || '',
      price: p.price,
      category: p.category || 'Uncategorized',
      stock: p.stock ?? 0,
      imageUrl: p.imageUrl || null
    }))
  };
}

// 3️⃣ Get orders for a customer
async function getOrdersByCustomerId(customerId, limit = 1) {
  if (!isValidObjectId(customerId)) {
    console.warn(`[Function] Invalid customer ID: ${customerId}`);
    return { found: false, message: 'Invalid customer ID format' };
  }

  const db = getDb();
  const orders = await db.collection('orders')
    .find({ customerId: new ObjectId(customerId) })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  return {
    found: true,
    count: orders.length,
    orders: orders.map(o => ({
      orderId: o._id.toString(),
      status: o.status,
      total: o.total,
      itemCount: o.items.length,
      createdAt: o.createdAt,
      carrier: o.carrier || null,
      estimatedDelivery: o.estimatedDelivery || null
    }))
  };
}

// 4️⃣ Count customer orders
async function countCustomerOrders(customerId) {
  if (!isValidObjectId(customerId)) return { orderCount: 0 };

  const db = getDb();
  const count = await db.collection('orders').countDocuments({ customerId: new ObjectId(customerId) });
  return { orderCount: count };
}

// 5️⃣ Count all products
async function countAllProducts() {
  const db = getDb();
  const count = await db.collection('products').countDocuments();
  return { totalProducts: count };
}

// 6️⃣ Calculate total spending
async function calculateTotalSpending(customerId) {
  if (!isValidObjectId(customerId)) {
    console.warn(`[Function] Invalid customer ID: ${customerId}`);
    return { totalSpent: 0, orderCount: 0 };
  }

  const db = getDb();
  const agg = await db.collection('orders').aggregate([
    { $match: { customerId: new ObjectId(customerId) } },
    { $group: { _id: null, totalSpent: { $sum: '$total' }, orderCount: { $sum: 1 } } }
  ]).toArray();

  return agg[0] || { totalSpent: 0, orderCount: 0 };
}

// -------------------------------
// Function Registry Map
// -------------------------------

const functions = {
  getOrderStatus: {
    schema: {
      name: 'getOrderStatus',
      description: 'Retrieve order details and status by ID',
      parameters: {
        type: 'object',
        properties: { orderId: { type: 'string' } },
        required: ['orderId']
      }
    },
    execute: ({ orderId }) => getOrder(orderId)
  },

  searchProducts: {
    schema: {
      name: 'searchProducts',
      description: 'Search products by name, description, or tags',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          limit: { type: 'number', default: 3 }
        },
        required: ['query']
      }
    },
    execute: ({ query, limit }) => searchProductsByName(query, limit)
  },

  getCustomerOrders: {
    schema: {
      name: 'getCustomerOrders',
      description: 'Fetch customer orders by ID',
      parameters: {
        type: 'object',
        properties: {
          customerId: { type: 'string' },
          limit: { type: 'number', default: 1 }
        },
        required: ['customerId']
      }
    },
    execute: ({ customerId, limit }) => getOrdersByCustomerId(customerId, limit)
  },

  getProductCount: {
    schema: {
      name: 'getProductCount',
      description: 'Count total products available',
      parameters: { type: 'object', properties: {} }
    },
    execute: () => countAllProducts()
  },

  getTotalSpendings: {
    schema: {
      name: 'getTotalSpendings',
      description: 'Compute total spending and order count for a customer',
      parameters: {
        type: 'object',
        properties: { customerId: { type: 'string' } },
        required: ['customerId']
      }
    },
    execute: ({ customerId }) => calculateTotalSpending(customerId)
  },

  countCustomerOrders: {
    schema: {
      name: 'countCustomerOrders',
      description: 'Count total orders placed by a customer',
      parameters: {
        type: 'object',
        properties: { customerId: { type: 'string' } },
        required: ['customerId']
      }
    },
    execute: ({ customerId }) => countCustomerOrders(customerId)
  }
};

// -------------------------------
// Public Registry API
// -------------------------------

export const functionRegistry = {
  async execute(name, args) {
    const fn = functions[name];
    if (!fn) throw new Error(`Function "${name}" not found.`);

    try {
      const result = await fn.execute(args);
      console.log(`[Function] ✅ ${name} executed successfully`);
      return { success: true, function: name, result };
    } catch (error) {
      console.error(`[Function] ❌ ${name} failed:`, error.message);
      return { success: false, function: name, error: error.message };
    }
  },

  getAllSchemas() {
    return Object.values(functions).map(f => f.schema);
  }
};
