// ================================
// apps/api/src/assistant/intent-classifier.js
// Intent Classification System - ENHANCED v2.3 (final)
// ================================

import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------------------
// Load YAML configuration
// -------------------------------
let config = null;
function loadConfig() {
  if (!config) {
    const yamlPath = path.join(__dirname, '../../docs/prompts.yaml');
    const fileContents = fs.readFileSync(yamlPath, 'utf8');
    config = yaml.load(fileContents);
  }
  return config;
}

/**
 * Classify user intent from message
 */
export function classifyIntent(message) {
  console.log('🔥 [DEBUG] Using ENHANCED intent-classifier v2.3 (final)');
  console.log('🔥 [DEBUG] Message:', message);

  const cfg = loadConfig();
  const intents = cfg.intents;
  const normalized = message.toLowerCase().trim();

  // Initialize intent scores
  const scores = {
    policy_question: 0,
    order_status: 0,
    product_search: 0,
    complaint: 0,
    chitchat: 0,
    off_topic: 0,
    violation: 0
  };

  // 1️⃣ Violation detection (highest priority)
  if (containsProfanity(normalized) || containsThreats(normalized)) {
    return {
      intent: 'violation',
      confidence: 1.0,
      subIntent: null,
      sentimentLevel: null,
      violationType: containsThreats(normalized) ? 'threats' : 'profanity'
    };
  }

  // ✅ Explicit abusive or insult patterns
  if (/(you are|you're|this is|that is)\s*(terrible|garbage|awful|useless|disgusting|horrible|stupid|trash|bad)/i.test(normalized)) {
    return {
      intent: 'violation',
      confidence: 1.0,
      subIntent: null,
      sentimentLevel: null,
      violationType: 'insult'
    };
  }

  // ✅ Escalation / manager request detection
  if (/speak to (a )?(manager|supervisor|representative|agent)/i.test(normalized)) {
    return {
      intent: 'complaint',
      confidence: 1.0,
      subIntent: null,
      sentimentLevel: 'moderate'
    };
  }

  // 2️⃣ Keyword-based scoring
  for (const [intentName, intentConfig] of Object.entries(intents)) {
    if (!intentConfig.keywords) continue;
    const keywords = intentConfig.keywords;
    let matchCount = 0;

    for (const keyword of keywords) {
      if (normalized.includes(keyword)) matchCount++;
    }

    scores[intentName] = keywords.length > 0 ? matchCount / keywords.length : 0;
    if (matchCount > 1) scores[intentName] *= 1.2;
  }

  // 3️⃣ Intent-specific heuristics
  if (/(what|how|can i|do you|tell me about).*(policy|return|refund|ship|warranty|payment|exchange)/i.test(normalized))
    scores.policy_question += 0.3;

  if (/(where|track|status|my order|order #|order number)/i.test(normalized))
    scores.order_status += 0.4;

  if (/order\s*(#|number)?\s*[a-z0-9]{6,}/i.test(message))
    scores.order_status += 0.5;

  if (/(never received|didn't receive|not arrived|haven't received|where is my|package|delivery)/i.test(normalized)) {
    scores.order_status += 0.5;
    scores.complaint += 0.3;
  }

  if (/(show me|find|search|looking for|recommend|i need|i want|do you have|do you sell)/i.test(normalized))
    scores.product_search += 0.4;

  if (/(headphones|laptop|phone|keyboard|mouse|camera|watch|shoes|dress|bag|wireless|bluetooth|gaming)/i.test(normalized))
    scores.product_search += 0.5;

  if (/(cheap|best|good|quality|affordable|wireless|portable)/i.test(normalized))
    scores.product_search += 0.2;

  // Complaint sentiment detection
  const complaintScore = detectComplaintSentiment(normalized, intents.complaint);
  if (complaintScore.level) scores.complaint += complaintScore.score;

  // ✅ NEW: Detect defective / broken product complaints
  if (/(broken|defective|damaged|not working|doesn'?t work|malfunction|faulty)/i.test(normalized)) {
    scores.complaint += 0.6;
  }

  // ✅ Direct “product is broken” shortcut
  if (/product\s+(is|was)\s+(broken|damaged|defective|faulty)/i.test(normalized)) {
    return {
      intent: 'complaint',
      confidence: 1.0,
      subIntent: null,
      sentimentLevel: 'moderate'
    };
  }

  if (/^(hi|hello|hey|good morning|good afternoon|thanks|thank you|bye|goodbye)\b/i.test(normalized))
    scores.chitchat += 0.5;

  if (/(weather|news|politics|sports|movie|recipe|homework|joke)/i.test(normalized))
    scores.off_topic += 0.4;

  // 4️⃣ Determine dominant intent
  let maxScore = 0;
  let detectedIntent = 'chitchat';
  for (const [intentName, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedIntent = intentName;
    }
  }

  console.log('🔥 [DEBUG] Scores:', scores);
  console.log('🔥 [DEBUG] Detected intent:', detectedIntent, 'confidence:', maxScore);

  const confidence = Math.min(maxScore, 1.0);

  if (confidence < 0.3) {
    if (normalized.split(' ').length <= 3) {
      return {
        intent: 'chitchat',
        confidence: 0.5,
        subIntent: null,
        sentimentLevel: null,
        ambiguous: true
      };
    }
    return {
      intent: 'off_topic',
      confidence: 0.4,
      subIntent: null,
      sentimentLevel: null,
      noMatch: true
    };
  }

  let subIntent = null;
  if (detectedIntent === 'policy_question') {
    subIntent = detectPolicySubIntent(normalized, intents.policy_question.sub_intents);
  }

  let sentimentLevel = null;
  if (detectedIntent === 'complaint') {
    sentimentLevel = complaintScore.level || 'moderate';
  }

  return {
    intent: detectedIntent,
    confidence: Math.round(confidence * 100) / 100,
    subIntent,
    sentimentLevel,
    ambiguous: false,
    noMatch: false
  };
}

/**
 * Complaint sentiment level detection
 */
function detectComplaintSentiment(message, complaintConfig) {
  const levels = complaintConfig.sentiment_levels;
  for (const keyword of levels.severe.keywords)
    if (message.includes(keyword)) return { level: 'severe', score: 0.8 };
  for (const keyword of levels.moderate.keywords)
    if (message.includes(keyword)) return { level: 'moderate', score: 0.6 };
  for (const keyword of levels.mild.keywords)
    if (message.includes(keyword)) return { level: 'mild', score: 0.4 };
  return { level: null, score: 0 };
}

/**
 * Detect policy sub-intents
 */
function detectPolicySubIntent(message, subIntents) {
  for (const [subIntentName, keywords] of Object.entries(subIntents)) {
    for (const keyword of keywords) {
      if (message.includes(keyword)) return subIntentName;
    }
  }
  return null;
}

/**
 * Profanity & threat detection
 */
function containsProfanity(message) {
  const patterns = [
    /\bf+u+c+k/i,
    /\bs+h+i+t/i,
    /\ba+s+s+h+o+l+e/i,
    /\bb+i+t+c+h/i,
    /\bd+a+m+n/i,
    /\bc+r+a+p/i
  ];
  return patterns.some(p => p.test(message));
}

function containsThreats(message) {
  const patterns = [
    /\b(kill|hurt|harm|attack|destroy)\s+(you|your)/i,
    /\b(lawsuit|sue|lawyer|legal action)\b/i,
    /\bi('ll| will)\s+(sue|report|complain to)\b/i
  ];
  return patterns.some(p => p.test(message));
}

/**
 * Detect multiple intents
 */
export function detectMultipleIntents(message) {
  const cfg = loadConfig();
  const segments = message.split(/\b(and|also|plus|,)\b/i);
  const detectedIntents = [];

  for (const segment of segments) {
    if (segment.trim().length < 5) continue;
    const result = classifyIntent(segment);
    if (result.confidence > 0.5 && !detectedIntents.includes(result.intent))
      detectedIntents.push(result.intent);
  }

  return {
    hasMultiple: detectedIntents.length > 1,
    intents: detectedIntents,
    primary: detectedIntents[0] || classifyIntent(message).intent
  };
}

/**
 * Config helpers
 */
export function getIntentConfig(intentName) {
  const cfg = loadConfig();
  return cfg.intents[intentName] || null;
}

export function getAllIntents() {
  const cfg = loadConfig();
  return Object.keys(cfg.intents);
}

export function testClassifier() {
  const cfg = loadConfig();
  const results = [];
  for (const [intentName, intentConfig] of Object.entries(cfg.intents)) {
    if (!intentConfig.example_queries) continue;
    for (const example of intentConfig.example_queries.slice(0, 3)) {
      const result = classifyIntent(example);
      results.push({
        example,
        expected: intentName,
        detected: result.intent,
        confidence: result.confidence,
        correct: result.intent === intentName
      });
    }
  }
  const accuracy = results.filter(r => r.correct).length / results.length;
  return {
    results,
    accuracy: Math.round(accuracy * 100),
    total: results.length,
    correct: results.filter(r => r.correct).length
  };
}
