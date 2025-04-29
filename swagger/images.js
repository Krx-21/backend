/**
 * @swagger
 * tags:
 *   name: Images
 *   description: Image management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ImageFormat:
 *       type: object
 *       properties:
 *         format:
 *           type: string
 *           description: All images are stored as base64 encoded strings
 *           example: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
 *         maxSize:
 *           type: string
 *           description: Maximum image size before compression
 *           example: "10MB"
 *         compression:
 *           type: string
 *           description: Images larger than 5MB are automatically compressed
 *           example: "0.8 quality factor"
 *         carImages:
 *           type: array
 *           description: Car images are stored as an array of base64 strings (max 5 images per car)
 *           items:
 *             type: string
 *           example: ["data:image/jpeg;base64,/9j/4AAQSkZJRg...", "data:image/png;base64,iVBORw0KGg..."]
 *         userImage:
 *           type: string
 *           description: User profile image is stored as a single base64 string
 *           example: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
 */

/**
 * @swagger
 * /images:
 *   delete:
 *     summary: Delete multiple images
 *     description: Deletes images from cars and users by their IDs (base64 strings)
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of image IDs (base64 strings) to delete
 *                 example: ["data:image/jpeg;base64,/9j/4AAQSkZJRg...", "data:image/png;base64,iVBORw0KGg..."]
 *     responses:
 *       200:
 *         description: Images deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Images deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedCount:
 *                       type: integer
 *                       example: 2
 *                     carsUpdated:
 *                       type: integer
 *                       example: 1
 *                     usersUpdated:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Bad request - No image IDs provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: No image IDs provided
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
