const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: true
	},
	car: {
		type: mongoose.Schema.ObjectId,
		ref: 'Car',
		required: true
	},
	comment: {
		type: String,
		required: [true, 'your comment'],
	},
	rating: {
		type: Number,
		required: [true, 'your rating'],
		min: 0,
		max: 5
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('Comment', CommentSchema);
