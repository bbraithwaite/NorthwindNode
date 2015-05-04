'use strict';

var should = require('should'),
  request = require('supertest'),
  mongoose = require('mongoose');

module.exports = function(app, model, path) {
  var agent = request.agent(app);
  var Model = mongoose.model(model);

  var create = function(item, cb) {
    agent.post(path)
      .auth('username', 'password')
      .send(item)
      .end(function (err, res) {
        cb(res);
      });
  };

  var getById = function(id, cb) {
    agent.get(path + id)
      .auth('username', 'password')
      .end(function (err, res) {
        cb(res);
      });
  };

  var get = function(cb) {
    agent.get(path)
      .auth('username', 'password')
      .end(function (err, res) {
        cb(res);
      });
  };

  var update = function(item, cb) {
    agent.put(path + item._id)
      .auth('username', 'password')
      .send(item)
      .end(function (err, res) {
        cb(res);
      });
  };

  var deleteById = function(id, cb) {
    agent.delete(path + id)
      .auth('username', 'password')
      .end(function (err, res) {
        cb(res);
      });
  };

  var clearData = function(cb) {
    Model.remove().exec(cb);
  };

  return {
    create: create,
    get: getById,
    update: update,
    list: get,
    clear: clearData,
    delete: deleteById
  };

};
