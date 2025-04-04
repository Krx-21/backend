const mongoose = require('mongoose');



const RentalCarProviderSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    district: {
        type: String,
        required: [true, 'Please add a district']
    },
    province: {
        type: String,
        required: [true, 'Please add a province']
    },
    postalcode: {
        type: String,
        required: [true, 'Please add a postal code'],
        maxlength: [10, 'Postal code can not be more than 5 digits']
    },
    tel: {
        type: String,
    },
    region: {
        type: String,
        required: [true, 'Please add a region']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: false  // optional because the controller handles it
    }
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

RentalCarProviderSchema.virtual('bookings', {
    ref: 'Booking',
    localField: '_id',
    foreignField: 'rentalCarProvider',
    justOne: false
});

module.exports = mongoose.model('RentalCarProvider', RentalCarProviderSchema);