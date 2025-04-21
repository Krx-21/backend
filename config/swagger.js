const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Car Rental API',
      version: '1.0.0',
      description: 'API documentation for the Car Rental Service',
      contact: {
        name: 'API Support',
        email: 'support@carrentalapi.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development server'
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
          required: ['name', 'telephoneNumber', 'email', 'password'],
          properties: {
            _id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'User name'
            },
            telephoneNumber: {
              type: 'string',
              description: 'User telephone number'
            },
            email: {
              type: 'string',
              description: 'User email'
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
            image: {
              type: 'string',
              description: 'User profile image URL'
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
              description: 'Rental car provider ID (for provider users)'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation date'
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
              description: 'Rental car provider ID'
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
              description: 'Car images URLs'
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
        RentalCarProvider: {
          type: 'object',
          required: ['name', 'address', 'district', 'province', 'postalcode', 'region', 'user'],
          properties: {
            _id: {
              type: 'string',
              description: 'Rental car provider ID'
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
              description: 'User ID of the provider'
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
              description: 'Rental car provider ID'
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
      }
    }
  },
  apis: ['./swagger/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Function to setup our docs
const swaggerDocs = (app) => {
  // Route for swagger docs
  app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Docs in JSON format
  app.get('/api/v1/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`Swagger docs available at /api/v1/docs`);
};

module.exports = { swaggerDocs };
