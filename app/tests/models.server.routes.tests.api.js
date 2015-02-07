'use strict';

var should = require('should'),
	request = require('supertest'),
	mongoose = require('mongoose');

module.exports = function(app, model, path) {

	var agent = request.agent(app);
	var Model = mongoose.model(model);

	var create = function(category, cb) {
	 	agent.post(path)
			.send(category)
			.end(function (err, res) {
				cb(res);
			});
	};

	var getById = function(id, cb) {
		agent.get(path + id)
			.end(function (err, res) {
				cb(res);
			});
	};

	var get = function(cb) {
		agent.get(path)
			.end(function (err, res) {
				cb(res);
			});
	};

	var update = function(category, cb) {
		agent.put(path + category._id)
			.send(category)
			.end(function (err, res) {
				cb(res);
			});
	};

	var deleteById = function(id, cb) {
		agent.delete(path + id)
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
