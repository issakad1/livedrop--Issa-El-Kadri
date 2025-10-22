// ================================
// apps/api/src/assistant/llm-client.js
// LLM Client - Calls Week 3 Colab endpoint (Enhanced with Debugging)
// ================================

import yaml from "js-yaml";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================================================
// Helpers for Environment & Config
// ======================================================
function getCleanBase() {
  const raw = (process.env.LLM_ENDPOINT_URL || process.env.LLM_API_URL || "").trim();
  return raw.replace(/\s+/g, "").replace(/\/+$/, ""); // remove spaces + trailing slashes
}

function buildGenerateUrl() {
  const base = getCleanBase();
  if (!base) return "";
  return /\/generate$/i.test(base) ? base : `${base}/generate`;
}

function buildHealthUrl() {
  const gen = buildGenerateUrl();
  return gen.replace(/\/generate$/i, "/health");
}

let config = null;
function loadConfig() {
  if (!config) {
    const yamlPath = path.join(__dirname, "../../docs/prompts.yaml");
    const fileContents = fs.readFileSync(yamlPath, "utf8");
    config = yaml.load(fileContents);
  }
  return config;
}

// ======================================================
// Main generation logic
// ======================================================
export async function generateResponse(userMessage, groundedContext, intent) {
  console.log("========== [LLM DEBUG] ==========");
  console.log("[LLM DEBUG] generateResponse() called");
  console.log("[LLM DEBUG] Endpoint:", buildGenerateUrl());
  console.log("[LLM DEBUG] Intent:", intent);
  console.log("[LLM DEBUG] User message:", userMessage);
  console.log("=================================");

  const GENERATE_URL = buildGenerateUrl();

  if (!GENERATE_URL) {
    console.warn("[LLM] No endpoint configured; using fallback");
    return fallbackResponse(groundedContext);
  }

  const cfg = loadConfig();
  const prompt = buildPrompt(cfg, userMessage, groundedContext, intent);

  try {
    // Increased timeout and token limit
    const signal =
      AbortSignal?.timeout?.(90000) ||
      (() => {
        const ac = new AbortController();
        setTimeout(() => ac.abort(), 90000  );
        return ac.signal;
      })();

    console.log("[LLM DEBUG] Sending request to:", GENERATE_URL);

    const response = await fetch(GENERATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        max_new_tokens: 400, // ⬅️ Increased from 200 to 400
      }),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[LLM] API Error:", response.status, errorText);
      throw new Error(`LLM API returned ${response.status}`);
    }

    const result = await response.json();
    const generatedText =
      result.text || result.generated_text || result.answer || "";

    const clean = cleanResponse(generatedText);

    console.log("[LLM DEBUG] Raw LLM Output:", generatedText);
    console.log("[LLM DEBUG] Cleaned Output:", clean);

    return clean;
  } catch (error) {
    console.error("[LLM] Generation error:", error.message);
    return fallbackResponse(groundedContext);
  }
}


// ======================================================
// Prompt and Cleanup Utilities
// ======================================================
function buildPrompt(cfg, userMessage, groundedContext, intent) {
  const identity = cfg.identity || {
  name: "Alex",
  role: "Customer Support Specialist",
  company: "Storefront",
  personality: ["empathetic", "clear", "reassuring"]
};

// Prefer tone from config, else use this default
const intentConfig = (cfg.intents && cfg.intents[intent]) || {};
const tone = intentConfig?.behavior?.tone || "empathetic, clear, and reassuring";

  return `
You are ${identity.name}, a ${identity.role} at ${identity.company}.
Your style: ${Array.isArray(identity.personality) ? identity.personality.join(", ") : "helpful"}.
Your tone: ${tone} and conversational.

CRITICAL RULES:
- Be concise (2–3 sentences max).
- Speak naturally as a helpful human agent.
- Always include [PolicyID] citation when referencing a policy (e.g., [Returns1.1]).
- Use only the information from the context; never make up data.
- Do not repeat the user’s question.
- Never say you are an AI or chatbot.

Context (policies & info):
${groundedContext || "(no additional context provided)"}

User message:
"${userMessage}"

Write your response below as ${identity.name}:
`;
}



function cleanResponse(text) {
  if (!text) return "";
  let t = String(text).trim();
  const meta = [
    "Based on the provided information",
    "According to the context",
    "From the documents",
    "The information shows",
    "As mentioned in the context",
    "The context states",
  ];
  for (const p of meta) t = t.replace(new RegExp(p, "gi"), "");
  if (t.includes("Explanation:")) t = t.split("Explanation:")[0];
  return t.replace(/\s+/g, " ").trim();
}

function fallbackResponse(groundedContext) {
  if (!groundedContext)
    return "I'm having trouble generating a response right now. Please try again.";
  const lines = groundedContext.split("\n");
  const first = lines.find((l) => l.trim().length > 20) || groundedContext;
  return first.trim();
}

// ======================================================
// Health and Config Info
// ======================================================
export async function checkLLMHealth() {
  const HEALTH_URL = buildHealthUrl();

  if (!HEALTH_URL) {
    return {
      available: false,
      reason: "LLM endpoint not configured",
      note: "Set LLM_ENDPOINT_URL or LLM_API_URL",
    };
  }

  try {
    const signal =
      AbortSignal?.timeout?.(90000) ||
      (() => {
        const ac = new AbortController();
        setTimeout(() => ac.abort(), 90000);
        return ac.signal;
      })();

    const r = await fetch(HEALTH_URL, { signal });
    const j = await r.json().catch(() => ({}));
    return r.ok
      ? { available: true, endpoint: buildGenerateUrl(), status: j }
      : { available: false, reason: `Health ${r.status}`, status: j };
  } catch (e) {
    return {
      available: false,
      reason: String(e),
      note: "Ensure Colab + ngrok are running",
    };
  }
}

export function getLLMConfig() {
  const GENERATE_URL = buildGenerateUrl();
  return {
    endpoint: GENERATE_URL || "NOT_CONFIGURED",
    configured: !!GENERATE_URL,
    instructions:
      "Set LLM_ENDPOINT_URL or LLM_API_URL to your Colab base or /generate endpoint (no trailing slash).",
  };
}
