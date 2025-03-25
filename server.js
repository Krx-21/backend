const express = require('express');
const dotenv = require('dotenv');
const rentalCarProviders = require('./routes/rentalCarProviders');
const bookings = require('./routes/bookings');
const connectDB = require('./config/db');
const auth = require('./routes/auth');
const cookieParser = require('cookie-parser');
const cors = require('cors');

dotenv.config({path:'config/config.env'});

connectDB();

const app = express();

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'https://fe-project-2024-2-jsbygpt-js-txt.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['set-cookie'],
};

// Apply middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/v1/rentalCarProviders', rentalCarProviders);
app.use('/api/v1/auth', auth);
app.use('/api/v1/bookings', bookings);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT));

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});