/**
 * Test CORS Route
 * 
 * Provides endpoints for testing CORS functionality
 */

import express from 'express';
import { getAllowedOrigins } from '../security/corsConfig.js';

const router = express.Router();

/**
 * GET /api/test-cors
 * Test CORS configuration
 */
router.get('/', (req, res) => {
  res.json({
    message: 'CORS test successful',
    origin: req.headers.origin || 'No origin header found',
    allowedOrigins: getAllowedOrigins()
  });
});

/**
 * POST /api/test-cors/preflight
 * Test CORS preflight requests
 */
router.post('/preflight', (req, res) => {
  res.json({
    message: 'CORS preflight test successful',
    method: 'POST',
    receivedHeaders: {
      origin: req.headers.origin,
      'content-type': req.headers['content-type']
    },
    receivedBody: req.body
  });
});

export default router;