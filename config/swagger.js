const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Car Rental API',
    version: '1.0.0',
    description: 'API documentation for the Car Rental application',
    contact: {
      name: 'API Support',
      email: 'support@carrentalapi.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Development server'
    },
    {
      url: 'https://backend-six-bay-39.vercel.app/api/v1',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      User: {
        type: 'object',
        required: ['name', 'email', 'password', 'telephoneNumber'],
        properties: {
          _id: {
            type: 'string',
            description: 'User ID'
          },
          name: {
            type: 'string',
            description: 'User name'
          },
          email: {
            type: 'string',
            description: 'User email'
          },
          telephoneNumber: {
            type: 'string',
            description: 'User telephone number'
          },
          role: {
            type: 'string',
            enum: ['user', 'admin', 'provider'],
            description: 'User role'
          },
          password: {
            type: 'string',
            description: 'User password'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'User creation date'
          },
          image: {
            type: 'string',
            description: 'User profile image'
          },
          bookedCar: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'List of booked car IDs'
          },
          myRcpId: {
            type: 'string',
            description: 'Rental car provider ID if user is a provider'
          }
        }
      },
      RentalCarProvider: {
        type: 'object',
        required: ['name', 'address', 'district', 'province', 'postalcode', 'region', 'user'],
        properties: {
          _id: {
            type: 'string',
            description: 'Provider ID'
          },
          name: {
            type: 'string',
            description: 'Provider name'
          },
          address: {
            type: 'string',
            description: 'Provider address'
          },
          district: {
            type: 'string',
            description: 'Provider district'
          },
          province: {
            type: 'string',
            description: 'Provider province'
          },
          postalcode: {
            type: 'string',
            description: 'Provider postal code'
          },
          tel: {
            type: 'string',
            description: 'Provider telephone number'
          },
          region: {
            type: 'string',
            description: 'Provider region'
          },
          user: {
            type: 'string',
            description: 'User ID who owns this provider'
          }
        }
      },
      Car: {
        type: 'object',
        required: ['brand', 'model', 'type', 'topSpeed', 'fuelType', 'seatingCapacity', 'year', 'pricePerDay', 'provider'],
        properties: {
          _id: {
            type: 'string',
            description: 'Car ID'
          },
          brand: {
            type: 'string',
            description: 'Car brand'
          },
          model: {
            type: 'string',
            description: 'Car model'
          },
          type: {
            type: 'string',
            enum: ['Sedan', 'SUV', 'Hatchback', 'Truck', 'Convertible', 'Van', 'MPV'],
            description: 'Car type'
          },
          topSpeed: {
            type: 'number',
            description: 'Car top speed'
          },
          fuelType: {
            type: 'string',
            description: 'Car fuel type'
          },
          seatingCapacity: {
            type: 'number',
            description: 'Car seating capacity'
          },
          year: {
            type: 'number',
            description: 'Car manufacturing year'
          },
          pricePerDay: {
            type: 'number',
            description: 'Car rental price per day'
          },
          provider: {
            type: 'string',
            description: 'Provider ID'
          },
          carDescription: {
            type: 'string',
            description: 'Car description'
          },
          postedDate: {
            type: 'string',
            format: 'date-time',
            description: 'Car posting date'
          },
          image: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Car images'
          }
        }
      },
      Booking: {
        type: 'object',
        required: ['start_date', 'end_date', 'user', 'car', 'totalprice'],
        properties: {
          _id: {
            type: 'string',
            description: 'Booking ID'
          },
          start_date: {
            type: 'string',
            format: 'date-time',
            description: 'Booking start date'
          },
          end_date: {
            type: 'string',
            format: 'date-time',
            description: 'Booking end date'
          },
          user: {
            type: 'string',
            description: 'User ID'
          },
          car: {
            type: 'string',
            description: 'Car ID'
          },
          totalprice: {
            type: 'number',
            description: 'Total booking price'
          },
          status: {
            type: 'string',
            enum: ['pending', 'processing', 'completed', 'failed'],
            description: 'Booking status'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Booking creation date'
          }
        }
      },
      Promotion: {
        type: 'object',
        required: ['title', 'description', 'discountPercentage', 'maxDiscountAmount', 'minPurchaseAmount', 'startDate', 'endDate', 'amount'],
        properties: {
          _id: {
            type: 'string',
            description: 'Promotion ID'
          },
          title: {
            type: 'string',
            description: 'Promotion title'
          },
          description: {
            type: 'string',
            description: 'Promotion description'
          },
          discountPercentage: {
            type: 'number',
            description: 'Discount percentage'
          },
          maxDiscountAmount: {
            type: 'number',
            description: 'Maximum discount amount'
          },
          minPurchaseAmount: {
            type: 'number',
            description: 'Minimum purchase amount'
          },
          startDate: {
            type: 'string',
            format: 'date-time',
            description: 'Promotion start date'
          },
          endDate: {
            type: 'string',
            format: 'date-time',
            description: 'Promotion end date'
          },
          provider: {
            type: 'string',
            description: 'Provider ID'
          },
          amount: {
            type: 'number',
            description: 'Promotion amount'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Promotion creation date'
          }
        }
      },
      Comment: {
        type: 'object',
        required: ['user', 'car', 'comment', 'rating'],
        properties: {
          _id: {
            type: 'string',
            description: 'Comment ID'
          },
          user: {
            type: 'string',
            description: 'User ID'
          },
          car: {
            type: 'string',
            description: 'Car ID'
          },
          comment: {
            type: 'string',
            description: 'Comment text'
          },
          rating: {
            type: 'number',
            description: 'Rating (0-5)'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Comment creation date'
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string'
          }
        }
      }
    },
    responses: {
      UnauthorizedError: {
        description: 'Access token is missing or invalid',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              success: false,
              message: 'Not authorized to access this route'
            }
          }
        }
      },
      ForbiddenError: {
        description: 'User does not have permission to access this resource',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              success: false,
              message: 'Role user is not authorized to access this route'
            }
          }
        }
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              success: false,
              message: 'Resource not found'
            }
          }
        }
      },
      ValidationError: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              success: false,
              message: 'Please provide all required fields'
            }
          }
        }
      },
      ServerError: {
        description: 'Server error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              success: false,
              message: 'Unexpected Error'
            }
          }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: ['./routes/*.js', './controllers/*.js', './models/*.js', './swagger/*.js']
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

// Function to setup our docs
const swaggerDocs = (app) => {
  // Route for swagger docs
  app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Docs in JSON format
  app.get('/api/v1/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`Docs available at /api/v1/docs`);
};

module.exports = swaggerDocs;
