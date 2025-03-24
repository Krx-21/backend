const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if(!token || token == 'null') {
        return res.status(401).json({msg: 'Not authorized to access this route'});
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);
        req.user = await User.findById(decoded.id);
        next();
    }
    catch (err) {
        console.error(err.stack);
        return res.status(401).json({msg: 'Not authorized to access this route'});
    }
}

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return res.status(403).json({msg: `Role ${req.user.role} is not authorized to access this route`});
        }
        next();
    }
}