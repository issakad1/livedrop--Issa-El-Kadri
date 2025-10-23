# 🚀 Deployment Guide — Week 5 Final MVP

## Overview
This guide explains how to deploy and configure the **Livedrop** project — a complete e-commerce MVP with backend, database, AI assistant, and live order tracking.

---

## 1. 🗄️ Database Setup (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and sign up.
2. Create a **Free M0 cluster**.
3. Under **Network Access**, whitelist `0.0.0.0/0`.
4. Create a **database user** and set a password.
5. Create a database named **week5**.
6. Copy your connection string and add it to your backend `.env` file:

   ```env
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/week5
   DB_NAME=week5


2. Backend deployment (railway.app)
Go to Railway.app
 → Create a New Project.

Connect your GitHub repo and choose /apps/api as the root.

Add the following environment variables:
    PORT=8080
    MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/week5
    DB_NAME=week5
    LLM_URL=https://<your-ngrok-id>.ngrok-free.app/generate

4. 💻 Frontend Deployment (Vercel)

Go to Vercel

Import your repo and set the root directory to:
apps/storefront
add env: VITE_API_URL=https://<your-backend>.up.railway.app

5. 🧰 Local Development Setup
# Backend
cd apps/api
pnpm install
pnpm dev

# Frontend
cd apps/storefront
pnpm install
pnpm dev

6. 📊 Accessing the Admin Dashboard

Once deployed or running locally:

Frontend (local) → http://localhost:5173/dashboard

Frontend (Vercel) → https://livedrop-issa-el-kadri.vercel.app/dashboard

The dashboard is powered by the AdminDashboard.tsx page and pulls data from:
/api/dashboard/performance
/api/dashboard/business-metrics
/api/dashboard/assistant-stats

7. Testing
cd tests
pnpm install
pnpm test
 
output:  107 successful tests

8. 👤 Demo Account

Use this for testing:

Field	Value
Email	demo@example.com
Orders	3 sample orders
Role	Test user (pre-seeded)