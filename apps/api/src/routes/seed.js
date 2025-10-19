// ================================
// apps/api/src/routes/seed.js - Seed endpoint with CONSISTENT data
// ================================
import express from 'express';
import { faker } from '@faker-js/faker';
import { collections } from '../db.js';

const router = express.Router();

// ✅ SET FAKER SEED - Makes all random data consistent
faker.seed(12345);

const pick = (arr, n) => faker.helpers.arrayElements(arr, n);

router.post('/seed', async (req, res) => {
  try {
    const { customers: customersCol, products: productsCol, orders: ordersCol } = collections();

    // Clear existing data
    await customersCol.deleteMany({});
    await productsCol.deleteMany({});
    await ordersCol.deleteMany({});

    // Generate customers (now consistent due to faker.seed())
    const customerCount = 12; // Fixed count instead of random
    const customers = Array.from({ length: customerCount }, (_, i) => ({
      name: i === 0 ? "Demo User" : faker.person.fullName(),
      email: i === 0 ? "demo@example.com" : faker.internet.email().toLowerCase(),
      phone: faker.phone.number(),
      address: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.state()} ${faker.location.zipCode()}`,
      createdAt: faker.date.recent({ days: 60 })
    }));

    const custRes = await customersCol.insertMany(customers);
    const customerIds = Object.values(custRes.insertedIds);

    // Generate products with your templates
    const categories = ["Audio", "Fashion", "Home", "Gaming", "Fitness", "Photography", "Accessories"];
    const tagsPool = ["bestseller", "new", "sale", "wireless", "eco", "premium", "budget", "portable", "lightweight", "pro"];
    const productCount = 25; // ✅ Fixed count
    
    // Category-specific product templates
    const categoryTemplates = {
      Audio: {
        names: [
          "Wireless Noise-Cancelling Headphones",
          "Bluetooth Speaker Pro",
          "Smart Soundbar",
          "Studio Microphone Kit",
          "Hi-Fi Stereo Earbuds"
        ],
        descriptions: [
          "Experience immersive, crystal-clear sound with deep bass and 30-hour battery life.",
          "Compact yet powerful speaker that delivers crisp audio for your next party.",
          "Enhance your TV experience with virtual surround and wireless connectivity.",
          "Perfect for podcasters and streamers, with professional-grade audio clarity.",
          "Designed for comfort and performance during daily commutes or workouts."
        ],
        images: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
          "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
          "https://images.unsplash.com/photo-1545127398-14699f92334b?w=500",
          "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500",
          "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500"
        ]
      },
      Fashion: {
        names: [
          "Classic Denim Jacket",
          "Silk Summer Dress",
          "Leather Messenger Bag",
          "Running Sneakers",
          "Cotton Hoodie"
        ],
        descriptions: [
          "Timeless and durable, pairs perfectly with any casual outfit.",
          "Lightweight silk dress with breathable fabric and vibrant colors.",
          "Hand-crafted messenger bag made from genuine leather.",
          "High-performance sneakers designed for comfort and style.",
          "Soft and cozy hoodie with a minimalist modern cut."
        ],
        images: [
          "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500",
          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500",
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500",
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
          "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500"
        ]
      },
      Home: {
        names: [
          "Minimalist LED Lamp",
          "Ceramic Vase Set",
          "Smart Wi-Fi Air Purifier",
          "Aromatherapy Diffuser",
          "Wall Art Canvas"
        ],
        descriptions: [
          "Sleek modern lamp with adjustable brightness and touch controls.",
          "Elegant ceramic vase collection perfect for any home decor.",
          "Advanced air purifier with HEPA filter and smart app control.",
          "Ultrasonic diffuser with soothing LED lights and timer.",
          "Premium canvas art print ready to hang."
        ],
        images: [
          "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500",
          "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=500",
          "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500",
          "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500",
          "https://images.unsplash.com/photo-1513519245088-0e3ad4e6e89f?w=500"
        ]
      },
      Gaming: {
        names: [
          "Mechanical Gaming Keyboard",
          "Wireless Gaming Mouse",
          "Gaming Headset Pro",
          "Gaming Controller Elite",
          "RGB Mouse Pad"
        ],
        descriptions: [
          "RGB backlit mechanical keyboard with customizable keys.",
          "High-precision wireless mouse with 16,000 DPI sensor.",
          "7.1 surround sound headset with noise-canceling mic.",
          "Pro-grade controller with customizable buttons.",
          "Large RGB mouse pad with non-slip base."
        ],
        images: [
          "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500",
          "https://images.unsplash.com/photo-1527814050087-3793815479db?w=500",
          "https://images.unsplash.com/photo-1599669454699-248893623440?w=500",
          "https://images.unsplash.com/photo-1592840331687-d4c752f4a67c?w=500",
          "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500"
        ]
      },
      Fitness: {
        names: [
          "Yoga Mat Premium",
          "Resistance Bands Set",
          "Smart Fitness Watch",
          "Foam Roller Pro",
          "Dumbbell Set"
        ],
        descriptions: [
          "Extra-thick non-slip yoga mat with carrying strap.",
          "5-piece resistance band set with handles and door anchor.",
          "Advanced fitness tracker with heart rate and GPS.",
          "High-density foam roller for muscle recovery.",
          "Adjustable dumbbell set from 5 to 25 lbs."
        ],
        images: [
          "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500",
          "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500",
          "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500",
          "https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=500",
          "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500"
        ]
      },
      Photography: {
        names: [
          "Mirrorless Camera Kit",
          "Camera Tripod Pro",
          "LED Ring Light",
          "Camera Lens 50mm",
          "Camera Bag"
        ],
        descriptions: [
          "24MP mirrorless camera with 4K video and WiFi.",
          "Professional tripod with fluid head and quick-release.",
          "18-inch LED ring light with phone holder.",
          "Prime lens with f/1.8 aperture for stunning portraits.",
          "Weatherproof camera bag with padded dividers."
        ],
        images: [
          "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500",
          "https://images.unsplash.com/photo-1613517526732-98a392514e5c?w=500",
          "https://images.unsplash.com/photo-1587588354456-ae376af71a25?w=500",
          "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=500",
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500"
        ]
      },
      Accessories: {
        names: [
          "Wireless Charging Pad",
          "USB-C Hub 7-in-1",
          "Laptop Stand Aluminum",
          "Cable Organizer Set",
          "Phone Mount Car"
        ],
        descriptions: [
          "Fast wireless charger for all Qi-enabled devices.",
          "Multi-port hub with HDMI, USB 3.0, and SD card reader.",
          "Ergonomic laptop stand with adjustable height.",
          "Cable management kit with clips and sleeves.",
          "Magnetic phone mount with 360-degree rotation."
        ],
        images: [
          "https://images.unsplash.com/photo-1591290619762-c588f7c0f6f3?w=500",
          "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500",
          "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500",
          "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500",
          "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=500"
        ]
      }
    };

    // Generate products (now consistent due to faker.seed())
    const products = Array.from({ length: productCount }, () => {
      const category = faker.helpers.arrayElement(categories);
      const template = categoryTemplates[category];
      const idx = faker.number.int({ min: 0, max: template.names.length - 1 });

      return {
        name: template.names[idx],
        description: template.descriptions[idx],
        price: Number(faker.number.float({ min: 15, max: 299, precision: 0.01 }).toFixed(2)),
        category,
        tags: pick(tagsPool, faker.number.int({ min: 1, max: 3 })),
        imageUrl: template.images[idx],
        stock: faker.number.int({ min: 10, max: 100 }),
        createdAt: faker.date.recent({ days: 45 }),
        updatedAt: new Date()
      };
    });

    const prodRes = await productsCol.insertMany(products);
    const productIds = Object.values(prodRes.insertedIds);

    // Generate orders (now consistent due to faker.seed())
    const statuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
    const ordersCount = 18; // ✅ Fixed count
    const demoCustomerId = customerIds[0];
    const orders = [];

    function makeOrder(customerId) {
      const n = faker.number.int({ min: 1, max: 3 });
      const chosenIdx = pick(productIds.map((id, idx) => idx), n);
      const items = chosenIdx.map(idx => ({
        productId: productIds[idx],
        name: products[idx].name,
        price: products[idx].price,
        quantity: faker.number.int({ min: 1, max: 2 })
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
    for (let i = 0; i < 3; i++) {
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
      message: "Database seeded successfully with CONSISTENT data!",
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