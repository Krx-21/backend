const mongoose = require('mongoose')


const CommentSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required:true
    },
    car:{
        type: mongoose.Schema.ObjectId,
        ref: 'Car', //ใส่ไว้ก่อน เปลี่ยนได้
        required: true
    },
    comment: {
        type: String,
        required: [true, 'your comment'],
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.model('Comment',CommentSchema);