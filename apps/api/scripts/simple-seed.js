// Simple seed script with SSL workaround
// Save as: apps/api/scripts/simple-seed.js

import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://issa:issakadri2004@cluster0.p47e2eu.mongodb.net/week5?retryWrites=true&w=majority";

const customers = [
  { name: "Demo User", email: "demo@example.com", phone: "+1-555-0100", address: "123 Main St, New York, NY 10001", createdAt: new Date("2024-01-15") },
  { name: "Sarah Johnson", email: "sarah.j@email.com", phone: "+1-555-0101", address: "456 Oak Ave, Los Angeles, CA 90001", createdAt: new Date("2024-02-20") },
  { name: "Michael Chen", email: "mchen@email.com", phone: "+1-555-0102", address: "789 Pine Rd, Chicago, IL 60601", createdAt: new Date("2024-03-10") }
];

const products = [
  { name: "Wireless Headphones", description: "Premium noise-canceling headphones", price: 199.99, category: "Audio", tags: ["bestseller", "wireless"], imageUrl: "https://picsum.photos/400/400?random=1", stock: 50, createdAt: new Date(), updatedAt: new Date() },
  { name: "Smart Watch", description: "Fitness tracking smartwatch", price: 299.99, category: "Fitness", tags: ["new", "wireless"], imageUrl: "https://picsum.photos/400/400?random=2", stock: 30, createdAt: new Date(), updatedAt: new Date() },
  { name: "Bluetooth Speaker", description: "Portable wireless speaker", price: 79.99, category: "Audio", tags: ["portable", "wireless"], imageUrl: "https://picsum.photos/400/400?random=3", stock: 100, createdAt: new Date(), updatedAt: new Date() }
];

async function seed() {
  const client = new MongoClient(uri, {
    tls: true,
    tlsAllowInvalidCertificates: true,
    serverSelectionTimeoutMS: 30000,
  });

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");
    
    const db = client.db('week5');
    
    // Clear and insert customers
    await db.collection('customers').deleteMany({});
    const custResult = await db.collection('customers').insertMany(customers);
    console.log(`✅ Inserted ${Object.keys(custResult.insertedIds).length} customers`);
    
    // Clear and insert products
    await db.collection('products').deleteMany({});
    const prodResult = await db.collection('products').insertMany(products);
    console.log(`✅ Inserted ${Object.keys(prodResult.insertedIds).length} products`);
    
    // Create sample order
    const demoCustomer = await db.collection('customers').findOne({ email: "demo@example.com" });
    const firstProduct = await db.collection('products').findOne({});
    
    if (demoCustomer && firstProduct) {
      await db.collection('orders').deleteMany({});
      await db.collection('orders').insertOne({
        customerId: demoCustomer._id,
        items: [{
          productId: firstProduct._id,
          name: firstProduct.name,
          price: firstProduct.price,
          quantity: 2
        }],
        total: firstProduct.price * 2,
        status: "PENDING",
        carrier: "UPS",
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`✅ Created sample order`);
    }
    
    console.log("\n🎉 Database seeded successfully!");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.close();
  }
}

seed();