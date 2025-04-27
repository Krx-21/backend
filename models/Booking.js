const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
	start_date: {
		type: Date,
		required: true
	},
	end_date: {
		type: Date,
		required: true
	},
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
	totalprice: {
		type: Number,
		required: true
	},
	status: {
		type: String,
		enum: ['pending', 'processing', 'completed', 'failed'],
		default: 'pending'
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('Booking', BookingSchema);