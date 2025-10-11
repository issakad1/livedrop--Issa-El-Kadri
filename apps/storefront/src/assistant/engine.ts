import gt from "./ground-truth.json";
import { getOrderStatus } from "../lib/api";

const ORDER_ID_RE = /[A-Z0-9]{10,}/g;

function tokenize(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

function overlapScore(q: string, cand: string) {
  const qSet = new Set(tokenize(q));
  const cSet = new Set(tokenize(cand));
  let hits = 0;
  qSet.forEach((t) => {
    if (cSet.has(t)) hits++;
  });
  return hits / Math.max(1, qSet.size);
}

function maskId(id: string) {
  return id.slice(-4).padStart(id.length, "•");
}

export async function askSupport(input: string): Promise<string> {
  let response = "";

  try {
    // 🔹 Detect order IDs and fetch status
    const ids = input.match(ORDER_ID_RE) ?? [];
    const id = ids?.[0]; // may be undefined

    if (id) {
      const status = await getOrderStatus(id);
      response += `Order ${maskId(id)} status: ${status.status}`;
      if (status.carrier) response += ` • Carrier: ${status.carrier}`;
      if (status.eta) response += ` • ETA: ${status.eta}`;
      response += "\n\n";
    }

    // 🔹 Match FAQs from ground-truth.json
    let best = { qid: "", score: 0, answer: "" };
    for (const row of gt as { qid: string; question: string; answer: string }[]) {
      const s = Math.max(
        overlapScore(input, row.question),
        overlapScore(input, row.answer)
      );
      if (s > best.score) best = { qid: row.qid, score: s, answer: row.answer };
    }

    // 🔹 Fallback if no relevant match
    if (!best.qid || best.score < 0.45) {
      return (
        response +
        "Sorry, I can’t answer that from our approved materials. Please rephrase or contact a human agent."
      );
    }

    // ✅ Return final combined response
    return response + `${best.answer} [${best.qid}]`;
  } catch (err) {
    console.error("askSupport error:", err);
    return "Sorry, something went wrong while processing your request.";
  }
}
