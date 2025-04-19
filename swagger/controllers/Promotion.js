'use strict';

var utils = require('../utils/writer.js');
var Promotion = require('../service/PromotionService');

module.exports.apiV1Promotions67f8e533b5fb87483342b804GET = function apiV1Promotions67f8e533b5fb87483342b804GET (req, res, next) {
  Promotion.apiV1Promotions67f8e533b5fb87483342b804GET()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.apiV1Promotions67f8ea6c1b091b99e53c655bDELETE = function apiV1Promotions67f8ea6c1b091b99e53c655bDELETE (req, res, next) {
  Promotion.apiV1Promotions67f8ea6c1b091b99e53c655bDELETE()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.apiV1Promotions67f8ea6c1b091b99e53c655bPUT = function apiV1Promotions67f8ea6c1b091b99e53c655bPUT (req, res, next, body, contentType) {
  Promotion.apiV1Promotions67f8ea6c1b091b99e53c655bPUT(body, contentType)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.apiV1PromotionsGET = function apiV1PromotionsGET (req, res, next) {
  Promotion.apiV1PromotionsGET()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.apiV1PromotionsPOST = function apiV1PromotionsPOST (req, res, next, body, contentType) {
  Promotion.apiV1PromotionsPOST(body, contentType)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.apiV1Rentalcarproviders67f8e98e1b091b99e53c6516PromotionsGET = function apiV1Rentalcarproviders67f8e98e1b091b99e53c6516PromotionsGET (req, res, next) {
  Promotion.apiV1Rentalcarproviders67f8e98e1b091b99e53c6516PromotionsGET()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
