const Booking = require('../models/Booking');
const RentalCarProvider = require('../models/RentalCarProvider');

exports.getBookings = async (req, res, next) => {
    let query;

    if(req.user.role !== 'admin') {
        query = Booking.find({user: req.user.id}).populate({
            path:'rentalCarProvider',
            select: 'name province tel'
        });
    }
    else {
        if (req.params.rentalCarProviderId) {
            console.log(req.params.rentalCarProviderId);
            query = Booking.find({rentalCarProvider: req.params.rentalCarProviderId}).populate({
                path: "rentalCarProvider",
                select: "name province tel",
            });
        }
        else {
            query = Booking.find().populate({
                path:'rentalCarProvider',
                select: 'name province tel'
            });
        }
    }
    try {
        const bookings = await query;
        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    }
    catch (err) {
        console.Console.log(err);
        return res.status(500).json({ success: false, message: 'Cannot find Bookings' });
    }
};

exports.getBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id).populate({
            path: 'rentalCarProvider',
            select: 'name description tel'
        });

        if(!booking) {
            return res.status(404).json({ success: false , message: `No booking found with id of ${req.params.id}`});
        }
        res.status(200).json({ success: true, data: booking});
    }
    catch(err) {
        return res.status(500).json({ success: false, message: 'Cannot find Booking' });
    }
};

exports.addBooking = async (req, res, next) => {
    try {
        req.body.rentalCarProvider = req.params.rentalCarProviderId;

        const rentalCarProvider = await RentalCarProvider.findById(req.params.rentalCarProviderId);

        if(!rentalCarProvider) {
            return res.status(404).json({success: false, message: `No rental car provider with the id of ${req.params.rentalCarProviderId}'`});
        }

        req.body.user = req.user.id;
        const existedBookings = await Booking.find({user: req.user.id});
        if(existedBookings.length >= 3 && req.user.role !== 'admin') {
            return res.status(400).json({ success: false, message: `The user with ID ${req.user.id} has already made 3 bookings`});
        }

        const booking = await Booking.create(req.body);
        res.status(201).json({ success: true, data: booking});
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({success: false, message: 'Cannot create Booking'});
    }
}

exports.updateBooking = async (req, res, next) => {
    try {
        let booking = await Booking.findById(req.params.id);

        if(!booking) {
            return res.status(404).json({ success: false, message: `No booking with the id of ${req.params.id}`});
        }

        if(booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: `User ${req.user.id} is not authorized to update this booking`});
        }

        booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({ success: true, data: booking});
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({ success: false, message: 'Cannot update Booking'});
    }
};

exports.deleteBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if(!booking) {
            return res.status(404).json({ success: false, message: `No booking with the id of ${req.params.id}`});
        }

        if(booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: `User ${req.user.id} is not authorized to delete this booking`});
        }

        await booking.deleteOne();
        res.status(200).json({ success: true, data: {}});
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({ success: false, message: 'Cannot delete Booking'});
    }
};