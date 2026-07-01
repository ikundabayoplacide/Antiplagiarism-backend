/**
 * @swagger
 * tags:
 *   name: Lecturer
 *   description: Lecturer endpoints (requires lecturer or admin JWT)
 */

/**
 * @swagger
 * /lecturer/stats:
 *   get:
 *     tags: [Lecturer]
 *     summary: Get lecturer dashboard stats
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats retrieved
 */

/**
 * @swagger
 * /lecturer/students:
 *   get:
 *     tags: [Lecturer]
 *     summary: Get all students with submission counts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of students
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:               { type: string }
 *                   name:             { type: string }
 *                   email:            { type: string }
 *                   phoneNumber:      { type: string }
 *                   joinedDate:       { type: string }
 *                   submissionsCount: { type: integer }
 *                   department:       { type: string }
 */

/**
 * @swagger
 * /lecturer/projects:
 *   get:
 *     tags: [Lecturer]
 *     summary: Get all student projects
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of projects
 */

/**
 * @swagger
 * /lecturer/projects/{id}:
 *   get:
 *     tags: [Lecturer]
 *     summary: Get a specific project by ID
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
 *         description: Project details
 *       404:
 *         description: Project not found
 */

/**
 * @swagger
 * /lecturer/charts/monthly-submissions:
 *   get:
 *     tags: [Lecturer]
 *     summary: Get monthly submission counts (last 6 months)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly submissions data
 */

/**
 * @swagger
 * /lecturer/charts/plagiarism-distribution:
 *   get:
 *     tags: [Lecturer]
 *     summary: Get plagiarism distribution (low/medium/high)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Distribution data
 */

/**
 * @swagger
 * /lecturer/charts/similarity-trends:
 *   get:
 *     tags: [Lecturer]
 *     summary: Get average similarity trends (last 6 months)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Similarity trends data
 */

/**
 * @swagger
 * /lecturer/notifications:
 *   get:
 *     tags: [Lecturer]
 *     summary: Get high similarity notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 */
