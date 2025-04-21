/**
 * @swagger
 * tags:
 *   name: Cars
 *   description: Car management
 */

/**
 * @swagger
 * /cars:
 *   get:
 *     summary: Get all cars
 *     tags: [Cars]
 *     parameters:
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filter by car brand
 *       - in: query
 *         name: model
 *         schema:
 *           type: string
 *         description: Filter by car model
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [Sedan, SUV, Hatchback, Truck, Convertible, Van, MPV]
 *         description: Filter by car type
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *         description: Fields to select (comma separated)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort fields (comma separated)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of cars
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalCount:
 *                       type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Car'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /cars/{id}:
 *   get:
 *     summary: Get a single car by ID
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Car ID
 *     responses:
 *       200:
 *         description: Car details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Car'
 *       404:
 *         description: Car not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   put:
 *     summary: Update a car
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Car ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Car'
 *     responses:
 *       200:
 *         description: Car updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Car'
 *       401:
 *         description: Not authorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Car not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   delete:
 *     summary: Delete a car
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Car ID
 *     responses:
 *       200:
 *         description: Car deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties: {}
 *       401:
 *         description: Not authorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Car not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /cars/{providerId}:
 *   post:
 *     summary: Create a new car
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Rental car provider ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - brand
 *               - model
 *               - type
 *               - topSpeed
 *               - fuelType
 *               - seatingCapacity
 *               - year
 *               - pricePerDay
 *             properties:
 *               brand:
 *                 type: string
 *                 description: Car brand
 *               model:
 *                 type: string
 *                 description: Car model
 *               type:
 *                 type: string
 *                 enum: [Sedan, SUV, Hatchback, Truck, Convertible, Van, MPV]
 *                 description: Car type
 *               topSpeed:
 *                 type: number
 *                 description: Car top speed
 *               fuelType:
 *                 type: string
 *                 description: Car fuel type
 *               seatingCapacity:
 *                 type: number
 *                 description: Car seating capacity
 *               year:
 *                 type: number
 *                 description: Car manufacturing year
 *               pricePerDay:
 *                 type: number
 *                 description: Car rental price per day
 *               carDescription:
 *                 type: string
 *                 description: Car description
 *               image:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Car images URLs
 *     responses:
 *       201:
 *         description: Car created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Car'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Provider not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /cars/calculate-price:
 *   post:
 *     summary: Calculate car rental price
 *     description: |
 *       Calculates the total price for a car rental based on the rental period and optional promotion.
 *       The calculation includes the base price (price per day × number of days) and any applicable discounts.
 *       This endpoint is useful for showing price previews before booking.
 *     tags: [Cars]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - carId
 *               - startDate
 *               - endDate
 *             properties:
 *               carId:
 *                 type: string
 *                 description: Car ID
 *                 example: "60d21b4667d0d8992e610c86"
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Rental start date (ISO format)
 *                 example: "2023-06-15T10:00:00.000Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: Rental end date (ISO format)
 *                 example: "2023-06-18T10:00:00.000Z"
 *               promoId:
 *                 type: string
 *                 description: Promotion ID (optional)
 *                 example: "60d21b4667d0d8992e610c95"
 *           examples:
 *             basicCalculation:
 *               summary: Basic price calculation without promotion
 *               value:
 *                 carId: "60d21b4667d0d8992e610c86"
 *                 startDate: "2023-06-15T10:00:00.000Z"
 *                 endDate: "2023-06-18T10:00:00.000Z"
 *             withPromotion:
 *               summary: Price calculation with promotion
 *               value:
 *                 carId: "60d21b4667d0d8992e610c86"
 *                 startDate: "2023-06-15T10:00:00.000Z"
 *                 endDate: "2023-06-18T10:00:00.000Z"
 *                 promoId: "60d21b4667d0d8992e610c95"
 *     responses:
 *       200:
 *         description: Price calculation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     carId:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c86"
 *                     numberOfDays:
 *                       type: number
 *                       example: 3
 *                     pricePerDay:
 *                       type: number
 *                       example: 1500
 *                     basePrice:
 *                       type: number
 *                       example: 4500
 *                     finalPrice:
 *                       type: number
 *                       example: 3600
 *                     discount:
 *                       type: number
 *                       example: 900
 *                     promoId:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c95"
 *                     promoName:
 *                       type: string
 *                       example: "Summer Discount"
 *                     promoDiscountPercentage:
 *                       type: number
 *                       example: 20
 *             examples:
 *               withoutPromotion:
 *                 summary: Calculation without promotion
 *                 value:
 *                   success: true
 *                   data:
 *                     carId: "60d21b4667d0d8992e610c86"
 *                     numberOfDays: 3
 *                     pricePerDay: 1500
 *                     basePrice: 4500
 *                     finalPrice: 4500
 *                     discount: 0
 *               withPromotion:
 *                 summary: Calculation with promotion
 *                 value:
 *                   success: true
 *                   data:
 *                     carId: "60d21b4667d0d8992e610c86"
 *                     numberOfDays: 3
 *                     pricePerDay: 1500
 *                     basePrice: 4500
 *                     finalPrice: 3600
 *                     discount: 900
 *                     promoId: "60d21b4667d0d8992e610c95"
 *                     promoName: "Summer Discount"
 *                     promoDiscountPercentage: 20
 *       400:
 *         description: Bad request - invalid dates or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalidDates:
 *                 summary: Invalid date range
 *                 value:
 *                   success: false
 *                   message: "End date must be after start date"
 *               missingFields:
 *                 summary: Missing required fields
 *                 value:
 *                   success: false
 *                   message: "Please provide carId, startDate, and endDate"
 *       404:
 *         description: Car or promotion not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               carNotFound:
 *                 summary: Car not found
 *                 value:
 *                   success: false
 *                   message: "Car not found with id 60d21b4667d0d8992e610c86"
 *               promoNotFound:
 *                 summary: Promotion not found
 *                 value:
 *                   success: false
 *                   message: "Promotion not found with id 60d21b4667d0d8992e610c95"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               serverError:
 *                 summary: Unexpected server error
 *                 value:
 *                   success: false
 *                   message: "Error calculating price"
 */
