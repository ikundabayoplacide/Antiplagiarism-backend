/**
 * @swagger
 * tags:
 *   name: Student
 *   description: Student endpoints (requires student JWT)
 */

/**
 * @swagger
 * /student/stats:
 *   get:
 *     tags: [Student]
 *     summary: Get student scan statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:         { type: integer }
 *                 original:      { type: integer }
 *                 flagged:       { type: integer }
 *                 reports:       { type: integer }
 *                 avgSimilarity: { type: integer }
 */

/**
 * @swagger
 * /student/scans:
 *   get:
 *     tags: [Student]
 *     summary: Get all scans for the logged-in student
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of scans
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Scan'
 *
 *   post:
 *     tags: [Student]
 *     summary: Upload a document for plagiarism scanning
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: PDF, DOC, DOCX or TXT file (max 10MB)
 *     responses:
 *       201:
 *         description: Scan created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Scan'
 *       400:
 *         description: No file or unsupported file type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /student/scans/{id}:
 *   get:
 *     tags: [Student]
 *     summary: Get a specific scan by ID
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
 *         description: Scan details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Scan'
 *       404:
 *         description: Scan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   delete:
 *     tags: [Student]
 *     summary: Delete a scan
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
 *         description: Scan deleted successfully
 *       404:
 *         description: Scan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
