// ================================
// apps/api/src/assistant/assistant-engine.js
// Unified Assistant Engine (Stable & LLM-Ready) + STATS TRACKING FOR PART 5 (FINAL)
// ================================

import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { classifyIntent } from './intent-classifier.js';
import { functionRegistry } from './function-registry.js';
import { generateResponse, checkLLMHealth } from './llm-client.js';
import { validateResponse, findRelevantPolicies } from './citation-validator.js';

// --------------------------------
// Setup & Config
// --------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let config = null;
function loadConfig() {
  if (!config) {
    const yamlPath = path.join(__dirname, '../../../docs/prompts.yaml');

    const fileContents = fs.readFileSync(yamlPath, 'utf8');
    config = yaml.load(fileContents);
    console.log('[Assistant] prompts.yaml loaded');
  }
  return config;
}

// ================================
// ✅ STATISTICS TRACKING
// ================================
export const assistantStats = {
  totalQueries: 0,
  intentCounts: {},
  functionCallCounts: {},
  responseTimesByIntent: {},
  llmCallsByIntent: {},
  startTime: Date.now()
};

function recordStats(intent, functionsCalled, processingTime, usedLLM) {
  assistantStats.totalQueries++;
  assistantStats.intentCounts[intent] = (assistantStats.intentCounts[intent] || 0) + 1;

  if (functionsCalled && Array.isArray(functionsCalled)) {
    functionsCalled.forEach(fnName => {
      assistantStats.functionCallCounts[fnName] =
        (assistantStats.functionCallCounts[fnName] || 0) + 1;
    });
  }

  if (!assistantStats.responseTimesByIntent[intent])
    assistantStats.responseTimesByIntent[intent] = [];
  assistantStats.responseTimesByIntent[intent].push(processingTime);
  if (assistantStats.responseTimesByIntent[intent].length > 100)
    assistantStats.responseTimesByIntent[intent].shift();

  if (usedLLM)
    assistantStats.llmCallsByIntent[intent] =
      (assistantStats.llmCallsByIntent[intent] || 0) + 1;
}

// --------------------------------
// ✅ EXPORT FOR DASHBOARD
// --------------------------------
export function getAssistantAnalytics() {
  const avgResponseMsByIntent = {};
  for (const [intent, times] of Object.entries(assistantStats.responseTimesByIntent)) {
    if (times.length > 0) {
      const sum = times.reduce((a, b) => a + b, 0);
      avgResponseMsByIntent[intent] = Number((sum / times.length).toFixed(1));
    }
  }

  return {
    totalQueries: assistantStats.totalQueries,
    intents: assistantStats.intentCounts,
    functionCalls: assistantStats.functionCallCounts,
    avgResponseMsByIntent,
    llmCallsByIntent: assistantStats.llmCallsByIntent,
    uptime: Math.floor((Date.now() - assistantStats.startTime) / 1000),
    timestamp: new Date().toISOString()
  };
}

// --------------------------------
// Main Processor
// --------------------------------
export async function processMessage(message, context = {}) {
  const startTime = Date.now();
  const cfg = loadConfig();

  try {
    const intentResult = classifyIntent(message);
    const { intent, confidence } = intentResult;

    console.log(`🔥 [DEBUG] Detected intent: ${intent} confidence: ${confidence}`);

    let response;

    switch (intent) {
      case 'policy_question':
        response = await handlePolicyQuestion(message, intent);
        break;
      case 'order_status':
        response = await handleOrderStatus(message, context);
        break;
      case 'product_search':
        response = await handleProductSearch(message);
        break;
      case 'complaint':
        // ✅ merge classifier's sentimentLevel
        response = handleComplaint(message, intentResult.sentimentLevel);
        break;
      case 'chitchat':
        response = handleChitchat(message, cfg);
        break;
      case 'off_topic':
        response = {
          text: cfg.intents?.off_topic?.response_template ||
            'I can only assist with Storefront topics.',
          usedLLM: false,
          functionsCalled: []
        };
        break;
      default:
        response = {
          text: "I'm not sure how to help with that. Could you try rephrasing?",
          usedLLM: false,
          functionsCalled: []
        };
    }

    const citations =
      intent === 'policy_question'
        ? validateResponse(response.text)
        : { validCitations: [], allValid: true };

    const processingTime = Date.now() - startTime;

    recordStats(intent, response.functionsCalled || [], processingTime, response.usedLLM || false);

    const result = {
      success: true,
      text: response.text,
      intent,
      confidence,
      citations: citations.validCitations,
      functionsCalled: response.functionsCalled || [],
      metadata: {
        processingTime: `${processingTime}ms`,
        usedLLM: response.usedLLM || false,
        grounded: citations.allValid
      }
    };

    if (response.sentimentLevel) result.sentimentLevel = response.sentimentLevel;
    return result;
  } catch (err) {
    console.error('[Assistant] Error:', err.message);
    const processingTime = Date.now() - startTime;
    recordStats('error', [], processingTime, false);
    return {
      success: false,
      text: "I'm having some trouble processing that. Please try again in a moment.",
      metadata: { processingTime: `${processingTime}ms` }
    };
  }
}

// --------------------------------
// Intent Handlers
// --------------------------------

async function handlePolicyQuestion(message) {
  const relevantPolicies = findRelevantPolicies(message, 3);
  if (relevantPolicies.length === 0) {
    return {
      text:
        "I couldn't find a specific policy for that question. You can reach our support team at support@storefront.com for more details.",
      usedLLM: false,
      functionsCalled: []
    };
  }

  const groundedContext = relevantPolicies
    .map(p => `[${p.id}] ${p.question}: ${p.answer}`)
    .join('\n\n');

  const llmAnswer = await generateResponse(message, groundedContext, 'policy_question');

  return {
    text: llmAnswer,
    usedLLM: true,
    groundedOn: relevantPolicies.map(p => p.id),
    functionsCalled: []
  };
}

async function handleOrderStatus(message, context) {
  const functionsCalled = [];
  const orderId = message.match(/order\s*#?\s*([A-Za-z0-9]{6,})/i)?.[1];

  let result;
  if (orderId) {
    result = await functionRegistry.execute('getOrderStatus', { orderId });
    functionsCalled.push('getOrderStatus');
  } else if (context.email) {
    result = await functionRegistry.execute('getCustomerOrders', { email: context.email });
    functionsCalled.push('getCustomerOrders');
  }

  if (result?.success && result.result?.found) {
    const contextData = JSON.stringify(result.result, null, 2);
    try {
      const llmText = await generateResponse(message, contextData, 'order_status');
      return { text: llmText, usedLLM: true, functionsCalled };
    } catch {
      return formatOrderStatusFallback(result.result, functionsCalled);
    }
  }

  return {
    text: 'Could you provide your order number? It usually looks like #ABC123.',
    usedLLM: false,
    functionsCalled
  };
}

// ✅ Product Search (fixed)
async function handleProductSearch(message) {
  const query = message.replace(/(show me|find|search|looking for|do you have)/gi, '').trim();
  const functionsCalled = ['searchProducts'];

  if (!query) {
    return { text: 'What product are you looking for?', usedLLM: false, functionsCalled };
  }

  const result = await functionRegistry.execute('searchProducts', { query, limit: 5 });
  if (result.success && result.result?.found) {
    const contextData = JSON.stringify(result.result, null, 2);
    try {
      const llmText = await generateResponse(message, contextData, 'product_search');
      return { text: llmText, usedLLM: true, functionsCalled };
    } catch {
      return formatProductsFallback(result.result, functionsCalled);
    }
  }
  // ✅ always include function call even if not found
  return {
    text: `I couldn't find products matching "${query}". Could you try a different keyword?`,
    usedLLM: false,
    functionsCalled
  };
}

// ✅ Complaint (supports preset sentiment)
function handleComplaint(message, presetLevel = null) {
  const lowerMsg = message.toLowerCase();
  let sentimentLevel = presetLevel || 'mild';

  if (lowerMsg.match(/(terrible|worst|unacceptable|furious|outraged|disgusted)/i)) {
    sentimentLevel = 'severe';
  } else if (lowerMsg.match(/(disappointed|unhappy|frustrated|upset|annoyed)/i)) {
    sentimentLevel = 'moderate';
  }

  return {
    text:
      "I'm really sorry to hear that. Could you please tell me more so I can help resolve it?",
    sentimentLevel,
    usedLLM: false,
    functionsCalled: []
  };
}

function handleChitchat(message, cfg) {
  const msg = message.toLowerCase();
  if (msg.includes('who are you') || msg.includes('your name'))
    return { text: cfg.identity.identity_response, usedLLM: false, functionsCalled: [] };
  if (msg.match(/(hi|hello|hey)/))
    return {
      text: "Hey there! I'm Alex from Storefront support. How can I help?",
      usedLLM: false,
      functionsCalled: []
    };
  if (msg.includes('thank'))
    return {
      text: "You're welcome! Anything else I can assist you with?",
      usedLLM: false,
      functionsCalled: []
    };
  return {
    text: "I'm here to help with your Storefront questions!",
    usedLLM: false,
    functionsCalled: []
  };
}

// Fallback Helpers
function formatOrderStatusFallback(orderData, functionsCalled) {
  if (!orderData?.found)
    return { text: 'Order not found. Please check the order number.', usedLLM: false, functionsCalled };
  let text = `Your order #${orderData.orderId.slice(-6).toUpperCase()} is currently ${orderData.status}.`;
  if (orderData.estimatedDelivery) {
    text += ` Estimated delivery: ${new Date(orderData.estimatedDelivery).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })}.`;
  }
  return { text, usedLLM: false, functionsCalled };
}

function formatProductsFallback(productData, functionsCalled) {
  const items = productData.products || [];
  if (!items.length)
    return { text: 'No products found.', usedLLM: false, functionsCalled };
  const summary = items
    .map((p, i) => `${i + 1}. ${p.name} - $${p.price.toFixed(2)}${p.stock > 0 ? ' (In stock)' : ''}`)
    .join('\n');
  return { text: `I found ${items.length} products:\n${summary}`, usedLLM: false, functionsCalled };
}

// Health + Stats
export async function checkSystemHealth() {
  const cfg = loadConfig();
  const llmHealth = await checkLLMHealth();
  return {
    assistant: {
      status: 'operational',
      intents: Object.keys(cfg.intents).length,
      functions: functionRegistry.functions.size,
      totalQueries: assistantStats.totalQueries
    },
    llm: llmHealth,
    timestamp: new Date().toISOString()
  };
}

export function getAssistantStats() {
  return {
    intents: [
      'order_status',
      'policy_question',
      'product_search',
      'complaint',
      'chitchat',
      'off_topic',
      'violation'
    ],
    version: '1.0',
    description: 'Storefront Assistant Engine with LLM integration',
    timestamp: new Date().toISOString()
  };
}
