'use strict';

var utils = require('../utils/writer.js');
var Cars = require('../service/CarsService');

module.exports.apiV1Cars67f0a5caa7d95b786071302ePOST = function apiV1Cars67f0a5caa7d95b786071302ePOST (req, res, next, body, contentType) {
  Cars.apiV1Cars67f0a5caa7d95b786071302ePOST(body, contentType)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.apiV1Cars67f8e466b5fb87483342b7e0DELETE = function apiV1Cars67f8e466b5fb87483342b7e0DELETE (req, res, next) {
  Cars.apiV1Cars67f8e466b5fb87483342b7e0DELETE()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.apiV1Cars67f8e466b5fb87483342b7e0GET = function apiV1Cars67f8e466b5fb87483342b7e0GET (req, res, next) {
  Cars.apiV1Cars67f8e466b5fb87483342b7e0GET()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.apiV1Cars67f8e466b5fb87483342b7e0PUT = function apiV1Cars67f8e466b5fb87483342b7e0PUT (req, res, next, body, contentType) {
  Cars.apiV1Cars67f8e466b5fb87483342b7e0PUT(body, contentType)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.apiV1CarsGET = function apiV1CarsGET (req, res, next) {
  Cars.apiV1CarsGET()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.apiV1Rentalcarproviders67f927fced912f44869c20cdCarsGET = function apiV1Rentalcarproviders67f927fced912f44869c20cdCarsGET (req, res, next) {
  Cars.apiV1Rentalcarproviders67f927fced912f44869c20cdCarsGET()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
