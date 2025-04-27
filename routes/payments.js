const express = require('express');
const router = express.Router();

const { verifyPayment } = require('../controllers/payments');

router.route('/verify/:id').get(verifyPayment);

module.exports = router;