'use strict';

module.exports = function(app) {
	var categories = require('../controllers/categories.server.controller');
	var users = require('../controllers/users.server.controller');
	var apiAuth = require('../controllers/api.authorization.server.controller');

	app.route('/categories')
		.get(apiAuth, users.requiresLogin, categories.list)
		.post(apiAuth, users.requiresLogin, categories.create);

	app.route('/categories/:categoryId')
		.get(apiAuth, users.requiresLogin, categories.read)
		.put(apiAuth, users.requiresLogin, categories.update)
		.delete(apiAuth, users.requiresLogin, categories.delete);

	// Finish by binding the article middleware
	app.param('categoryId', categories.getByID);
};
