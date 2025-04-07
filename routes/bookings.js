const express = require('express');
const router = express.Router({mergeParams: true});

const { getBookings, getBooking, addBooking, updateBooking, deleteBooking } = require('../controllers/bookings');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
    .get(protect, getBookings)
    .post(protect, authorize('admin', 'provider', 'user'), addBooking);  

router.route('/:id') 
    .get(protect, getBooking)
    .put(protect, authorize('admin', 'provider', 'user'), updateBooking)
    .delete(protect, authorize('admin', 'provider', 'user'), deleteBooking);

module.exports = router;
