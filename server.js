const express = require('express');
const  dotenv = require('dotenv');
const rentalCarProviders = require('./routes/rentalCarProviders');
const bookings = require('./routes/bookings');
const connectDB = require('./config/db');
const auth = require('./routes/auth');
const cookieParser = require('cookie-parser');
const cors = require('cors');


dotenv.config({path:'config/config.env'});

connectDB();

const app = express();
app.use(express.json());
app.use('/api/v1/rentalCarProviders', rentalCarProviders);
app.use('/api/v1/auth', auth);
app.use('/api/v1/bookings', bookings);
app.use(cookieParser());

const corsOptions = {
  origin: 'http://localhost:3000', // Allow requests from your frontend origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Specify allowed HTTP methods
  credentials: true, // Allow sending of cookies, etc.
  allowedHeaders: 'Content-Type, Authorization', // Specify allowed headers
};

app.use(cors(corsOptions));
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT));

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});