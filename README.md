Assignment1:
https://excalidraw.com/
I accidenlty deleted it when adding assignment 4





////////
---

# 🏪 **2. Root README.md**

```markdown
# 🏪 Livedrop — Week 5 Final MVP

## 🎯 Overview
Livedrop is a full-stack e-commerce MVP with a **real backend**, **live order tracking**, and a **smart assistant** built for Week 5 of the AI Developer Program.

It connects the Vite-based storefront with a cloud backend (MongoDB + Express), real-time SSE updates, and an LLM-powered assistant with intent detection and function calling.

---

## 🌍 Live Links
| Component | URL |
|------------|-----|
| 🛒 Storefront (Vercel) | https://livedrop-issa-el-kadri.vercel.app |
| ⚙️ Backend (Railway) | https://livedrop-issa-el-kadri-production-bd62.up.railway.app |
| 🧠 LLM (Colab/ngrok) | https://<your-ngrok-id>.ngrok-free.app/generate |

---

## 👤 Demo Account
Use this account for all testing:

| Field | Value |
|--------|--------|
| Email | `demo@example.com` |
| Orders | 3 existing orders (varied statuses) |

---

## ⚙️ Tech Stack
- **Frontend:** React (Vite, TypeScript)
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas
- **Hosting:** Railway (API), Vercel (Frontend)
- **LLM Integration:** Google Colab + ngrok
- **Testing:** Jest (API, assistant, integration)
- **Realtime:** Server-Sent Events (SSE)

---

## 🧩 Core Features

| Feature | Description |
|----------|--------------|
| 🛍 Products API | Fetches from MongoDB |
| 🧾 Orders API | Creates and tracks orders |
| 🔔 Real-Time SSE | Auto-updates order status |
| 💬 AI Assistant | Intent detection + function calling |
| 📊 Admin Dashboard | Live metrics, assistant stats, and system performance |

---

## 📈 Accessing the Dashboard
To view analytics, go to:

https://livedrop-issa-el-kadri.vercel.app/dashboard

or locally at:
http://localhost:5173/dashboard



---

## 🧠 Assistant Overview
**Name:** Alex  
**Role:** Support Specialist  
**Personality:** Friendly, empathetic, and concise.  
**Intents:**
- `policy_question`
- `order_status`
- `product_search`
- `complaint`
- `chitchat`
- `off_topic`
- `violation`

**Functions Registered:**
- `getOrderStatus(orderId)`
- `searchProducts(query, limit)`
- `getCustomerOrders(email)`

---

## 🧾 Key Endpoints

| Category | Endpoint | Description |
|-----------|-----------|--------------|
| Products | `/api/products` | List all products |
| Orders | `/api/orders` | Create or view orders |
| Customers | `/api/customers` | Lookup by email |
| Analytics | `/api/analytics/dashboard-metrics` | Business metrics |
| Dashboard | `/api/dashboard/performance` | System stats |
| SSE | `/api/orders/:id/stream` | Live order updates |

---

## 🧪 Testing
```bash
cd tests
pnpm install
pnpm test


💬 Author

Issa El Kadri
📧 demo@example.com