const express = require('express');
const dotenv = require('dotenv');
const rentalCarProviders = require('./routes/rentalCarProviders');
const bookings = require('./routes/bookings');
const cars = require('./routes/cars');
const promotions = require('./routes/promotions')
const comment = require('./routes/comments');
const images = require('./routes/images');
const payments = require('./routes/payments');
const connectDB = require('./config/db');
const auth = require('./routes/auth');
const cookieParser = require('cookie-parser');
const cors = require('cors');

dotenv.config({path:'config/config.env'});

connectDB();

const app = express();

const corsOptions = {
  origin: ['http://localhost:3000', 'https://web-project-delta-nine.vercel.app'], 
  methods: 'GET, POST, OPTIONS, PUT, DELETE',
  allowedHeaders: 'Content-Type, Authorization',
  credentials: true, 
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

app.use(cookieParser());

app.use('/api/v1/rentalCarProviders', rentalCarProviders);
app.use('/api/v1/auth', auth);
app.use('/api/v1/bookings', bookings);
app.use('/api/v1/cars', cars);
app.use('/api/v1/promotions', promotions);
app.use('/api/v1/comments', comment);
app.use('/api/v1/images', images);
app.use('/api/v1/payments', payments);


const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT));

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

