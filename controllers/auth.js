const User = require('../models/User');
const Booking = require('../models/Booking');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const {name, telephoneNumber, email, password, role} = req.body;
        const user = await User.create({
            name,
            telephoneNumber,
            email,
            password,
            role
        });
        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(500).json({ success: false, message: "Unexpected Error" });
        console.log(err);
    }
}

// @desc    Login user
// @route   POST /api/v1/auth/login 
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        if(!email || !password) {
            return res.status(400).json({success: false, msg: 'Please provide email and password'});
        }

        const user = await User.findOne({email}).select('+password');
        if(!user) {
            return res.status(401).json({success: false, msg: 'Invalid credentials'});
        }

        const isMatch = await user.matchPassword(password);
        if(!isMatch) {
            return res.status(401).json({success: false, msg: 'Invalid credentials'});
        }
        sendTokenResponse(user, 200, res);

    } catch (err) {
        res.status(500).json({ success: false, message: "Unexpected Error" });
        console.log(err);
    }
}

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: "Unexpected Error" });
        console.log(err);
    }
}

// @desc    Logout user / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Public
exports.logout = async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ success: true, data: {} });
};

const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }
    
    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true, 
            token,
            role: user.role,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
}

// @desc    Upload User Profile
// @route   GET /api/v1/auth/uploadProfile
// @access  Private
exports.uploadProfile = async (req,res) => {
    try{
        let user = await User.findById(req.user.id);
        if(!user){
            return res.status(404).json({success:false , message:`no user with id of ${req.user.id}`});
        }
        user = await User.findByIdAndUpdate(req.user.id, req.body,{
            new: true,
            runValidators: true
        });    
        
        return res.status(200).json({success: true , data: user});

    }catch (e){
        res.status(500).json({success: false, message: `upload image fail : ${e}`});
    }
}


// @desc    Update booked car
// @route   GET /api/v1/auth/booked
// @access  Private
exports.finishBooking = async (req,res) => {
    try{
        let user = await User.findById(req.user.id);
        if(!user){
            return res.status(404).json({success:false , message:`no user with id of ${req.user.id}`});
        }
        console.log(req.params.bookingId);
        if(!req.body.booking){
            req.body.booking = req.params.bookingId
        }else {
            req.params.bookingId = req.body.booking   
        }

        const booking = await Booking.findById(req.body.booking);
        if(!booking){
            return res.status(404).json({success: false , message: `no booking with id of ${req.params.bookingId}`});
        }
        // console.log(booking.user.toString());

        if(booking.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success: false , message: `User ${req.user.id} is not authorized to finish this booking`});
        }

        if(!user.bookedCar)user.bookedCar = [];
        if(!user.bookedCar.includes(booking.car)){
            user.bookedCar.push(booking.car);
            await user.save();
        }
        await booking.deleteOne();
        return res.status(200).json({success: true , data: user});
    }catch (e){
        res.status(500).json({success: false, message: `update booked car fail : ${e}`});
    }
}



// @desc    Get all users (Admin only)
// @route   GET /api/v1/auth/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        // Only allow admin to access
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to access this route' });
        }

        const users = await User.find()

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to get users", error: err.message });
    }
};


