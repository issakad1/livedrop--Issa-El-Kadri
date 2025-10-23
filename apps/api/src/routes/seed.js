// ================================
// apps/api/src/routes/seed.js - Seed endpoint (REALISTIC DATA, INSTRUCTOR COMPLIANT)
// ================================
import express from "express";
import { faker } from "@faker-js/faker";
import { collections } from "../db.js";

const router = express.Router();

router.post("/seed", async (req, res) => {
  try {
    const { customers: customersCol, products: productsCol, orders: ordersCol } = collections();

    // Clear old data
    await customersCol.deleteMany({});
    await productsCol.deleteMany({});
    await ordersCol.deleteMany({});

    // ================================
    // 1️⃣ CUSTOMERS (12 total)
    // ================================
    const customers = Array.from({ length: 12 }, (_, i) => ({
      name: i === 0 ? "Demo User" : faker.person.fullName(),
      email: i === 0 ? "demo@example.com" : faker.internet.email().toLowerCase(),
      phone: faker.phone.number(),
      address: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.state()} ${faker.location.zipCode()}`,
      createdAt: faker.date.recent({ days: 60 }),
    }));

    const custRes = await customersCol.insertMany(customers);
    const customerIds = Object.values(custRes.insertedIds);
    const demoCustomerId = customerIds[0];

    // ================================
    // 2️⃣ PRODUCTS (25 total, 7 categories)
    // ================================
    const products = [
      // Audio
      {
        name: "Wireless Noise-Cancelling Headphones",
        description: "Premium over-ear headphones with deep bass, 30-hour battery life, and adaptive noise control.",
        price: 40,
        category: "Audio",
        tags: ["wireless", "premium"],
        imageUrl: "https://thvnext.bing.com/th/id/OIP.RhcYNnuoPMa5PBSD_CU3zgHaHa?w=198&h=198&c=7&r=0&o=7&cb=12&pid=1.7&rm=3",
      },
      {
        name: "Bluetooth Speaker Pro",
        description: "Portable waterproof speaker with rich sound and 24-hour playtime.",
        price: 31.5,
        category: "Audio",
        tags: ["portable", "bestseller"],
        imageUrl: "https://thvnext.bing.com/th/id/OIP.zKc_TIA9gpdVDBUwykrKRAHaFj?w=215&h=180&c=7&r=0&o=7&cb=12&pid=1.7&rm=3",
      },
      {
        name: "Studio Microphone Kit",
        description: "Professional-grade condenser microphone with stand and pop filter.",
        price: 149.99,
        category: "Audio",
        tags: ["studio", "premium"],
        imageUrl: "https://thvnext.bing.com/th/id/OIP.5V8WSKHe9m-XvK0-_KXY-QHaHa?w=182&h=182&c=7&r=0&o=7&cb=12&pid=1.7&rm=3",
      },

      // Fashion
      {
        name: "Classic Denim Jacket",
        description: "Timeless denim jacket that pairs perfectly with casual or streetwear looks.",
        price: 35,
        category: "Fashion",
        tags: ["classic", "bestseller"],
        imageUrl: "https://thvnext.bing.com/th/id/OIP.eSLaiMmhGTr3HlLPSvWfmQHaKn?w=184&h=264&c=7&r=0&o=7&cb=12&pid=1.7&rm=3"
        ,name: "Leather Messenger Bag",
        description: "Elegant leather bag ideal for work or travel.",
        price: 115,
        category: "Fashion",
        tags: ["leather", "premium"],
        imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500",
      },
      {
        name: "Running Sneakers",
        description: "Lightweight performance sneakers with breathable mesh upper and shock-absorbing sole.",
        price: 55.99,
        category: "Fashion",
        tags: ["sport", "eco"],
        imageUrl: "https://thvnext.bing.com/th?id=OIF.4b2WR063%2bOoxDPQjyc2ZSw&w=178&h=180&c=7&r=0&o=7&cb=12&pid=1.7&rm=3"
      
      
      
      
      },

      // Home
      {
        name: "Minimalist LED Lamp",
        description: "Energy-efficient LED desk lamp with touch controls and brightness adjustment.",
        price: 33,
        category: "Home",
        tags: ["lighting", "eco"],
        imageUrl: "https://tse2.mm.bing.net/th/id/OIP.-C_p7e8gGV7alQ3paVn57gHaHa?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3",
      },
      {
        name: "Ceramic Vase Set",
        description: "Elegant handcrafted vases perfect for home décor or gifts.",
        price: 112,
        category: "Home",
        tags: ["decor", "minimalist"],
        imageUrl: "https://thvnext.bing.com/th/id/OIP.Jt3vjhhjlwovCBjmJb6HVQHaHa?w=172&h=180&c=7&r=0&o=7&cb=12&pid=1.7&rm=3",
      },
      {
       name: "Camera Bag",
  description: "Durable and stylish camera bag with padded compartments to protect your gear and accessories.",
  price: 55.99,
  category: "Photography",
  tags: ["accessory", "camera", "travel"],
  imageUrl: "https://thvnext.bing.com/th/id/OIP.Hs67jySKodBOSaxpcUU8HAHaIX?w=161&h=182&c=7&r=0&o=7&cb=12&pid=1.7&rm=3",}

      // Gaming
      ,{
        name: "Mechanical Gaming Keyboard",
        description: "RGB mechanical keyboard with customizable lighting and tactile feedback.",
        price: 87.99,
        category: "Gaming",
        tags: ["rgb", "gaming"],
        imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500",
      },
      {
        name: "Wireless Gaming Mouse",
        description: "High-precision gaming mouse with ergonomic design and long battery life.",
        price: 90.,
        category: "Gaming",
        tags: ["wireless", "pro"],
        imageUrl: "https://thvnext.bing.com/th/id/OIP.w3_qntIq7AIuia74zq9figHaHa?w=177&h=180&c=7&r=0&o=7&cb=12&pid=1.7&rm=3",
      },
      {
        name: "Gaming Controller Elite",
        description: "Premium controller compatible with all major consoles and PCs.",
        price: 75.99,
        category: "Gaming",
        tags: ["elite", "controller"],
        imageUrl: "https://thvnext.bing.com/th/id/OIP.fUxQwQvQb7WsFVQAX5YjDAAAAA?w=236&h=180&c=7&r=0&o=7&cb=12&pid=1.7&rm=3",
      },

      // Fitness
      {
        name: "Yoga Mat Premium",
        description: "Extra-thick non-slip yoga mat with carrying strap for easy transport.",
        price: 25.99,
        category: "Fitness",
        tags: ["yoga", "lightweight"],
        imageUrl: "https://thvnext.bing.com/th/id/OIP.BeDfosBf_YENsn-obSXPagHaHk?w=176&h=180&c=7&r=0&o=7&cb=12&pid=1.7&rm=3",
      },
      {
        name: "Smart Fitness Watch",
        description: "Fitness tracker with GPS, heart-rate monitoring, and step counter.",
        price: 149.99,
        category: "Fitness",
        tags: ["smart", "wearable"],
        imageUrl: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500",
      },
      {
        name: "Resistance Bands Set",
        description: "5-piece resistance band kit with handles, door anchor, and carrying pouch.",
        price: 29.99,
        category: "Fitness",
        tags: ["home", "workout"],
        imageUrl: "https://thvnext.bing.com/th/id/OIP.NSRno7ON-qG7sguiMjsgcAHaHa?w=202&h=202&c=7&r=0&o=7&cb=12&pid=1.7&rm=3",
      },

      // Photography
      {
        name: "Mirrorless Camera Kit",
        description: "24MP mirrorless camera with 4K video and dual-lens package.",
        price: 150,
        category: "Photography",
        tags: ["camera", "pro"],
        imageUrl: "https://thvnext.bing.com/th/id/OIP.Xxg_uV5rc73YGv-1WCtdfQHaFV?w=233&h=180&c=7&r=0&o=7&cb=12&pid=1.7&rm=3",
      },
      {
        name: "Camera Tripod Pro",
        description: "Carbon fiber tripod with adjustable ball head and quick-release system.",
        price: 400,
        category: "Photography",
        tags: ["tripod", "lightweight"],
        imageUrl: "https://thvnext.bing.com/th/id/OIP.73MDHOPNA5daPh6yMLF9kQHaHa?w=207&h=207&c=7&r=0&o=7&cb=12&pid=1.7&rm=3",
      },
      {
        name: "LED Ring Light",
        description: "18-inch LED ring light perfect for photography, vlogging, and live streaming.",
        price: 40,
        category: "Photography",
        tags: ["lighting", "studio"],
        imageUrl: "https://thvnext.bing.com/th/id/OIP.M9gxgOo0LgYlcYe8NU21UQHaHa?w=192&h=192&c=7&r=0&o=7&cb=12&pid=1.7&rm=3",
      },

      // Accessories
      {
        name: "Wireless Charging Pad",
        description: "Fast wireless charging pad for all Qi-enabled devices.",
        price: 39.99,
        category: "Accessories",
        tags: ["charging", "tech"],
        imageUrl: "https://thvnext.bing.com/th/id/OIP.-wMLAGjZZeFjzNYDT8keygHaHa?w=186&h=185&c=7&r=0&o=7&cb=12&pid=1.7&rm=3",
      },
      {
        name: "USB-C Hub 7-in-1",
        description: "Multiport hub with HDMI, SD, and USB 3.0 ports for laptops.",
        price: 25,
        category: "Accessories",
        tags: ["usb", "portable"],
        imageUrl: "https://thvnext.bing.com/th/id/OIP.xdnsINAt1RN1i_vb-dYE2wHaHU?w=193&h=191&c=7&r=0&o=7&cb=12&pid=1.7&rm=3",
      },
      {
        name: "Laptop Stand Aluminum",
        description: "Ergonomic adjustable laptop stand made from lightweight aluminum.",
        price: 44.99,
        category: "Accessories",
        tags: ["office", "portable"],
        imageUrl: "https://thvnext.bing.com/th/id/OIP.XuIVQl7vPZ5xzHh4jfcT5AHaHa?w=201&h=201&c=7&r=0&o=7&cb=12&pid=1.7&rm=3",
      },
      {
        name: "Cable Organizer Set",
        description: "Silicone cable management kit for decluttering your workspace.",
        price: 40,
        category: "Accessories",
        tags: ["organization", "minimalist"],
        imageUrl: "https://thvnext.bing.com/th/id/OIP.ZbGVzkUTrzE033JtaGzX-AHaHa?w=180&h=180&c=7&r=0&o=7&cb=12&pid=1.7&rm=3",
      },
      {
        name: "Phone Mount Car",
        description: "Magnetic car mount for smartphones with 360° rotation.",
        price: 24.99,
        category: "Accessories",
        tags: ["car", "mount"],
        imageUrl: "https://thvnext.bing.com/th/id/OIP.Gsw3NyF84TUg7Ii0IaBMjAHaHa?w=201&h=201&c=7&r=0&o=7&cb=12&pid=1.7&rm=3",
      },
    ].map((p) => ({
      ...p,
      stock: faker.number.int({ min: 10, max: 100 }),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const prodRes = await productsCol.insertMany(products);
    const productIds = Object.values(prodRes.insertedIds);

    // ================================
    // 3️⃣ ORDERS (18 total)
    // ================================
    const statuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
    const orders = [];
    const pick = (arr, n) => faker.helpers.arrayElements(arr, n);

    function makeOrder(customerId) {
      const n = faker.number.int({ min: 1, max: 3 });
      const chosenIdx = pick(productIds.map((_, idx) => idx), n);
      const items = chosenIdx.map((idx) => ({
        productId: productIds[idx],
        name: products[idx].name,
        price: products[idx].price,
        quantity: faker.number.int({ min: 1, max: 2 }),
      }));
      const total = items.reduce((s, it) => s + it.price * it.quantity, 0).toFixed(2);
      const created = faker.date.recent({ days: 20 });
      return {
        customerId,
        items,
        total: Number(total),
        status: faker.helpers.arrayElement(statuses),
        carrier: faker.helpers.arrayElement(["UPS", "DHL", "FedEx", "USPS"]),
        estimatedDelivery: faker.date.soon({ days: 7, refDate: created }).toISOString(),
        createdAt: created,
        updatedAt: new Date(),
      };
    }

    for (let i = 0; i < 3; i++) orders.push(makeOrder(demoCustomerId));
    while (orders.length < 18) orders.push(makeOrder(faker.helpers.arrayElement(customerIds)));

    await ordersCol.insertMany(orders);

    // ================================
    // 4️⃣ SUCCESS RESPONSE
    // ================================
    res.json({
      success: true,
      message: "✅ Database seeded successfully with 12 customers, 25 products, and 18 orders.",
      data: {
        customers: customers.length,
        products: products.length,
        orders: orders.length,
        testUser: "demo@example.com",
      },
    });
  } catch (error) {
    console.error("[SEED ERROR]", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
