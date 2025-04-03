const express = require('express');
const {getRentalCarProviders, getRentalCarProvider, createRentalCarProvider, updateRentalCarProvider, deleteRentalCarProvider} = require('../controllers/rentalCarProviders');
const {protect, authorize} = require('../middleware/auth');
const bookingRouter = require('./bookings');

const router = express.Router();

router.use('/:ProviderId/bookings/', bookingRouter);
// I add "provider" to every authorize that have "admin" so now provider is kinda equavalient with admin
router.route('/').get(getRentalCarProviders).post(protect, authorize('admin','provider'), createRentalCarProvider);
router.route('/:id').get(getRentalCarProvider).put(protect, authorize('admin','provider'), updateRentalCarProvider).delete(protect, authorize('admin','provider'), deleteRentalCarProvider);

module.exports = router;