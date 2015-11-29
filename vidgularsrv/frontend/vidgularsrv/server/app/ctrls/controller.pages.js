'use strict';

var mResponse = require('../core/response.common');

exports.getPages = function(req, res, next) {
  Pages.find(function (err, pages) {
    if (err) return next(err);
    res.json(pages);
  });
};

exports.postPage = function(req, res, next) {
  Pages.create( req.body, function (err, page) {
    if (err) return next(err);
    res.json(page);
  });
};

exports.getPage = function(req, res, next) {
  Pages.findById(req.params.id, function (err, page) {
    if (err) return next(err);
    res.json(page);
  });
};

exports.putPage = function(req, res, next) {
  Pages.findByIdAndUpdate(req.params.id, req.body, function (err, page) {
    if (err) return next(err);
    res.json(page);
  });
};

exports.deletePage = function(req, res, next) {
  Pages.findByIdAndRemove(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
};
