'use strict';

var utils = require('../utils/writer.js');
var Booking = require('../service/BookingService');

module.exports.apiV1Bookings67f14494e70b3cbd3c397681GET = function apiV1Bookings67f14494e70b3cbd3c397681GET (req, res, next) {
  Booking.apiV1Bookings67f14494e70b3cbd3c397681GET()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.apiV1Bookings67f14494e70b3cbd3c397681PUT = function apiV1Bookings67f14494e70b3cbd3c397681PUT (req, res, next, body, contentType) {
  Booking.apiV1Bookings67f14494e70b3cbd3c397681PUT(body, contentType)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.apiV1Bookings67f91c1a7d177a0aa45ff4fbDELETE = function apiV1Bookings67f91c1a7d177a0aa45ff4fbDELETE (req, res, next) {
  Booking.apiV1Bookings67f91c1a7d177a0aa45ff4fbDELETE()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.apiV1BookingsGET = function apiV1BookingsGET (req, res, next) {
  Booking.apiV1BookingsGET()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.apiV1Cars67f90726269b0ab62543f465BookingsGET = function apiV1Cars67f90726269b0ab62543f465BookingsGET (req, res, next) {
  Booking.apiV1Cars67f90726269b0ab62543f465BookingsGET()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.apiV1Cars67f94e688ff882c757a34f6dBookingsPOST = function apiV1Cars67f94e688ff882c757a34f6dBookingsPOST (req, res, next, body, contentType) {
  Booking.apiV1Cars67f94e688ff882c757a34f6dBookingsPOST(body, contentType)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
