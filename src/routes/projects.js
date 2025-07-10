const express = require('express');
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  voteOnProject,
  getProjectVotes
} = require('../controllers/projectController');
const { authenticate, authorize } = require('../middleware/auth');
const {
  createProjectValidation,
  updateProjectValidation,
  voteValidation,
  getProjectsValidation,
  idParamValidation
} = require('../middleware/validations');
const { handleValidationErrors } = require('../middleware/validationHandler');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Community project management
 */
router.use(authenticate);

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Suggest a new community project
 *     tags: [Projects]
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
 *     responses:
 *       201:
 *         description: Project created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', createProjectValidation, handleValidationErrors, createProject);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: List all projects
 *     tags: [Projects]
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
 *           enum: [PROPOSED, APPROVED, REJECTED]
 *       - in: query
 *         name: proposer
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of projects
 *       401:
 *         description: Unauthorized
 */
router.get('/', getProjectsValidation, handleValidationErrors, getProjects);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get project details
 *     tags: [Projects]
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
 *         description: Project details
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', idParamValidation, handleValidationErrors, getProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update a project
 *     tags: [Projects]
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
 *               status:
 *                 type: string
 *                 enum: [PROPOSED, APPROVED, REJECTED]
 *     responses:
 *       200:
 *         description: Project updated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', updateProjectValidation, handleValidationErrors, updateProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
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
 *         description: Project deleted
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', idParamValidation, handleValidationErrors, deleteProject);

/**
 * @swagger
 * /api/projects/{id}/vote:
 *   post:
 *     summary: Cast a vote on a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vote_type:
 *                 type: string
 *                 enum: [UPVOTE, DOWNVOTE]
 *     responses:
 *       201:
 *         description: Vote created
 *       200:
 *         description: Vote updated
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/vote', voteValidation, handleValidationErrors, voteOnProject);

/**
 * @swagger
 * /api/projects/{id}/votes:
 *   get:
 *     summary: Get vote summary for a project
 *     tags: [Projects]
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
 *         description: Vote summary
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id/votes', idParamValidation, handleValidationErrors, getProjectVotes);

module.exports = router;