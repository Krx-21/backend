const mongoose = require('mongoose')


const CarTestingSchema = new mongoose.Schema({
    provider:{
        type: mongoose.Schema.ObjectId,
        ref: 'RentalCarProvider',
        require: true
    },
    test: {
        type: String
    }
});
module.exports = mongoose.model('Car',CarTestingSchema);