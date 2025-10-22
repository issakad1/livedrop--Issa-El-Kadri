// ================================
// apps/api/src/routes/assistant.js
// Assistant API Routes - FINAL FIXED (v2.2)
// ================================

import express from 'express';
import { processMessage, getAssistantStats } from '../assistant/assistant-engine.js';
import { testClassifier } from '../assistant/intent-classifier.js';
import { getKnowledgeBaseStats } from '../assistant/citation-validator.js';

const router = express.Router();

/**
 * POST /api/assistant/chat AND /api/assistant
 * Main chat endpoint (supports both paths)
 *
 * Body: {
 *   message: string (required),
 *   email?: string (optional, for order tracking)
 * }
 */
const handleChat = async (req, res) => {
  try {
    const { message, email } = req.body;

    // ✅ FIX 1: Unified validation (EMPTY_MESSAGE takes priority)
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: {
          code: 'EMPTY_MESSAGE',
          message: 'Message cannot be empty'
        }
      });
    }

    // ✅ FIX 2: Max length validation
    if (message.length > 1000) {
      return res.status(400).json({
        error: {
          code: 'MESSAGE_TOO_LONG',
          message: 'Message must be less than 1000 characters'
        }
      });
    }

    // Process message
    const context = email ? { email } : {};
    const response = await processMessage(message, context);

    // Normalize response to consistent UI contract
    return res.json({
      success: response?.success !== false,
      text: response?.text || '',
      intent: response?.intent || 'chitchat',
      confidence: response?.confidence || 0,
      citations: Array.isArray(response?.citations) ? response.citations : [],
      functionsCalled: Array.isArray(response?.functionsCalled)
        ? response.functionsCalled.map(f => (typeof f === 'string' ? f : f?.name || String(f)))
        : [],
      metadata: response?.metadata || {
        processingTime: '0ms',
        usedLLM: false,
        grounded: true
      },
      ...(response?.sentimentLevel && { sentimentLevel: response.sentimentLevel })
    });
  } catch (error) {
    console.error('[Assistant API] Error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred processing your message'
      }
    });
  }
};

// Support both paths
router.post('/chat', handleChat);
router.post('/', handleChat);

/**
 * GET /api/assistant/stats
 * Assistant statistics + knowledge base info
 */
router.get('/stats', (req, res) => {
  try {
    const assistantStats = getAssistantStats();
    const kbStats = getKnowledgeBaseStats();

    res.json({
      assistant: assistantStats,
      knowledgeBase: kbStats,
      capabilities: [
        'Policy questions with citations',
        'Order status tracking',
        'Product search',
        'Complaint handling',
        'Multi-intent detection'
      ]
    });
  } catch (error) {
    console.error('[Assistant API] Stats error:', error);
    res.status(500).json({
      error: {
        code: 'STATS_ERROR',
        message: 'Could not retrieve statistics'
      }
    });
  }
});

/**
 * GET /api/assistant/test
 * Intent classifier evaluation (dev-only)
 */
router.get('/test', (req, res) => {
  try {
    const testResults = testClassifier();
    res.json(testResults);
  } catch (error) {
    console.error('[Assistant API] Test error:', error);
    res.status(500).json({
      error: {
        code: 'TEST_ERROR',
        message: 'Could not run classifier tests'
      }
    });
  }
});

/**
 * GET /api/assistant/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'assistant'
  });
});

export default router;
