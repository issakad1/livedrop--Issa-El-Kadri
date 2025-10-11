# RAG System Evaluation

This checklist provides structured manual evaluation for retrieval quality, response accuracy, and edge cases when testing the Shoplite RAG assistant.  

---

## Retrieval Quality Tests (10 tests)

| Test ID | Question | Expected Documents | Pass Criteria |
|---------|----------|-------------------|---------------|
| R01 | How do I create a seller account on Shoplite? | Document 8 | Retrieved docs must include Document 8 |
| R02 | What is the return window for Shoplite products? | Document 6 | Retrieved docs contain Document 6 |
| R03 | Which payment methods does Shoplite support? | Document 4 | Retrieved docs contain Document 4 |
| R04 | How can I track my order after it’s shipped? | Document 5 | Retrieved docs contain Document 5 |
| R05 | What are Shoplite’s shipping options? | Document 17 | Retrieved docs contain Document 17 |
| R06 | How often do sellers receive payouts? | Document 19 | Retrieved docs contain Document 19 |
| R07 | How does Shoplite prevent fraud? | Document 18 + Document 4 | Both docs retrieved |
| R08 | What are Shoplite’s loyalty program rules? | Document 20 | Retrieved docs contain Document 20 |
| R09 | What analytics do sellers get in Shoplite? | Document 16 + Document 9 | Both docs retrieved |
| R10 | How are commissions and fees structured? | Document 10 + Document 19 | Both docs retrieved |

---

## Response Quality Tests (15 tests)

| Test ID | Question | Required Keywords | Forbidden Terms | Expected Behavior |
|---------|----------|-------------------|-----------------|-------------------|
| Q01 | How do I create a seller account? | ["Seller Portal", "business license", "2–3 business days"] | ["instant approval"] | Step-by-step answer citing Doc 8 |
| Q02 | What is Shoplite’s return policy? | ["30-day window", "refund", "non-returnable"] | ["lifetime returns"] | Policy-based answer from Doc 6 |
| Q03 | How can I track my order? | ["tracking ID", "order status", "notifications"] | ["manual updates only"] | Clear tracking process from Doc 5 |
| Q04 | What payment methods are supported? | ["credit and debit cards", "PayPal", "PCI-DSS"] | ["cash on delivery"] | Secure payment answer citing Doc 4 |
| Q05 | How do reviews work? | ["star ratings", "verified buyers", "moderated"] | ["anonymous reviews"] | Review features from Doc 7 |
| Q06 | How often are payouts made? | ["14 days", "weekly option", "payout reports"] | ["daily payouts"] | Payout schedule citing Doc 19 |
| Q07 | What are Shoplite’s shipping options? | ["standard shipping", "expedited", "same-day delivery"] | ["flat shipping only"] | Delivery explanation from Doc 17 |
| Q08 | How does Shoplite secure user data? | ["encryption", "GDPR", "CCPA"] | ["sells user data"] | Privacy/security details from Doc 14 |
| Q09 | How does checkout work? | ["three steps", "shipping address", "review summary"] | ["automatic checkout"] | Step-by-step citing Doc 3 |
| Q10 | What happens after a missed delivery? | ["48 hours", "reschedule", "refund or replacement"] | ["no redelivery"] | Refund/redelivery citing Doc 5 |
| Q11 | How does Shoplite prevent fraud? | ["AI-driven", "multi-factor authentication", "identity verification"] | ["no fraud checks"] | Fraud answer citing Docs 18 + 4 |
| Q12 | What analytics tools are available? | ["sales performance", "conversion rates", "exportable reports"] | ["hidden data"] | Insights citing Docs 16 + 9 |
| Q13 | How are fees structured? | ["category-based commissions", "transaction fee", "premium sellers"] | ["no fees"] | Commission breakdown citing Docs 10 + 19 |
| Q14 | How do buyers use promotional codes? | ["checkout", "account wallet", "abuse prevention"] | ["unrestricted sharing"] | Promo answer citing Docs 15 + 18 |
| Q15 | How do loyalty points work? | ["one point per dollar", "redeem", "12 months"] | ["points never expire"] | Rewards citing Doc 20 |

---

## Edge Case Tests (5 tests)

| Test ID | Scenario | Expected Response Type |
|---------|----------|----------------------|
| E01 | Question about a feature not in knowledge base (e.g., “Does Shoplite accept cryptocurrency payments?”) | Refusal with polite explanation (no_context_prompt) |
| E02 | Ambiguous question (“How do payments work?”) | Clarification request with options (clarification_prompt) |
| E03 | Customer asks for personal recommendation (“Which laptop should I buy?”) | Refusal, explain assistant only uses Shoplite docs |
| E04 | User provides incomplete query (“Refund?”) | Clarification request asking whether they mean policy, timeline, or eligibility |
| E05 | User uses emotional tone (“I’m angry, my order is lost!”) | Polite, empathetic tone (tone_control_prompt) |

---
