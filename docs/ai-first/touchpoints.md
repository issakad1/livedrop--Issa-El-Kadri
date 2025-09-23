# AI Touchpoint Specs

---

## 1. Smart Review Summarizer

### Problem Statement
Shoppers are overwhelmed by the volume of reviews on popular products, often facing hundreds of comments that vary in quality and tone. This makes it difficult to extract meaningful insights quickly, leading to decision fatigue and cart abandonment. In some cases, unclear expectations from reviews result in higher return rates. By providing concise “Top Pros” and “Top Cons,” an AI summarizer reduces effort, builds trust, and guides customers toward more confident and accurate purchase decisions.

### Happy Path
1. User opens a product page.  
2. Backend checks cache for existing summary.  
3. If cached, summary is returned instantly.  
4. If not cached, reviews and ratings are retrieved.  
5. Summarization model generates structured pros/cons.  
6. Result is stored in cache for reuse.  
7. Summary displayed in an “AI Highlights” box.  
8. User scans summary instead of reading all reviews.  
9. User adds item to cart.  
10. Interaction is logged for analysis.  

### Grounding & Guardrails
- *Source of Truth*: Verified customer reviews and star ratings.  
- *Retrieval Scope*: Only reviews tied to the current SKU.  
- *Context Limit*: Maximum of 2,000 tokens per summarization batch.  
- *Out-of-Scope Handling*: If no reviews exist, display “No reviews yet.”  

### Human-in-the-Loop
- *Trigger Condition*: Summary flagged by ≥5% of users as misleading or irrelevant.  
- *Escalation Workflow*: Flagged items sent to content moderation queue.  
- *UI Surface*: “Report summary” link beneath summary box.  
- *Reviewer SLA*: Moderators review flagged summaries weekly and update cached results.  

### Latency Budget
- *Cache Lookup*: 50 ms  
- *Review Retrieval*: 200 ms  
- *Model Inference*: 500 ms  
- *Packaging & Delivery*: 50 ms  
- *Total Budget*: ≤ 800 ms (p95)  
- *Cache Strategy*: Daily refresh, ~90% hit rate expected.  

### Error & Fallback Behavior
- *Model Failure*: If summarizer fails, system shows top 3 most recent reviews.  
- *Timeout Condition*: If p95 > 800 ms, return cached summary or fallback reviews.  
- *Graceful Degradation*: Ensure page always shows some review content even if AI unavailable.  

### PII Handling
- *Input Control*: Only review text and ratings are used.  
- *Anonymization*: Reviewer IDs and names removed before processing.  
- *Logging Policy*: Logs retained for 30 days, stripped of user identifiers.  
- *Access Control*: Logs accessible only to product analytics team.  

### Success Metrics
- *Product Metric 1*: Engagement = clicks on “Expand summary” ÷ product views.  
- *Product Metric 2*: Purchase Rate = purchases ÷ views with summary displayed.  
- *Business Metric*: Return Rate Reduction = (baseline returns – returns after launch) ÷ baseline returns.  

### Feasibility Note
- *Data Availability*: All product reviews and ratings already exist in ShopLite’s database.  
- *Model Readiness*: Summarization possible with GPT-4o-mini or Llama 3.1, which handle long text efficiently.  
- *Integration Complexity*: Summaries can be pre-generated for top SKUs and cached to ensure low latency.  
- *Prototype Step*: Generate summaries for top 100 SKUs and A/B test conversion against a control group.  

---

## 2. Fraudulent Order Detector

### Problem Statement
Fraudulent orders lead to direct financial losses through chargebacks, fulfillment costs, and lost trust from legitimate customers. Current rules-based systems identify only known patterns and cannot adapt to evolving fraud behaviors. This results in both missed fraud (false negatives) and unnecessary delays for genuine buyers (false positives). By scoring order risk in real time using metadata such as cart value, IP address, device fingerprint, and payment method, AI can complement rules with adaptive detection, improving security without harming customer experience.

### Happy Path
1. User submits an order at checkout.  
2. Backend checks “trusted user” cache for known safe profiles.  
3. If no cache hit, metadata extracted (IP, device, cart, payment).  
4. Data passed to fraud detection model.  
5. Model assigns fraud risk score.  
6. If below threshold, approve automatically.  
7. If above threshold, flag for manual review.  
8. Ops team investigates flagged order.  
9. Reviewer approves or rejects.  
10. Final decision logged for retraining loop.  

### Grounding & Guardrails
- *Source of Truth*: Order metadata, payment logs, device fingerprints.  
- *Retrieval Scope*: ShopLite transactions only.  
- *Context Limit*: Maximum 50 fields per order.  
- *Out-of-Scope Handling*: Reject unrelated inputs.  

### Human-in-the-Loop
- *Trigger Condition*: Fraud score ≥0.7 or incomplete metadata.  
- *Escalation Workflow*: Flagged orders sent to fraud analyst queue.  
- *UI Surface*: Internal fraud review dashboard.  
- *Reviewer SLA*: Analysts resolve flagged cases within 2 hours.  

### Latency Budget
- *Cache Lookup*: 50 ms  
- *Feature Extraction*: 100 ms  
- *Model Scoring*: 200 ms  
- *Packaging & Delivery*: 150 ms  
- *Total Budget*: ≤ 500 ms (p95)  
- *Cache Strategy*: Trusted users cached for instant approval (30% hit rate).  

### Error & Fallback Behavior
- *Model Failure*: Revert to existing rules-based fraud checks.  
- *Timeout Condition*: If >500 ms, auto-route to rules engine for decision.  
- *Graceful Degradation*: Never block orders outright without fallback; suspicious orders flagged for human review.  

### PII Handling
- *Input Control*: Metadata only (cart, IP, device ID, payment type).  
- *Anonymization*: Personally identifiable details (name, email, card number) masked before analysis.  
- *Logging Policy*: Logs retained for 90 days with strict access controls.  
- *Access Control*: Fraud logs visible only to fraud prevention and compliance teams.  

### Success Metrics
- *Product Metric 1*: False Positive Rate = flagged legit orders ÷ total legit orders.  
- *Product Metric 2*: Detection Rate = blocked fraud ÷ total fraudulent orders.  
- *Business Metric*: Fraud Loss Reduction = (baseline fraud loss – post-launch fraud loss) ÷ baseline fraud loss.  

### Feasibility Note
- *Data Availability*: ShopLite already logs order metadata and payment details.  
- *Model Readiness*: Initial deployment can use anomaly detection (e.g., isolation forest, logistic regression) before scaling to LLM.  
- *Integration Complexity*: AI runs alongside rules engine with safe fallback to avoid blocking.  
- *Prototype Step*: Deploy in shadow mode on 1,000 recent orders to benchmark detection accuracy against rules.
