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
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Car'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * 
 * /cars/calculate-price:
 *   post:
 *     summary: Calculate car rental price
 *     tags: [Cars]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - carId
 *               - numberOfDays
 *             properties:
 *               carId:
 *                 type: string
 *                 description: Car ID
 *               numberOfDays:
 *                 type: integer
 *                 description: Number of rental days
 *               promotionId:
 *                 type: string
 *                 description: Promotion ID (optional)
 *     responses:
 *       200:
 *         description: Calculated price
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
 *                     totalPrice:
 *                       type: number
 *                     days:
 *                       type: number
 *                     pricePerDay:
 *                       type: number
 *                     discount:
 *                       type: number
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * 
 * /cars/{id}:
 *   get:
 *     summary: Get a single car
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
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
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
 *             type: object
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
 *                 description: Car images
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
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
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
 *                 message:
 *                   type: string
 *                   example: Car deleted
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * 
 * /cars/{providerId}:
 *   post:
 *     summary: Create a new car for a provider
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Provider ID
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
 *                 description: Car images
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
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Provider not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * 
 * /cars/{carId}/comments:
 *   get:
 *     summary: Get all comments for a car
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: carId
 *         required: true
 *         schema:
 *           type: string
 *         description: Car ID
 *     responses:
 *       200:
 *         description: List of comments for the car
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
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     summary: Add a comment to a car
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: carId
 *         required: true
 *         schema:
 *           type: string
 *         description: Car ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comment
 *               - rating
 *             properties:
 *               comment:
 *                 type: string
 *                 description: Comment text
 *               rating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *                 description: Rating (0-5)
 *     responses:
 *       201:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
