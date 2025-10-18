// ================================
// apps/api/src/routes/seed.js - Seed endpoint
// ================================
import express from 'express';
import { faker } from '@faker-js/faker';
import { collections } from '../db.js';

const router = express.Router();
const pick = (arr, n) => faker.helpers.arrayElements(arr, n);

router.post('/seed', async (req, res) => {
  try {
    const { customers: customersCol, products: productsCol, orders: ordersCol } = collections();

    // Clear existing data
    await customersCol.deleteMany({});
    await productsCol.deleteMany({});
    await ordersCol.deleteMany({});

    // Generate customers
    const customerCount = faker.number.int({ min: 10, max: 15 });
    const customers = Array.from({ length: customerCount }, (_, i) => ({
      name: i === 0 ? "Demo User" : faker.person.fullName(),
      email: i === 0 ? "demo@example.com" : faker.internet.email().toLowerCase(),
      phone: faker.phone.number(),
      address: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.state()} ${faker.location.zipCode()}`,
      createdAt: faker.date.recent({ days: 60 })
    }));

    const custRes = await customersCol.insertMany(customers);
    const customerIds = Object.values(custRes.insertedIds);

    // Generate products
    const categories = ["Audio", "Fashion", "Home", "Gaming", "Fitness", "Photography", "Accessories"];
    const tagsPool = ["bestseller", "new", "sale", "wireless", "eco", "premium", "budget", "portable", "lightweight", "pro"];
    const productCount = faker.number.int({ min: 20, max: 30 });
    const products = Array.from({ length: productCount }, () => ({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: Number(faker.number.float({ min: 5, max: 500, precision: 0.01 }).toFixed(2)),
      category: faker.helpers.arrayElement(categories),
      tags: pick(tagsPool, faker.number.int({ min: 1, max: 3 })),
      imageUrl: faker.image.urlLoremFlickr({ category: "product" }),
      stock: faker.number.int({ min: 0, max: 120 }),
      createdAt: faker.date.recent({ days: 45 }),
      updatedAt: new Date()
    }));

    const prodRes = await productsCol.insertMany(products);
    const productIds = Object.values(prodRes.insertedIds);

    // Generate orders
    const statuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
    const ordersCount = faker.number.int({ min: 15, max: 20 });
    const demoCustomerId = customerIds[0];
    const orders = [];

    function makeOrder(customerId) {
      const n = faker.number.int({ min: 1, max: 4 });
      const chosenIdx = pick(productIds.map((id, idx) => idx), n);
      const items = chosenIdx.map(idx => ({
        productId: productIds[idx],
        name: products[idx].name,
        price: products[idx].price,
        quantity: faker.number.int({ min: 1, max: 3 })
      }));
      const total = Number(items.reduce((s, it) => s + it.price * it.quantity, 0).toFixed(2));
      const created = faker.date.recent({ days: 20 });
      return {
        customerId,
        items,
        total,
        status: faker.helpers.arrayElement(statuses),
        carrier: faker.helpers.arrayElement([null, "UPS", "DHL", "USPS", "FedEx"]),
        estimatedDelivery: faker.date.soon({ days: 7, refDate: created }).toISOString(),
        createdAt: created,
        updatedAt: new Date()
      };
    }

    // Create 2-3 orders for demo user
    for (let i = 0, n = faker.number.int({ min: 2, max: 3 }); i < n; i++) {
      orders.push(makeOrder(demoCustomerId));
    }

    // Create remaining orders for other customers
    while (orders.length < ordersCount) {
      const anyCust = faker.helpers.arrayElement(customerIds);
      orders.push(makeOrder(anyCust));
    }

    await ordersCol.insertMany(orders);

    res.json({
      success: true,
      message: "Database seeded successfully!",
      data: {
        customers: customerIds.length,
        products: productIds.length,
        orders: orders.length,
        testUser: "demo@example.com"
      }
    });

  } catch (error) {
    console.error("[SEED] Error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;