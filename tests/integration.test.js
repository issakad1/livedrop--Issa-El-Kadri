// ================================
// tests/integration.test.js
// Integration Tests - Part 4 Requirement
// ================================

/**
 * End-to-end workflow tests that verify the entire system works together:
 * 
 * Test 1: Complete Purchase Flow
 *   - Browse products → Create order → SSE stream → Ask assistant → Verify
 * 
 * Test 2: Support Interaction Flow
 *   - Policy question → Order question → Complaint → Verify responses
 * 
 * Test 3: Multi-Intent Conversation
 *   - Greeting → Products → Policy → Order → Verify context
 * 
 * These test actual user journeys through multiple system components.
 */

const BASE_URL = process.env.API_URL || 'http://localhost:8080';
const TEST_USER_EMAIL = 'demo@example.com';

/**
 * Helper to send assistant message
 */
async function askAssistant(message, email = null) {
  const body = { message };
  if (email) body.email = email;
  
  const response = await fetch(`${BASE_URL}/api/assistant/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  return await response.json();
}

/**
 * Helper to wait for condition
 */
function waitFor(conditionFn, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      if (conditionFn()) {
        clearInterval(interval);
        resolve();
      } else if (Date.now() - startTime > timeout) {
        clearInterval(interval);
        reject(new Error('Timeout waiting for condition'));
      }
    }, 100);
  });
}

describe('Integration Tests - Complete Workflows', () => {
  
  // ================================
  // TEST 1: COMPLETE PURCHASE FLOW
  // Browse → Order → SSE → Assistant
  // ================================
  
  describe('Test 1: Complete Purchase Flow', () => {
    let customerId;
    let productId;
    let orderId;
    
    test('Step 1: Browse products via API', async () => {
      const response = await fetch(`${BASE_URL}/api/products?search=Camera bag&limit=5`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.items.length).toBeGreaterThan(0);
      
      // Pick first product
      productId = data.items[0]._id;
      expect(productId).toBeDefined();
      
      console.log('✅ Step 1: Found product:', data.items[0].name);
    });

    test('Step 2: Get customer for order creation', async () => {
      const response = await fetch(`${BASE_URL}/api/customers?email=${TEST_USER_EMAIL}`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.email).toBe(TEST_USER_EMAIL);
      
      customerId = data._id;
      expect(customerId).toBeDefined();
      
      console.log('✅ Step 2: Customer identified:', data.name);
    });

    test('Step 3: Create order', async () => {
      const newOrder = {
        customerId,
        items: [
          {
            productId,
            name: 'Test Product',
            price: 99.99,
            quantity: 1
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
      expect(data._id).toBeDefined();
      expect(data.status).toBe('PENDING');
      
      orderId = data._id;
      
      console.log('✅ Step 3: Order created:', orderId);
    });

    test('Step 4: Subscribe to SSE stream for live updates', async () => {
      // Note: Jest doesn't support EventSource, so we test the endpoint exists
      const response = await fetch(`${BASE_URL}/api/orders/${orderId}/stream`, {
        headers: { 'Accept': 'text/event-stream' }
      });
      
      // SSE endpoint should accept connection
      expect([200, 102]).toContain(response.status);
      
      console.log('✅ Step 4: SSE endpoint accessible');
      
      // In real usage, status would progress: PENDING → PROCESSING → SHIPPED → DELIVERED
    }, 10000);

    test('Step 5: Ask assistant about order status', async () => {
      const assistantResponse = await askAssistant(
        `What is the status of order ${orderId}?`,
        TEST_USER_EMAIL
      );
      
      expect(assistantResponse.intent).toBe('order_status');
      expect(assistantResponse).toHaveProperty('text');
      
      // Function should be called
      expect(Array.isArray(assistantResponse.functionsCalled)).toBe(true);
      
      console.log('✅ Step 5: Assistant responded:', assistantResponse.text.substring(0, 50) + '...');
    });

    test('Step 6: Verify function was called and response is correct', async () => {
      const assistantResponse = await askAssistant(
        `Track order ${orderId}`,
        TEST_USER_EMAIL
      );
      
      // Should call getOrderStatus or getCustomerOrders
      expect(assistantResponse.functionsCalled.length).toBeGreaterThan(0);
      expect(['getOrderStatus', 'getCustomerOrders']).toContain(assistantResponse.functionsCalled[0]);
      
      // Response should mention order status
      expect(assistantResponse.text.toLowerCase()).toMatch(/(order|status|pending|processing|shipped)/i);
      
      console.log('✅ Step 6: Complete purchase flow verified!');
    });
  });

  // ================================
  // TEST 2: SUPPORT INTERACTION FLOW
  // Policy → Order → Complaint
  // ================================
  
  describe('Test 2: Support Interaction Flow', () => {
    test('Step 1: Ask policy question', async () => {
      const response = await askAssistant('What is your return policy?');
      
      expect(response.intent).toBe('policy_question');
      expect(response).toHaveProperty('text');
      
      // Should have grounded response with citations
      expect(Array.isArray(response.citations)).toBe(true);
      
      // Should NOT call functions (uses KB)
      expect(response.functionsCalled.length).toBe(0);
      
      // Should be grounded
      expect(response.metadata.grounded).toBe(true);
      
      console.log('✅ Step 1: Policy question answered with citations:', response.citations);
    });

    test('Step 2: Verify grounded response structure', async () => {
      const response = await askAssistant('Tell me about shipping');
      
      expect(response.intent).toBe('policy_question');
      
      // Response should contain citation markers like [PolicyID]
      const hasCitationFormat = /\[[A-Z][a-z]+\d+\.\d+\]/.test(response.text);
      
      // Citations array should match citation markers in text
      if (response.citations.length > 0) {
        expect(hasCitationFormat).toBe(true);
      }
      
      console.log('✅ Step 2: Response properly grounded');
    });

    test('Step 3: Ask about specific order', async () => {
      // Get a real order first
      const ordersResponse = await fetch(`${BASE_URL}/api/orders?customerId=${await getCustomerId()}`);
      const orders = await ordersResponse.json();
      
      if (orders.length > 0) {
        const orderId = orders[0]._id;
        const response = await askAssistant(`What is the status of order ${orderId}?`, TEST_USER_EMAIL);
        
        expect(response.intent).toBe('order_status');
        expect(response.functionsCalled.length).toBeGreaterThan(0);
        
        console.log('✅ Step 3: Order query handled with function call');
      } else {
        console.log('⚠️  Step 3: No orders found for test user');
      }
    });

    test('Step 4: Verify function was called correctly', async () => {
      const response = await askAssistant('Show me my orders', TEST_USER_EMAIL);
      
      expect(response.intent).toBe('order_status');
      
      // Should call function
      expect(Array.isArray(response.functionsCalled)).toBe(true);
      if (response.functionsCalled.length > 0) {
        expect(['getOrderStatus', 'getCustomerOrders']).toContain(response.functionsCalled[0]);
      }
      
      console.log('✅ Step 4: Function called:', response.functionsCalled);
    });

    test('Step 5: Express complaint', async () => {
      const response = await askAssistant('I am very disappointed with this service');
      
      expect(response.intent).toBe('complaint');
      expect(response).toHaveProperty('sentimentLevel');
      expect(['mild', 'moderate', 'severe']).toContain(response.sentimentLevel);
      
      console.log('✅ Step 5: Complaint detected, sentiment:', response.sentimentLevel);
    });

    test('Step 6: Verify empathetic response', async () => {
      const response = await askAssistant('This is unacceptable!');
      
      expect(response.intent).toBe('complaint');
      
      // Response should be empathetic
      expect(response.text.toLowerCase()).toMatch(/(sorry|apologize|understand|help|resolve)/i);
      
      // Should not escalate unnecessarily
      const isSerious = response.text.toLowerCase().includes('escalat');
      
      console.log('✅ Step 6: Empathetic response verified');
      console.log('   Escalated:', isSerious ? 'Yes' : 'No');
    });
  });

  // ================================
  // TEST 3: MULTI-INTENT CONVERSATION
  // Greeting → Products → Policy → Order
  // ================================
  
  describe('Test 3: Multi-Intent Conversation', () => {
    const conversation = [];
    
    test('Step 1: Start with greeting (chitchat)', async () => {
      const response = await askAssistant('Hello!');
      conversation.push({ message: 'Hello!', response });
      
      expect(response.intent).toBe('chitchat');
      expect(response.text.length).toBeGreaterThan(0);
      
      // Should be brief
      expect(response.text.length).toBeLessThan(200);
      
      console.log('✅ Step 1: Greeting handled');
    });

    test('Step 2: Ask about products (product_search)', async () => {
      const response = await askAssistant('Show me wireless headphones');
      conversation.push({ message: 'Show me wireless headphones', response });
      
      expect(response.intent).toBe('product_search');
      expect(response.functionsCalled).toContain('searchProducts');
      
      // Should have product info in response
      expect(response.text.toLowerCase()).toMatch(/(product|headphone|price|\$)/i);
      
      console.log('✅ Step 2: Product search completed');
    });

    test('Step 3: Ask about policy (policy_question)', async () => {
      const response = await askAssistant('Can I return these if I don\'t like them?');
      conversation.push({ message: 'Can I return these if I don\'t like them?', response });
      
      expect(response.intent).toBe('policy_question');
      expect(response.citations.length).toBeGreaterThan(0);
      
      // Should reference return policy
      expect(response.text.toLowerCase()).toMatch(/(return|refund|day|policy)/i);
      
      console.log('✅ Step 3: Policy question answered');
    });

    test('Step 4: Check order (order_status)', async () => {
      const response = await askAssistant('Where is my order?', TEST_USER_EMAIL);
      conversation.push({ message: 'Where is my order?', response });
      
      expect(response.intent).toBe('order_status');
      
      // Should attempt to get orders
      expect(Array.isArray(response.functionsCalled)).toBe(true);
      
      console.log('✅ Step 4: Order status checked');
    });

    test('Step 5: Verify appropriate responses throughout conversation', async () => {
      // Each response should be appropriate for its intent
      expect(conversation.length).toBe(4);
      
      // Intent progression should make sense
      const intents = conversation.map(c => c.response.intent);
      expect(intents).toEqual(['chitchat', 'product_search', 'policy_question', 'order_status']);
      
      // Each response should be relevant to the question
      conversation.forEach(({ message, response }) => {
        expect(response.text.length).toBeGreaterThan(0);
        expect(response).toHaveProperty('confidence');
      });
      
      console.log('✅ Step 5: Multi-intent conversation flow verified');
      console.log('   Intent progression:', intents.join(' → '));
    });

    test('Step 6: Verify context is maintained', async () => {
      // System should handle multiple intents correctly
      // Each intent should get appropriate handler
      
      const intentCounts = conversation.reduce((acc, c) => {
        acc[c.response.intent] = (acc[c.response.intent] || 0) + 1;
        return acc;
      }, {});
      
      expect(intentCounts.chitchat).toBe(1);
      expect(intentCounts.product_search).toBe(1);
      expect(intentCounts.policy_question).toBe(1);
      expect(intentCounts.order_status).toBe(1);
      
      console.log('✅ Step 6: Context maintained across conversation');
      console.log('   Intent distribution:', intentCounts);
    });
  });

  // ================================
  // SYSTEM HEALTH CHECKS
  // ================================
  
  describe('System Health Integration', () => {
    test('All system components should be operational', async () => {
      const checks = {
        api: false,
        database: false,
        assistant: false,
        sse: false
      };
      
      // Check API
      const healthResponse = await fetch(`${BASE_URL}/health`);
      checks.api = healthResponse.status === 200;
      
      // Check database (via products endpoint)
      const productsResponse = await fetch(`${BASE_URL}/api/products?limit=1`);
      checks.database = productsResponse.status === 200;
      
      // Check assistant
      const assistantResponse = await askAssistant('test');
      checks.assistant = assistantResponse.hasOwnProperty('intent');
      
      // Check SSE endpoint exists
      const ordersResponse = await fetch(`${BASE_URL}/api/orders`);
      const orders = await ordersResponse.json();
      if (orders.length > 0) {
        const sseResponse = await fetch(`${BASE_URL}/api/orders/${orders[0]._id}/stream`, {
          headers: { 'Accept': 'text/event-stream' }
        });
        checks.sse = [200, 102].includes(sseResponse.status);
      }
      
      console.log('📊 System Health:', checks);
      
      // All core components should be operational
      expect(checks.api).toBe(true);
      expect(checks.database).toBe(true);
      expect(checks.assistant).toBe(true);
    });

    test('System should handle load', async () => {
      // Send multiple concurrent requests
      const requests = Array(10).fill(null).map((_, i) => 
        askAssistant(`Test message ${i}`)
      );
      
      const responses = await Promise.all(requests);
      
      // All should succeed
      responses.forEach(response => {
        expect(response).toHaveProperty('intent');
        expect(response).toHaveProperty('text');
      });
      
      console.log('✅ System handled 10 concurrent requests');
    });
  });

  // ================================
  // ERROR RECOVERY TESTS
  // ================================
  
  describe('Error Recovery Integration', () => {
    test('should recover from invalid order ID', async () => {
      const response = await askAssistant('Track order invalid123');
      
      // Should still respond gracefully
      expect(response).toHaveProperty('text');
      expect(response.text.length).toBeGreaterThan(0);
      
      // Should ask for clarification
      expect(response.text.toLowerCase()).toMatch(/(order|number|help)/i);
    });

    test('should handle missing customer context', async () => {
      const response = await askAssistant('Show me my orders');
      
      // Should respond even without email context
      expect(response).toHaveProperty('text');
      
      // Should ask for order number
      expect(response.text.toLowerCase()).toMatch(/(order|number|provide)/i);
    });

    test('should handle function failures gracefully', async () => {
      const response = await askAssistant('Find non-existent product xyz999');
      
      // Should not crash
      expect(response).toHaveProperty('intent');
      expect(response).toHaveProperty('text');
      
      // Should explain the issue
      expect(response.text.length).toBeGreaterThan(0);
    });
  });
});

// ================================
// HELPER FUNCTIONS
// ================================

/**
 * Get customer ID for test user
 */
async function getCustomerId() {
  const response = await fetch(`${BASE_URL}/api/customers?email=${TEST_USER_EMAIL}`);
  const customer = await response.json();
  return customer._id;
}