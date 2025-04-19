'use strict';

var utils = require('../utils/writer.js');
var Aunthentication = require('../service/AunthenticationService');

module.exports.apiV1AuthLoginPOST = function apiV1AuthLoginPOST (req, res, next, body, contentType) {
  Aunthentication.apiV1AuthLoginPOST(body, contentType)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.apiV1AuthLogoutGET = function apiV1AuthLogoutGET (req, res, next) {
  Aunthentication.apiV1AuthLogoutGET()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.apiV1AuthMeGET = function apiV1AuthMeGET (req, res, next, authorization) {
  Aunthentication.apiV1AuthMeGET(authorization)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.apiV1AuthRegisterPOST = function apiV1AuthRegisterPOST (req, res, next, body, contentType) {
  Aunthentication.apiV1AuthRegisterPOST(body, contentType)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
