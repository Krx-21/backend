const express = require('express');
const {getBookings, getBooking, addBooking, updateBooking, deleteBooking} = require('../controllers/bookings');
const {protect, authorize} = require('../middleware/auth');

const router = express.Router({mergeParams: true});
// I add "provider" to every authorize that have "admin" so now provider is kinda equavalient with admin
router.route('/')
    .get(protect, getBookings)
    .post(protect, authorize('admin', 'user','provider'), addBooking);  
router.route('/:id') 
    .get(protect, getBooking)
    .put(protect, authorize('admin', 'user','provider'), updateBooking)
    .delete(protect, authorize('admin', 'user','provider'), deleteBooking);

module.exports = router;