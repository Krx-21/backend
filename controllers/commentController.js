const Comment = require('../models/Comment');
const Car = require('../models/Car');
const User = require('../models/User');

// @desc    Get all comments
// @route   GET /api/v1/comments
// @access  Public
exports.getComments = async (req,res,next) =>{ 
    try {
        const car = await Car.findById(req.params.carId);
        if(!car){
            return res.status(404).json({
                success: false,
                message: `No car with the id of ${req.params.carId}`
            });
        }    
        const Comments = await Comment.find({car: req.params.carId}).populate({
            path: 'user' ,
            select: 'name image'
        });
        
        res.status(200).json({ success: true, count: Comments.length, data: Comments });
    }catch (err){
        console.log(err);
        return res.status(500).json({success:false , message:"get Comment error"});
    }
}

// @desc    Get a single comment
// @route   GET /api/v1/comments/:id
// @access  Public
exports.addComment = async (req,res,next) => {
    try{
        if(!req.params.carId) req.params.carId = req.body.car;
        else{
            req.body.car = req.params.carId;  
        }
        const car = await Car.findById(req.params.carId);
        
        if(!car){
            return res.status(404).json({
                success: false,
                message: `No car with the id of ${req.params.carId}`
            });
        }
        const user = await User.findById(req.user.id);
        if(!user.bookedCar.includes(req.params.carId) && user.role !== 'admin'){
            return res.status(400).json({
                success: false,
                message: `comment fail`
            });
        }
        req.body.user = req.user.id;
        const comment = await Comment.create(req.body);
        res.status(201).json({ success: true, data: comment });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: "Cannot create Comment" });
    }
}

// @desc    Update a comment
// @route   PUT /api/v1/comments/:id
// @access  Private
exports.updateComment = async (req,res,next) =>{
    try {
        let comment = await Comment.findById(req.params.id);
        if(!comment){
            return res.status(404).json({
                success: false,
                message: `no Comment with the id of ${req.params.id}`
            });
        }

        if(comment.user.toString() !== req.user.id){
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not autherized to update this comment`
            });
        }

        comment = await Comment.findByIdAndUpdate(req.params.id,req.body,{
            new: true,
            runValidators: true
        });

        res.status(200).json({ success:true, data: comment });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Cannot update Comment" });
    }
}

// @desc    Delete a comment
// @route   DELETE /api/v1/comments/:id
// @access  Private
exports.deleteComment = async (req,res,next) =>{
    try {
        const comment = await Comment.findById(req.params.id);
        if(!comment){
            return res.status(404).json({
                success: false,
                message: `no Comment with the id of ${req.params.id}`
            });
        }

        if(comment.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not autherized to update this `
            });
        }

        await comment.deleteOne();
        res.status(200).json({ success:true, data: {} });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: "Cannot delete Comment"});
    }
}
