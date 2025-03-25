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
  origin: 'https://frontend-project-cedt.vercel.app', // Specific frontend origin
  methods: 'GET, POST, OPTIONS, PUT, DELETE', // Adjust as needed
  allowedHeaders: 'Content-Type, Authorization', // Adjust as needed
  credentials: true, // Make sure this is true if you're handling credentials
};

// Apply middlewares
app.use(cors(corsOptions));
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