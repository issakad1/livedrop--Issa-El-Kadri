// ================================
// tests/api.test.js
// API Endpoint Tests - Part 4 Requirement
// ================================

/**
 * Tests for all API endpoints:
 * - Products (GET list, GET by ID, POST create)
 * - Orders (GET list, GET by ID, POST create, GET by customerId)
 * - Customers (GET by email, GET by ID)
 * - Analytics (daily revenue with aggregation, dashboard metrics)
 * - Dashboard (business metrics, performance, assistant stats)
 * - Error handling (400, 404, 500 responses)
 */

const BASE_URL = process.env.API_URL || 'http://localhost:8080';

describe('API Endpoints - Part 1 Requirements', () => {
  
  // ================================
  // Products Endpoints
  // ================================
  
  describe('GET /api/products', () => {
    test('should return array of products', async () => {
      const response = await fetch(`${BASE_URL}/api/products`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.items.length).toBeGreaterThan(0);
      expect(data).toHaveProperty('page');
      expect(data).toHaveProperty('total');
      
      // Verify product structure
      const product = data.items[0];
      expect(product).toHaveProperty('_id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('category');
      expect(product).toHaveProperty('stock');
    });

    test('should filter by search query', async () => {
      const response = await fetch(`${BASE_URL}/api/products?search=headphones`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(Array.isArray(data.items)).toBe(true);
      
      // Check that results contain the search term
      if (data.items.length > 0) {
        const hasSearchTerm = data.items.some(p => 
          p.name.toLowerCase().includes('headphones') ||
          p.description.toLowerCase().includes('headphones') ||
          p.category.toLowerCase().includes('headphones')
        );
        expect(hasSearchTerm).toBe(true);
      }
    });

    test('should filter by tag', async () => {
      const response = await fetch(`${BASE_URL}/api/products?tag=wireless`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(Array.isArray(data.items)).toBe(true);
      
      // Verify products have the tag
      if (data.items.length > 0) {
        const product = data.items[0];
        expect(Array.isArray(product.tags)).toBe(true);
      }
    });

    test('should support pagination', async () => {
      const response = await fetch(`${BASE_URL}/api/products?page=1&limit=5`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.page).toBe(1);
      expect(data.items.length).toBeLessThanOrEqual(5);
    });

    test('should sort by price ascending', async () => {
      const response = await fetch(`${BASE_URL}/api/products?sort=price_asc&limit=10`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      
      // Verify ascending price order
      if (data.items.length > 1) {
        for (let i = 0; i < data.items.length - 1; i++) {
          expect(data.items[i].price).toBeLessThanOrEqual(data.items[i + 1].price);
        }
      }
    });
  });

  describe('GET /api/products/:id', () => {
    test('should return single product by ID', async () => {
      // First get a product ID
      const listResponse = await fetch(`${BASE_URL}/api/products?limit=1`);
      const listData = await listResponse.json();
      const productId = listData.items[0]._id;
      
      // Then get that specific product
      const response = await fetch(`${BASE_URL}/api/products/${productId}`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data._id).toBe(productId);
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('price');
      expect(data).toHaveProperty('description');
    });

    test('should return 404 for non-existent product', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format but doesn't exist
      const response = await fetch(`${BASE_URL}/api/products/${fakeId}`);
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data).toHaveProperty('error');
      expect(data.error.code).toBe('PRODUCT_NOT_FOUND');
    });

    test('should return 400 for invalid product ID format', async () => {
      const response = await fetch(`${BASE_URL}/api/products/invalid-id`);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
      expect(data.error.code).toBe('INVALID_ID');
    });
  });

  describe('POST /api/products', () => {
    test('should create new product with valid data', async () => {
      const newProduct = {
        name: 'Test Product',
        description: 'A test product for automated testing',
        price: 99.99,
        category: 'Testing',
        tags: ['test', 'automation'],
        imageUrl: 'https://example.com/test.jpg',
        stock: 50
      };
      
      const response = await fetch(`${BASE_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data).toHaveProperty('_id');
      expect(data.name).toBe(newProduct.name);
      expect(data.price).toBe(newProduct.price);
      expect(data).toHaveProperty('createdAt');
      expect(data).toHaveProperty('updatedAt');
    });

    test('should return 400 for invalid product data', async () => {
      const invalidProduct = {
        name: 'Test',
        // Missing required fields
      };
      
      const response = await fetch(`${BASE_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidProduct)
      });
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });
  });

  // ================================
  // Orders Endpoints
  // ================================

  describe('GET /api/orders', () => {
    test('should return array of orders', async () => {
      const response = await fetch(`${BASE_URL}/api/orders`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      
      if (data.length > 0) {
        const order = data[0];
        expect(order).toHaveProperty('_id');
        expect(order).toHaveProperty('customerId');
        expect(order).toHaveProperty('items');
        expect(order).toHaveProperty('total');
        expect(order).toHaveProperty('status');
        expect(Array.isArray(order.items)).toBe(true);
      }
    });

    test('should filter orders by customerId', async () => {
      // Get demo customer first
      const customerResponse = await fetch(`${BASE_URL}/api/customers?email=demo@example.com`);
      const customer = await customerResponse.json();
      const customerId = customer._id;
      
      const response = await fetch(`${BASE_URL}/api/orders?customerId=${customerId}`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      
      // All orders should belong to this customer
      data.forEach(order => {
        expect(order.customerId.toString()).toBe(customerId.toString());
      });
    });
  });

  describe('GET /api/orders/:id', () => {
    test('should return single order by ID', async () => {
      // First get an order ID
      const listResponse = await fetch(`${BASE_URL}/api/orders`);
      const orders = await listResponse.json();
      const orderId = orders[0]._id;
      
      const response = await fetch(`${BASE_URL}/api/orders/${orderId}`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data._id).toBe(orderId);
      expect(data).toHaveProperty('items');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('status');
    });

    test('should return 404 for non-existent order', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await fetch(`${BASE_URL}/api/orders/${fakeId}`);
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.error.code).toBe('ORDER_NOT_FOUND');
    });
  });

  describe('POST /api/orders', () => {
    test('should create new order with valid data', async () => {
      // Get customer and product IDs first
      const customerResponse = await fetch(`${BASE_URL}/api/customers?email=demo@example.com`);
      const customer = await customerResponse.json();
      
      const productsResponse = await fetch(`${BASE_URL}/api/products?limit=1`);
      const productsData = await productsResponse.json();
      const product = productsData.items[0];
      
      const newOrder = {
        customerId: customer._id,
        items: [
          {
            productId: product._id,
            name: product.name,
            price: product.price,
            quantity: 2
          }
        ]
      };
      
      const response = await fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data).toHaveProperty('_id');
      expect(data.status).toBe('PENDING');
      expect(data.total).toBe(product.price * 2);
      expect(data).toHaveProperty('createdAt');
    });

    test('should return 400 for invalid order data', async () => {
      const invalidOrder = {
        customerId: 'invalid',
        items: []
      };
      
      const response = await fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidOrder)
      });
      
      expect(response.status).toBe(400);
    });
  });

  // ================================
  // Customers Endpoints
  // ================================

  describe('GET /api/customers (by email)', () => {
    test('should return customer by email', async () => {
      const response = await fetch(`${BASE_URL}/api/customers?email=demo@example.com`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.email).toBe('demo@example.com');
      expect(data.name).toBe('Demo User');
      expect(data).toHaveProperty('_id');
      expect(data).toHaveProperty('phone');
      expect(data).toHaveProperty('address');
    });

    test('should return 404 for non-existent email', async () => {
      const response = await fetch(`${BASE_URL}/api/customers?email=nonexistent@example.com`);
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.error.code).toBe('CUSTOMER_NOT_FOUND');
    });

    test('should return 400 when email is missing', async () => {
      const response = await fetch(`${BASE_URL}/api/customers`);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error.code).toBe('MISSING_EMAIL');
    });
  });

  describe('GET /api/customers/:id', () => {
    test('should return customer by ID', async () => {
      // First get customer by email
      const emailResponse = await fetch(`${BASE_URL}/api/customers?email=demo@example.com`);
      const customer = await emailResponse.json();
      
      // Then get by ID
      const response = await fetch(`${BASE_URL}/api/customers/${customer._id}`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data._id.toString()).toBe(customer._id.toString());
      expect(data.email).toBe('demo@example.com');
    });

    test('should return 404 for non-existent customer ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await fetch(`${BASE_URL}/api/customers/${fakeId}`);
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.error.code).toBe('CUSTOMER_NOT_FOUND');
    });
  });

  // ================================
  // Analytics Endpoints (Database Aggregation Requirement)
  // ================================

  describe('GET /api/analytics/daily-revenue', () => {
    test('should return daily revenue using database aggregation', async () => {
      const from = '2024-10-01';
      const to = '2024-10-31';
      
      const response = await fetch(`${BASE_URL}/api/analytics/daily-revenue?from=${from}&to=${to}`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      
      // Verify aggregation structure
      if (data.length > 0) {
        const row = data[0];
        expect(row).toHaveProperty('date');
        expect(row).toHaveProperty('revenue');
        expect(row).toHaveProperty('orderCount');
        expect(typeof row.revenue).toBe('number');
        expect(typeof row.orderCount).toBe('number');
        
        // Verify date format
        expect(row.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
      
      // Verify sorting (dates should be in ascending order)
      for (let i = 0; i < data.length - 1; i++) {
        expect(data[i].date <= data[i + 1].date).toBe(true);
      }
    });

    test('should return 400 for invalid date format', async () => {
      const response = await fetch(`${BASE_URL}/api/analytics/daily-revenue?from=invalid&to=2024-10-31`);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error.code).toBe('BAD_REQUEST');
    });
  });

  describe('GET /api/analytics/dashboard-metrics', () => {
    test('should return aggregated dashboard metrics', async () => {
      const response = await fetch(`${BASE_URL}/api/analytics/dashboard-metrics`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('revenue');
      expect(data).toHaveProperty('orders');
      expect(data).toHaveProperty('avgOrderValue');
      
      expect(typeof data.revenue).toBe('number');
      expect(typeof data.orders).toBe('number');
      expect(typeof data.avgOrderValue).toBe('number');
      
      // Verify calculations
      if (data.orders > 0) {
        const expectedAvg = data.revenue / data.orders;
        expect(Math.abs(data.avgOrderValue - expectedAvg)).toBeLessThan(0.01);
      }
    });
  });

  // ================================
  // Dashboard Endpoints
  // ================================

  describe('GET /api/dashboard/business-metrics', () => {
    test('should redirect to analytics dashboard metrics', async () => {
      const response = await fetch(`${BASE_URL}/api/dashboard/business-metrics`, {
        redirect: 'manual'
      });
      
      expect([307, 200]).toContain(response.status);
    });
  });

  describe('GET /api/dashboard/performance', () => {
    test('should return performance metrics', async () => {
      const response = await fetch(`${BASE_URL}/api/dashboard/performance`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('requestsTotal');
      expect(data).toHaveProperty('avgLatencyMs');
      expect(data).toHaveProperty('p95LatencyMs');
      expect(data).toHaveProperty('sseConnections');
      expect(data).toHaveProperty('failedRequests');
      
      expect(typeof data.requestsTotal).toBe('number');
      expect(typeof data.avgLatencyMs).toBe('number');
    });
  });

  describe('GET /api/dashboard/assistant-stats', () => {
    test('should return assistant statistics', async () => {
      const response = await fetch(`${BASE_URL}/api/dashboard/assistant-stats`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('totalQueries');
      expect(data).toHaveProperty('intents');
      expect(data).toHaveProperty('functionCalls');
    });
  });

  // ================================
  // Error Handling Tests
  // ================================

  describe('Error Handling', () => {
    test('should return 404 for non-existent route', async () => {
      const response = await fetch(`${BASE_URL}/api/nonexistent-route`);
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data).toHaveProperty('error');
      expect(data.error.code).toBe('NOT_FOUND');
    });

    test('should return JSON error format', async () => {
      const response = await fetch(`${BASE_URL}/api/products/invalid-id`);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
      expect(data.error).toHaveProperty('code');
      expect(data.error).toHaveProperty('message');
    });

    test('server should not crash on bad JSON', async () => {
      const response = await fetch(`${BASE_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json{'
      });
      
      // Server should handle this gracefully, not crash
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(600);
    });
  });

  // ================================
  // Health Check
  // ================================

  describe('GET /health', () => {
    test('should return health status', async () => {
      const response = await fetch(`${BASE_URL}/health`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.db).toBe('data-api');
    });
  });
});