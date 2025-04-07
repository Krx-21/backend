const Car = require('../models/Car');
const RentalCarProvider = require('../models/RentalCarProvider');


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
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get a single car by ID
// @route   GET /api/v1/cars/:id
// @access  Public
exports.getCar = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id).populate('provider');
        if (!car) {
            return res.status(404).json({ success: false, message: 'Car not found' });
        }
        res.status(200).json({ success: true, data: car });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create a new car
// @route   POST /api/v1/cars/:providerId
// @access  Private (Provider required)
exports.createCar = async (req, res) => {
    try {
        const { brand, model, type, topSpeed, fuelType, seatingCapacity, year, pricePerDay, carDescription } = req.body;
        const providerId = req.params.providerId;

        const existingProvider = await RentalCarProvider.findById(providerId);
        if (!existingProvider) {
            return res.status(404).json({ success: false, message: 'Provider not found' });
        }
        const validCarTypes = ['Sedan', 'SUV', 'Hatchback', 'Truck', 'Convertible', 'Van'];
        if (!validCarTypes.includes(type)) {
            return res.status(422).json({ success: false, message: `Invalid car type. Choose from: ${validCarTypes.join(', ')}` });
        }

        const validFuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
        if (!validFuelTypes.includes(fuelType)) {
            return res.status(422).json({ success: false, message: `Invalid fuel type. Choose from: ${validFuelTypes.join(', ')}` });
        }

        if (req.user.role === 'provider' && existingProvider.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
              success: false,
              message: 'You are not authorized to add car model since you are not the owner'
            });
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
            carDescription
        });

        res.status(201).json({ success: true, data: car });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update a car
// @route   PUT /api/v1/cars/:id
// @access  Private (Provider required)

// exports.updateCar = async (req, res) => {
//     try {
//         let car = await Car.findById(req.params.id);
//         if (!car) {
//             return res.status(404).json({ success: false, message: 'Car not found' });
//         }
//         if (req.user.role === 'provider' && RentalCarProvider.user.toString() !== req.user._id.toString()) {
//             return res.status(403).json({
//               success: false,
//               message: 'You are not authorized to update this rental car provider'
//             });
//         }
//         car = await Car.findByIdAndUpdate(req.params.id, req.body, {
//             new: true,
//             runValidators: true
//         });

//         res.status(200).json({ success: true, data: car });
//     } catch (error) {
//         res.status(400).json({ success: false, message: error.message });
//     }
// };
exports.updateCar = async (req, res) => {
    try {
        let car = await Car.findById(req.params.id).populate('provider');
        if (!car) {
            return res.status(404).json({ success: false, message: 'Car not found' });
        }

        // Authorization: Only the provider who owns the car can update it
        if (
            req.user.role === 'provider' &&
            car.provider.user.toString() !== req.user._id.toString()
        ) {
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
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


// @desc    Delete a car
// @route   DELETE /api/v1/cars/:id
// @access  Private (Provider required)
exports.deleteCar = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id).populate('provider');;
        if (!car) {
            return res.status(404).json({ success: false, message: 'Car not found' });
        }
        // Authorization: Only the provider who owns the car can update it
        if (
            req.user.role === 'provider' &&
            car.provider.user.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this car'
            });
        }

        await car.deleteOne();
        res.status(200).json({ success: true, message: 'Car deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
