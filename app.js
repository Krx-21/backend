const express = require('express');
const dotenv = require('dotenv');
const rentalCarProviders = require('./routes/rentalCarProviders');
const bookings = require('./routes/bookings');
const cars = require('./routes/cars');
const promotions = require('./routes/promotions');
const comment = require('./routes/comments');
const auth = require('./routes/auth');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { swaggerDocs } = require('./config/swagger');

// Load env vars
dotenv.config({ path: 'config/config.env' });

const app = express();

// CORS config
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: 'GET, POST, OPTIONS, PUT, DELETE',
  allowedHeaders: 'Content-Type, Authorization',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(cookieParser());

app.use('/api/v1/rentalCarProviders', rentalCarProviders);
app.use('/api/v1/auth', auth);
app.use('/api/v1/bookings', bookings);
app.use('/api/v1/cars', cars);
app.use('/api/v1/promotions', promotions);
app.use('/api/v1/comments', comment);

// Setup Swagger documentation
swaggerDocs(app);

module.exports = app;
