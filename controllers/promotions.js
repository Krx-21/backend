const Promotion = require('../models/Promotion')
const RentalCarProvider = require('../models/RentalCarProvider');

// @desc    Get all promotions
// @route   GET /api/v1/promotions
// @access  Public
exports.getPromotions = async (req, res, next) => {
    let query;

    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);
    
    if (req.params.providerId) {
        reqQuery.provider = req.params.providerId;
    }

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    query = Promotion.find(JSON.parse(queryStr))
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
        const total = await Promotion.countDocuments();
        query = query.skip(startIndex).limit(limit);
        const promotions = await query;
        console.log(promotions)
        const pagination = {};
        if (endIndex < total) {
            pagination.next = { page: page + 1, limit };
        }
        if (startIndex > 0) {
            pagination.prev = { page: page - 1, limit };
        }



        res.status(200).json({
            success: true,
            count: promotions.length,
            pagination,
            data: promotions,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
}

// @desc    Get a single promotion by ID
// @route   GET /api/v1/promotions/:id
// @access  Public
exports.getPromotion = async (req, res, next) => {
    try {
        const promotion = await Promotion.findById(req.params.id).populate('provider');
        if (!promotion) {
            return res.status(404).json({ success: false, message: 'Promotion not found' });
        }
        res.status(200).json({ success: true, data: promotion });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
}

// @desc    Create a new promotion
// @route   POST /api/v1/promotions/:providerId
// @access  Private (Admin, Provider required)
exports.createPromotion = async (req, res, next) => {
    try {

        const { role, _id: userId } = req.user;
        let providerId = undefined;
        if (role === 'provider') {
            const existingRCProvider = await RentalCarProvider.findOne({ user: userId });
            if (!existingRCProvider) {
                return res.status(404).json({ success: false, message: `RentalCarProvider not found ${userId}` });
            }
            if (req.body.provider && req.body.provider.toString() !== userId.toString()) {
                return res.status(400).json({ success: false, message: `You can only add promotions for your own provider. ${userId}\n${req.body.provider} ${req.body.provider !== userId}` });
            }
            providerId =  userId;
        }
        else if (role === 'admin') {
            if (req.body.provider) {
                const existingRCProvider = await RentalCarProvider.findOne({ user: req.body.provider });
                if (!existingRCProvider) {
                    return res.status(404).json({ success: false, message: `RentalCarProvider not found for user ${req.body.provider}` });
                }
                providerId = req.body.provider;
            }
        }


        const { title, description, discountPercentage, maxDiscountAmount, minPurchaseAmount, startDate, endDate } = req.body;

        if (
            title === undefined ||
            discountPercentage === undefined ||
            maxDiscountAmount === undefined ||
            minPurchaseAmount === undefined ||
            !startDate ||
            !endDate
        ) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        if (discountPercentage <= 0 || discountPercentage > 100) {
            return res.status(422).json({ success: false, message: 'Discount percentage must be between 0 and 100' });
        }

        if (maxDiscountAmount <= 0) {
            return res.status(422).json({ success: false, message: 'Max discount amount must be a positive number' });
        }

        if (minPurchaseAmount < 0) {
            return res.status(422).json({ success: false, message: 'Min purchase amount cannot be negative' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start >= end) {
            return res.status(422).json({ success: false, message: 'Start date must be before end date' });
        }


        const promotionData = {
            title, 
            description,
            discountPercentage, 
            maxDiscountAmount, 
            minPurchaseAmount, 
            startDate, 
            endDate,
        };

        // Add provider only if it's an admin or if it's a provider and their own promotion
        if (providerId) {
            promotionData.provider = providerId; // Set providerId only if it was set
        }

        const promotion = await Promotion.create(promotionData);
        res.status(201).json({ success: true, data: promotion });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

// @desc    Update a promotion
// @route   PUT /api/v1/promotions/:id
// @access  Private (Provider required)
exports.updatePromotion = async (req, res, next) => {
    try {

        const { role, _id: userId } = req.user;
        let promotion = await Promotion.findById(req.params.id);
        if (!promotion) {
            return res.status(404).json({ success: false, message: 'Promotion not found' });
        }
        if (role === 'provider') {
            const existingRCProvider = await RentalCarProvider.findOne({ user: userId });
            if (!existingRCProvider) {
                return res.status(404).json({ success: false, message: `RentalCarProvider not found ${userId}` });
            }

            if (!promotion.provider || promotion.provider.toString() !== existingRCProvider.user.toString()) {
                return res.status(403).json({ success: false, message: `You are not authorized to update this promotion.` });
            }

            if (req.body.provider && req.body.provider.toString() !== userId.toString()) {
                return res.status(400).json({ success: false, message: `You can only update promotions for your own provider. ${userId}\n${req.body.provider} ${req.body.provider !== userId}` });
            }
        }
        else if (role === 'admin') {
            if (req.body.provider) {
                const existingRCProvider = await RentalCarProvider.findOne({ user: req.body.provider });
                if (!existingRCProvider) {
                    return res.status(404).json({ success: false, message: `RentalCarProvider not found for user ${req.body.provider}` });
                }
            }
        }



        promotion = await Promotion.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: promotion });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

// @desc    Delete a promotion
// @route   DELETE /api/v1/promotions/:id
// @access  Private (Provider required)
exports.deletePromotion = async (req, res, next) => {
   try {

        const { role, _id: userId } = req.user;
        const promotion = await Promotion.findById(req.params.id);
        if (!promotion) {
            return res.status(404).json({ success: false, message: 'Promotion not found' });
        }

        if (role === 'provider') {
            const existingRCProvider = await RentalCarProvider.findOne({ user: userId });
            if (!existingRCProvider) {
                return res.status(404).json({ success: false, message: `RentalCarProvider not found ${userId}` });
            }

            if (!promotion.provider || promotion.provider.toString() !== existingRCProvider.user.toString()) {
                return res.status(403).json({ success: false, message: `You are not authorized to delete this promotion.` });
            }

            if (req.body.provider && req.body.provider.toString() !== userId.toString()) {
                return res.status(400).json({ success: false, message: `You can only delete promotions for your own provider. ${userId}\n${req.body.provider} ${req.body.provider !== userId}` });
            }
        }
        else if (role === 'admin') {
            if (req.body.provider) {
                const existingRCProvider = await RentalCarProvider.findOne({ user: req.body.provider });
                if (!existingRCProvider) {
                    return res.status(404).json({ success: false, message: `RentalCarProvider not found for user ${req.body.provider}` });
                }
            }
        }

        await promotion.deleteOne();
        res.status(200).json({ success: true, message: 'Promotion deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    } 
}