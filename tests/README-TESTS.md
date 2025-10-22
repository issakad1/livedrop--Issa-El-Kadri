# 🧪 Week 5 Test Suite

Complete test suite for Week 5 API, Assistant, and Integration testing.

---

## 📋 Test Coverage

### ✅ api.test.js (50+ tests)
Tests all API endpoints:
- **Products**: GET list, GET by ID, POST create, filtering, sorting, pagination
- **Orders**: GET list, GET by ID, POST create, filter by customer
- **Customers**: GET by email, GET by ID
- **Analytics**: Daily revenue (with database aggregation), dashboard metrics
- **Dashboard**: Business metrics, performance, assistant stats
- **Error Handling**: 400, 404, 500 responses

### ✅ assistant.test.js (40+ tests)
Tests intelligent assistant:
- **Intent Detection**: All 7 intents with 3-5 examples each
  - policy_question, order_status, product_search, complaint, chitchat, off_topic, violation
- **Identity Tests**: MUST NOT reveal AI model (ChatGPT/Claude/Llama)
- **Function Calling**: getOrderStatus, getCustomerOrders, searchProducts
- **Citation Validation**: Ground-truth.json references

### ✅ integration.test.js (20+ tests)
End-to-end workflow tests:
- **Test 1**: Complete Purchase Flow (Browse → Order → SSE → Assistant)
- **Test 2**: Support Interaction Flow (Policy → Order → Complaint)
- **Test 3**: Multi-Intent Conversation (Greeting → Products → Policy → Order)

---

## 🚀 Setup

### 1. Install Dependencies

```bash
# From project root
npm install

# Or if using project-level package.json
cd tests
npm install
```

### 2. Ensure Backend is Running

```bash
# Terminal 1: Start backend
cd apps/api
npm run dev

# Should see:
# [API] Server running on port 8080
# [DB] Connected successfully
```

### 3. Set Environment Variable (Optional)

```bash
# Default: http://localhost:8080
export API_URL=http://localhost:8080

# Or for deployed backend:
export API_URL=https://your-app.railway.app
```

---

## ▶️ Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
# API tests only
npm run test:api

# Assistant tests only
npm run test:assistant

# Integration tests only
npm run test:integration
```

### Watch Mode (Re-run on file changes)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

---

## 📊 Expected Results

### ✅ Should PASS (100%):
- All API endpoint tests
- Intent detection (all 7 intents)
- Identity tests (doesn't reveal AI)
- Function calling tests
- Citation validation
- Integration workflows

### 🟡 Current Status Notes:

**LLM Text Generation:**
- Tests verify structure and logic ✅
- LLM currently uses fallback responses (Colab CUDA issue)
- When fixed, responses will be more natural
- Tests will still pass (structure unchanged)

---

## 🐛 Troubleshooting

### Backend Not Running
```
Error: fetch failed
```
**Fix:** Start backend with `cd apps/api && npm run dev`

### MongoDB Not Connected
```
Error: MongoServerError
```
**Fix:** Check MongoDB connection string in `.env`

### Test Timeout
```
Error: Timeout - Async callback was not invoked
```
**Fix:** Increase timeout in jest config or check if backend is slow

### Port Conflict
```
Error: EADDRINUSE
```
**Fix:** Change port in backend or update `API_URL` env variable

---

## 📁 File Structure

```
tests/
├── api.test.js              # API endpoint tests
├── assistant.test.js        # Assistant intelligence tests
├── integration.test.js      # End-to-end workflow tests
├── package.json             # Jest configuration
└── README.md                # This file

apps/api/
├── src/
│   ├── routes/              # Tested endpoints
│   ├── assistant/           # Tested assistant logic
│   └── db.js                # Database connection
└── docs/
    ├── prompts.yaml         # Assistant configuration
    └── ground-truth.json    # Knowledge base
```

---

## ✅ Assignment Requirements Checklist

### Part 4: Testing & Validation

- [x] **Intent Detection Tests** - 3-5 examples per intent, all 7 intents covered
- [x] **Identity Tests** - Doesn't reveal ChatGPT/Claude/Llama
- [x] **Function Calling Tests** - Verifies functions called correctly
- [x] **API Tests** - All endpoints tested with proper error handling
- [x] **Integration Test 1** - Complete Purchase Flow
- [x] **Integration Test 2** - Support Interaction Flow
- [x] **Integration Test 3** - Multi-Intent Conversation
- [x] **Automated** - All tests run with `npm test`
- [x] **Documented** - Expected vs actual results

---

## 📈 Test Results Format

```bash
PASS tests/api.test.js
  API Endpoints - Part 1 Requirements
    GET /api/products
      ✓ should return array of products (45ms)
      ✓ should filter by search query (32ms)
      ✓ should filter by tag (28ms)
      ...
    
PASS tests/assistant.test.js
  Assistant Intelligence Tests - Part 3 Requirements
    Intent: policy_question
      ✓ should detect policy_question: "What is your return policy?" (156ms)
      ✓ should detect policy_question: "How do I return an item?" (142ms)
      ...
    Identity Tests - CRITICAL
      ✓ should NOT reveal AI model when asked "What's your name?" (98ms)
      ...

PASS tests/integration.test.js
  Integration Tests - Complete Workflows
    Test 1: Complete Purchase Flow
      ✓ Step 1: Browse products via API (52ms)
      ✓ Step 2: Get customer for order creation (38ms)
      ...

Test Suites: 3 passed, 3 total
Tests:       110 passed, 110 total
Time:        12.456 s
```

---

## 🎯 Test User

**Email:** `demo@example.com`  
**Name:** Demo User  
**Orders:** 3 orders in database

Use this user for testing customer-specific functionality.

---

## 📝 Notes

1. **Database Aggregation**: Analytics tests verify native MongoDB aggregation (not JavaScript loops)
2. **Response Times**: Tests expect responses under 5 seconds
3. **Error Handling**: Tests verify proper JSON error format and status codes
4. **LLM Integration**: Tests work with both live LLM and fallback responses

---

## 🤝 Contributing

When adding new tests:
1. Follow existing test structure
2. Use descriptive test names
3. Include comments for complex logic
4. Test both success and error cases
5. Keep tests independent (no shared state)

---

## 📞 Support

If tests fail unexpectedly:
1. Check backend is running on correct port
2. Verify database has seed data
3. Check environment variables
4. Review backend logs for errors
5. Try running tests individually

---

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Assignment Requirements](../README.md)
- [API Documentation](../apps/api/README.md)

---

**Built with ❤️ for Week 5 Assignment**