/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin endpoints (requires admin JWT)
 */

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Get admin dashboard stats
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats retrieved
 */

/**
 * @swagger
 * /admin/documents:
 *   get:
 *     tags: [Admin]
 *     summary: Get all documents
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of documents
 */

/**
 * @swagger
 * /admin/similarity:
 *   get:
 *     tags: [Admin]
 *     summary: Get similarity ranking of all documents
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Similarity ranking
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Get all users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *
 *   post:
 *     tags: [Admin]
 *     summary: Create a new user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       409:
 *         description: Email already registered
 */

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /admin/charts/documents-per-month:
 *   get:
 *     tags: [Admin]
 *     summary: Get documents uploaded per month (last 6 months)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Documents per month data
 */

/**
 * @swagger
 * /admin/charts/plagiarism-stats:
 *   get:
 *     tags: [Admin]
 *     summary: Get plagiarism stats by month
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Plagiarism stats
 */

/**
 * @swagger
 * /admin/charts/user-activity:
 *   get:
 *     tags: [Admin]
 *     summary: Get user activity by day (last 7 days)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User activity data
 */

/**
 * @swagger
 * /admin/notifications:
 *   get:
 *     tags: [Admin]
 *     summary: Get recent submission notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 */
