const Booking = require('../models/Booking');
const Car = require('../models/Car');
const rentalCarProvider = require('../models/RentalCarProvider');
const Promotion = require('../models/Promotion')

// @desc    Get all bookings
// @route   GET /api/v1/bookings
// @access  Private
exports.getBookings = async (req, res, next) => {
    let query;

    if (req.params.carId) {
        if (req.user.role === 'admin') {
            query = Booking.find({car: req.params.carId}).populate({
                path:'car',
                populate: {
                    path: "provider"
                }
            });
        } else if (req.user.role === 'provider') {
            const car = await Car.findById(req.params.carId);
            const rcp = await rentalCarProvider.findOne({user: req.user.id});
            const bookings = await Booking.find({car: req.params.carId})
            .populate({
                path:'car',
                populate: {
                    path: "provider"
                }
            });
  
            if ( car.provider.toString() !== rcp._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'You are not authorized to get booking form other providers beside your own'
                });
            }
            return res.status(200).json({ success: true, count: bookings.length, data: bookings });
                 
        } else {
            query = Booking.find({user: req.user.id, car: req.params.CarId }).populate({
                path:'car',
                populate: {
                    path: "provider"
                }
            });
        }
    } else {
        if (req.user.role !== 'admin') {
            query = Booking.find({user: req.user.id}).populate({
                path:'car',
                populate: {
                    path: "provider"
                }
            });
            console.log("eie")
        } else {
            query = Booking.find().populate({
                path:'car',
                populate: {
                    path: "provider"
                }
            });
        }
    } 
    
    try {
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
            path:'car',
            populate: {
                path: "provider"
            } 
        });
        console.log(req.user);

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
// @route   POST /api/v1/bookings/:carId
// @access  Private
exports.addBooking = async (req, res, next) => {
    try {
        req.body.car = req.params.carId;

        const car = await Car.findById(req.params.carId);

        if (!car) {
            return res.status(404).json({success: false, message: `No rental car provider with the id of ${req.params.carId}` });
        }

        req.body.user = req.user.id;
        const existedBookings = await Booking.find({user: req.user.id});
        if (existedBookings.length >= 3 && req.user.role === 'user') {
            return res.status(400).json({ success: false, message: `The user with ID ${req.user.id} has already made 3 bookings` });
        }
        
        const startDate = new Date(req.body.start_date)
        const endDate = new Date(req.body.end_date)

        if (!req.body.start_date || !req.body.end_date) {
            return res.status(400).json({ success: false, message: "startDate and endDate are required" });
        }

        if(startDate>endDate){
            return res.status(400).json({ 
                success: false,
                message: "Start date must be before end date."
            });
        }
        if(startDate < Date.now()){
            return res.status(400).json({
                success: false,
                message: "Can't Make Reservation in Past"
            })
        }

        const provider = await rentalCarProvider.findById(car.provider.toString());
        if (req.user.role === 'provider' && provider.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to add booking for other providers beside your own'
            });
        }


        const diffInMs = endDate - startDate;
        const numberOfDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
        const basePrice = car.pricePerDay * numberOfDays;
        let finalPrice = basePrice;

        const promoId = req.body.promoId;
        if (promoId) {
            const promotion = await Promotion.findById(promoId);
            if (!promotion) {
                throw new Error('Promotion not found');
            }

            if (promotion.provider && promotion.provider.toString() !== car.provider.toString()) {
                throw new Error("Promotion provider does not match car provider");
            }

            const now = new Date();
            const isValidPromo =
                now >= new Date(promotion.startDate) &&
                now <= new Date(promotion.endDate) &&
                basePrice >= promotion.minPurchaseAmount &&
                promotion.amount > 0;

            if (isValidPromo) {
                const discount = Math.min(
                    (promotion.discountPercentage / 100) * basePrice,
                    promotion.maxDiscountAmount
                );
                finalPrice = basePrice - discount;
                if (finalPrice < 0) finalPrice = 0;
        
                promotion.amount -= 1;
                await promotion.save();
            }
        }

        req.body.totalprice = finalPrice;

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
        let booking = await Booking.findById(req.params.id).populate({
            path:'car',
            populate: {
                path: "provider"
            } 
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: `No booking with the id of ${req.params.id}` });
        }

        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'provider') {
            return res.status(401).json({ success: false, message: `User ${req.user.id} is not authorized to update this booking` });
        }

        const provider = rentalCarProvider.findById(booking.car.provider.toString());
        if (req.user.role === 'provider' && provider.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update booking for other providers beside your own'
            });
        }

        const startDate = new Date(req.body.start_date)
        const endDate = new Date(req.body.end_date)

        if (!req.body.start_date || !req.body.end_date) {
            return res.status(400).json({ success: false, message: "startDate and endDate are required" });
        }

        if(startDate>endDate){
            return res.status(400).json({ 
                success: false,
                message: "Start date must be before end date."
            });
        }
        if(startDate < Date.now()){
            return res.status(400).json({
                success: false,
                message: "Can't Make Reservation in Past"
            })
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
        const booking = await Booking.findById(req.params.id).populate({
            path:'car',
            populate: {
                path: "provider"
            } 
        });
        if(!booking) {
            return res.status(404).json({ success: false, message: `No booking with the id of ${req.params.id}` });
        }

        if(booking.user.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'provider') {
            return res.status(401).json({ success: false, message: `User ${req.user.id} is not authorized to delete this booking` });
        }
        console.log(booking);
        console.log(req.user.id);
        // const provider = rentalCarProvider.findById(booking.car.provider.id);
        if (req.user.role === 'provider' && booking.car.provider.id !== req.user.id) {
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
