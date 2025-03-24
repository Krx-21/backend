const User = require('../models/User');

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
        // const token =user.getSignedJwtToken();
        // res.status(200).json({succes: true, token});
        sendTokenResponse(user, 200, res);
    }
    catch (err) {
        res.status(400).json({success: false});
        console.log(err.stack);
    }
}

exports.login = async (req, res, next) => {
    try {
        const {email, password} = req.body;

        if(!email || !password) {
            return res.status(400).json({success: false, msg: 'Please provide email and password'});
        }

        const user = await User
            .findOne({email})
            .select('+password');
        
        if(!user) {
            return res.status(401).json({success: false, msg: 'Invalid credentials'});
        }

        const isMatch = await user.matchPassword(password);

        if(!isMatch) {
            return res.status(401).json({success: false, msg: 'Invalid credentials'});
        }

        // const token = user.getSignedJwtToken();
        // res.status(200).json({success: true, token});
        sendTokenResponse(user, 200, res);
    }
    catch(err) {
        res.status(400).json({success: false});
    }
}

const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };
    if(process.env.NODE_ENV === 'production') {
        options.secure = true;
    }
    
    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true, 
            token,
            // ส่ง role และข้อมูลผู้ใช้ที่จำเป็นกลับไป
            role: user.role,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
}

exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({success: true, data: user});
    }
    catch (err) {
        res.status(400).json({success: false});
    }
}

exports.logout = async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        data: {} 
    });
};