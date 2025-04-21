/**
 * @swagger
 * tags:
 *   name: Images
 *   description: Image management
 */

/**
 * @swagger
 * /images:
 *   delete:
 *     summary: Delete images
 *     description: |
 *       Deletes one or more images from the system.
 *       This endpoint requires authentication and is restricted to admin and provider roles.
 *       Images are identified by their unique IDs, which should be provided as an array.
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
 *                 description: Array of image IDs to delete
 *                 example: ["img123456", "img789012", "img345678"]
 *           examples:
 *             singleImage:
 *               summary: Delete a single image
 *               value:
 *                 ids: ["img123456"]
 *             multipleImages:
 *               summary: Delete multiple images
 *               value:
 *                 ids: ["img123456", "img789012", "img345678"]
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
 *                       example: 3
 *             examples:
 *               singleImageDeleted:
 *                 summary: Single image deleted
 *                 value:
 *                   success: true
 *                   message: "Images deleted successfully"
 *                   data:
 *                     deletedCount: 1
 *               multipleImagesDeleted:
 *                 summary: Multiple images deleted
 *                 value:
 *                   success: true
 *                   message: "Images deleted successfully"
 *                   data:
 *                     deletedCount: 3
 *       400:
 *         description: Bad request - missing or invalid image IDs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               missingIds:
 *                 summary: No image IDs provided
 *                 value:
 *                   success: false
 *                   message: "No image IDs provided"
 *               invalidIds:
 *                 summary: Invalid image IDs format
 *                 value:
 *                   success: false
 *                   message: "Image IDs must be provided as an array"
 *       401:
 *         description: Not authorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               unauthorized:
 *                 summary: Unauthorized access
 *                 value:
 *                   success: false
 *                   message: "Not authorized to access this route"
 *       403:
 *         description: Forbidden - user does not have required role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               forbidden:
 *                 summary: Access forbidden
 *                 value:
 *                   success: false
 *                   message: "User role not authorized to perform this action"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               serverError:
 *                 summary: Error deleting images
 *                 value:
 *                   success: false
 *                   message: "Failed to delete images"
 */
