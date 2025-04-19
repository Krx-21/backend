'use strict';

var utils = require('../utils/writer.js');
var RentalCarProvider = require('../service/RentalCarProviderService');

module.exports.apiV1Rentalcarproviders67f8e8541b091b99e53c64ddDELETE = function apiV1Rentalcarproviders67f8e8541b091b99e53c64ddDELETE (req, res, next) {
  RentalCarProvider.apiV1Rentalcarproviders67f8e8541b091b99e53c64ddDELETE()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.apiV1Rentalcarproviders67f8e8541b091b99e53c64ddGET = function apiV1Rentalcarproviders67f8e8541b091b99e53c64ddGET (req, res, next) {
  RentalCarProvider.apiV1Rentalcarproviders67f8e8541b091b99e53c64ddGET()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.apiV1Rentalcarproviders67f8e8541b091b99e53c64ddPUT = function apiV1Rentalcarproviders67f8e8541b091b99e53c64ddPUT (req, res, next, body, contentType) {
  RentalCarProvider.apiV1Rentalcarproviders67f8e8541b091b99e53c64ddPUT(body, contentType)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.apiV1RentalcarprovidersGET = function apiV1RentalcarprovidersGET (req, res, next) {
  RentalCarProvider.apiV1RentalcarprovidersGET()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.apiV1RentalcarprovidersPOST = function apiV1RentalcarprovidersPOST (req, res, next, body, contentType) {
  RentalCarProvider.apiV1RentalcarprovidersPOST(body, contentType)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
