// ================================
// apps/api/src/assistant/citation-validator.js
// Citation Validator - Validates PolicyID citations against ground truth
// ================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load ground truth knowledge base
let knowledgeBase = null;

function loadKnowledgeBase() {
  if (!knowledgeBase) {
    const groundTruthPath = path.join(__dirname, '../../../docs/ground-truth.json');
    const fileContents = fs.readFileSync(kbPath, 'utf8');
    knowledgeBase = JSON.parse(fileContents);
  }
  return knowledgeBase;
}

/**
 * Extract citations from response text
 * Looks for [PolicyID] format
 * @param {string} text - Response text with potential citations
 * @returns {string[]} - Array of citation IDs
 */
export function extractCitations(text) {
  // Match [PolicyID] format
  const citationPattern = /\[([A-Za-z]+\d+\.\d+)\]/g;
  const citations = [];
  let match;

  while ((match = citationPattern.exec(text)) !== null) {
    citations.push(match[1]); // Extract the PolicyID
  }

  return [...new Set(citations)]; // Remove duplicates
}

/**
 * Validate a single citation
 * @param {string} policyId - Policy ID to validate
 * @returns {Object} - Validation result
 */
export function validateCitation(policyId) {
  const kb = loadKnowledgeBase();
  
  // Find policy in knowledge base
  const policy = kb.find(p => p.id === policyId);
  
  if (!policy) {
    return {
      isValid: false,
      policyId,
      reason: 'Policy ID not found in knowledge base',
      policy: null
    };
  }

  return {
    isValid: true,
    policyId,
    policy: {
      id: policy.id,
      question: policy.question,
      answer: policy.answer,
      category: policy.category,
      lastUpdated: policy.lastUpdated
    }
  };
}

/**
 * Validate all citations in a response
 * @param {string} responseText - Assistant's response with citations
 * @returns {Object} - Complete validation report
 */
export function validateResponse(responseText) {
  const citations = extractCitations(responseText);
  
  if (citations.length === 0) {
    return {
      hasCitations: false,
      citationCount: 0,
      allValid: true,
      validCitations: [],
      invalidCitations: [],
      details: []
    };
  }

  const validCitations = [];
  const invalidCitations = [];
  const details = [];

  for (const citation of citations) {
    const result = validateCitation(citation);
    details.push(result);

    if (result.isValid) {
      validCitations.push(citation);
    } else {
      invalidCitations.push(citation);
    }
  }

  return {
    hasCitations: true,
    citationCount: citations.length,
    allValid: invalidCitations.length === 0,
    validCitations,
    invalidCitations,
    details
  };
}

/**
 * Check if response is properly grounded
 * @param {string} responseText - Response to check
 * @param {string} intent - Detected intent
 * @returns {Object} - Grounding check result
 */
export function checkGrounding(responseText, intent) {
  // Policy questions MUST have citations
  if (intent === 'policy_question') {
    const validation = validateResponse(responseText);
    
    if (!validation.hasCitations) {
      return {
        isGrounded: false,
        intent,
        reason: 'Policy question must include citations',
        recommendation: 'Add [PolicyID] citations to ground the response'
      };
    }

    if (!validation.allValid) {
      return {
        isGrounded: false,
        intent,
        reason: 'Response contains invalid citations',
        invalidCitations: validation.invalidCitations,
        recommendation: 'Remove or correct invalid PolicyIDs'
      };
    }

    return {
      isGrounded: true,
      intent,
      citationCount: validation.citationCount,
      validCitations: validation.validCitations
    };
  }

  // Other intents don't require citations
  return {
    isGrounded: true,
    intent,
    citationsNotRequired: true
  };
}

/**
 * Find relevant policies for a query using keyword matching
 * @param {string} query - User's query
 * @param {number} limit - Max number of policies to return
 * @returns {Object[]} - Relevant policies
 */
export function findRelevantPolicies(query, limit = 3) {
  const kb = loadKnowledgeBase();
  const normalized = query.toLowerCase();

  // Category keywords mapping
  const categoryKeywords = {
    returns: ['return', 'refund', 'send back', 'money back', 'exchange'],
    shipping: ['ship', 'delivery', 'arrive', 'carrier', 'tracking', 'track', 'package'],
    warranty: ['warranty', 'guarantee', 'defect', 'broken', 'damaged'],
    payment: ['payment', 'pay', 'credit card', 'paypal', 'secure', 'checkout'],
    privacy: ['privacy', 'personal', 'data', 'information', 'delete', 'account'],
    discounts: ['discount', 'sale', 'promo', 'coupon', 'student', 'military'],
    exchange: ['exchange', 'swap', 'different size', 'different color'],
    giftcards: ['gift card', 'gift certificate', 'voucher'],
    cancellation: ['cancel', 'cancellation'],
    stock: ['stock', 'out of stock', 'backorder', 'available', 'availability'],
    bulk: ['bulk', 'wholesale', 'quantity'],
    support: ['support', 'contact', 'hours', 'phone', 'email'],
    sizing: ['size', 'sizing', 'fit', 'measurement'],
    care: ['care', 'clean', 'wash', 'maintain'],
    damage: ['damaged', 'broken', 'defective'],
    pricematch: ['price match', 'competitor', 'lower price'],
    promotions: ['promotion', 'newsletter', 'email', 'subscribe']
  };

  // Find matching category
  let matchedCategories = [];
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    const matches = keywords.filter(kw => normalized.includes(kw));
    if (matches.length > 0) {
      matchedCategories.push({ category, matchCount: matches.length });
    }
  }

  // Sort by match count
  matchedCategories.sort((a, b) => b.matchCount - a.matchCount);

  // Get policies from matched categories
  const results = [];
  for (const { category } of matchedCategories) {
    const categoryPolicies = kb.filter(p => p.category === category);
    results.push(...categoryPolicies);
    
    if (results.length >= limit) break;
  }

  // If no category matches, try direct keyword search in questions/answers
  if (results.length === 0) {
    const words = normalized.split(' ').filter(w => w.length > 3);
    
    for (const policy of kb) {
      const policyText = `${policy.question} ${policy.answer}`.toLowerCase();
      const matchCount = words.filter(word => policyText.includes(word)).length;
      
      if (matchCount > 0) {
        results.push({ ...policy, matchScore: matchCount });
      }
    }

    // Sort by match score
    results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }

  return results.slice(0, limit);
}

/**
 * Get policy by ID
 * @param {string} policyId - Policy ID to retrieve
 * @returns {Object|null} - Policy object or null
 */
export function getPolicyById(policyId) {
  const kb = loadKnowledgeBase();
  return kb.find(p => p.id === policyId) || null;
}

/**
 * Get all policies in a category
 * @param {string} category - Category name
 * @returns {Object[]} - Array of policies
 */
export function getPoliciesByCategory(category) {
  const kb = loadKnowledgeBase();
  return kb.filter(p => p.category === category);
}

/**
 * Get all available categories
 * @returns {string[]} - Array of category names
 */
export function getAllCategories() {
  const kb = loadKnowledgeBase();
  const categories = [...new Set(kb.map(p => p.category))];
  return categories.sort();
}

/**
 * Get knowledge base statistics
 * @returns {Object} - Statistics about the knowledge base
 */
export function getKnowledgeBaseStats() {
  const kb = loadKnowledgeBase();
  const categories = getAllCategories();

  const stats = {
    totalPolicies: kb.length,
    totalCategories: categories.length,
    categoryCounts: {},
    lastUpdated: null
  };

  // Count policies per category
  for (const category of categories) {
    stats.categoryCounts[category] = kb.filter(p => p.category === category).length;
  }

  // Find most recent update
  const dates = kb.map(p => new Date(p.lastUpdated));
  stats.lastUpdated = new Date(Math.max(...dates)).toISOString();

  return stats;
}

/**
 * Format policy for LLM context
 * @param {Object} policy - Policy object
 * @returns {string} - Formatted policy text
 */
export function formatPolicyForContext(policy) {
  return `[${policy.id}] ${policy.question}\n${policy.answer}`;
}

/**
 * Build context from relevant policies
 * @param {string} query - User query
 * @param {number} limit - Max policies to include
 * @returns {string} - Formatted context string
 */
export function buildPolicyContext(query, limit = 3) {
  const policies = findRelevantPolicies(query, limit);
  
  if (policies.length === 0) {
    return 'No relevant policies found for this query.';
  }

  const context = policies.map(formatPolicyForContext).join('\n\n');
  return `Relevant Policies:\n\n${context}`;
}