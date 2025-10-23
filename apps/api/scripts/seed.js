// apps/api/scripts/seed.js
// ✅ This version uses built-in fetch (no imports needed)

const API_URL = process.env.API_URL || "http://localhost:8080";

(async () => {
  try {
    console.log(`🌱 Seeding database via ${API_URL}/api/seed ...`);

    const res = await fetch(`${API_URL}/api/seed`, {
      method: "POST",
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} - ${res.statusText}`);
    }

    const data = await res.json();
    console.log("✅ Seed successful:", data.message);
    console.log("📊 Stats:", data.data);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
  }
})();
