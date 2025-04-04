const express = require('express');
const { getCars, getCar, createCar, updateCar, deleteCar } = require('../controllers/cars');
const router = express.Router({mergeParams: true});
const { protect, authorize } = require('../middleware/auth'); 

const commentRouter = require('./comments');



router.use('/:carId/comments/',commentRouter);


router.route('/')
    .get(getCars);


router.route('/:id')
    .get(getCar) 
    .put(protect, authorize('admin', 'provider'), updateCar) 
    .delete(protect, authorize('admin', 'provider'), deleteCar); 


router.route('/:providerId')
    .post(protect, authorize('admin', 'provider'), createCar); 

module.exports = router;
