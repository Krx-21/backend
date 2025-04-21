/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: |
 *       Creates a new user account in the system.
 *       All users start with a default role of 'user' unless specified otherwise.
 *       Upon successful registration, a JWT token is returned for immediate authentication.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - telephoneNumber
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *                 example: "John Doe"
 *               telephoneNumber:
 *                 type: string
 *                 description: User's telephone number in any format
 *                 example: "0812345678"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address (must be unique)
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password (will be hashed before storage)
 *                 example: "securePassword123"
 *               role:
 *                 type: string
 *                 enum: [user, admin, provider]
 *                 description: User's role (default is 'user')
 *                 example: "user"
 *           examples:
 *             userRegistration:
 *               summary: Standard user registration
 *               value:
 *                 name: "John Doe"
 *                 telephoneNumber: "0812345678"
 *                 email: "john.doe@example.com"
 *                 password: "securePassword123"
 *             providerRegistration:
 *               summary: Provider registration
 *               value:
 *                 name: "Car Rental Company"
 *                 telephoneNumber: "0223456789"
 *                 email: "contact@carrentalcompany.com"
 *                 password: "providerPass456"
 *                 role: "provider"
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *             examples:
 *               successResponse:
 *                 summary: Successful registration response
 *                 value:
 *                   success: true
 *                   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Bad request - missing required fields or validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               missingFields:
 *                 summary: Missing required fields
 *                 value:
 *                   success: false
 *                   message: "Please provide all required fields"
 *               emailExists:
 *                 summary: Email already exists
 *                 value:
 *                   success: false
 *                   message: "Email already in use"
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
 *                   message: "Unexpected Error"
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     description: |
 *       Authenticates a user with email and password.
 *       Returns a JWT token that should be included in the Authorization header for protected routes.
 *       The token is also set as an HTTP-only cookie for web applications.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *                 example: "securePassword123"
 *           examples:
 *             userLogin:
 *               summary: Standard user login
 *               value:
 *                 email: "john.doe@example.com"
 *                 password: "securePassword123"
 *             adminLogin:
 *               summary: Admin login
 *               value:
 *                 email: "admin@carrentalservice.com"
 *                 password: "adminPassword"
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *             examples:
 *               successResponse:
 *                 summary: Successful login response
 *                 value:
 *                   success: true
 *                   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Bad request - missing email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               missingCredentials:
 *                 summary: Missing credentials
 *                 value:
 *                   success: false
 *                   msg: "Please provide email and password"
 *       401:
 *         description: Invalid credentials - email or password incorrect
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalidCredentials:
 *                 summary: Invalid credentials
 *                 value:
 *                   success: false
 *                   msg: "Invalid credentials"
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
 *                   message: "Unexpected Error"
 */

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current logged in user
 *     description: |
 *       Retrieves the profile information of the currently authenticated user.
 *       This endpoint requires authentication via JWT token in the Authorization header.
 *       The token can be obtained from the login or register endpoints.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *             examples:
 *               regularUser:
 *                 summary: Regular user profile
 *                 value:
 *                   success: true
 *                   data:
 *                     _id: "60d21b4667d0d8992e610c85"
 *                     name: "John Doe"
 *                     email: "john.doe@example.com"
 *                     telephoneNumber: "0812345678"
 *                     role: "user"
 *                     image: "https://example.com/profile.jpg"
 *                     bookedCar: ["60d21b4667d0d8992e610c86"]
 *               providerUser:
 *                 summary: Provider user profile
 *                 value:
 *                   success: true
 *                   data:
 *                     _id: "60d21b4667d0d8992e610c87"
 *                     name: "Car Rental Company"
 *                     email: "contact@carrentalcompany.com"
 *                     telephoneNumber: "0223456789"
 *                     role: "provider"
 *                     image: "https://example.com/company-logo.jpg"
 *                     bookedCar: []
 *                     myRcpId: "60d21b4667d0d8992e610c88"
 *       401:
 *         description: Not authorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   success: false
 *                   message: "Not authorized to access this route"
 *               missingToken:
 *                 summary: Missing token
 *                 value:
 *                   success: false
 *                   message: "Please provide an authentication token"
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
 *                   message: "Unexpected Error"
 */

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Logout current user
 *     description: |
 *       Logs out the current user by clearing the authentication cookie.
 *       This endpoint invalidates the session by setting an expired cookie.
 *       After logout, the user will need to login again to access protected routes.
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: User logged out successfully
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
 *             examples:
 *               logoutSuccess:
 *                 summary: Successful logout
 *                 value:
 *                   success: true
 *                   data: {}
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
 *                   message: "Unexpected Error"
 */

/**
 * @swagger
 * /auth/uploadProfile:
 *   put:
 *     summary: Upload user profile image
 *     description: |
 *       Updates the current user's profile image.
 *       The image should be provided as a base64 encoded string.
 *       This endpoint requires authentication via JWT token.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 description: Base64 encoded image (must start with 'data:image')
 *                 example: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."
 *           examples:
 *             profileImage:
 *               summary: Profile image upload
 *               value:
 *                 image: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *             examples:
 *               profileUpdated:
 *                 summary: Profile image updated successfully
 *                 value:
 *                   success: true
 *                   data:
 *                     _id: "60d21b4667d0d8992e610c85"
 *                     name: "John Doe"
 *                     email: "john.doe@example.com"
 *                     telephoneNumber: "0812345678"
 *                     role: "user"
 *                     image: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."
 *                     bookedCar: ["60d21b4667d0d8992e610c86"]
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
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               userNotFound:
 *                 summary: User not found
 *                 value:
 *                   success: false
 *                   message: "No user with id of 60d21b4667d0d8992e610c85"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               uploadFailed:
 *                 summary: Upload failed
 *                 value:
 *                   success: false
 *                   message: "Upload image fail: Error processing image"
 */

/**
 * @swagger
 * /auth/booked:
 *   put:
 *     summary: Mark a car as booked for a user after completing a booking
 *     description: |
 *       Updates the user's bookedCar array to include the car from a completed booking.
 *       This endpoint is used to track which cars a user has previously booked.
 *       Only the booking owner or an admin can mark a booking as completed.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - booking
 *             properties:
 *               booking:
 *                 type: string
 *                 description: ID of the booking to mark as completed
 *                 example: "60d21b4667d0d8992e610c89"
 *           examples:
 *             markBooked:
 *               summary: Mark booking as completed
 *               value:
 *                 booking: "60d21b4667d0d8992e610c89"
 *     responses:
 *       200:
 *         description: Booking completed and car marked as booked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *             examples:
 *               bookingCompleted:
 *                 summary: Booking completed successfully
 *                 value:
 *                   success: true
 *                   data:
 *                     _id: "60d21b4667d0d8992e610c85"
 *                     name: "John Doe"
 *                     email: "john.doe@example.com"
 *                     telephoneNumber: "0812345678"
 *                     role: "user"
 *                     image: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."
 *                     bookedCar: ["60d21b4667d0d8992e610c86", "60d21b4667d0d8992e610c90"]
 *       401:
 *         description: Not authorized - user not authorized to complete this booking
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               unauthorized:
 *                 summary: Unauthorized to complete booking
 *                 value:
 *                   success: false
 *                   message: "User 60d21b4667d0d8992e610c85 is not authorized to finish this booking"
 *       404:
 *         description: User or booking not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               userNotFound:
 *                 summary: User not found
 *                 value:
 *                   success: false
 *                   message: "No user with id of 60d21b4667d0d8992e610c85"
 *               bookingNotFound:
 *                 summary: Booking not found
 *                 value:
 *                   success: false
 *                   message: "No booking with id of 60d21b4667d0d8992e610c89"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               serverError:
 *                 summary: Update failed
 *                 value:
 *                   success: false
 *                   message: "Update booked car fail: Error updating user"
 */

/**
 * @swagger
 * /auth/users:
 *   get:
 *     summary: Get all users (admin only)
 *     description: |
 *       Retrieves a list of all users in the system.
 *       This endpoint is restricted to administrators only.
 *       The response includes detailed information about each user.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
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
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *             examples:
 *               usersList:
 *                 summary: List of users
 *                 value:
 *                   success: true
 *                   count: 3
 *                   data:
 *                     - _id: "60d21b4667d0d8992e610c85"
 *                       name: "John Doe"
 *                       email: "john.doe@example.com"
 *                       telephoneNumber: "0812345678"
 *                       role: "user"
 *                       image: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."
 *                       bookedCar: ["60d21b4667d0d8992e610c86"]
 *                     - _id: "60d21b4667d0d8992e610c87"
 *                       name: "Car Rental Company"
 *                       email: "contact@carrentalcompany.com"
 *                       telephoneNumber: "0223456789"
 *                       role: "provider"
 *                       image: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."
 *                       bookedCar: []
 *                       myRcpId: "60d21b4667d0d8992e610c88"
 *                     - _id: "60d21b4667d0d8992e610c91"
 *                       name: "Admin User"
 *                       email: "admin@carrentalservice.com"
 *                       telephoneNumber: "0223456700"
 *                       role: "admin"
 *                       image: null
 *                       bookedCar: []
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
 *         description: Forbidden - user is not an admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               forbidden:
 *                 summary: Access forbidden
 *                 value:
 *                   success: false
 *                   message: "Not authorized to access this route"
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
 *                   message: "Failed to get users"
 */
