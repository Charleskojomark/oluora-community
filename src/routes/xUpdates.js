const express = require('express');
const {
  getXUpdates,
  getXUpdate,
  refreshXUpdates
} = require('../controllers/xUpdateController');
const { authenticate, authorize } = require('../middleware/auth');
const { getXUpdatesValidation, idParamValidation, validateDateRange } = require('../middleware/validations');
const { handleValidationErrors } = require('../middleware/validationHandler');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: X Updates
 *   description: Live updates from X related to Abia State
 */

/**
 * @swagger
 * /api/x-updates:
 *   get:
 *     summary: Fetch live X updates
 *     tags: [X Updates]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: List of X updates
 *       400:
 *         description: Validation error
 */
router.get('/', getXUpdatesValidation, validateDateRange, handleValidationErrors, getXUpdates);

/**
 * @swagger
 * /api/x-updates/{id}:
 *   get:
 *     summary: Get specific X update
 *     tags: [X Updates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: X update details
 *       404:
 *         description: X update not found
 */
router.get('/:id', idParamValidation, handleValidationErrors, getXUpdate);

/**
 * @swagger
 * /api/x-updates/refresh:
 *   post:
 *     summary: Refresh X updates (admin only)
 *     tags: [X Updates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: X updates refreshed
 *       403:
 *         description: Insufficient permissions
 *       401:
 *         description: Unauthorized
 */
router.post('/refresh', authenticate, authorize(['ADMIN']), refreshXUpdates);

module.exports = router;