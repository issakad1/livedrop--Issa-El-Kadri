# AI Cost Model – ShopLite

---

## Assumptions
- *Model*: Llama 3.1 8B Instruct via OpenRouter  
  - $0.05 / 1K prompt tokens  
  - $0.20 / 1K completion tokens  
- *Traffic*: Based on ShopLite usage, optimized with caching and tiered execution.  
- *Caching & Tiering*: Pre-compute where possible, rules engine before LLM when risk is low.  

---

## 1. Smart Review Summarizer

### Assumptions
- Avg tokens in: 300 (last 20–30 reviews, not full history).  
- Avg tokens out: 100 (short pros/cons summary).  
- Requests/day: 2,000 (product page visits).  
- Cache hit rate: 95% (summaries refreshed daily).  

### Calculation
- Cost/action = (300/1000 × $0.05) + (100/1000 × $0.20)  
- Cost/action = $0.015 + $0.020 = *$0.035*  
- Daily cost = $0.035 × 2000 × (1 – 0.95)  
- Daily cost = $0.035 × 100  
- *Daily cost = $3.50*  

### Results
- *Review Summarizer*: Cost/action = $0.035, Daily = $3.50  

### Cost Lever
- Pre-generate summaries only for top-viewed SKUs.  
- Truncate to 200 tokens input if accuracy remains acceptable.  

---

## 2. Fraudulent Order Detector

### Assumptions
- Avg tokens in: 100 (compressed metadata fields).  
- Avg tokens out: 20 (fraud score only, no verbose explanation).  
- Requests/day: 5,000 orders.  
- Only 20% require LLM (rules handle the rest).  
- Effective requests/day: 1,000.  
- Cache hit rate: 30% (trusted users bypass checks).  

### Calculation
- Cost/action = (100/1000 × $0.05) + (20/1000 × $0.20)  
- Cost/action = $0.005 + $0.004 = *$0.009*  
- Daily cost = $0.009 × 1000 × (1 – 0.30)  
- Daily cost = $0.009 × 700  
- *Daily cost = $6.30*  

### Results
- *Fraud Detector*: Cost/action = $0.009, Daily = $6.30  

### Cost Lever
- Run lightweight anomaly detection first, escalate only suspicious orders to LLM.  
- Reduce output to numeric score only.  

---

## Overall Results
- *Review Summarizer Daily Cost*: $3.50  
- *Fraud Detector Daily Cost*: $6.30  
- *Total Daily AI Spend: **$9.80*  

---

## Cost Levers if Over Budget
- Further reduce input length (fewer reviews or metadata fields).  
- Pre-compute results in batches instead of real-time calls.  
- Use distilled/custom models trained on ShopLite-specific data.
