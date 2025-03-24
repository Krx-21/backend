const mongoose = require('mongoose');
const RentalCarProvider = require('./RentalCarProvider');

const BookingSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    rentalCarProvider: {
        type: mongoose.Schema.ObjectId,
        ref: 'RentalCarProvider',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', BookingSchema);