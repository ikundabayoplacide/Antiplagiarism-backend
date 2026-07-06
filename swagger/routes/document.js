/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Document upload and management
 */

/**
 * @swagger
 * /documents:
 *   post:
 *     tags: [Documents]
 *     summary: Upload a document
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: pdf, doc, docx, txt (max 10MB)
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Document'
 *       400:
 *         description: No file or unsupported file type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /documents:
 *   get:
 *     tags: [Documents]
 *     summary: Get all documents for the logged-in user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of documents (without base64 content)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Document'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /documents/{id}:
 *   get:
 *     tags: [Documents]
 *     summary: Get a document by ID (includes base64 content)
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
 *         description: Document with base64 content
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DocumentWithContent'
 *       404:
 *         description: Document not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /documents/{id}:
 *   delete:
 *     tags: [Documents]
 *     summary: Delete a document
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
 *         description: Document deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Document not found
 *       401:
 *         description: Unauthorized
 */
