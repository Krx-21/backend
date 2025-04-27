const express = require('express');
const router = express.Router();

const { verifyPayment } = require('../controllers/payments');
const { protect, authorize } = require('../middleware/auth');

router.route('/verify/:id').get(protect, verifyPayment);

module.exports = router;