const Car = require('../models/Car');
const Promotion = require('../models/Promotion')
const RentalCarProvider = require('../models/RentalCarProvider');
const Comment = require('../models/Comment');

// @desc    Get all cars
// @route   GET /api/v1/cars
// @access  Public
exports.getCars = async (req, res, next) => {
    let query;
    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    if (req.params.providerId) {
        query = Car.find({
            provider: req.params.providerId,
            ...JSON.parse(queryStr),
        }).populate('provider');
    } else {
        query = Car.find(JSON.parse(queryStr)).populate('provider');
    }

    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-postedDate');
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    try {
        const total = await Car.countDocuments();
        query = query.skip(startIndex).limit(limit);
        const cars = await query;

        const pagination = {};
        if (endIndex < total) {
            pagination.next = { page: page + 1, limit };
        }
        if (startIndex > 0) {
            pagination.prev = { page: page - 1, limit };
        }

        res.status(200).json({
            success: true,
            count: cars.length,
            pagination,
            data: cars,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Unexpected Error" });
        console.log(err);
    }
};

// @desc    Get a single car
// @route   GET /api/v1/cars/:id
// @access  Public
exports.getCar = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id).populate('provider');
        if (!car) {
            return res.status(404).json({ success: false, message: 'Car not found' });
        }

        res.status(200).json({ success: true, data: car });
    } catch (err) {
        res.status(500).json({ success: false, message: "Unexpected Error" });
        console.log(err);
    }
};

// @desc    Create a new car
// @route   POST /api/v1/cars/:providerId
// @access  Private
exports.createCar = async (req, res) => {
    try {
        const { brand, model, type, topSpeed, fuelType, seatingCapacity, year, pricePerDay, carDescription,image } = req.body;
        const providerId = req.params.providerId;
        const existingProvider = await RentalCarProvider.findById(providerId);
        if (!existingProvider) {
            return res.status(404).json({ success: false, message: 'Provider not found' });
        }

        const validCarTypes = ['Sedan', 'SUV', 'Hatchback', 'Truck', 'Convertible', 'Van'];
        if (!validCarTypes.includes(type)) {
            return res.status(422).json({ success: false, message: `Invalid car type. Choose from: ${validCarTypes.join(', ')}` });
        }

        if (req.user.role === 'provider' && existingProvider.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You are not authorized to add car model since you are not the owner' });
        }

        const car = await Car.create({
            provider: providerId,
            brand,
            model,
            type,
            topSpeed,
            fuelType,
            seatingCapacity,
            year,
            pricePerDay,
            carDescription,
            image
        });

        res.status(201).json({ success: true, data: car });
    } catch (err) {
        res.status(500).json({ success: false, message: "Unexpected Error" });
        console.log(err);
    }
};

// @desc    Update a car
// @route   PUT /api/v1/cars/:id
// @access  Private
exports.updateCar = async (req, res) => {
    try {
        let car = await Car.findById(req.params.id).populate('provider');
        if (!car) {
            return res.status(404).json({ success: false, message: 'Car not found' });
        }

        if (req.user.role === 'provider' && car.provider.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this car'
            });
        }

        car = await Car.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: car });
    } catch (err) {
        res.status(500).json({ success: false, message: "Unexpected Error" });
        console.log(err);
    }
};

// @desc    Delete a car
// @route   DELETE /api/v1/cars/:id
// @access  Private
exports.deleteCar = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id).populate('provider');;
        if (!car) {
            return res.status(404).json({ success: false, message: 'Car not found' });
        }

        if (req.user.role === 'provider' && car.provider.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You are not authorized to delete this car' });
        }

        await Comment.deleteMany({ car: car._id });
        await car.deleteOne();
        res.status(200).json({ success: true, message: 'Car deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: "Unexpected Error" });
        console.log(err);
    }
};

// @desc    calculate car price
// @route   POST /api/v1/cars/calculate-price
// @access  Public
exports.calculateCarPrice = async (req, res) => {
    try {
        const { carId, startDate, endDate, promoId } = req.body;

        if (!carId || !startDate || !endDate) {
            return res.status(400).json({ success: false, message: 'carId, startDate, and endDate are required' });
        }

        // Calculate number of days
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffInMs = end - start;
        const numberOfDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

        if (numberOfDays <= 0) {
            return res.status(400).json({ success: false, message: 'End date must be after start date' });
        }

        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ success: false, message: 'Car not found' });
        }

        const basePrice = car.pricePerDay * numberOfDays;
        let finalPrice = basePrice;

        if (promoId) {
            const promotion = await Promotion.findById(promoId);
            if(!promotion){
                return res.status(404).json({ success: false, message: 'Promotion not found' });
            }

            if(promotion.provider){
                if(promotion.provider.toString() !== car.provider.toString()){
                    return res.status(400).json({ message: "Promotion provider does not match car provider."});
                }
            }

            const now = new Date();
            const isValidPromo = promotion &&
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
                if(finalPrice < 0) finalPrice = 0;
            }
        }

        res.status(200).json({
            success: true,
            data: {
                carId: car._id,
                startDate,
                endDate,
                numberOfDays,
                pricePerDay: car.pricePerDay,
                basePrice,
                finalPrice,
                totalPrice: finalPrice // This is what the booking service will use
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Unexpected error occurred" });
    }
};