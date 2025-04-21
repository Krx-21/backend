/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment management
 */

/**
 * @swagger
 * /payments/verify/{id}:
 *   get:
 *     summary: Verify payment and update booking status
 *     description: |
 *       Verifies a payment for a booking and updates the booking status to 'completed'.
 *       This endpoint is typically called after a successful payment transaction.
 *       It marks the booking as confirmed and ready for service.
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *         example: "60d21b4667d0d8992e610c89"
 *     responses:
 *       200:
 *         description: Payment verified and booking status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *                 message:
 *                   type: string
 *                   example: Payment verified and booking status updated to completed
 *             examples:
 *               paymentVerified:
 *                 summary: Payment successfully verified
 *                 value:
 *                   success: true
 *                   data:
 *                     _id: "60d21b4667d0d8992e610c89"
 *                     start_date: "2023-06-15T10:00:00.000Z"
 *                     end_date: "2023-06-18T10:00:00.000Z"
 *                     user: "60d21b4667d0d8992e610c85"
 *                     car: "60d21b4667d0d8992e610c86"
 *                     totalprice: 3600
 *                     status: "completed"
 *                     createdAt: "2023-06-10T15:30:00.000Z"
 *                   message: "Payment verified and booking status updated to completed"
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               bookingNotFound:
 *                 summary: Booking not found
 *                 value:
 *                   success: false
 *                   message: "Booking with ID 60d21b4667d0d8992e610c89 not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               serverError:
 *                 summary: Payment verification failed
 *                 value:
 *                   success: false
 *                   message: "Payment verification failed"
 *                   error: "Error updating booking status"
 */
