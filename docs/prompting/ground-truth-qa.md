# Ground Truth Q&A for Shoplite RAG System  

This file contains 20 Q&A pairs based on the knowledge base documents. Each question specifies expected context, required keywords, and forbidden terms to guide evaluation.  

---

### Q01: How do I create a seller account on Shoplite?  
*Expected retrieval context:* Document 8: Seller Account Setup and Management  
*Authoritative answer:* To create a seller account, you must register through the Shoplite Seller Portal, submit a valid business license, tax identification number, and bank details. Verification typically takes 2–3 business days before you can begin listing products.  
*Required keywords:* ["Seller Portal", "business license", "2–3 business days"]  
*Forbidden content:* ["instant approval", "no verification required"]  

---

### Q02: What is the return window for most Shoplite products?  
*Expected retrieval context:* Document 6: Return and Refund Policies  
*Authoritative answer:* Shoplite allows returns within a standard 30-day window from the date of delivery, except for perishable goods, personalized items, and digital downloads.  
*Required keywords:* ["30-day window", "non-returnable", "refund"]  
*Forbidden content:* ["lifetime returns", "no returns accepted"]  

---

### Q03: How can I track my order once it’s shipped?  
*Expected retrieval context:* Document 5: Order Tracking and Delivery  
*Authoritative answer:* Every order generates a unique tracking ID that shows stages like processing, shipped, in transit, out for delivery, and delivered. Buyers receive updates through email, SMS, and app notifications.  
*Required keywords:* ["tracking ID", "order status", "notifications"]  
*Forbidden content:* ["no tracking available", "manual updates only"]  

---

### Q04: Which payment methods does Shoplite support?  
*Expected retrieval context:* Document 4: Payment Methods and Security  
*Authoritative answer:* Shoplite supports credit and debit cards, PayPal, Apple Pay, Google Pay, and bank transfers in select regions. All transactions are tokenized and PCI-DSS compliant for security.  
*Required keywords:* ["credit and debit cards", "PayPal", "PCI-DSS"]  
*Forbidden content:* ["cash on delivery", "unsupported payments"]  

---

### Q05: What kind of reviews can buyers leave on Shoplite?  
*Expected retrieval context:* Document 7: Product Reviews and Ratings  
*Authoritative answer:* Verified buyers can leave star ratings, text reviews, and upload photos or videos. Reviews are moderated with automated filters and human checks to prevent abuse.  
*Required keywords:* ["star ratings", "verified buyers", "moderated"]  
*Forbidden content:* ["anonymous reviews", "no review system"]  

---

### Q06: How often do sellers receive payouts?  
*Expected retrieval context:* Document 19: Seller Payouts and Withdrawals  
*Authoritative answer:* Sellers receive payouts every 14 days, while premium sellers can opt for weekly payments. Reports include gross sales, deductions, and net payouts.  
*Required keywords:* ["14 days", "weekly option", "payout reports"]  
*Forbidden content:* ["daily payouts", "instant transfers"]  

---

### Q07: What are Shoplite’s shipping options?  
*Expected retrieval context:* Document 17: Shipping Policies and Partners  
*Authoritative answer:* Shoplite offers standard shipping (3–7 business days), expedited shipping (1–3 business days), and same-day delivery in select cities. Shipping costs are calculated automatically at checkout.  
*Required keywords:* ["standard shipping", "expedited", "same-day delivery"]  
*Forbidden content:* ["no shipping choice", "flat shipping only"]  

---

### Q08: How does Shoplite protect user data and privacy?  
*Expected retrieval context:* Document 14: Security and Privacy Policies  
*Authoritative answer:* Shoplite encrypts all data, complies with GDPR and CCPA, and allows users to export or delete their data. Independent audits and bug bounty programs enhance security.  
*Required keywords:* ["encryption", "GDPR", "CCPA"]  
*Forbidden content:* ["sells user data", "no privacy controls"]  

---

### Q09: What are the steps for checking out on Shoplite?  
*Expected retrieval context:* Document 3: Shopping Cart and Checkout Process  
*Authoritative answer:* Checkout has three steps: confirm or add a shipping address, select a payment method, and review a summary before confirming the order. Fees and delivery times are calculated automatically.  
*Required keywords:* ["three steps", "shipping address", "review summary"]  
*Forbidden content:* ["automatic checkout", "single click only"]  

---

### Q10: What happens if a buyer misses a delivery?  
*Expected retrieval context:* Document 5: Order Tracking and Delivery  
*Authoritative answer:* Buyers have 48 hours to reschedule missed deliveries. If redelivery fails, the order is refunded or replaced depending on preference.  
*Required keywords:* ["48 hours", "reschedule", "refund or replacement"]  
*Forbidden content:* ["no redelivery", "no refunds"]  

---

### Q11: How does Shoplite prevent fraud for both buyers and sellers?  
*Expected retrieval context:* Document 18: Fraud Prevention and Security Features + Document 4: Payment Methods and Security  
*Authoritative answer:* Shoplite uses AI-driven fraud detection, identity verification for sellers, multi-factor authentication for buyers, and guarantees refunds for undelivered or counterfeit products.  
*Required keywords:* ["AI-driven", "multi-factor authentication", "identity verification"]  
*Forbidden content:* ["no fraud checks", "manual only"]  

---

### Q12: What analytics tools are available for sellers?  
*Expected retrieval context:* Document 16: Seller Analytics and Insights + Document 9: Inventory Management  
*Authoritative answer:* Sellers can track sales, customer demographics, traffic sources, and conversion rates. Reports are exportable in CSV/PDF and include stock movement insights.  
*Required keywords:* ["sales performance", "conversion rates", "exportable reports"]  
*Forbidden content:* ["no analytics", "hidden data"]  

---

### Q13: How are commissions and fees structured for sellers?  
*Expected retrieval context:* Document 10: Commission and Fee Structure + Document 19: Seller Payouts and Withdrawals  
*Authoritative answer:* Shoplite charges category-based commissions (e.g., 8% for electronics, 12% for fashion) plus a $0.30 transaction fee. Premium sellers enjoy reduced rates and faster payouts.  
*Required keywords:* ["category-based commissions", "transaction fee", "premium sellers"]  
*Forbidden content:* ["no fees", "flat rate only"]  

---

### Q14: What are Shoplite’s policies for digital goods?  
*Expected retrieval context:* Document 6: Return and Refund Policies + Document 14: Security and Privacy Policies  
*Authoritative answer:* Digital products such as e-books and downloads are non-returnable. Shoplite protects these purchases with secure delivery systems and refund guarantees only if the product is defective or inaccessible.  
*Required keywords:* ["digital products", "non-returnable", "secure delivery"]  
*Forbidden content:* ["full returns on digital items", "unlimited access without purchase"]  

---

### Q15: How can sellers manage low stock situations?  
*Expected retrieval context:* Document 9: Inventory Management + Document 16: Seller Analytics and Insights  
*Authoritative answer:* Sellers receive low-stock alerts and can mark products as “restocking soon.” Analytics show fast-moving items to guide restocking and prevent overselling.  
*Required keywords:* ["low-stock alerts", "restocking soon", "prevent overselling"]  
*Forbidden content:* ["no stock tracking", "manual updates only"]  

---

### Q16: How are promotional codes applied and regulated?  
*Expected retrieval context:* Document 15: Promotional Codes and Discounts + Document 18: Fraud Prevention  
*Authoritative answer:* Promotional codes can be applied at checkout or saved in the account wallet. Abuse prevention systems track unusual patterns, and violators risk account suspension.  
*Required keywords:* ["checkout", "account wallet", "abuse prevention"]  
*Forbidden content:* ["no limits", "unrestricted sharing"]  

---

### Q17: How do buyers earn and redeem loyalty points?  
*Expected retrieval context:* Document 20: Loyalty Program and Buyer Rewards + Document 15: Promotional Codes and Discounts  
*Authoritative answer:* Buyers earn one point per dollar spent, redeemable for discounts, vouchers, or shipping perks. Points expire after 12 months, and higher tiers unlock exclusive benefits.  
*Required keywords:* ["one point per dollar", "redeem", "12 months"]  
*Forbidden content:* ["points never expire", "cash withdrawals"]  

---

### Q18: How does Shoplite handle customer disputes?  
*Expected retrieval context:* Document 11: Customer Support Procedures + Document 6: Return and Refund Policies  
*Authoritative answer:* Disputes are handled via a structured ticket system, with Tier 1 resolving basic cases and escalations moving to compliance teams. Buyers must provide proof such as receipts or photos.  
*Required keywords:* ["ticket system", "Tier 1", "proof of purchase"]  
*Forbidden content:* ["no dispute system", "verbal only"]  

---

### Q19: What integrations can developers build with Shoplite’s API?  
*Expected retrieval context:* Document 13: API Documentation for Developers + Document 9: Inventory Management  
*Authoritative answer:* Developers can integrate inventory updates, automate order tracking, access payment details, and retrieve sales analytics using JSON-based RESTful APIs with sandbox testing support.  
*Required keywords:* ["inventory updates", "RESTful API", "sandbox environment"]  
*Forbidden content:* ["no API", "SOAP only"]  

---

### Q20: What steps does Shoplite take to secure financial transactions?  
*Expected retrieval context:* Document 4: Payment Methods and Security + Document 18: Fraud Prevention  
*Authoritative answer:* Shoplite secures transactions with PCI-DSS compliance, tokenization, 3D Secure authentication, and AI monitoring for suspicious activity. Refunds for fraud cases are guaranteed.  
*Required keywords:* ["PCI-DSS", "tokenization", "3D Secure"]  
*Forbidden content:* ["stores card details", "no fraud monitoring"]  

---
