const express = require('express');
const router = express.Router({mergeParams: true});

const { getCars, getCar, createCar, updateCar, deleteCar } = require('../controllers/cars');
const { protect, authorize } = require('../middleware/auth'); 
const commentRouter = require('./comments');
const bookingRouter = require('./bookings')

router.use('/:carId/comments/', commentRouter);
router.use('/:carId/bookings', bookingRouter);

router.route('/')
    .get(getCars);

router.route('/:id')
    .get(getCar) 
    .put(protect, authorize('admin', 'provider'), updateCar) 
    .delete(protect, authorize('admin', 'provider'), deleteCar); 

router.route('/:providerId')
    .post(protect, authorize('admin', 'provider'), createCar); 

module.exports = router;
