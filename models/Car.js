const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema(
    {
        brand: {
            type: String,
            required: [true, 'Please add a brand'],
            trim: true
        },
        model: {
            type: String,
            required: [true, 'Please add a model'],
            trim: true
        },
        type: {
            type: String,
            required: [true, 'Please specify the car type'],
            enum: ['Sedan', 'SUV', 'Hatchback', 'Truck', 'Convertible', 'Van'],
            trim: true
        },
        topSpeed: {
            type: Number,
            required: [true, 'Please specify the top speed'],
            min: [0, 'Top speed cannot be negative']
        },
        fuelType: {
            type: String,
            required: [true, 'Please specify the fuel type'],
            enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid']
        },
        seatingCapacity: {
            type: Number,
            required: [true, 'Please specify seating capacity'],
            min: [1, 'Seating capacity must be at least 1']
        },
        year: {
            type: Number,
            required: [true, 'Please specify the manufacturing year'],
            min: [1886, 'Year must be after the first car was invented'],
            max: [new Date().getFullYear(), 'Year cannot be in the future']
        },
        pricePerDay: {
            type: Number,
            required: [true, 'Please specify the rental price per day'],
            min: [0, 'Price per day cannot be negative']
        },
        provider: {
            type: mongoose.Schema.ObjectId,
            ref: 'RentalCarProvider',
            required: [true, 'car must be linked to a provider']
        },
        carDescription: {
            type: String,
            trim: true
        },
        postedDate: {
            type: Date,
            default: Date.now
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

module.exports = mongoose.model('Car', CarSchema);
