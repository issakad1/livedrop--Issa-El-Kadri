# AI Capability Map – ShopLite

| Capability | Intent (user) | Inputs (this sprint) | Risk 1–5 (tag) | p95 ms | Est. cost/action | Fallback | Selected |
|------------|---------------|----------------------|----------------|-------:|-----------------:|----------|:--------:|
| Smart Review Summarizer | User wants quick highlights of pros & cons without reading hundreds of reviews | Customer reviews (text), star ratings | 2 | 800 | $0.020 | Show top 3 reviews as-is | ✅ |
| Fraudulent Order Detector | Business wants to catch risky or fake orders before shipping | Order metadata (cart value, IP, device, payment method) | 3 | 500 | $0.015 | Rules-based fraud engine | ✅ |
| Dynamic Pricing Optimizer | User sees competitive prices while ShopLite maximizes margin | SKU prices, competitor snapshots, sales velocity | 4 | 1500 | $0.050 | Static price rules | ❌ |
| Smart Inventory Forecaster | Business wants early alerts for out-of-stock risk | Sales history, SKU stock levels, seasonal trend | 3 | 1200 | $0.025 | Weekly manual forecast | ❌ |
| Visual Search (image → product) | User uploads an image to find similar SKUs | User image input, product image dataset | 4 | 1600 | $0.100 | Ask user to type keywords | ❌ |
| Voice Shopping Assistant | User speaks queries to search or order products | User voice input, speech-to-text, SKU catalog | 5 | 2000 | $0.120 | Standard text search | ❌ |

---

## Why did I chose these 2 AI touchpoints:

I selected *Smart Review Summarizer* and *Fraudulent Order Detector* because they deliver measurable impact with low integration risk. Summarized reviews increase *conversion rates* by reducing decision friction, while fraud detection decreases *financial loss* and manual support overhead. Both rely on data ShopLite already has (reviews, orders, payments), making them feasible this sprint. Clear fallbacks (raw reviews, rules engine) ensure graceful degradation, while latency and cost targets are within acceptable bounds.
