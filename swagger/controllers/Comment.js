'use strict';

var utils = require('../utils/writer.js');
var Comment = require('../service/CommentService');

module.exports.apiV1Cars67f2980e4c0c4285bd72b773CommentsGET = function apiV1Cars67f2980e4c0c4285bd72b773CommentsGET (req, res, next) {
  Comment.apiV1Cars67f2980e4c0c4285bd72b773CommentsGET()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.apiV1Cars67f2980e4c0c4285bd72b773CommentsPOST = function apiV1Cars67f2980e4c0c4285bd72b773CommentsPOST (req, res, next, body) {
  Comment.apiV1Cars67f2980e4c0c4285bd72b773CommentsPOST(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.apiV1Comments67f8a780b5fb87483342b79cPUT = function apiV1Comments67f8a780b5fb87483342b79cPUT (req, res, next, body, contentType) {
  Comment.apiV1Comments67f8a780b5fb87483342b79cPUT(body, contentType)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.apiV1Comments67f8a7adb5fb87483342b7b2DELETE = function apiV1Comments67f8a7adb5fb87483342b7b2DELETE (req, res, next) {
  Comment.apiV1Comments67f8a7adb5fb87483342b7b2DELETE()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.apiV1CommentsPOST = function apiV1CommentsPOST (req, res, next, body, contentType) {
  Comment.apiV1CommentsPOST(body, contentType)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
