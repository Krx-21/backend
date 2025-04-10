const Booking = require('../models/Booking'); 
const Car = require('../models/Car');
const RentalCarProvider = require('../models/RentalCarProvider'); 
const Comment = require('../models/Comment');
const User = require('../models/User');

// @desc    Get all rental car providers
// @route   GET /api/v1/rentalcarproviders
// @access  Public
exports.getRentalCarProviders = async (req, res, next) => {  
    try {

        let query;
        const reqQuery = { ...req.query };
        const removeFields = ['select', 'sort', 'page', 'limit'];
        removeFields.forEach(param => delete reqQuery[param]);
        console.log(reqQuery);

        let queryStr = JSON.stringify(req.query);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
        query = RentalCarProvider.find(JSON.parse(queryStr)).populate({
            path: 'user'
        });

        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 25;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await RentalCarProvider.countDocuments();  

        query = query.skip(startIndex).limit(limit);
        const rentalCarProviders = await query; 
        const pagination = {};

        if(endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            }
        }
        if(startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            }
        }

        res.status(200).json({ success: true, count: rentalCarProviders.length, pagination, data: rentalCarProviders}); 
    } catch(err) {
        res.status(500).json({ success: false, message: "Unexpected Error" });
        console.log(err);
    }
};

// @desc    Get a single rental car provider
// @route   GET /api/v1/rentalcarproviders/:id
// @access  Public
exports.getRentalCarProvider = async (req, res, next) => {
    try {
        const rentalCarProvider = await RentalCarProvider.findById(req.params.id).populate('user')
        if(!rentalCarProvider) {
            return res.status(400).json({ success: false});
        }

        res.status(200).json({ success: true, data: rentalCarProvider});
    } catch(err) {
        res.status(500).json({ success: false, message: "Unexpected Error" });
        console.log(err);
    }
};

// @desc    Create a rental car provider
// @route   POST /api/v1/rentalcarproviders
// @access  Private
exports.createRentalCarProvider = async (req, res, next) => { 
    try {
        const existingProvider = await RentalCarProvider.findOne({ user: req.user._id });
        if (existingProvider) {
            return res.status(400).json({
                success: false,
                message: 'You have already created a rental car provider'
            });
        }
        const user = await User.findById(req.user.id);

        if(!user){
            return res.status(404).json({
                success:false,
                message: `no user with id of ${req.user.id}`
            })
        }
        req.body.user = req.user._id;
        const rentalCarProvider = await RentalCarProvider.create(req.body); 
        user.myRcpId = rentalCarProvider._id;
        await user.save()
        res.status(201).json({ success: true, data: rentalCarProvider }); 
    } catch (err) {
        res.status(500).json({ success: false, message: "Unexpected Error" });
        console.log(err);
    }
    
};

// @desc    Update a rental car provider
// @route   PUT /api/v1/rentalcarproviders/:id
// @access  Private
exports.updateRentalCarProvider = async (req, res, next) => {
    try {
        let rentalCarProvider = await RentalCarProvider.findById(req.params.id);
        if (!rentalCarProvider) {
            return res.status(404).json({ success: false, message: 'RentalCarProvider not found' });
        }
  
        if (req.user.role === 'provider' && rentalCarProvider.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this rental car provider'
            });
        }
  
        rentalCarProvider = await RentalCarProvider.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
  
        res.status(200).json({ success: true, data: rentalCarProvider });
    } catch (err) {
        res.status(500).json({ success: false, message: "Unexpected Error" });
        console.log(err);
    }
};

// @desc    Delete a rental car provider
// @route   DELETE /api/v1/rentalcarproviders/:id
// @access  Private
exports.deleteRentalCarProvider = async (req, res, next) => {
    try {
        const rentalCarProvider = await RentalCarProvider.findById(req.params.id);
        if (!rentalCarProvider) {
            return res.status(404).json({
                success: false,
                message: `Rental car provider not found with id of ${req.params.id}`
            });
        }
        
        const cars = await Car.find({ provider: req.params.id });
        const carIds = cars.map(car => car._id);
        await Comment.deleteMany({ car: { $in: carIds } });
        await Car.deleteMany({ provider: req.params.id });
        await Booking.deleteMany({ rentalCarProvider: req.params.id });
        await rentalCarProvider.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, message: "Unexpected Error" });
        console.log(err);
    }
};
