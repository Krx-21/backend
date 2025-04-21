// server.js
const app = require('./app');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: 'config/config.env' });

// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
