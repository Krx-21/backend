const express = require('express');
const { register, login, getMe, logout , uploadProfile , finishBooking, getAllUsers } = require('../controllers/auth');
const { protect } = require('../middleware/auth');

const router = express.Router({mergeParams: true});

router.post('/register', register);
router.post('/login', login);
router.put('/booked', protect , finishBooking);
router.put('/uploadProfile', protect ,uploadProfile);
router.get('/me', protect, getMe);
router.get('/logout', logout);
router.get('/users', protect, getAllUsers);

module.exports = router;