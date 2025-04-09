const Booking = require('../models/Booking');
const RentalCarProvider = require('../models/RentalCarProvider');


// @desc    Get all bookings
// @route   GET /api/v1/bookings
// @access  Private
exports.getBookings = async (req, res, next) => {
    let query;

    if (req.params.RentalCarId) {
        if (req.user.role === 'admin') {
            query = Booking.find({rentalCarProvider: req.params.RentalCarId}).populate({
                path:'rentalCarProvider',
                select: 'name province tel user'
            });
        } else if (req.user.role === 'provider') {
            if (req.params.RentalCarId !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'You are not authorized to add booking for other providers beside your own'
                });
            }

            query = Booking.find({rentalCarProvider: req.params.RentalCarId}).populate({
                path:'rentalCarProvider',
                select: 'name province tel user'
            });
        } else {
            query = Booking.find({user: req.user.id, rentalCarProvider: req.params.RentalCarId}).populate({
                path:'rentalCarProvider',
                select: 'name province tel user'
            });
        }
    } else {
        if (req.user.role !== 'admin') {
            query = Booking.find({user: req.user.id}).populate({
                path:'rentalCarProvider',
                select: 'name province tel user'
            });
            console.log("eie")
        } else {
            query = Booking.find().populate({
                path:'rentalCarProvider',
                select: 'name province tel user'
            });
        }
    } try {
        const bookings = await query;
        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (err) {
        res.status(500).json({ success: false, message: "Unexpected Error" });
        console.log(err);
    }
};

// @desc    Get a single booking
// @route   GET /api/v1/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id).populate({
            path: 'rentalCarProvider',
            select: 'name description tel'
        });

        if (!booking) {
            return res.status(404).json({ success: false , message: `No booking found with id of ${req.params.id}` });
        }
        res.status(200).json({ success: true, data: booking });
    } catch (err) {
        res.status(500).json({ success: false, message: "Unexpected Error" });
        console.log(err);
    }
};

// @desc    Create a booking
// @route   POST /api/v1/bookings/:RentalCarId
// @access  Private
exports.addBooking = async (req, res, next) => {
    try {
        req.body.rentalCarProvider = req.params.RentalCarId;

        const rentalCarProvider = await RentalCarProvider.findById(req.params.RentalCarId);

        if (!rentalCarProvider) {
            return res.status(404).json({success: false, message: `No rental car provider with the id of ${req.params.RentalCarId}` });
        }

        req.body.user = req.user.id;
        const existedBookings = await Booking.find({user: req.user.id});
        if (existedBookings.length >= 3 && req.user.role === 'user') {
            return res.status(400).json({ success: false, message: `The user with ID ${req.user.id} has already made 3 bookings` });
        }

        if (req.user.role === 'provider' && rentalCarProvider.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to add booking for other providers beside your own'
            });
        }

        const booking = await Booking.create(req.body);
        res.status(201).json({ success: true, data: booking});
    } catch (err) {
        res.status(500).json({ success: false, message: "Unexpected Error" });
        console.log(err);
    }
}

// @desc    Update a booking
// @route   PUT /api/v1/bookings/:id
// @access  Private
exports.updateBooking = async (req, res, next) => {
    try {
        let booking = await Booking.findById(req.params.id).populate('rentalCarProvider'); 

        if (!booking) {
            return res.status(404).json({ success: false, message: `No booking with the id of ${req.params.id}` });
        }

        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'provider') {
            return res.status(401).json({ success: false, message: `User ${req.user.id} is not authorized to update this booking` });
        }

        if (req.user.role === 'provider' && booking.rentalCarProvider.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update booking for other providers beside your own'
            });
        }

        booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({ success: true, data: booking });
    } catch (err) {
        res.status(500).json({ success: false, message: "Unexpected Error" });
        console.log(err);
    }
};

// @desc    Delete a booking
// @route   DELETE /api/v1/bookings/:id
// @access  Private
exports.deleteBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('rentalCarProvider');
        if(!booking) {
            return res.status(404).json({ success: false, message: `No booking with the id of ${req.params.id}` });
        }

        if(booking.user.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'provider') {
            return res.status(401).json({ success: false, message: `User ${req.user.id} is not authorized to delete this booking` });
        }

        if (req.user.role === 'provider' && booking.rentalCarProvider.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete booking for other providers beside your own'
            });
        }

        await booking.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, message: "Unexpected Error" });
        console.log(err);
    }
};