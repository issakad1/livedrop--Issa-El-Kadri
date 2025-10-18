# Week 5 API (MongoDB + Express)

## Quickstart
1) cp .env.example .env and set MONGODB_URI
2) pnpm install
3) pnpm seed
4) pnpm dev → http://localhost:8080

## Env
- MONGODB_URI
- DB_NAME (default week5)
- PORT (default 8080)
- CORS_ORIGIN (default *)

## Endpoints
- GET /api/customers?email=
- GET /api/customers/:id
- GET /api/products?search=&tag=&sort=&page=&limit=
- GET /api/products/:id
- POST /api/products
- POST /api/orders
- GET /api/orders/:id
- GET /api/orders?customerId=
- GET /api/analytics/daily-revenue?from=YYYY-MM-DD&to=YYYY-MM-DD
- GET /api/analytics/dashboard-metrics
- GET /api/dashboard/business-metrics
- GET /api/dashboard/performance
- GET /api/dashboard/assistant-stats

## Errors
{ "error": { "code": "STRING_CODE", "message": "Human message", "details": {} } }
