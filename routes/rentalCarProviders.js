const express = require('express');
const router = express.Router();

const { getRentalCarProviders, getRentalCarProvider, createRentalCarProvider, updateRentalCarProvider, deleteRentalCarProvider } = require('../controllers/rentalCarProviders');
const { protect, authorize } = require('../middleware/auth');
const bookingRouter = require('./bookings');
const carRouter = require('./cars');
const promotionRouter = require('./promotions');

router.use('/:providerId/promotions/', promotionRouter);
router.use('/:ProviderId/bookings/', bookingRouter);
router.use('/:providerId/cars/', carRouter);

router.route('/').get(getRentalCarProviders)
    .post(protect, authorize('provider'), createRentalCarProvider);
router.route('/:id')
    .get(getRentalCarProvider)
    .put(protect, authorize('admin','provider'), updateRentalCarProvider)
    .delete(protect, authorize('admin'), deleteRentalCarProvider);

module.exports = router;
