const express = require('express');
const {
  createTownhall,
  getTownhalls,
  getTownhall,
  updateTownhall,
  deleteTownhall
} = require('../controllers/townhallController');
const { authenticate, authorize } = require('../middleware/auth');
const {
  createTownhallValidation,
  updateTownhallValidation,
  getTownhallsValidation,
  idParamValidation,
  validateDateRange
} = require('../middleware/validations');
const { handleValidationErrors } = require('../middleware/validationHandler');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Townhalls
 *   description: Digital townhall meeting management
 */
router.use(authenticate);

/**
 * @swagger
 * /api/townhalls:
 *   post:
 *     summary: Create a new townhall meeting
 *     tags: [Townhalls]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               scheduled_at:
 *                 type: string
 *                 format: date-time
 *               zoom_link:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: Townhall created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', createTownhallValidation, handleValidationErrors, createTownhall);

/**
 * @swagger
 * /api/townhalls:
 *   get:
 *     summary: List all townhall meetings
 *     tags: [Townhalls]
 *     security:
 *       - bearerAuth: []
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SCHEDULED, LIVE, COMPLETED, CANCELLED]
 *       - in: query
 *         name: organizer
 *         schema:
 *           type: integer
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
 *         description: List of townhalls
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get('/', getTownhallsValidation, validateDateRange, handleValidationErrors, getTownhalls);

/**
 * @swagger
 * /api/townhalls/{id}:
 *   get:
 *     summary: Get townhall details
 *     tags: [Townhalls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Townhall details
 *       404:
 *         description: Townhall not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', idParamValidation, handleValidationErrors, getTownhall);

/**
 * @swagger
 * /api/townhalls/{id}:
 *   put:
 *     summary: Update a townhall
 *     tags: [Townhalls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               scheduled_at:
 *                 type: string
 *                 format: date-time
 *               zoom_link:
 *                 type: string
 *                 format: uri
 *               status:
 *                 type: string
 *                 enum: [SCHEDULED, LIVE, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: Townhall updated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Townhall not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', updateTownhallValidation, handleValidationErrors, updateTownhall);

/**
 * @swagger
 * /api/townhalls/{id}:
 *   delete:
 *     summary: Delete a townhall
 *     tags: [Townhalls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Townhall deleted
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Townhall not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', idParamValidation, handleValidationErrors, deleteTownhall);

module.exports = router;